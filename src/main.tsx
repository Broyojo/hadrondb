import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@/App";
import { ratingCss } from "@/lib/rating-css";
import "./index.css";

const style = document.createElement("style");
style.textContent = ratingCss();
document.head.appendChild(style);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
