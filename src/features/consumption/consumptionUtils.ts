export const utilityTariffs = [
  "BT1",
  "BT2",
  "BT3",
  "BT4.1",
  "BT4.2",
  "BT4.3",
  "THR",
  "Otra",
];

export function parseChileanNumber(str: string): number {
  let clean = str.trim();
  if (clean.includes(",") && clean.includes(".")) {
    // E.g. "1.200,50" -> "1200.50"
    clean = clean.replace(/\./g, "").replace(/,/g, ".");
  } else if (clean.includes(",")) {
    // E.g. "1200,5" -> "1200.5" or "5,5" -> "5.5"
    clean = clean.replace(/,/g, ".");
  } else if (clean.includes(".")) {
    // E.g. "1.200" vs "5.5"
    const parts = clean.split(".");
    if (parts.length === 2 && parts[1].length === 3) {
      clean = clean.replace(/\./g, ""); // 1.200 -> 1200
    } else if (parts.length > 2) {
      clean = clean.replace(/\./g, ""); // 1.234.567 -> 1234567
    }
  }
  return Number(clean);
}

export function parseExcelPaste(text: string): number[] {
  const parts = text.split(/[\r\n\t;]+/);
  const parsedNumbers: number[] = [];

  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed === "") continue;
    
    // Split by whitespace if they come in a single line copied as horizontal cells
    const subParts = trimmed.split(/\s+/);
    for (const subPart of subParts) {
      const cleanSub = subPart.trim();
      if (cleanSub === "") continue;
      
      const num = parseChileanNumber(cleanSub);
      if (!isNaN(num) && cleanSub !== "") {
        parsedNumbers.push(num);
      }
    }
  }

  return parsedNumbers;
}
