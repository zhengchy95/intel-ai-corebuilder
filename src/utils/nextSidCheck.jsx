function findNextNumber(arr) {
  const set = new Set(arr);
  const min = Math.min(...arr);
  const max = Math.max(...arr);

  for (let i = min; i <= max; i++) {
    if (!set.has(i)) {
      return i; // First missing number
    }
  }

  return max + 1; // All numbers present, return next
}

export default findNextNumber;
