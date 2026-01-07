"use client";
import React, { useState } from "react";
import TypingEngine from "./components/typingengine";
import LandingPage from "./components/landingpage";
export default function Home() {
  const [view, setView] = useState<"landing" | "engine">("landing");
  return (
    <>
      {view === "landing" ? (
        <LandingPage onStart={() => setView("engine")} />
      ) : (
        <div className="relative animate-in fade-in slide-in-from-bottom-8 duration-500">
          <TypingEngine />
        </div>
      )}
    </>
  );
}
