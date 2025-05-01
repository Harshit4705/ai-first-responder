import React from "react";

interface SeverityIndicatorProps {
  severity: number;
  className?: string;
}

const SeverityIndicator: React.FC<SeverityIndicatorProps> = ({ severity, className = "" }) => {
  // Normalize severity to be between 0 and 100
  const normalizedSeverity = Math.min(Math.max(severity * 10, 0), 100);
  
  // Text label based on severity
  const getSeverityLabel = (severity: number) => {
    if (severity <= 2) return { text: "Minor", color: "text-green-600 dark:text-green-400" };
    if (severity <= 5) return { text: "Moderate", color: "text-yellow-600 dark:text-yellow-400" };
    if (severity <= 8) return { text: "Severe", color: "text-orange-600 dark:text-orange-400" };
    return { text: "Critical", color: "text-red-600 dark:text-red-400" };
  };
  
  const severityLabel = getSeverityLabel(severity);

  return (
    <div className={className}>
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-foreground/80">Severity Assessment</span>
        <span className={`text-sm font-medium ${severityLabel.color}`}>
          {severityLabel.text}
        </span>
      </div>
      <div className="h-[20px] relative bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full absolute top-0 left-0 bg-gradient-to-r from-green-500 to-red-500 transition-all duration-500"
          style={{ width: `${normalizedSeverity}%` }}
        ></div>
      </div>
      <div className="flex justify-between text-xs text-muted-foreground mt-1">
        <span>Minor</span>
        <span>Severe</span>
      </div>
    </div>
  );
};

export default SeverityIndicator;
