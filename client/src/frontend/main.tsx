import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/index.css";

// Build version for cache busting: 20260112_0700
console.log("App Version: 2.1.0 (Professional Light Theme)");

createRoot(document.getElementById("root")!).render(<App />);
