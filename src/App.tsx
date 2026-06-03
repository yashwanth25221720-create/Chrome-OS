import React from "react";
import { HaloStateProvider } from "./state/HaloStateContext";
import { MinimalDesktop } from "./components/minimal/MinimalDesktop";
import "./styles.css";

export default function App() {
  return (
    <HaloStateProvider>
      <MinimalDesktop />
    </HaloStateProvider>
  );
}
