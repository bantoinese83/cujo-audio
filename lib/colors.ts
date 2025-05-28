const COLORS = ["#9900ff", "#5200ff", "#ff25f6", "#2af6de", "#ffdd28", "#3dffab", "#d8ff3e", "#d9b2ff"]

export function generateRandomColor(usedColors: string[] = []): string {
  const availableColors = COLORS.filter((c) => !usedColors.includes(c))

  if (availableColors.length === 0) {
    // If no available colors, pick a random one from the original list
    return COLORS[Math.floor(Math.random() * COLORS.length)]
  }

  return availableColors[Math.floor(Math.random() * availableColors.length)]
}
