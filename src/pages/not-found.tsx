import { Link } from "react-router";
import { useTitle } from "@/lib/use-title";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  useTitle("Page not found · HadronDB");
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-sm font-medium text-primary">404</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Nothing here</h1>
      <p className="mt-3 text-muted-foreground">
        This page doesn't exist, or the game hasn't been reported yet.
      </p>
      <Button asChild className="mt-6">
        <Link to="/">Browse games</Link>
      </Button>
    </div>
  );
}
