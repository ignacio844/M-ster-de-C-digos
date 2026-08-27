export type ParsedTable = {
  headers: string[];
  rows: string[][];
};

function detectDelimiter(text: string): string {
  const first = text.split(/\r?\n/).find((l) => l.trim().length > 0) ?? "";
  const tabs = (first.match(/\t/g) ?? []).length;
  const semis = (first.match(/;/g) ?? []).length;
  const commas = (first.match(/,/g) ?? []).length;
  if (tabs > 0 && tabs >= commas && tabs >= semis) return "\t";
  if (semis > commas) return ";";
  return ",";
}

function normalizeTable(rows: string[][]): ParsedTable {
  const nonEmptyRows = rows.filter((row) => row.some((cell) => cell.trim().length > 0));
  const headers = (nonEmptyRows.shift() ?? []).map(
    (header, index) => header.trim() || `columna_${index + 1}`,
  );

  const width = Math.max(headers.length, ...nonEmptyRows.map((row) => row.length), 1);

  while (headers.length < width) {
    headers.push(`columna_${headers.length + 1}`);
  }

  const normalized = nonEmptyRows.map((row) => {
    const copy = row.map((cell) => cell.trim());
    while (copy.length < width) copy.push("");
    return copy.slice(0, width);
  });

  return { headers, rows: normalized };
}

function cellToText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
  return String(value).trim();
}

export function tableFromSpreadsheetRows(
  rows: readonly (readonly unknown[])[],
): ParsedTable {
  return normalizeTable(rows.map((row) => row.map(cellToText)));
}

export function parseDelimited(text: string): ParsedTable {
  const raw = text.replace(/^\uFEFF/, "");
  const delimiter = detectDelimiter(raw);
  const rows: string[][] = [];
  let cell = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    const next = raw[i + 1];
    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i += 1;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      continue;
    }
    if (ch === delimiter) {
      row.push(cell.trim());
      cell = "";
      continue;
    }
    if (ch === "\n") {
      row.push(cell.trim());
      cell = "";
      if (row.some((c) => c.length > 0)) rows.push(row);
      row = [];
      continue;
    }
    if (ch === "\r") continue;
    cell += ch;
  }
  row.push(cell.trim());
  if (row.some((c) => c.length > 0)) rows.push(row);

  return normalizeTable(rows);
}

const CODE_RE = /^(codigo|código|code|cod|id|sku|clave|nro|numero|número)$/i;
const NAME_RE =
  /^(nombre|name|descripcion|descripción|description|titulo|título|label|denominacion|denominación|detalle)$/i;

export function guessCodeColumn(headers: string[]): number {
  const idx = headers.findIndex((h) => CODE_RE.test(h.trim()));
  return idx >= 0 ? idx : 0;
}

export function guessNameColumn(headers: string[]): number {
  const idx = headers.findIndex((h) => NAME_RE.test(h.trim()));
  if (idx >= 0) return idx;
  return headers.length > 1 ? 1 : 0;
}

export function tableToCsv(headers: string[], rows: string[][]): string {
  const esc = (v: string) => {
    if (/[",\n;]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
    return v;
  };
  return [headers, ...rows].map((r) => r.map(esc).join(",")).join("\n");
}
