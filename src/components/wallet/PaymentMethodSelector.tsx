
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Smartphone, Banknote, ArrowLeft } from "lucide-react";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";

export type PaymentMethod = 'stripe' | 'paystack';
export type Currency = 'usd' | 'ngn';

interface PaymentMethodSelectorProps {
  onMethodSelect: (method: PaymentMethod, currency: Currency) => void;
  onBack?: () => void;
  type: 'deposit' | 'withdrawal';
}

export const PaymentMethodSelector = ({ onMethodSelect, onBack, type }: PaymentMethodSelectorProps) => {
  const { isMobile } = useResponsiveLayout();
  const [selectedMethod, setSelectedMethod] = useState<{ method: PaymentMethod; currency: Currency } | null>(null);

  const paymentMethods = [
    {
      method: 'stripe' as PaymentMethod,
      currency: 'usd' as Currency,
      title: 'International Cards',
      description: 'Visa, Mastercard, American Express',
      icon: CreditCard,
      badge: 'USD',
      badgeColor: 'bg-blue-500',
      recommended: false,
    },
    {
      method: 'paystack' as PaymentMethod,
      currency: 'ngn' as Currency,
      title: 'Nigerian Payment',
      description: 'Bank Transfer, Cards, USSD',
      icon: Smartphone,
      badge: 'NGN',
      badgeColor: 'bg-green-500',
      recommended: true,
    },
    {
      method: 'stripe' as PaymentMethod,
      currency: 'ngn' as Currency,
      title: 'Stripe (NGN)',
      description: 'International processing for NGN',
      icon: Banknote,
      badge: 'NGN',
      badgeColor: 'bg-purple-500',
      recommended: false,
    }
  ];

  const handleMethodSelect = (method: PaymentMethod, currency: Currency) => {
    setSelectedMethod({ method, currency });
    setTimeout(() => {
      onMethodSelect(method, currency);
    }, 300);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        {onBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        )}
        <div className="flex-1 text-center">
          <h2 className="text-xl font-bold text-white">
            Choose Payment Method
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Select your preferred {type} method
          </p>
        </div>
      </div>

      {/* Payment Methods Grid */}
      <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'}`}>
        {paymentMethods.map(({ method, currency, title, description, icon: Icon, badge, badgeColor, recommended }) => (
          <Card
            key={`${method}-${currency}`}
            className={`
              relative cursor-pointer transition-all duration-300 border-2 
              ${selectedMethod?.method === method && selectedMethod?.currency === currency
                ? 'border-blue-500 bg-blue-500/10 scale-105' 
                : 'border-gray-700 bg-black/40 hover:border-gray-600 hover:bg-black/60'
              }
              backdrop-blur-sm
            `}
            onClick={() => handleMethodSelect(method, currency)}
          >
            {recommended && (
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-green-500 to-teal-600 text-white text-xs px-3 py-1">
                  Recommended
                </Badge>
              </div>
            )}

            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-gray-800">
                    <Icon className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-lg">{title}</CardTitle>
                  </div>
                </div>
                <Badge className={`${badgeColor} text-white text-xs`}>
                  {badge}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <p className="text-gray-400 text-sm mb-4">{description}</p>
              
              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  {method === 'paystack' ? 'Local Processing' : 'International'}
                </div>
                <Button
                  size="sm"
                  variant={selectedMethod?.method === method && selectedMethod?.currency === currency ? "default" : "outline"}
                  className={`
                    transition-all duration-200
                    ${selectedMethod?.method === method && selectedMethod?.currency === currency
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    }
                  `}
                >
                  {selectedMethod?.method === method && selectedMethod?.currency === currency ? 'Selected' : 'Select'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info Section */}
      <Card className="bg-gradient-to-r from-blue-900/20 to-teal-900/20 border-blue-800/30">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-full bg-blue-600/20">
              <CreditCard className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h4 className="text-white font-medium mb-2">Secure Payments</h4>
              <p className="text-gray-400 text-sm">
                All payments are processed securely with bank-level encryption. 
                Your payment information is never stored on our servers.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
