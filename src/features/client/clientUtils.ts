// Dynamic formatter for Chilean RUT / RUN (12345678K -> 12.345.678-K)
export function formatRut(value: string) {
  const clean = value.replace(/[^0-9kK]/g, "");
  if (clean.length === 0) return "";
  if (clean.length === 1) return clean;

  const dv = clean.slice(-1);
  const body = clean.slice(0, -1);

  let formattedBody = body;
  if (body.length > 3) {
    const parts = [];
    let i = body.length;
    while (i > 0) {
      parts.unshift(body.slice(Math.max(0, i - 3), i));
      i -= 3;
    }
    formattedBody = parts.join(".");
  }

  return `${formattedBody}-${dv.toUpperCase()}`;
}

export const utilityCompanies = [
  "CGE",
  "Enel",
  "Chilquinta",
  "Saesa",
  "Frontel",
  "Luz Osorno",
  "Otra",
];
