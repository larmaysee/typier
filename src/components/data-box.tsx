"use client";
import engdatasets from "@/datas/english-data";
import lidatasets from "@/datas/lisu-data";
import mydatasets from "@/datas/myanmar-data";
import { RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { useSiteConfig } from "./site-config";
import { Button } from "./ui/button";

export type DataBoxType = {
  data: string;
};

export default function DataBox({}) {
  const { config } = useSiteConfig();
  const datasets = {
    en: engdatasets,
    my: mydatasets,
    li: lidatasets,
  };

  const [currentData, setCurrentData] = useState<string | null>(null);
  const [typedChars, setTypedChars] = useState<string>("");
  const [cursorPosition, setCursorPosition] = useState<number>(0);

  useEffect(() => {
    console.log("DataBox mounted");
    const value = getRandomData();
    setCurrentData(value);
    return () => {
      console.log("DataBox unmounted");
    };
  }, [config.language]);

  const getRandomData = () => {
    const syntaxs = datasets[config.language.code].syntaxs;
    return syntaxs[Math.floor(Math.random() * syntaxs.length)];
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!currentData) return;

    if (event.key === "Backspace") {
      setTypedChars((prev) => prev.slice(0, -1));
      setCursorPosition((prev) => Math.max(prev - 1, 0));
    } else if (event.key.length === 1) {
      const nextChar = currentData[cursorPosition];
      if (event.key === nextChar) {
        setTypedChars((prev) => prev + event.key);
        setCursorPosition((prev) => prev + 1);
      } else {
        setTypedChars((prev) => prev + event.key);
        setCursorPosition((prev) => prev + 1);
      }
    }
  };

  return (
    <>
      <div
        className="bg-background rounded-lg h-[120px] p-4 border border-dashed relative"
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        <div className="flex flex-wrap text-muted-foreground pr-4 pb-4">
          {currentData?.split("").map((char, index) => {
            let charClass = "";
            if (index < typedChars.length) {
              charClass = typedChars[index] === char ? "bg-muted" : "text-red";
            } else if (index === typedChars.length) {
              charClass = "text-user-typed";
            }
            return (
              <span key={index} className={charClass}>
                {char === " " ? "\u00A0" : char}
              </span>
            );
          })}
        </div>

        <Button
          variant={"outline"}
          size={"icon"}
          className="absolute bottom-1 right-1 h-6 w-6"
          onClick={() => {
            setCurrentData(getRandomData());
            setTypedChars("");
            setCursorPosition(0);
          }}
        >
          <RotateCcw />
        </Button>
      </div>
    </>
  );
}
