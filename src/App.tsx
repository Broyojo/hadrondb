import { createBrowserRouter, RouterProvider } from "react-router";
import { Layout } from "@/components/layout";
import { AboutPage } from "@/pages/about";
import { GamePage } from "@/pages/game";
import { HomePage } from "@/pages/home";
import { HowToReportPage } from "@/pages/how-to-report";
import { NotFoundPage } from "@/pages/not-found";

const router = createBrowserRouter(
  [
    {
      element: <Layout />,
      children: [
        { index: true, element: <HomePage /> },
        { path: "game/:id", element: <GamePage kind="steam" /> },
        { path: "program/:id", element: <GamePage kind="program" /> },
        { path: "report", element: <HowToReportPage /> },
        { path: "about", element: <AboutPage /> },
        { path: "*", element: <NotFoundPage /> },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL.replace(/\/$/, "") || "/" },
);

export function App() {
  return <RouterProvider router={router} />;
}
