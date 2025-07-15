import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  console.log(`[PayStack Verify] ${step}`, details ? JSON.stringify(details) : '');
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep('Starting PayStack payment verification');

    // Create Supabase client for user authentication
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Create service role client for database operations
    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header provided');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    logStep('User authenticated', { userId: user.id });

    // Parse request body
    const { reference } = await req.json();

    if (!reference) {
      throw new Error('Payment reference is required');
    }

    logStep('Verifying payment with PayStack', { reference });

    // Verify payment with PayStack
    const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('PAYSTACK_SECRET_KEY')}`,
        'Content-Type': 'application/json',
      },
    });

    const paystackResult = await paystackResponse.json();

    if (!paystackResponse.ok || !paystackResult.status) {
      logStep('PayStack verification failed', paystackResult);
      throw new Error(paystackResult.message || 'Payment verification failed');
    }

    const paymentData = paystackResult.data;
    logStep('PayStack verification response', { 
      status: paymentData.status, 
      amount: paymentData.amount,
      currency: paymentData.currency 
    });

    // Check if payment was successful
    if (paymentData.status !== 'success') {
      throw new Error(`Payment not successful. Status: ${paymentData.status}`);
    }

    // Convert amount from kobo to cents (PayStack uses kobo, we store in cents)
    const amountInCents = Math.round(paymentData.amount / 100 * 100); // Convert kobo to NGN, then to cents

    // Get user's wallet
    const { data: wallet, error: walletError } = await supabaseService
      .from('user_wallets')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (walletError) {
      logStep('Wallet fetch error', walletError);
      throw new Error('Failed to fetch user wallet');
    }

    logStep('User wallet found', { walletId: wallet.id, currentBalance: wallet.balance });

    // Get transaction type from PayStack metadata
    const transactionType = paymentData.metadata?.transaction_type || 'deposit';
    const tournamentId = paymentData.metadata?.tournament_id;

    logStep('Processing transaction', { transactionType, tournamentId });

    if (transactionType === 'tournament_fee') {
      // Handle tournament fee payment
      if (!tournamentId) {
        throw new Error('Tournament ID is required for tournament fee payments');
      }

      // Create transaction record for tournament fee
      const { data: transaction, error: transactionError } = await supabaseService
        .from('wallet_transactions')
        .insert({
          user_id: user.id,
          wallet_id: wallet.id,
          transaction_type: 'tournament_fee',
          amount: amountInCents,
          description: `Tournament entry fee - ${reference}`,
          reference_id: reference,
          status: 'completed',
          metadata: {
            tournament_id: tournamentId,
            paystack_data: {
              reference: paymentData.reference,
              amount_kobo: paymentData.amount,
              currency: paymentData.currency,
              channel: paymentData.channel,
              paid_at: paymentData.paid_at,
              transaction_date: paymentData.transaction_date,
            }
          }
        })
        .select()
        .single();

      if (transactionError) {
        logStep('Tournament fee transaction creation error', transactionError);
        throw new Error('Failed to create tournament fee transaction record');
      }

      // Register user for tournament
      const { error: registrationError } = await supabaseService
        .from('tournament_participants')
        .insert({
          tournament_id: tournamentId,
          user_id: user.id,
          status: 'registered'
        });

      if (registrationError) {
        logStep('Tournament registration error', registrationError);
        throw new Error('Failed to register user for tournament');
      }

      // Update tournament prize pool
      const { error: prizePoolError } = await supabaseService
        .rpc('update_tournament_prize_pool', {
          tournament_id: tournamentId,
          amount: amountInCents
        });

      if (prizePoolError) {
        logStep('Prize pool update error', prizePoolError);
        // Don't throw error here as registration is complete
      }

      logStep('Tournament registration completed', { tournamentId, userId: user.id });

      return new Response(
        JSON.stringify({
          success: true,
          data: {
            transaction_id: transaction.id,
            tournament_id: tournamentId,
            amount_paid: amountInCents,
            reference,
            status: 'tournament_registered'
          },
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );

    } else {
      // Handle regular deposit
      // Create transaction record
      const { data: transaction, error: transactionError } = await supabaseService
        .from('wallet_transactions')
        .insert({
          user_id: user.id,
          wallet_id: wallet.id,
          transaction_type: 'deposit',
          amount: amountInCents,
          description: `PayStack deposit - ${reference}`,
          reference_id: reference,
          status: 'completed',
          metadata: {
            paystack_data: {
              reference: paymentData.reference,
              amount_kobo: paymentData.amount,
              currency: paymentData.currency,
              channel: paymentData.channel,
              paid_at: paymentData.paid_at,
              transaction_date: paymentData.transaction_date,
            }
          }
        })
        .select()
        .single();

      if (transactionError) {
        logStep('Transaction creation error', transactionError);
        throw new Error('Failed to create transaction record');
      }

      logStep('Transaction record created', { transactionId: transaction.id });

      // Update wallet balance
      const newBalance = wallet.balance + amountInCents;
      const { error: updateError } = await supabaseService
        .from('user_wallets')
        .update({ 
          balance: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq('id', wallet.id);

      if (updateError) {
        logStep('Wallet update error', updateError);
        throw new Error('Failed to update wallet balance');
      }

      logStep('Wallet balance updated', { 
        oldBalance: wallet.balance, 
        newBalance, 
        amountAdded: amountInCents 
      });

      return new Response(
        JSON.stringify({
          success: true,
          data: {
            transaction_id: transaction.id,
            amount_added: amountInCents,
            new_balance: newBalance,
            reference,
            status: 'completed'
          },
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

  } catch (error) {
    logStep('Error in PayStack verification', { error: error.message });
    console.error('PayStack verification error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Payment verification failed',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});