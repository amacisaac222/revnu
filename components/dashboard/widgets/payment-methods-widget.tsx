"use client";

import { CreditCard, Banknote, DollarSign, Smartphone } from "lucide-react";

export interface PaymentMethodStat {
  method: string;
  count: number;
  totalAmount: number;
  percentage: number;
}

interface PaymentMethodsWidgetProps {
  paymentMethods: PaymentMethodStat[];
}

export default function PaymentMethodsWidget({
  paymentMethods,
}: PaymentMethodsWidgetProps) {
  const getIcon = (method: string) => {
    const lowerMethod = method.toLowerCase();
    if (lowerMethod.includes("card") || lowerMethod.includes("credit")) {
      return <CreditCard className="w-5 h-5 text-revnu-green" />;
    }
    if (lowerMethod.includes("ach") || lowerMethod.includes("bank")) {
      return <Banknote className="w-5 h-5 text-blue-400" />;
    }
    if (lowerMethod.includes("venmo") || lowerMethod.includes("zelle") || lowerMethod.includes("paypal")) {
      return <Smartphone className="w-5 h-5 text-purple-400" />;
    }
    return <DollarSign className="w-5 h-5 text-amber-400" />;
  };

  if (paymentMethods.length === 0) {
    return (
      <div className="text-center py-8 text-revnu-gray">
        <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No payment data yet</p>
      </div>
    );
  }

  const totalAmount = paymentMethods.reduce((sum, pm) => sum + pm.totalAmount, 0);

  return (
    <div className="space-y-3">
      {paymentMethods.map((method) => (
        <div
          key={method.method}
          className="p-3 bg-revnu-dark/30 border border-revnu-green/10 rounded-lg hover:border-revnu-green/30 transition"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-revnu-dark/50 rounded-lg">
              {getIcon(method.method)}
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-white">{method.method}</h4>
              <p className="text-xs text-revnu-gray">{method.count} payment{method.count !== 1 ? 's' : ''}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-revnu-green">
                ${(method.totalAmount / 100).toLocaleString()}
              </p>
              <p className="text-xs text-revnu-gray">{method.percentage.toFixed(1)}%</p>
            </div>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-revnu-dark rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-revnu-green to-revnu-greenDark h-full rounded-full transition-all"
              style={{ width: `${method.percentage}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
