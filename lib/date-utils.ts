export function getCurrentFinancialYear(
  referenceDate = new Date(),
) {
  return referenceDate.getMonth() < 3
    ? referenceDate.getFullYear() - 1
    : referenceDate.getFullYear();
}

export function getFinancialYearRange(year: number) {
  const start = new Date(year, 3, 1); 
  start.setHours(0, 0, 0, 0);

  const end = new Date(year + 1, 2, 31); 
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

export function getFinancialYearRangeToDate(
  year: number,
  referenceDate = new Date(),
) {
  const { start, end } = getFinancialYearRange(year);
  const currentFinancialYear = getCurrentFinancialYear(
    referenceDate,
  );

  if (year !== currentFinancialYear) {
    return { start, end };
  }

  const cappedEnd = new Date(referenceDate);
  cappedEnd.setHours(23, 59, 59, 999);

  return {
    start,
    end: cappedEnd < end ? cappedEnd : end,
  };
}
