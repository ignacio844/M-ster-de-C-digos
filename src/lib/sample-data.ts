import type { CatalogRow, Source } from "@/lib/matching";

type BamindsJsonRow = {
  codigo: string;
  descripcion: string;
};

export async function loadBamindsReference(): Promise<Source> {
  const response = await fetch("/data/Codigos_Baminds.json");

  if (!response.ok) {
    throw new Error("No se pudo cargar la base central de BAMinds");
  }

  const data: BamindsJsonRow[] = await response.json();

  const rows: CatalogRow[] = data.map((item, index) => ({
    id: `bam-${item.codigo}-${index}`,
    code: item.codigo,
    name: item.descripcion,
    extra: {},
  }));

  return {
    id: "baminds",
    name: "BAMinds",
    rows,
  };
}
