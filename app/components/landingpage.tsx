"use client";
import React from "react";
const ArrowRight = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="group-hover:translate-x-1 transition-transform"
  >
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);
const KeyboardIllustration = () => (
  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 opacity-[0.03] scale-125 sm:scale-150 pointer-events-none select-none">
    <div className="grid grid-cols-10 gap-2">
      {Array.from({ length: 30 }).map((_, i) => (
        <div
          key={i}
          className={`w-12 h-12 rounded-xl border-2 border-gray-900 ${
            i === 14 || i === 15 ? "col-span-2 w-full bg-gray-900/10" : ""
          }`}
        ></div>
      ))}
    </div>
    <div className="w-full h-12 mt-2 rounded-xl border-2 border-gray-900 mx-auto max-w-[60%]"></div>
  </div>
);

const LandingPage = ({ onStart }: { onStart: () => void }) => {
  return (
    <div className="min-h-[100dvh] w-full bg-white text-gray-900 font-mono flex flex-col relative overflow-hidden">
      <div
        className="absolute inset-0 z-0 opacity-[0.4]"
        style={{
          backgroundImage:
            "linear-gradient(#f3f4f6 1px, transparent 1px), linear-gradient(90deg, #f3f4f6 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      ></div>
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-white via-white/40 to-white/80"></div>
      <KeyboardIllustration />
      <nav className="relative z-10 flex justify-between items-center px-6 sm:px-12 py-8">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-900 rounded-sm"></div>
          <span className="font-bold tracking-[0.2em] text-sm">VELO</span>
        </div>
        <div className="hidden sm:flex gap-6 text-xs font-medium text-gray-400 tracking-widest uppercase">
          <span>Typing Benchmark</span>
          <span>v2.0.5</span>
          <span className="text-gray-900">Ready</span>
        </div>
      </nav>
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 pb-20">
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="px-4 py-1.5 rounded-full border border-gray-200 bg-white/80 backdrop-blur-sm text-[10px] uppercase tracking-[0.3em] font-bold text-gray-500 shadow-sm flex items-center gap-2 mx-auto w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            System Calibrated
          </span>
        </div>
        <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter mb-4 text-gray-900 animate-in fade-in zoom-in-95 duration-700 delay-100">
          VELO
        </h1>
        <h2 className="text-lg sm:text-2xl font-bold text-gray-400 uppercase tracking-[0.3em] mb-8 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-150">
          The Typing Engine
        </h2>
        <p className="max-w-md text-sm sm:text-base text-gray-600 leading-relaxed mb-12 tracking-wide animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          Measure your{" "}
          <span className="font-bold text-gray-900">Words Per Minute</span> and
          accuracy in a high-fidelity environment. Designed for developers and
          writers who value precision.
        </p>
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          <button
            onClick={onStart}
            className="group relative px-8 py-4 bg-gray-900 text-white rounded-2xl sm:rounded-full font-bold transition-all hover:bg-black hover:scale-105 active:scale-95 shadow-xl shadow-gray-200"
          >
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase tracking-[0.3em]">
                Start Typing Test
              </span>
              <ArrowRight />
            </div>
            <div className="absolute -inset-1 rounded-full bg-gray-400 opacity-20 group-hover:opacity-40 blur transition-opacity"></div>
          </button>
        </div>
        <div className="mt-20 grid grid-cols-2 sm:grid-cols-3 gap-8 sm:gap-16 opacity-60 animate-in fade-in duration-1000 delay-500">
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold">42</span>
            <span className="text-[9px] uppercase tracking-widest text-gray-400 mt-1">
              Avg Global WPM
            </span>
          </div>
          <div className="hidden sm:flex flex-col items-center border-x border-gray-200 px-8 sm:px-16">
            <span className="text-2xl font-bold">98%</span>
            <span className="text-[9px] uppercase tracking-widest text-gray-400 mt-1">
              Accuracy Target
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold">QWERTY</span>
            <span className="text-[9px] uppercase tracking-widest text-gray-400 mt-1">
              Layout
            </span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
