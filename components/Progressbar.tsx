"use client";

import React from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils"; // Utility for combining classes safely

interface ProgressBarProps {
  /**
   * Progress value between 0 and 100
   */
  progress: number;
  /**
   * Optional height of the progress bar
   */
  height?: string;
  /**
   * Optional custom classes
   */
  className?: string;
  /**
   * Accessibility label
   */
  ariaLabel?: string;
  /**
   * Whether to show percentage text
   */
  showPercentage?: boolean;
  /**
   * Optional test ID for testing
   */
  testId?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress: rawProgress,
  height = "h-2",
  className = "",
  ariaLabel = "Progress indicator",
  showPercentage = true,
  testId = "progress-bar",
}) => {
  // Sanitize and clamp progress value
  const progress = Math.min(Math.max(0, Number(rawProgress) || 0), 100);

  // Smooth animation for progress value
  const springConfig = { damping: 30, stiffness: 300 };
  const springProgress = useSpring(progress, springConfig);

  // Transform progress to percentage string
  const progressText = useTransform(springProgress, (value) => 
    `${Math.round(value)}%`
  );

  // Transform progress to width percentage
  const progressWidth = useTransform(springProgress, (value) => 
    `${value}%`
  );

  return (
    <div
      className={cn(
        "w-full rounded-full bg-gray-200 dark:bg-gray-700",
        height,
        className
      )}
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel}
      data-testid={testId}
    >
      <motion.div
        className="h-full rounded-full bg-blue-600 dark:bg-blue-500"
        style={{ width: progressWidth }}
        initial={{ width: "0%" }}
        transition={{ type: "spring", ...springConfig }}
      >
        {showPercentage && (
          <motion.span
            className={cn(
              "absolute right-0 -translate-y-6",
              "text-sm font-medium text-blue-700 dark:text-blue-300",
              "transition-opacity duration-200",
              progress === 0 ? "opacity-0" : "opacity-100"
            )}
          >
            {progressText}
          </motion.span>
        )}
      </motion.div>
    </div>
  );
};

export default React.memo(ProgressBar);