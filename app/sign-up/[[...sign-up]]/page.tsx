import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-revnu-dark">
      <div className="w-full max-w-md">
        <SignUp />
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            By signing up, you agree to our{" "}
            <Link
              href="/terms"
              target="_blank"
              className="text-revnu-green hover:underline"
            >
              Terms of Service
            </Link>
            ,{" "}
            <Link
              href="/privacy"
              target="_blank"
              className="text-revnu-green hover:underline"
            >
              Privacy Policy
            </Link>
            , and{" "}
            <Link
              href="/acceptable-use"
              target="_blank"
              className="text-revnu-green hover:underline"
            >
              Acceptable Use Policy
            </Link>
            .
          </p>
          <p className="text-xs text-gray-500 mt-3">
            You certify that you will obtain proper consent before sending SMS messages and comply with TCPA requirements.
          </p>
        </div>
      </div>
    </div>
  );
}
