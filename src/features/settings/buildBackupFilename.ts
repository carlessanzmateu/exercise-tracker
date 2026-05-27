function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

export function buildBackupFilename(now: Date): string {
  const date = `${now.getFullYear()}${pad2(now.getMonth() + 1)}${pad2(now.getDate())}`;
  const time = `${pad2(now.getHours())}${pad2(now.getMinutes())}`;
  return `exercise-tracker-backup-${date}-${time}.json`;
}
