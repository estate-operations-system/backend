export const generateColorFromId = (id: number | undefined | null): string => {
  if (!id) return '#ad6952';

  const hash = Math.abs(id * 1234567) % 360;
  const saturation = 70 + (Math.abs(id * 9876) % 20);
  const lightness = 55 + (Math.abs(id * 5432) % 15);

  return `hsl(${hash}, ${saturation}%, ${lightness}%)`;
};
