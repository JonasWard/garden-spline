const getPseudeRandomNumber = (i: number) => {
  // Simple linear congruential generator with fixed params/seed
  let seed = i;
  const a = 1664525;
  const c = 1013904223;
  const m = 2 ** 32;
  seed = (a * seed + c) % m;
  return seed / m;
};

export const randomColor = (i: number): string => `#${Math.floor(getPseudeRandomNumber(i) * 16777215).toString(16)}`;
