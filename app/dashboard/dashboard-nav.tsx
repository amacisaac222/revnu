"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

interface DashboardNavProps {
  organization: {
    businessName: string;
  };
  userName: string;
}

export default function DashboardNav({ organization }: DashboardNavProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  const navLinks = [
    { href: "/dashboard", label: "Overview", icon: "📊", match: (p: string) => p === "/dashboard" },
    { href: "/dashboard/customers", label: "Customers", icon: "👥", match: (p: string) => p.startsWith("/dashboard/customers") },
    { href: "/dashboard/invoices", label: "Invoices", icon: "📄", match: (p: string) => p.startsWith("/dashboard/invoices") },
    { href: "/dashboard/send-reminders", label: "Send Reminders", icon: "💌", match: (p: string) => p.startsWith("/dashboard/send-reminders") },
    { href: "/dashboard/campaigns", label: "Campaigns", icon: "🎯", match: (p: string) => p.startsWith("/dashboard/campaigns") },
    { href: "/dashboard/sequences", label: "Sequences", icon: "📬", match: (p: string) => p.startsWith("/dashboard/sequences") },
    { href: "/dashboard/reports", label: "Reports", icon: "📈", match: (p: string) => p.startsWith("/dashboard/reports") },
    { href: "/dashboard/communications", label: "Communications", icon: "💬", match: (p: string) => p.startsWith("/dashboard/communications") },
  ];

  return (
    <>
      {/* Desktop Top Nav */}
      <div className="bg-revnu-darker border-b border-revnu-slate/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo - Always visible */}
            <Link href="/dashboard" className="hover:opacity-90 transition">
              <img src="/logo.svg" alt="REVNU" className="h-8" />
            </Link>

            {/* Desktop Nav - Hidden on mobile */}
            <nav className="hidden lg:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-semibold ${
                    link.match(pathname)
                      ? "text-revnu-green"
                      : "text-revnu-gray hover:text-white"
                  } transition`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              <div className="hidden md:block text-right">
                <div className="text-sm font-bold text-white">{organization.businessName}</div>
              </div>
              <UserButton />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation - Fixed at bottom */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-revnu-darker border-t border-revnu-slate/50 safe-area-inset-bottom">
        <div className="grid grid-cols-7 gap-1 px-2 py-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all active:scale-95 ${
                link.match(pathname)
                  ? "bg-revnu-green/20 text-revnu-green"
                  : "text-revnu-gray active:bg-revnu-slate/30"
              }`}
            >
              <span className="text-xl mb-1">{link.icon}</span>
              <span className="text-[10px] font-bold leading-tight">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Add padding to bottom of page content on mobile to account for fixed nav */}
      <style jsx global>{`
        @media (max-width: 1023px) {
          main {
            padding-bottom: 80px !important;
          }
        }
      `}</style>
    </>
  );
}
