import { useEffect } from "react";
import { Link, NavLink, Outlet, ScrollRestoration, useLocation } from "react-router";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme";
import { DOCS_URL, HADRON_URL, REPO_URL, REPORT_FORM_URL } from "@/data";
import { cn } from "@/lib/utils";

const nav = "px-2 py-1 text-[13px] text-muted-foreground hover:text-foreground";

export function Layout() {
  const { pathname } = useLocation();
  // Move focus to the content on navigation, so screen readers announce the new page.
  useEffect(() => {
    document.getElementById("main")?.focus({ preventScroll: true });
  }, [pathname]);
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only z-50 bg-primary px-3 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Skip to content
      </a>
      <header className="border-b border-rule">
        <div className="mx-auto flex h-11 max-w-[1200px] items-center gap-3 px-4">
          <Link to="/" className="mr-2 text-[15px] font-semibold tracking-tight">
            Hadron<span className="text-primary">DB</span>
          </Link>
          <nav aria-label="Main" className="flex min-w-0 flex-1 items-center">
            <NavLink to="/" end className={({ isActive }) => cn(nav, isActive && "text-foreground underline decoration-2 underline-offset-[14px]")}>
              Games
            </NavLink>
            <NavLink to="/report" className={({ isActive }) => cn(nav, isActive && "text-foreground underline decoration-2 underline-offset-[14px]")}>
              Report
            </NavLink>
            <NavLink to="/about" className={({ isActive }) => cn(nav, isActive && "text-foreground underline decoration-2 underline-offset-[14px]")}>
              About
            </NavLink>
            <a href={DOCS_URL} className={nav}>
              Docs
            </a>
          </nav>
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <a href={REPORT_FORM_URL}>Add a report</a>
          </Button>
          <ThemeToggle />
        </div>
      </header>
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        <Outlet />
      </main>
      <footer className="border-t">
        <p className="mx-auto max-w-[1200px] px-4 py-3 text-[12px] text-muted-foreground">
          A community database for <a className="underline hover:text-foreground" href={HADRON_URL}>Hadron</a>. Not
          affiliated with Valve, Steam or Apple. Data{" "}
          <Link className="underline hover:text-foreground" to="/about#license">
            CC BY 4.0
          </Link>
          , code MIT, on{" "}
          <a className="underline hover:text-foreground" href={REPO_URL}>
            GitHub
          </a>
          .
        </p>
      </footer>
      <ScrollRestoration />
    </div>
  );
}
