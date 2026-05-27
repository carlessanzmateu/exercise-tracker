const WEEKDAY_FORMATTER = new Intl.DateTimeFormat('es-ES', { weekday: 'short' });
const MONTH_FORMATTER = new Intl.DateTimeFormat('es-ES', { month: 'short' });
const TIME_FORMATTER = new Intl.DateTimeFormat('es-ES', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

function trimDot(text: string): string {
  return text.replace(/\.$/, '');
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function formatSessionDate(iso: string): string {
  const date = new Date(iso);
  const weekday = capitalize(trimDot(WEEKDAY_FORMATTER.format(date)));
  const day = date.getDate();
  const month = trimDot(MONTH_FORMATTER.format(date));
  const time = TIME_FORMATTER.format(date);
  return `${weekday} ${day} ${month} · ${time}`;
}
