
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) {
      throw new Error("User not authenticated or email not available");
    }

    const { sessionId } = await req.json();
    if (!sessionId) {
      throw new Error("Session ID is required");
    }

    logStep("Verifying payment", { sessionId, userId: user.id });

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Retrieve the session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status !== 'paid') {
      throw new Error("Payment not completed");
    }

    if (session.metadata?.user_id !== user.id) {
      throw new Error("Payment session does not belong to authenticated user");
    }

    logStep("Payment verified", { 
      paymentStatus: session.payment_status,
      amount: session.amount_total,
      currency: session.currency 
    });

    // Get user's wallet
    const { data: wallet, error: walletError } = await supabaseClient
      .from('user_wallets')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (walletError) {
      throw new Error(`Failed to get wallet: ${walletError.message}`);
    }

    // Create transaction record
    const transactionAmount = session.metadata?.transaction_type === 'deposit' 
      ? session.amount_total 
      : -session.amount_total;

    const { data: transaction, error: transactionError } = await supabaseClient
      .from('wallet_transactions')
      .insert({
        wallet_id: wallet.id,
        user_id: user.id,
        transaction_type: session.metadata?.transaction_type || 'deposit',
        amount: transactionAmount,
        description: `${session.metadata?.transaction_type === 'deposit' ? 'Deposit' : 'Withdrawal'} via Stripe - ${session.currency?.toUpperCase()} ${(session.amount_total! / 100).toFixed(2)}`,
        reference_id: sessionId,
        status: 'completed',
        metadata: {
          stripe_session_id: sessionId,
          stripe_payment_intent: session.payment_intent,
          currency: session.currency,
          payment_method: 'stripe',
        },
      })
      .select()
      .single();

    if (transactionError) {
      throw new Error(`Failed to create transaction: ${transactionError.message}`);
    }

    logStep("Transaction created", { transactionId: transaction.id });

    // Update wallet balance
    const newBalance = wallet.balance + transactionAmount;
    const { error: updateError } = await supabaseClient
      .from('user_wallets')
      .update({ 
        balance: newBalance,
        updated_at: new Date().toISOString(),
      })
      .eq('id', wallet.id);

    if (updateError) {
      throw new Error(`Failed to update wallet balance: ${updateError.message}`);
    }

    logStep("Wallet updated", { newBalance });

    return new Response(
      JSON.stringify({
        success: true,
        transaction: transaction,
        newBalance: newBalance,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in verify-payment", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
