"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TrendingUp, Star, Briefcase, BarChart2 } from "lucide-react";
import SearchBar from "./SearchBar";

const NAV_LINKS = [
  { href: "/", label: "Marchés", icon: TrendingUp },
  { href: "/favorites", label: "Favoris", icon: Star },
  { href: "/portfolio", label: "Portefeuille", icon: Briefcase },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-bg-border bg-bg-secondary/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-accent-green/20 flex items-center justify-center">
            <BarChart2 className="w-5 h-5 text-accent-green" />
          </div>
          <span className="font-semibold text-white hidden sm:block">
            StockTracker
          </span>
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-md">
          <SearchBar />
        </div>

        {/* Links */}
        <div className="flex items-center gap-1 shrink-0">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-accent-blue/20 text-accent-blue"
                    : "text-slate-400 hover:text-white hover:bg-bg-hover"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:block">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
