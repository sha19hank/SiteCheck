"use client";
import { useEffect, useRef } from "react";
import { scoreToHex, scoreToLabel } from "@/lib/utils";

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  animate?: boolean;
}

export default function ScoreRing({
  score,
  size = 100,
  strokeWidth = 8,
  showLabel = true,
  animate = true,
}: ScoreRingProps) {
  const circleRef = useRef<SVGCircleElement>(null);
  const radius    = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset    = circumference - (score / 100) * circumference;
  const color     = scoreToHex(score);
  const label     = scoreToLabel(score);

  useEffect(() => {
    if (!animate || !circleRef.current) return;
    const el = circleRef.current;
    // Start fully hidden, animate to target
    el.style.strokeDashoffset = `${circumference}`;
    el.style.transition = "none";
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transition = "stroke-dashoffset 1.4s cubic-bezier(0.34, 1.56, 0.64, 1)";
        el.style.strokeDashoffset = `${offset}`;
      });
    });
  }, [score, animate, circumference, offset]);

  const center = size / 2;

  return (
    <div className="relative inline-flex flex-col items-center gap-2">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        {/* Background track */}
        <circle
          cx={center} cy={center} r={radius}
          fill="none"
          stroke="#e4e9ed"
          strokeWidth={strokeWidth}
        />
        {/* Score arc */}
        <circle
          ref={circleRef}
          cx={center} cy={center} r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={animate ? circumference : offset}
          style={{ transition: animate ? undefined : "none" }}
        />
      </svg>

      {/* Score number overlay */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{ top: 0 }}
      >
        <span
          className="font-bold leading-none"
          style={{
            fontSize: size * 0.26,
            color,
            marginTop: size * 0.02,
          }}
        >
          {Math.round(score)}
        </span>
        {size > 70 && (
          <span
            className="text-surface-400 font-medium leading-none mt-1"
            style={{ fontSize: size * 0.1 }}
          >
            /100
          </span>
        )}
      </div>

      {showLabel && (
        <span
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
