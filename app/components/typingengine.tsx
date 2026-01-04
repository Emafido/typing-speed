"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import passagesData from "../data.json";

// Type definition for our difficulty levels
type Difficulty = "easy" | "medium" | "hard";

const TypingEngine = () => {
  // --- 1. STATE MANAGEMENT ---
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [isTimedMode, setIsTimedMode] = useState<boolean>(true);
  const [passage, setPassage] = useState<string>("");
  const [userInput, setUserInput] = useState<string>("");
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(60);
  const [totalMistakes, setTotalMistakes] = useState<number>(0);
  
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // --- 2. INTERNAL RESET LOGIC ---
  // This function handles switching levels or restarting without a page reload.
  const resetTest = (newDiff: Difficulty = difficulty, newMode: boolean = isTimedMode) => {
    const choices = passagesData[newDiff];
    const randomPassage = choices[Math.floor(Math.random() * choices.length)];
    
    setPassage(randomPassage);
    setUserInput("");
    setIsStarted(false);
    setDifficulty(newDiff);
    setIsTimedMode(newMode);
    setTotalMistakes(0); // Reset the mistake counter
    setTimer(newMode ? 60 : 0); // 60 for countdown, 0 for count-up
    
    // Smooth UX: automatically focus the hidden input
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  // Run once on mount to set the first passage
  useEffect(() => {
    resetTest();
  }, []);

  // --- 3. THE TIMER HEARTBEAT ---
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isStarted) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (isTimedMode) {
            if (prev <= 1) {
              setIsStarted(false);
              return 0;
            }
            return prev - 1; // Timed: Countdown
          } else {
            return prev + 1; // Passage: Count up
          }
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStarted, isTimedMode]);

  // --- 4. REAL-TIME MATH (useMemo for Performance) ---
  const stats = useMemo(() => {
    const secondsElapsed = isTimedMode ? 60 - timer : timer;
    const minutesElapsed = secondsElapsed / 60;
    
    // WPM Formula: ((Total Chars / 5) / Minutes)
    const wpm = minutesElapsed > 0 
      ? Math.round((userInput.length / 5) / minutesElapsed) 
      : 0;

    // True Accuracy Formula: ((Total Typed - Mistakes) / Total Typed) * 100
    const accuracy = userInput.length > 0 
      ? Math.max(0, Math.round(((userInput.length - totalMistakes) / userInput.length) * 100)) 
      : 100;

    return { wpm, accuracy };
  }, [userInput, timer, totalMistakes, isTimedMode]);

  // --- 5. INPUT HANDLER (With Mistake Tracking) ---
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    
    // Prevent typing if time ran out or passage is finished
    if ((isTimedMode && timer === 0) || userInput.length === passage.length) return;

    if (val.length <= passage.length) {
      // MISTAKE TRACKER: Only check if the user is adding a new character
      if (val.length > userInput.length) {
        const lastCharTyped = val[val.length - 1];
        const targetChar = passage[val.length - 1];
        
        if (lastCharTyped !== targetChar) {
          setTotalMistakes((prev) => prev + 1);
        }
      }

      setUserInput(val);
      if (!isStarted) setIsStarted(true);

      if (val.length === passage.length) {
        setIsStarted(false);
      }
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-4xl font-mono text-gray-800">
      
      {/* HEADER: MODE & DIFFICULTY TOGGLES */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
          {(["easy", "medium", "hard"] as Difficulty[]).map((level) => (
            <button
              key={level}
              onClick={() => resetTest(level)}
              className={`px-5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                difficulty === level ? "bg-white shadow-sm text-black" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {level.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => resetTest(difficulty, true)}
            className={`px-5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              isTimedMode ? "bg-white shadow-sm text-black" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            TIMED
          </button>
          <button
            onClick={() => resetTest(difficulty, false)}
            className={`px-5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              !isTimedMode ? "bg-white shadow-sm text-black" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            PASSAGE
          </button>
        </div>
      </div>

      {/* STATS DISPLAY */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
          <p className="text-[10px] uppercase tracking-tighter text-gray-400 mb-1">Words Per Minute</p>
          <p className="text-4xl font-black">{stats.wpm}</p>
        </div>
        <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
          <p className="text-[10px] uppercase tracking-tighter text-gray-400 mb-1">Accuracy</p>
          <p className="text-4xl font-black">{stats.accuracy}%</p>
        </div>
        <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
          <p className="text-[10px] uppercase tracking-tighter text-gray-400 mb-1">Time Remaining</p>
          <p className={`text-4xl font-black ${isTimedMode && timer < 10 ? "text-red-500 animate-pulse" : "text-gray-800"}`}>
            {timer}s
          </p>
        </div>
      </div>

      {/* TYPING ENGINE VISUALS */}
      <div
        className="relative p-12 bg-white border border-gray-100 rounded-[2rem] shadow-sm cursor-text min-h-[250px] flex items-center"
        onClick={() => inputRef.current?.focus()}
      >
        <div className="select-none pointer-events-none text-3xl leading-relaxed tracking-tight text-gray-200 w-full">
          {passage.split("").map((char, index) => {
            let color = "text-gray-200";
            let isCurrent = index === userInput.length;

            if (index < userInput.length) {
              color = userInput[index] === char ? "text-gray-800" : "text-red-500 border-b-2 border-red-500";
            }

            return (
              <span 
                key={index} 
                className={`${color} transition-colors duration-150 ${isCurrent ? "bg-gray-100 border-l-2 border-black animate-pulse" : ""}`}
              >
                {char}
              </span>
            );
          })}
        </div>

        {/* THE ENGINE CORE: HIDDEN INPUT */}
        <textarea
          ref={inputRef}
          value={userInput}
          onChange={handleInputChange}
          autoFocus
          className="absolute inset-0 opacity-0 cursor-default resize-none"
          spellCheck={false}
        />
      </div>

      {/* FOOTER: RESTART */}
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={() => resetTest()}
          className="group flex items-center gap-2 px-10 py-3 bg-gray-900 text-white rounded-full font-bold hover:bg-black transition-all active:scale-95"
        >
          <span>RESTART TEST</span>
          <span className="group-hover:rotate-180 transition-transform duration-500">🔄</span>
        </button>

        {!isStarted && userInput.length === passage.length && userInput.length > 0 && (
          <div className="bg-gray-900 text-white px-6 py-3 rounded-2xl animate-bounce">
            🔥 Result: {stats.wpm} WPM | {stats.accuracy}% ACC
          </div>
        )}
      </div>
    </div>
  );
};

export default TypingEngine;