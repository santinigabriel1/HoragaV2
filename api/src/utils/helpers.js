export function isValidDateISO(dateStr) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;

  const date = new Date(dateStr);

  if (isNaN(date.getTime())) return false;

  const [y, m, d] = dateStr.split("-").map(Number);

  return (
    date.getUTCFullYear() === y &&
    date.getUTCMonth() + 1 === m &&
    date.getUTCDate() === d
  );
}

export function getWeekdayIndex(dateStr) {
  const date = new Date(dateStr);
  if (isNaN(date)) return null; // data inválida
  return date.getDay();
}