/**
 * Formats a date object into a readable string.
 * @param {Date|string} date 
 * @returns {string} Formatted date (e.g. "January 1, 2024")
 */
export const formatDate = (date) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(date).toLocaleDateString(undefined, options);
};

/**
 * Utility to truncate long strings.
 */
export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};
