import { useEffect } from "react";
import { Link, NavLink, Outlet, ScrollRestoration, useLocation } from "react-router";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme";
import { HADRON_URL, REPO_URL, REPORT_FORM_URL } from "@/data";
import { cn } from "@/lib/utils";
import markDark from "@/assets/hadron-mark-dark.svg";
import markLight from "@/assets/hadron-mark-light.svg";

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 rounded-md font-semibold tracking-tight" aria-label="HadronDB, home">
      <img src={markLight} alt="" width={28} height={28} className="size-7 dark:hidden" />
      <img src={markDark} alt="" width={28} height={28} className="hidden size-7 dark:block" />
      <span className="hidden text-lg min-[400px]:inline">
        Hadron<span className="text-primary">DB</span>
      </span>
    </Link>
  );
}

const NAV: { to: string; label: string; short?: string; end: boolean }[] = [
  { to: "/", label: "Games", end: true },
  { to: "/report", label: "How to report", short: "Report", end: false },
  { to: "/about", label: "About", end: false },
];

export function Layout() {
  const { pathname } = useLocation();
  // Move focus to the page's heading on navigation, so screen readers announce the new page.
  useEffect(() => {
    document.getElementById("main")?.focus({ preventScroll: true });
  }, [pathname]);
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-primary px-3 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4 sm:gap-6">
          <Logo />
          <nav aria-label="Main" className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto text-sm">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  cn(
                    "rounded-md px-2.5 py-1.5 whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground",
                    isActive && "bg-secondary font-medium text-foreground",
                  )
                }
              >
                {n.short ? (
                  <>
                    <span className="sm:hidden">{n.short}</span>
                    <span className="hidden sm:inline">{n.label}</span>
                  </>
                ) : (
                  n.label
                )}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-1">
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <a href={REPORT_FORM_URL}>
                <Plus aria-hidden /> Add a report
              </a>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        <Outlet />
      </main>
      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            HadronDB is a community project for{" "}
            <a className="font-medium text-foreground underline" href={HADRON_URL}>
              Hadron
            </a>
            . Not affiliated with Valve, Steam or Apple.
          </p>
          <p className="flex flex-wrap gap-x-4 gap-y-1">
            <a className="underline hover:text-foreground" href={REPO_URL}>
              Source and data
            </a>
            <Link className="underline hover:text-foreground" to="/about#license">
              Licences
            </Link>
          </p>
        </div>
      </footer>
      <ScrollRestoration />
    </div>
  );
}
