export function seededRandom(seed: number) {
  let value = seed % 2147483647;
  if (value <= 0) {
    value += 2147483646;
  }

  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

export function pickBySeed<T>(items: T[], seed: number) {
  const random = seededRandom(seed);
  const index = Math.floor(random() * items.length);
  return items[index] ?? items[0];
}
