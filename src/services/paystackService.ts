
import { supabase } from '@/integrations/supabase/client';

export interface PayStackPaymentData {
  email: string;
  amount: number; // in kobo (NGN smallest unit)
  currency: 'NGN';
  reference: string;
  callback_url?: string;
  metadata?: {
    user_id: string;
    transaction_type: 'deposit' | 'withdrawal';
    [key: string]: any;
  };
}

export class PayStackService {
  private static readonly PAYSTACK_PUBLIC_KEY = 'pk_test_c81ee6045a1c2fa016fc95f26d81a05782163675';
  
  static async initializePayment(paymentData: PayStackPaymentData) {
    try {
      const { data, error } = await supabase.functions.invoke('initialize-paystack-payment', {
        body: paymentData,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('PayStack initialization error:', error);
      throw error;
    }
  }

  static async verifyPayment(reference: string) {
    try {
      const { data, error } = await supabase.functions.invoke('verify-paystack-payment', {
        body: { reference },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('PayStack verification error:', error);
      throw error;
    }
  }

  static generateReference(): string {
    return `paystack_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }
}
