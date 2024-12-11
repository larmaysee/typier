"use client";
import engdatasets from "@/datas/english-data";
import lidatasets from "@/datas/lisu-data";
import mydatasets from "@/datas/myanmar-data";
import { getLisuChar } from "@/lib/converter";
import { cn, isModifier } from "@/lib/utils";
import { RotateCcw } from "lucide-react";
import { Lisu_Bosa } from "next/font/google";
import { useEffect, useRef, useState } from "react";
import { useSiteConfig } from "./site-config";
import { Button } from "./ui/button";

const lisuBosa = Lisu_Bosa({
  weight: ["400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
});

export type DataBoxType = {
  data: string;
};

export default function DataBox({}) {
  const { config } = useSiteConfig();
  const ref = useRef<HTMLDivElement>(null);

  const [currentData, setCurrentData] = useState<string | null>(null);
  const [typedChars, setTypedChars] = useState<string>("");
  const [cursorPosition, setCursorPosition] = useState<number>(0);
  const [language, setLanguage] = useState<string>("en");
  const [syntaxs, setSyntaxs] = useState<string[]>([]);

  useEffect(() => {
    setLanguage(config.language.code);
    if (ref.current) ref.current.focus();
  }, [config.language]);

  useEffect(() => {
    const datasets: { [key: string]: { syntaxs: string[] } } = {
      en: engdatasets,
      my: mydatasets,
      li: lidatasets,
    };

    if (language) {
      setSyntaxs(datasets[language].syntaxs);
      const randomIndex = Math.floor(
        Math.random() * datasets[language].syntaxs.length
      );
      setCurrentData(datasets[language].syntaxs[randomIndex]);

      setTypedChars("");
      setCursorPosition(0);
    }
  }, [language]);

  const getRandomData = () => {
    if (syntaxs.length) {
      const randomIndex = Math.floor(Math.random() * syntaxs.length);
      setCurrentData(syntaxs[randomIndex]);
      setTypedChars("");
      setCursorPosition(0);
    }

    console.log(currentData);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!currentData) return;

    let key = event.key;
    console.log(key);

    if (language === "li" && !isModifier(key)) key = getLisuChar(event.key);

    console.log(key);

    if (key === "Backspace") {
      setTypedChars((prev) => prev.slice(0, -1));
      setCursorPosition((prev) => Math.max(prev - 1, 0));
    } else if (key.length === 1) {
      const nextChar = currentData[cursorPosition];
      if (key === nextChar) {
        setTypedChars((prev) => prev + key);
        setCursorPosition((prev) => prev + 1);
      } else {
        setTypedChars((prev) => prev + key);
        setCursorPosition((prev) => prev + 1);
      }
    }

    if (cursorPosition === currentData.length) {
      getRandomData();
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", (e) => {
      console.log("key down", e);

      if (ref.current) {
        e.preventDefault();
        ref.current.focus();
      }
    });
  }, []);

  return (
    <>
      <div
        className="bg-background rounded-lg h-[120px] p-4 border relative focus-visible:border-primary"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onClick={(e) => e.currentTarget.focus()} // Add this line
        ref={ref}
      >
        <div
          className={cn(
            "flex flex-wrap pr-4 pb-4 text-xl",
            `${lisuBosa.className}`
          )}
        >
          {currentData?.split("").map((char, index) => {
            let charClass = "";
            if (index < typedChars.length) {
              charClass =
                typedChars[index] === char
                  ? "bg-green-500 text-muted-foreground"
                  : "bg-destructive";
            } else if (index === typedChars.length) {
              charClass = "typed";
            }
            return (
              <span key={index} className={cn(`${char}`, charClass)}>
                {char === " " ? "\u00A0" : char}
              </span>
            );
          })}
        </div>

        <Button
          variant={"outline"}
          size={"icon"}
          className="absolute bottom-1 right-1 h-6 w-6"
          onClick={getRandomData}
        >
          <RotateCcw />
        </Button>
      </div>
    </>
  );
}
