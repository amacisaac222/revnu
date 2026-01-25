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

interface NavGroup {
  label: string;
  icon: string;
  items: NavLink[];
}

interface NavLink {
  href: string;
  label: string;
  icon: string;
  match: (p: string) => boolean;
}

export default function DashboardNav({ organization }: DashboardNavProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const isActive = (path: string) => pathname === path;

  // Grouped navigation structure
  const navGroups: (NavLink | NavGroup)[] = [
    { href: "/dashboard", label: "Overview", icon: "📊", match: (p: string) => p === "/dashboard" },
    { href: "/dashboard/customers", label: "Customers", icon: "👥", match: (p: string) => p.startsWith("/dashboard/customers") },
    { href: "/dashboard/invoices", label: "Invoices", icon: "📄", match: (p: string) => p.startsWith("/dashboard/invoices") },
    {
      label: "Automation",
      icon: "🤖",
      items: [
        { href: "/dashboard/send-reminders", label: "Send Reminders", icon: "💌", match: (p: string) => p.startsWith("/dashboard/send-reminders") },
        { href: "/dashboard/campaigns", label: "Campaigns", icon: "🎯", match: (p: string) => p.startsWith("/dashboard/campaigns") },
        { href: "/dashboard/sequences", label: "Sequences", icon: "📬", match: (p: string) => p.startsWith("/dashboard/sequences") },
      ]
    },
    {
      label: "Activity",
      icon: "📈",
      items: [
        { href: "/dashboard/reports", label: "Reports", icon: "📈", match: (p: string) => p.startsWith("/dashboard/reports") },
        { href: "/dashboard/communications", label: "Communications", icon: "💬", match: (p: string) => p.startsWith("/dashboard/communications") },
      ]
    },
  ];

  const isGroupActive = (group: NavGroup) => {
    return group.items.some(item => item.match(pathname));
  };

  return (
    <>
      {/* Desktop Top Nav */}
      <div className="bg-revnu-darker border-b border-revnu-slate/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo - Always visible */}
            <Link href="/dashboard" className="hover:opacity-90 transition">
              <img src="/logo-new.svg" alt="REVNU" className="h-8" />
            </Link>

            {/* Desktop Nav - Hidden on mobile */}
            <nav className="hidden lg:flex items-center gap-6">
              {navGroups.map((item, idx) => {
                if ('items' in item) {
                  // This is a dropdown group
                  const group = item as NavGroup;
                  const isActive = isGroupActive(group);
                  return (
                    <div key={idx} className="relative group">
                      <button
                        className={`text-sm font-semibold ${
                          isActive ? "text-revnu-green" : "text-revnu-gray hover:text-white"
                        } transition flex items-center gap-1`}
                      >
                        {group.label}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <div className="absolute top-full left-0 mt-2 w-48 bg-revnu-darker border border-revnu-slate/50 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                        {group.items.map((subItem) => (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className={`block px-4 py-2 text-sm ${
                              subItem.match(pathname)
                                ? "text-revnu-green bg-revnu-green/10"
                                : "text-revnu-gray hover:text-white hover:bg-revnu-slate/30"
                            } transition first:rounded-t-lg last:rounded-b-lg`}
                          >
                            <span className="mr-2">{subItem.icon}</span>
                            {subItem.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                } else {
                  // This is a regular link
                  const link = item as NavLink;
                  return (
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
                  );
                }
              })}
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
        <div className="grid grid-cols-5 gap-1 px-2 py-2">
          {navGroups.map((item, idx) => {
            if ('items' in item) {
              // This is a group - show as expandable
              const group = item as NavGroup;
              const isActive = isGroupActive(group);
              const isOpen = openDropdown === group.label;
              return (
                <div key={idx} className="relative">
                  <button
                    onClick={() => setOpenDropdown(isOpen ? null : group.label)}
                    className={`w-full flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all active:scale-95 ${
                      isActive
                        ? "bg-revnu-green/20 text-revnu-green"
                        : "text-revnu-gray active:bg-revnu-slate/30"
                    }`}
                  >
                    <span className="text-xl mb-1">{group.icon}</span>
                    <span className="text-[10px] font-bold leading-tight text-center">{group.label}</span>
                  </button>
                  {isOpen && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 bg-revnu-darker border border-revnu-slate/50 rounded-lg shadow-lg">
                      {group.items.map((subItem) => (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          onClick={() => setOpenDropdown(null)}
                          className={`block px-3 py-2 text-xs ${
                            subItem.match(pathname)
                              ? "text-revnu-green bg-revnu-green/10"
                              : "text-revnu-gray hover:text-white hover:bg-revnu-slate/30"
                          } transition first:rounded-t-lg last:rounded-b-lg`}
                        >
                          <span className="mr-2">{subItem.icon}</span>
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            } else {
              // Regular link
              const link = item as NavLink;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpenDropdown(null)}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all active:scale-95 ${
                    link.match(pathname)
                      ? "bg-revnu-green/20 text-revnu-green"
                      : "text-revnu-gray active:bg-revnu-slate/30"
                  }`}
                >
                  <span className="text-xl mb-1">{link.icon}</span>
                  <span className="text-[10px] font-bold leading-tight text-center">{link.label}</span>
                </Link>
              );
            }
          })}
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
