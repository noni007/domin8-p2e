import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  console.log(`[PayStack Init] ${step}`, details ? JSON.stringify(details) : '');
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep('Starting PayStack payment initialization');

    // Create Supabase client for user authentication
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
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
    const body = await req.json();
    const { email, amount, currency, reference, metadata } = body;

    logStep('Request body parsed', { email, amount, currency, reference });

    // Validate required fields
    if (!email || !amount || !currency || !reference) {
      throw new Error('Missing required fields: email, amount, currency, reference');
    }

    // Validate currency (PayStack primarily supports NGN)
    if (currency !== 'NGN') {
      throw new Error('PayStack currently supports NGN currency only');
    }

    // Validate minimum amount (PayStack requires minimum 100 kobo = 1 NGN)
    if (amount < 100) {
      throw new Error('Amount must be at least 100 kobo (1 NGN)');
    }

    // Prepare PayStack API request
    const transactionType = metadata?.transaction_type || 'deposit';
    
    // Set callback URL based on transaction type
    let callbackUrl;
    if (transactionType === 'tournament_fee') {
      callbackUrl = `${req.headers.get('origin')}/tournaments?payment=success&reference=${reference}`;
    } else {
      callbackUrl = `${req.headers.get('origin')}/wallet?payment=success&reference=${reference}`;
    }

    const paystackData = {
      email,
      amount: Math.round(amount), // Ensure amount is integer
      currency,
      reference,
      callback_url: callbackUrl,
      metadata: {
        user_id: user.id,
        transaction_type: transactionType,
        ...metadata
      }
    };

    logStep('Calling PayStack API', { reference, amount: paystackData.amount });

    // Call PayStack API to initialize transaction
    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('PAYSTACK_SECRET_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paystackData),
    });

    const paystackResult = await paystackResponse.json();

    if (!paystackResponse.ok || !paystackResult.status) {
      logStep('PayStack API error', paystackResult);
      throw new Error(paystackResult.message || 'PayStack initialization failed');
    }

    logStep('PayStack payment initialized successfully', { 
      reference: paystackResult.data.reference,
      authorizationUrl: paystackResult.data.authorization_url 
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          authorization_url: paystackResult.data.authorization_url,
          access_code: paystackResult.data.access_code,
          reference: paystackResult.data.reference,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    logStep('Error in PayStack initialization', { error: error.message });
    console.error('PayStack initialization error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to initialize PayStack payment',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});