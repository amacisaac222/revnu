import { CheckCircle } from "lucide-react";
import Link from "next/link";

export default function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ invoice?: string }>;
}) {
  return (
    <div className="min-h-screen bg-revnu-dark flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-revnu-slate/40 border border-revnu-green/20 rounded-2xl p-8 text-center">
        <div className="mb-6">
          <CheckCircle className="w-20 h-20 text-revnu-green mx-auto mb-4" />
          <h1 className="text-3xl font-black text-white mb-2">
            Payment Successful!
          </h1>
          <p className="text-revnu-gray">
            Thank you for your payment. Your transaction has been completed successfully.
          </p>
        </div>

        <div className="bg-revnu-dark/50 border border-revnu-green/20 rounded-lg p-6 mb-6">
          <h2 className="text-sm font-bold text-revnu-gray mb-2">
            What happens next?
          </h2>
          <ul className="text-sm text-white space-y-2 text-left">
            <li>✓ You'll receive a confirmation email shortly</li>
            <li>✓ Your account has been updated</li>
            <li>✓ Receipt is available in your email</li>
          </ul>
        </div>

        <div className="space-y-3">
          <Link
            href="/dashboard"
            className="block w-full px-6 py-3 bg-revnu-green text-revnu-dark font-black rounded-lg hover:bg-revnu-greenLight transition"
          >
            Return to Dashboard
          </Link>
          <p className="text-xs text-revnu-gray">
            If you have any questions, please contact support
          </p>
        </div>
      </div>
    </div>
  );
}
