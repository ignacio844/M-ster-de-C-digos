import type { Source } from "@/lib/matching";

type FixedSourcePayload = {
  id: string;
  name: string;
  sourceFile: string;
  sheet: string;
  codeColumn: string;
  descriptionColumn: string | null;
  rows: Array<{ code: string; name: string }>;
};

const FIXED_SOURCE_FILES = [
  "torettos.json",
  "warnes-market.json",
  "kobo.json",
  "octosis.json",
  "facturacion.json",
] as const;

async function loadFixedSource(fileName: string): Promise<Source> {
  const response = await fetch(`/data/fixed-sources/${fileName}`);
  if (!response.ok) {
    throw new Error(`No se pudo cargar la vista fija ${fileName}`);
  }

  const payload = (await response.json()) as FixedSourcePayload;
  return {
    id: payload.id,
    name: payload.name,
    fixed: true,
    rows: payload.rows.map((row, index) => ({
      id: `${payload.id}-${index}`,
      code: row.code,
      name: row.name,
      extra: {},
    })),
  };
}

export function loadFixedSources(): Promise<Source[]> {
  return Promise.all(FIXED_SOURCE_FILES.map(loadFixedSource));
}
