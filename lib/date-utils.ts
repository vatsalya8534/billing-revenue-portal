export function getFinancialYearRange(year: number) {
  const start = new Date(year, 3, 1); 
  start.setHours(0, 0, 0, 0);

  const end = new Date(year + 1, 2, 31); 
  end.setHours(23, 59, 59, 999);

  return { start, end };
}