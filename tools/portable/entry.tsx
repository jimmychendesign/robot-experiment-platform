import React from "react";
import { createRoot } from "react-dom/client";
import Home from "../../app/page";
import "../../app/globals.css";
import "../../app/design-system/axis.css";
import "../../app/design-system/platform.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("RobotOps portable root element is missing.");
}

createRoot(root).render(
  <React.StrictMode>
    <Home />
  </React.StrictMode>,
);
