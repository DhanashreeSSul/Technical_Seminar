import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useLanguage } from "@/components/language-provider";
import { useAuth } from "@/lib/auth";
import { Menu, X, Heart, Globe } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const langLabels: Record<string, string> = {
  en: "English",
  hi: "हिंदी",
  mr: "मराठी",
};

export function Header() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  const isAuthPage = location.startsWith("/auth") || location.startsWith("/ngo/register") || location.startsWith("/ngo/login");
  if (isAuthPage) return null;

  const navItems = [
    { href: "/", label: t("nav.home") },
    { href: "/events", label: t("nav.events") },
    { href: "/jobs", label: t("nav.jobs") },
    { href: "/training", label: t("nav.training") },
    { href: "/schemes", label: t("nav.schemes") },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Heart className="h-8 w-8 text-primary fill-primary" />
            <span className="font-semibold text-xl hidden sm:inline" style={{ fontFamily: "Poppins, sans-serif" }}>She Connects Now</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <span
                  className={`text-sm font-medium transition-colors hover:text-primary ${location === item.href ? "text-primary" : "text-muted-foreground"
                    }`}
                  data-testid={`link-nav-${item.href.replace("/", "") || "home"}`}
                >
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1.5" data-testid="button-language">
                  <Globe className="h-4 w-4" />
                  <span className="text-xs hidden sm:inline">{langLabels[language]}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLanguage("en")} className={language === "en" ? "bg-primary/10" : ""}>
                  English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("hi")} className={language === "hi" ? "bg-primary/10" : ""}>
                  हिंदी
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("mr")} className={language === "mr" ? "bg-primary/10" : ""}>
                  मराठी
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <ThemeToggle />

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" data-testid="button-user-menu">
                    {user.type === "user" ? user.data.name || "User" : (user.data as any).name}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={user.type === "user" ? "/dashboard" : "/ngo/dashboard"}>
                      {t("nav.dashboard")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout}>
                    {t("nav.logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/auth">
                  <Button variant="ghost" size="sm" data-testid="button-get-guidance">
                    {t("nav.getGuidance")}
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button size="sm" data-testid="button-register-women">
                    {t("nav.registerWomen")}
                  </Button>
                </Link>
                <Link href="/ngo/register">
                  <Button size="sm" variant="outline" data-testid="button-register-ngo">
                    {t("nav.registerNgo")}
                  </Button>
                </Link>
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <span
                    className={`block px-4 py-2 text-sm font-medium rounded-md transition-colors ${location === item.href ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                      }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </span>
                </Link>
              ))}
              {!user && (
                <>
                  <Link href="/auth">
                    <span className="block px-4 py-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                      {t("nav.getGuidance")}
                    </span>
                  </Link>
                  <Link href="/ngo/register">
                    <span className="block px-4 py-2 text-sm font-medium text-primary" onClick={() => setMobileMenuOpen(false)}>
                      {t("nav.registerNgo")}
                    </span>
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
