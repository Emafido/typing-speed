"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import passagesData from "../data.json";
import confetti from 'canvas-confetti';

type Difficulty = "easy" | "medium" | "hard";
type Category = "quotes" | "code" | "lyrics";
type ResultStatus = "none" | "baseline" | "high-score" | "completed";

const TypingEngine = () => {
  const [highScore, setHighScore] = useState<number>(0);
  const [isFirstTest, setIsFirstTest] = useState<boolean>(true);
  const [resultStatus, setResultStatus] = useState<ResultStatus>("none");
  const [streak, setStreak] = useState<number>(0);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [category, setCategory] = useState<Category>("quotes");
  const [isTimedMode, setIsTimedMode] = useState<boolean>(true);
  const [duration, setDuration] = useState<number>(60);
  const [passage, setPassage] = useState<string>("");
  const [userInput, setUserInput] = useState<string>("");
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(60);
  const [totalMistakes, setTotalMistakes] = useState<number>(0);
  const [keyStats, setKeyStats] = useState<Record<string, { hits: number, misses: number }>>({});

  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("typing-best-wpm");
    if (saved) {
      setHighScore(parseInt(saved));
      setIsFirstTest(false);
    }
    resetTest();
  }, []);

  const resetTest = (newDiff: Difficulty = difficulty, newCat: Category = category, newDur: number = duration, forcedMode?: boolean) => {
    const activeMode = forcedMode !== undefined ? forcedMode : isTimedMode;
    const choices = passagesData[newCat as keyof typeof passagesData] || passagesData["quotes"];
    const randomPassage = choices[Math.floor(Math.random() * choices.length)];
    
    setPassage(randomPassage);
    setUserInput("");
    setIsStarted(false);
    setDifficulty(newDiff);
    setCategory(newCat);
    setDuration(newDur);
    setTotalMistakes(0);
    setStreak(0);
    
    setTimer(activeMode ? newDur : 0);
    setResultStatus("none");
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const stats = useMemo(() => {
    const secondsElapsed = isTimedMode ? duration - timer : timer;
    const minutesElapsed = secondsElapsed / 60;
    const wpm = minutesElapsed > 0 ? Math.round(userInput.length / 5 / minutesElapsed) : 0;
    const accuracy = userInput.length > 0 
      ? Math.max(0, Math.round(((userInput.length - totalMistakes) / userInput.length) * 100)) 
      : 100;
    return { wpm, accuracy, secondsElapsed };
  }, [userInput, timer, totalMistakes, isTimedMode, duration]);

  const handleTestCompletion = () => {
    setIsStarted(false);
    const finalWPM = stats.wpm;

    if (isFirstTest) {
      setResultStatus("baseline");
      setHighScore(finalWPM);
      localStorage.setItem("typing-best-wpm", finalWPM.toString());
      setIsFirstTest(false);
    } else if (finalWPM > highScore) {
      setResultStatus("high-score");
      setHighScore(finalWPM);
      localStorage.setItem("typing-best-wpm", finalWPM.toString());
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#000000', '#ffffff', '#9CA3AF']
      });
    } else {
      setResultStatus("completed");
    }

    const sessionResult = { wpm: finalWPM, acc: stats.accuracy, date: new Date().getTime() };
    const history = JSON.parse(localStorage.getItem("typing-history") || "[]");
    localStorage.setItem("typing-history", JSON.stringify([...history, sessionResult].slice(-20)));
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isStarted) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (isTimedMode) {
            if (prev <= 1) {
              handleTestCompletion();
              return 0;
            }
            return prev - 1;
          } else {
            if (prev >= 300) { // 5-minute safety cap for Infinity Mode
              handleTestCompletion();
              return 300;
            }
            return prev + 1;
          }
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStarted, isTimedMode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if ((isTimedMode && timer === 0) || userInput.length === passage.length) return;

    if (val.length <= passage.length) {
      if (val.length > userInput.length) {
        const charTyped = val[val.length - 1];
        const targetChar = passage[val.length - 1];
        const isCorrect = charTyped === targetChar;

        if (!isCorrect) setTotalMistakes((prev) => prev + 1);
        setStreak(isCorrect ? streak + 1 : 0);

        const key = targetChar.toLowerCase();
        if (/^[a-z0-9 ]$/.test(key)) {
          setKeyStats(prev => ({
            ...prev,
            [key]: {
              hits: (prev[key]?.hits || 0) + (isCorrect ? 1 : 0),
              misses: (prev[key]?.misses || 0) + (isCorrect ? 0 : 1),
            }
          }));
        }
      }
      setUserInput(val);
      if (!isStarted) setIsStarted(true);
      if (val.length === passage.length) handleTestCompletion();
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-screen-2xl mx-auto px-4 sm:px-10 font-mono text-gray-900 py-8 min-h-screen bg-white">
      
      <div className="flex flex-col lg:flex-row justify-between items-center gap-6 border-b border-gray-100 pb-6">
        <div className="text-center lg:text-left">
          <p className="text-[10px] uppercase tracking-[0.4em] text-gray-400 font-bold">Personal Best</p>
          <p className="text-2xl font-black">{highScore} <span className="text-xs font-normal text-gray-300">WPM</span></p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
          <div className="flex gap-1  border-gray-200 pr-3">
            {(["quotes", "code", "lyrics"] as Category[]).map((cat) => (
              <button key={cat} onClick={() => resetTest(difficulty, cat)} className={`px-4 py-1.5 rounded-xl text-[10px] font-bold transition-all ${category === cat ? "bg-white shadow-sm text-black" : "text-gray-400 hover:text-black"}`}>
                {cat.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="flex gap-1  border-gray-200 pr-3">
            {(["easy", "medium", "hard"] as Difficulty[]).map((level) => (
              <button key={level} onClick={() => resetTest(level)} className={`px-4 py-1.5 rounded-xl text-[10px] font-bold transition-all ${difficulty === level ? "bg-white shadow-sm text-black" : "text-gray-400 hover:text-black"}`}>
                {level.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            {[15, 30, 60].map((d) => (
              <button key={d} onClick={() => { setIsTimedMode(true); resetTest(difficulty, category, d, true); }} className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all ${isTimedMode && duration === d ? "bg-white shadow-sm text-black" : "text-gray-400"}`}>
                {d}S
              </button>
            ))}
            <button onClick={() => { setIsTimedMode(false); resetTest(difficulty, category, duration, false); }} className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all ${!isTimedMode ? "bg-white shadow-sm text-black" : "text-gray-400"}`}>
              INF
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatBox label="WPM" value={stats.wpm} />
        <StatBox label="ACCURACY" value={`${stats.accuracy}%`} />
        <StatBox label="STREAK" value={streak} highlight={streak > 20} />
        <StatBox 
          label={isTimedMode ? "TIME REMAINING" : "TIME ELAPSED"} 
          value={`${timer}s`} 
          color={isTimedMode && timer < 10 ? "text-red-500 animate-pulse" : "text-gray-900"} 
        />
      </div>

      <div className="relative p-8 sm:p-20 bg-white border border-gray-100 rounded-[3rem] shadow-sm flex items-center min-h-[300px] transition-all duration-700" onClick={() => inputRef.current?.focus()}>
        <div className="select-none pointer-events-none text-2xl sm:text-4xl leading-[1.6] tracking-tight text-gray-100 w-full break-words">
          {passage.split("").map((char, index) => {
            let color = "text-gray-100";
            let isCurrent = index === userInput.length;
            if (index < userInput.length) {
              color = userInput[index] === char ? "text-gray-900" : "text-red-500 border-b-2 border-red-400";
            }
            return (
              <span key={index} className={`${color} transition-colors duration-100 ${isCurrent ? "border-l-4 border-black pl-1 bg-gray-50 font-bold" : ""}`}>
                {char}
              </span>
            );
          })}
        </div>
        <textarea ref={inputRef} value={userInput} onChange={handleInputChange} className="absolute inset-0 opacity-0 cursor-default" spellCheck={false} />
      </div>

      <div className="flex justify-center mt-6">
        <button onClick={() => resetTest()} className="group px-16 py-4 bg-gray-900 text-white rounded-full font-bold hover:bg-black transition-all active:scale-95 text-xs tracking-[0.3em]">
          RESTART_ENGINE
        </button>
      </div>

      {resultStatus !== "none" && (
        <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="w-full max-w-lg bg-white border border-gray-100 p-10 rounded-[2.5rem] shadow-2xl text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gray-900" />
            <p className="text-[10px] uppercase tracking-[0.5em] text-gray-400 mb-8 font-bold">Session Verification</p>
            
            {resultStatus === "baseline" && <p className="text-2xl font-black mb-2">🎯 BASELINE ESTABLISHED</p>}
            {resultStatus === "high-score" && <p className="text-2xl font-black mb-2 text-gray-900">🔥 HIGH SCORE SMASHED</p>}
            {resultStatus === "completed" && <p className="text-2xl font-black mb-2">SESSION COMPLETE</p>}
            
            <div className="flex justify-around my-10 py-6 border-y border-dashed border-gray-100">
              <div>
                <p className="text-4xl font-black">{stats.wpm}</p>
                <p className="text-[9px] text-gray-400 uppercase tracking-widest mt-1">WPM</p>
              </div>
              <div>
                <p className="text-4xl font-black">{stats.accuracy}%</p>
                <p className="text-[9px] text-gray-400 uppercase tracking-widest mt-1">Accuracy</p>
              </div>
            </div>

            <div className="text-[9px] text-gray-300 font-mono mb-8 italic">
              ID: {Math.random().toString(36).substring(7).toUpperCase()} // {new Date().toLocaleDateString()}
            </div>

            <button onClick={() => resetTest()} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all active:scale-95">
              DISMISS & RESTART
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const StatBox = ({ label, value, color = "text-gray-900", highlight = false }: any) => (
  <div className={`bg-white border border-gray-100 p-6 rounded-[2rem] shadow-sm transition-all duration-500 ${highlight ? "ring-2 ring-gray-900 shadow-xl" : ""}`}>
    <p className="text-[9px] uppercase tracking-[0.25em] text-gray-400 mb-2 font-bold">{label}</p>
    <p className={`text-4xl font-black tracking-tighter ${color}`}>{value}</p>
  </div>
);

export default TypingEngine;