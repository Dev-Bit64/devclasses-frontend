import { useEffect, useRef, useState } from "react";
import { Clock, TriangleAlert } from "lucide-react";
import { cn } from "../../libs/utils";

export interface ExamTimerProps {
  // Remaining milliseconds, owned by the exam page.
  msLeft: number;
  className?: string;
}

// Formats milliseconds as mm:ss, matching the format the exam previously displayed.
const formatTime = (ms: number) => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

/**
 * Exam countdown readout. Display only — the countdown itself is driven by the exam page,
 * which also owns auto-submission.
 */
const ExamTimer = ({ msLeft, className }: ExamTimerProps) => {
  // Preserves the existing single threshold: under one minute is the warning state.
  const isWarning = msLeft < 60 * 1000;
  const minutesLeft = Math.ceil(msLeft / 60000);
  const [announcement, setAnnouncement] = useState("");
  const lastAnnounced = useRef(-1);

  // Announce once per minute rather than every tick, which would flood a screen reader.
  useEffect(() => {
    if (minutesLeft !== lastAnnounced.current) {
      lastAnnounced.current = minutesLeft;
      setAnnouncement(minutesLeft > 0 ? `${minutesLeft} minutes remaining` : "Time is up");
    }
  }, [minutesLeft]);

  return (
    <>
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg border px-2.5 py-1.5 transition-colors sm:px-3",
          isWarning
            ? "border-destructive/30 bg-destructive/10 text-destructive"
            : "border-border bg-muted text-foreground",
          className
        )}
      >
        {/* The icon changes with the state, so the warning does not rely on colour alone. */}
        {isWarning ? (
          <TriangleAlert aria-hidden="true" className="size-4 shrink-0" />
        ) : (
          <Clock aria-hidden="true" className="size-4 shrink-0" />
        )}
        <span className="sr-only">Time remaining</span>
        <span className="dc-numeric text-base font-bold tabular-nums sm:text-lg">
          {formatTime(msLeft)}
        </span>
      </div>
      <span role="status" aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </>
  );
};

export { ExamTimer, formatTime };
