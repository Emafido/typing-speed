"use client";
import React, { useState, useRef } from "react";

const typingengine = () => {
  const [passage, setPassage] = useState<string>(
    "The quick brown fox jumps over the lazy dog."
  );
  const [userInput, setUserInput] = useState<string>("");
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isStarted && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsStarted(false);
    }
    return () => clearInterval(interval);
  }, [isStarted, timeLeft]);
  const timeElapsed = 60 - timeLeft;
  const minutesElapsed = timeElapsed / 60;
  const wpm =
    minutesElapsed > 0 ? Math.round(userInput.length / 5 / minutesElapsed) : 0;
  const correctChars = userInput
    .split("")
    .filter((char, i) => char === passage[i]).length;
  const accuracy =
    userInput.length > 0
      ? Math.round((correctChars / userInput.length) * 100)
      : 100;
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (timeLeft === 0 || userInput.length === passage.length) return;

    if (val.length <= passage.length) {
      setUserInput(val);

      if (!isStarted) setIsStarted(true);

      if (val.length === passage.length) {
        setIsStarted(false);
      }
    }
  };
  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl">
      {!isStarted && userInput.length === passage.length && (
        <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 animate-bounce">
          Test Complete! Check your WPM above.
          <button
            onClick={() => window.location.reload()}
            className="ml-4 px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            Restart
          </button>
        </div>
      )}
      <div className="flex justify-between items-center px-4 py-2 bg-gray-50 rounded-lg font-mono text-sm">
        <div className="flex gap-8">
          <span>
            WPM: <span className="text-black font-bold">{wpm}</span>
          </span>
          <span>
            ACCURACY: <span className="text-black font-bold">{accuracy}%</span>
          </span>
        </div>
        <div className="text-red-500 font-bold">{timeLeft}s</div>
      </div>

      <div
        className="relative p-8 bg-white border border-gray-100 rounded-xl shadow-sm cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        <div className="select-none pointer-events-none font-mono text-2xl leading-relaxed">
          {passage.split("").map((char, index) => {
            let color = "text-gray-300";
            let isCurrent = index === userInput.length;

            if (index < userInput.length) {
              color =
                userInput[index] === char
                  ? "text-gray-800"
                  : "text-red-500 border-b-2 border-red-500";
            }

            return (
              <span
                key={index}
                className={`${color} ${
                  isCurrent ? "bg-gray-200 animate-pulse" : ""
                }`}
              >
                {char}
              </span>
            );
          })}
        </div>

        <textarea
          ref={inputRef}
          value={userInput}
          onChange={handleInputChange}
          disabled={timeLeft === 0}
          autoFocus
          className="absolute inset-0 opacity-0 cursor-default resize-none"
        />
      </div>
    </div>
  );
};

export default typingengine;
