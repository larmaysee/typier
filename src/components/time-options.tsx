import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

export default function TimerOptions({
  selectedTime,
  setSelectedTime,
}: {
  selectedTime: number;
  setSelectedTime: (time: number) => void;
}) {
  const TimerOptions = [30, 60, 90, 120];

  return (
    <div className="timer-options grid grid-cols-4 gap-0">
      {TimerOptions.map((time, index) => (
        <Button
          key={time}
          size={"sm"}
          className={cn(
            "p-2",
            time === selectedTime ? "font-bold" : "",
            index === 0
              ? "rounded-r-none"
              : index === TimerOptions.length - 1
              ? "rounded-l-none"
              : "rounded-none"
          )}
          variant={time === selectedTime ? "default" : "secondary"}
          onClick={() => setSelectedTime(time)}
        >
          {time}s
        </Button>
      ))}
    </div>
  );
}
