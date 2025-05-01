/**
 * Format a date to a relative time string (e.g., "just now", "5 minutes ago")
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 5) {
    return 'Analyzed just now';
  }
  
  if (diffInSeconds < 60) {
    return `Analyzed ${diffInSeconds} seconds ago`;
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `Analyzed ${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `Analyzed ${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `Analyzed ${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  }
  
  // Fall back to date format for older dates
  return `Analyzed on ${date.toLocaleDateString()}`;
}

/**
 * Format a confidence score as a percentage
 */
export function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
}

/**
 * Format a severity score (0-10) to a text label
 */
export function formatSeverityLabel(severity: number): { text: string, color: string } {
  if (severity <= 2) return { text: "Minor", color: "text-green-600 dark:text-green-400" };
  if (severity <= 5) return { text: "Moderate", color: "text-yellow-600 dark:text-yellow-400" };
  if (severity <= 8) return { text: "Severe", color: "text-orange-600 dark:text-orange-400" };
  return { text: "Critical", color: "text-red-600 dark:text-red-400" };
}
