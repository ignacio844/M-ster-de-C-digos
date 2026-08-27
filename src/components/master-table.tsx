import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CatalogRow } from "@/lib/matching";

const PAGE_SIZE = 100;

export function MasterTable({
  rows,
  query,
}: {
  rows: CatalogRow[];
  query: string;
}) {
  const [page, setPage] = useState(1);
  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return rows;
    return rows.filter((row) =>
      `${row.code} ${row.name}`.toLowerCase().includes(normalizedQuery),
    );
  }, [rows, query]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, safePage]);

  useEffect(() => setPage(1), [query]);
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const from = filtered.length ? (safePage - 1) * PAGE_SIZE + 1 : 0;
  const to = Math.min(safePage * PAGE_SIZE, filtered.length);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-96 text-left text-sm">
          <thead className="border-b border-border bg-chip/70 text-xs font-medium tracking-wide text-muted uppercase">
            <tr>
              <th className="w-64 px-4 py-2.5">Código BAMinds</th>
              <th className="px-4 py-2.5">Descripción maestra</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row) => (
              <tr key={row.id} className="border-t border-border">
                <td className="whitespace-nowrap px-4 py-3 text-sm">
                  {row.code}
                </td>
                <td className="px-4 py-3">
                  <p className="truncate text-sm" title={row.name}>
                    {row.name}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-border md:hidden">
        {pageRows.map((row) => (
          <li key={row.id} className="px-4 py-3">
            <p className="truncate text-sm text-muted">{row.code}</p>
            <p className="mt-1 truncate text-sm" title={row.name}>
              {row.name}
            </p>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-2 text-xs text-muted">
        <span>
          Mostrando {from}–{to} de {filtered.length} códigos BAMinds
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex h-9 items-center gap-1 rounded-md border border-border bg-surface px-2.5 font-medium text-fg disabled:cursor-not-allowed disabled:opacity-40"
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            disabled={safePage <= 1}
          >
            <ChevronLeft className="size-3.5" />
            Anterior
          </button>
          <span className="min-w-24 text-center tabular-nums">
            Página {safePage} de {totalPages}
          </span>
          <button
            type="button"
            className="inline-flex h-9 items-center gap-1 rounded-md border border-border bg-surface px-2.5 font-medium text-fg disabled:cursor-not-allowed disabled:opacity-40"
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
            disabled={safePage >= totalPages}
          >
            Siguiente
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
