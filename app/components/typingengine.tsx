"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import passagesData from "../data.json";
import confetti from 'canvas-confetti';

type Difficulty = "easy" | "medium" | "hard";
type Category = "quotes" | "code" | "lyrics";
type ResultStatus = "none" | "baseline" | "high-score" | "completed";

const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

const VolumeIcon = ({ muted }: { muted: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {muted ? (
      <>
        <path d="M11 5L6 9H2v6h4l5 4V5z" /><line x1="23" x2="17" y1="9" y2="15" /><line x1="17" x2="23" y1="9" y2="15" />
      </>
    ) : (
      <>
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      </>
    )}
  </svg>
);

const HistoryIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

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
  
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [historyData, setHistoryData] = useState<any[]>([]);
  
  const successAudio = useRef<HTMLAudioElement | null>(null);
  const errorAudio = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null); 
  const activeCharRef = useRef<HTMLSpanElement>(null); 

  useEffect(() => {
    successAudio.current = new Audio("/success.mp3");
    errorAudio.current = new Audio("/error.mp3");
    if(successAudio.current) successAudio.current.volume = 0.2; 
    if(errorAudio.current) errorAudio.current.volume = 0.15;

    const saved = localStorage.getItem("typing-best-wpm");
    if (saved) {
      setHighScore(parseInt(saved));
      setIsFirstTest(false);
    }
    resetTest();
  }, []);

  useEffect(() => {
    if (showHistory) {
      const savedHist = JSON.parse(localStorage.getItem("typing-history") || "[]");
      setHistoryData(savedHist.reverse());
    }
  }, [showHistory]);

  useEffect(() => {
    if (activeCharRef.current && textContainerRef.current) {
      const container = textContainerRef.current;
      const element = activeCharRef.current;
      
      const elementTop = element.offsetTop;
      const elementHeight = element.offsetHeight;
      const containerHeight = container.clientHeight;
      const scrollTop = container.scrollTop;

      if (elementTop < scrollTop + containerHeight * 0.2 || elementTop > scrollTop + containerHeight * 0.7) {
         container.scrollTo({
            top: elementTop - containerHeight / 2 + elementHeight / 2,
            behavior: 'smooth'
         });
      }
    }
  }, [userInput]);

  const playSound = (isCorrect: boolean) => {
    if (isMuted) return;
    const sound = isCorrect ? successAudio.current : errorAudio.current;
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(() => {}); 
    }
  };

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
    setTimeout(() => {
        inputRef.current?.focus();
        if(textContainerRef.current) textContainerRef.current.scrollTop = 0;
    }, 0);
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

    const sessionResult = { wpm: finalWPM, acc: stats.accuracy, date: new Date().getTime(), mode: isTimedMode ? `${duration}s` : 'Inf' };
    const history = JSON.parse(localStorage.getItem("typing-history") || "[]");
    localStorage.setItem("typing-history", JSON.stringify([...history, sessionResult].slice(-50))); 
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
            if (prev >= 300) {
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

        playSound(isCorrect);

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
    <div className="h-[100dvh] w-full flex flex-col gap-2 sm:gap-4 max-w-screen-2xl mx-auto px-3 sm:px-10 font-mono text-gray-900 py-3 sm:py-6 bg-white overflow-hidden">
      
      <div className="flex flex-col xl:flex-row justify-between items-center gap-2 border-b border-gray-100 pb-2 shrink-0">
        <div className="flex items-center justify-between w-full xl:w-auto gap-4">
            
          <button 
            type="button"
             onClick={() => window.location.reload()}
             className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all text-gray-900 shadow-sm active:scale-95"
             title="Back"
          >
             <BackIcon />
          </button>

          <div className="text-left flex-1 sm:flex-none">
            <p className="text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.4em] text-gray-400 font-bold">Best</p>
            <p className="text-lg sm:text-xl font-black">{highScore} <span className="text-[10px] sm:text-xs font-normal text-gray-300">WPM</span></p>
          </div>
          
          <div className="flex gap-2">
            <button 
            type="button"
              onClick={() => setShowHistory(true)}
              className="p-2 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-all text-sm text-gray-600"
            >
              <HistoryIcon />
            </button>
            <button 
            type="button"
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-all text-sm text-gray-600"
            >
              <VolumeIcon muted={isMuted} />
            </button>
          </div>
        </div>

        <div className="w-full xl:w-auto overflow-x-auto pb-1 no-scrollbar">
          <div className="flex gap-2 min-w-max">
            <div className="flex bg-gray-50 p-1 rounded-2xl border border-gray-100 items-center">
              {(["quotes", "code", "lyrics"] as Category[]).map((cat) => (
                <button type="button" key={cat} onClick={() => resetTest(difficulty, cat)} className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all ${category === cat ? "bg-white shadow-sm text-black" : "text-gray-400 hover:text-black"}`}>
                  {cat.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="flex bg-gray-50 p-1 rounded-2xl border border-gray-100 items-center">
              {(["easy", "medium", "hard"] as Difficulty[]).map((level) => (
                <button type="button" key={level} onClick={() => resetTest(level)} className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all ${difficulty === level ? "bg-white shadow-sm text-black" : "text-gray-400 hover:text-black"}`}>
                  {level.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="flex bg-gray-50 p-1 rounded-2xl border border-gray-100 items-center">
              {[15, 30, 60].map((d) => (
                <button type="button" key={d} onClick={() => { setIsTimedMode(true); resetTest(difficulty, category, d, true); }} className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all ${isTimedMode && duration === d ? "bg-white shadow-sm text-black" : "text-gray-400"}`}>
                  {d}S
                </button>
              ))}
              <button type="button" onClick={() => { setIsTimedMode(false); resetTest(difficulty, category, duration, false); }} className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all ${!isTimedMode ? "bg-white shadow-sm text-black" : "text-gray-400"}`}>
                INF
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:gap-3 shrink-0">
        <StatBox label="WPM" value={stats.wpm} />
        <StatBox label="ACC" value={`${stats.accuracy}%`} />
        <StatBox label="STRK" value={streak} highlight={streak > 20} />
        <StatBox 
          label={isTimedMode ? "TIME" : "SEC"} 
          value={timer} 
          color={isTimedMode && timer < 10 ? "text-red-500 animate-pulse" : "text-gray-900"} 
        />
      </div>

      <div 
        className="flex-1 relative bg-white border border-gray-100 rounded-[1.5rem] sm:rounded-[2rem] shadow-sm flex flex-col overflow-hidden" 
        onClick={() => inputRef.current?.focus()}
      >
        <div 
            ref={textContainerRef}
            className="w-full h-full overflow-y-auto p-4 sm:p-16 flex flex-col items-center sm:block"
        >
            <div className="text-lg sm:text-3xl lg:text-4xl leading-relaxed tracking-tight text-gray-300 w-full break-words text-center sm:text-left">
            {passage.split("").map((char, index) => {
                let color = "text-gray-300";
                const isCurrent = index === userInput.length;
                if (index < userInput.length) {
                color = userInput[index] === char ? "text-gray-900" : "text-red-500 border-b-2 border-red-400";
                }
                return (
                <span 
                    key={index} 
                    ref={isCurrent ? activeCharRef : null}
                    className={`${color} transition-colors duration-100 ${isCurrent ? "border-l-2 sm:border-l-4 border-black pl-0.5 sm:pl-1 bg-gray-50 font-bold" : ""}`}
                >
                    {char}
                </span>
                );
            })}
            </div>
            <div className="h-[40vh] w-full pointer-events-none"></div>
        </div>
        
        <textarea ref={inputRef} value={userInput} onChange={handleInputChange} className="absolute inset-0 opacity-0 cursor-default" spellCheck={false} />
      </div>

      <div className="flex justify-center pb-2 shrink-0">
        <button type="button" onClick={() => resetTest()} className="group px-8 sm:px-14 py-3 sm:py-3.5 bg-gray-900 text-white rounded-full font-bold hover:bg-black transition-all active:scale-95 text-[10px] sm:text-xs tracking-[0.3em]">
          RESTART
        </button>
      </div>

      {resultStatus !== "none" && (
        <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="w-full max-w-lg bg-white border border-gray-100 p-8 sm:p-10 rounded-[2.5rem] shadow-2xl text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gray-900" />
            <p className="text-[10px] uppercase tracking-[0.5em] text-gray-400 mb-8 font-bold">Session Verification</p>
            {resultStatus === "baseline" && <p className="text-xl sm:text-2xl font-black mb-2 uppercase">Baseline Established</p>}
            {resultStatus === "high-score" && <p className="text-xl sm:text-2xl font-black mb-2 text-gray-900 uppercase">High Score Smashed</p>}
            {resultStatus === "completed" && <p className="text-xl sm:text-2xl font-black mb-2 uppercase">Session Complete</p>}
            <div className="flex justify-around my-8 py-6 border-y border-dashed border-gray-100">
              <div><p className="text-3xl sm:text-4xl font-black">{stats.wpm}</p><p className="text-[9px] text-gray-400 uppercase mt-1 tracking-widest">WPM</p></div>
              <div><p className="text-3xl sm:text-4xl font-black">{stats.accuracy}%</p><p className="text-[9px] text-gray-400 uppercase mt-1 tracking-widest">Accuracy</p></div>
            </div>
            <button type="button" onClick={() => resetTest()} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all active:scale-95">
              DISMISS & RESTART
            </button>
          </div>
        </div>
      )}

      {showHistory && (
        <div className="fixed inset-0 bg-white/95 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md h-[80vh] bg-white border border-gray-200 rounded-[2rem] shadow-xl relative flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
               <div>
                  <h2 className="text-lg font-black tracking-tight">Access Logs</h2>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest">Recent Activity</p>
               </div>
               <button type="button" onClick={() => setShowHistory(false)} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
                  <CloseIcon />
               </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
               {historyData.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-2">
                    <HistoryIcon />
                    <p className="text-xs uppercase tracking-widest">No Logs Found</p>
                  </div>
               ) : (
                 historyData.map((item: any, idx: number) => (
                   <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-50 hover:border-gray-200 transition-colors">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-bold tracking-widest">{new Date(item.date).toLocaleDateString()}</span>
                        <span className="text-xs text-gray-500 font-mono mt-0.5">{new Date(item.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <div className="text-right">
                         <div className="flex items-baseline gap-1 justify-end">
                            <span className="text-xl font-black text-gray-900">{item.wpm}</span>
                            <span className="text-[8px] text-gray-400 font-bold">WPM</span>
                         </div>
                         <div className="text-[10px] text-gray-400 font-medium">
                            {item.acc}% Acc • {item.mode}
                         </div>
                      </div>
                   </div>
                 ))
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatBox = ({ label, value, color = "text-gray-900", highlight = false }: any) => (
  <div className={`bg-white border border-gray-100 p-2 sm:p-5 rounded-xl sm:rounded-[2rem] shadow-sm transition-all duration-500 flex flex-col justify-center items-center sm:items-start ${highlight ? "ring-2 ring-gray-900 shadow-xl" : ""}`}>
    <p className="text-[7px] sm:text-[9px] uppercase tracking-[0.1em] sm:tracking-[0.25em] text-gray-400 mb-1 sm:mb-2 font-bold">{label}</p>
    <p className={`text-lg sm:text-3xl font-black tracking-tighter ${color}`}>{value}</p>
  </div>
);

export default TypingEngine;