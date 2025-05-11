
/**
 * Obfuscates a string by showing only first and last n characters
 * @param text The string to obfuscate
 * @param visibleChars Number of characters to show at start and end (default: 2)
 * @returns The obfuscated string
 */
export const obfuscateText = (text: string | null | undefined, visibleChars = 2): string => {
  if (!text || text.length <= visibleChars * 2) {
    return text || '';
  }
  
  const start = text.substring(0, visibleChars);
  const end = text.substring(text.length - visibleChars);
  const middleLength = Math.max(1, text.length - (visibleChars * 2));
  const obfuscated = '*'.repeat(middleLength);
  
  return `${start}${obfuscated}${end}`;
};
