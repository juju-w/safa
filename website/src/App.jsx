import React from "react";
import { HowItWorks } from "./HowItWorks.tsx";
import { Prototype } from "./Prototype.tsx";

export function App() {
  const path = window.location.pathname.replace(/\/+$/, "");
  return path.endsWith("/how-it-works") ? <HowItWorks /> : <Prototype />;
}
