import { Link } from "react-router";
import { useTitle } from "@/lib/use-title";

export function NotFoundPage() {
  useTitle("Page not found · HadronDB");
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-10">
      <div className="doc">
        <h1>Not found</h1>
        <p>
          No page here. The game may not have a report yet. <Link to="/">All games</Link>.
        </p>
      </div>
    </div>
  );
}
