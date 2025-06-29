
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-PAYSTACK-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!paystackSecretKey) {
      throw new Error("PAYSTACK_SECRET_KEY is not set");
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

    const { reference } = await req.json();
    if (!reference) {
      throw new Error("Payment reference is required");
    }

    logStep("Verifying payment", { reference, userId: user.id });

    // Verify payment with PayStack
    const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${paystackSecretKey}`,
      },
    });

    const verifyData = await verifyResponse.json();

    if (!verifyResponse.ok || !verifyData.status) {
      throw new Error(`PayStack verification failed: ${verifyData.message || 'Unknown error'}`);
    }

    const transaction = verifyData.data;

    if (transaction.status !== 'success') {
      throw new Error("Payment not successful");
    }

    if (transaction.metadata?.user_id !== user.id) {
      throw new Error("Payment does not belong to authenticated user");
    }

    logStep("Payment verified", { 
      status: transaction.status,
      amount: transaction.amount,
      currency: transaction.currency 
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
    const transactionAmount = transaction.metadata?.transaction_type === 'deposit' 
      ? transaction.amount 
      : -transaction.amount;

    const { data: walletTransaction, error: transactionError } = await supabaseClient
      .from('wallet_transactions')
      .insert({
        wallet_id: wallet.id,
        user_id: user.id,
        transaction_type: transaction.metadata?.transaction_type || 'deposit',
        amount: transactionAmount,
        description: `${transaction.metadata?.transaction_type === 'deposit' ? 'Deposit' : 'Withdrawal'} via PayStack - NGN ${(transaction.amount / 100).toFixed(2)}`,
        reference_id: reference,
        status: 'completed',
        metadata: {
          paystack_reference: reference,
          paystack_transaction_id: transaction.id,
          currency: transaction.currency,
          payment_method: 'paystack',
        },
      })
      .select()
      .single();

    if (transactionError) {
      throw new Error(`Failed to create transaction: ${transactionError.message}`);
    }

    logStep("Transaction created", { transactionId: walletTransaction.id });

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
        transaction: walletTransaction,
        newBalance: newBalance,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in verify-paystack-payment", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
