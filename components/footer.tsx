import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-revnu-green/20 bg-revnu-darker">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">REVNU</h3>
            <p className="text-sm text-gray-400">
              Professional payment reminder software for modern businesses.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/dashboard"
                  className="text-gray-400 hover:text-revnu-green transition-colors"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/sequences"
                  className="text-gray-400 hover:text-revnu-green transition-colors"
                >
                  Sequences
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/customers"
                  className="text-gray-400 hover:text-revnu-green transition-colors"
                >
                  Customers
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/invoices"
                  className="text-gray-400 hover:text-revnu-green transition-colors"
                >
                  Invoices
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/terms"
                  className="text-gray-400 hover:text-revnu-green transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-gray-400 hover:text-revnu-green transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/acceptable-use"
                  className="text-gray-400 hover:text-revnu-green transition-colors"
                >
                  Acceptable Use Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="mailto:support@revnu.com"
                  className="text-gray-400 hover:text-revnu-green transition-colors"
                >
                  Contact Support
                </a>
              </li>
              <li>
                <a
                  href="mailto:compliance@revnu.com"
                  className="text-gray-400 hover:text-revnu-green transition-colors"
                >
                  Compliance
                </a>
              </li>
              <li>
                <a
                  href="mailto:abuse@revnu.com"
                  className="text-gray-400 hover:text-revnu-green transition-colors"
                >
                  Report Abuse
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-revnu-green/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © {currentYear} REVNU. All rights reserved.
            </p>
            <p className="text-xs text-gray-500 text-center md:text-right max-w-2xl">
              REVNU is a software platform only and is NOT a debt collection agency.
              Users are responsible for TCPA compliance and obtaining proper consent.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
