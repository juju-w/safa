import React from "react";
import { HowItWorks } from "./HowItWorks.tsx";
import { LiveDemo } from "./LiveDemo.tsx";
import { Prototype } from "./Prototype.tsx";

export function App() {
  const path = window.location.pathname.replace(/\/+$/, "");
  if (path.endsWith("/how-it-works")) return <HowItWorks />;
  if (path.endsWith("/live-demo")) return <LiveDemo />;
  return <Prototype />;
}