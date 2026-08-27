import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MatchBar } from "@/components/match-bar";
import {
  resolveCellMatch,
  type MatchBy,
  type RowMatch,
  type Source,
} from "@/lib/matching";
import { matchDecisionKey, useCatalog } from "@/lib/store";

const PAGE_SIZE = 100;

const MASTER_COLUMNS = [
  { sourceId: null, label: "BAMINDS" },
  { sourceId: "fixed-torettos", label: "TORETTOS" },
  { sourceId: "fixed-warnes", label: "WARNES" },
  { sourceId: "fixed-kobo", label: "KOBO" },
  { sourceId: "fixed-octosis", label: "OCTOSIS" },
  { sourceId: "fixed-facturacion", label: "FACTURACIÓN" },
] as const;

type MasterColumn = (typeof MASTER_COLUMNS)[number];

type DisplayMatch = {
  code: string | null;
  score: number;
  by: MatchBy;
};

function matchForColumn(
  row: RowMatch,
  column: MasterColumn,
  sourceIds: Set<string>,
  decisions: ReturnType<typeof useCatalog.getState>["decisions"],
): DisplayMatch {
  if (!column.sourceId) {
    return { code: row.bam.code, score: 100, by: "code" };
  }

  if (!sourceIds.has(column.sourceId)) {
    return { code: null, score: 0, by: "none" };
  }

  const cell = row.cells.find((item) => item.sourceId === column.sourceId);
  if (!cell) return { code: null, score: 0, by: "none" };

  const resolved = resolveCellMatch(
    cell,
    decisions[matchDecisionKey(column.sourceId, row.bam.id)],
  );

  return {
    code: resolved.matched?.code ?? null,
    score: resolved.by === "none" ? 0 : resolved.score,
    by: resolved.by,
  };
}

function CodeMatch({ match, label }: { match: DisplayMatch; label: string }) {
  const percentage = match.by === "none" ? 0 : Math.round(match.score);

  return (
    <div
      className="min-w-0"
      data-source={label}
      data-score={percentage}
      aria-label={`${label}: ${match.code ?? "sin código"}, ${percentage}% de coincidencia`}
    >
      <p
        className="truncate font-mono text-xs font-medium text-fg"
        title={match.code ?? "Sin coincidencia"}
      >
        {match.code ?? "—"}
      </p>
      <div className="mt-2 flex items-center gap-2">
        <MatchBar score={match.score} by={match.by} className="min-w-12 flex-1" />
        <span className="w-9 text-right font-mono text-xs font-medium text-muted tabular-nums">
          {percentage}%
        </span>
      </div>
    </div>
  );
}

export function MasterTable({
  rows,
  sources,
  query,
}: {
  rows: RowMatch[];
  sources: Source[];
  query: string;
}) {
  const [page, setPage] = useState(1);
  const decisions = useCatalog((state) => state.decisions);
  const sourceIds = useMemo(
    () => new Set(sources.map((source) => source.id)),
    [sources],
  );

  const displayRows = useMemo(
    () =>
      rows.map((row) => ({
        row,
        matches: MASTER_COLUMNS.map((column) =>
          matchForColumn(row, column, sourceIds, decisions),
        ),
      })),
    [rows, sourceIds, decisions],
  );

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return displayRows;

    return displayRows.filter(({ matches }) =>
      matches.some((match) => match.code?.toLowerCase().includes(normalizedQuery)),
    );
  }, [displayRows, query]);

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
      {pageRows.length ? (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-chip/70 text-xs font-medium tracking-wide text-muted uppercase">
                <tr>
                  {MASTER_COLUMNS.map((column, index) => (
                    <th
                      key={column.label}
                      scope="col"
                      className={
                        index === 0
                          ? "sticky left-0 z-10 min-w-48 bg-chip px-4 py-3"
                          : "min-w-44 px-4 py-3"
                      }
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageRows.map(({ row, matches }) => (
                  <tr key={row.bam.id} className="border-t border-border align-top">
                    {matches.map((match, index) => (
                      <td
                        key={MASTER_COLUMNS[index].label}
                        className={
                          index === 0
                            ? "sticky left-0 z-10 bg-surface px-4 py-3.5"
                            : "px-4 py-3.5"
                        }
                      >
                        <CodeMatch match={match} label={MASTER_COLUMNS[index].label} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="divide-y divide-border md:hidden">
            {pageRows.map(({ row, matches }) => (
              <li key={row.bam.id} className="p-4">
                <div className="rounded-lg bg-chip/70 p-3">
                  <p className="mb-2 text-xs font-medium tracking-wide text-muted uppercase">
                    BAMINDS
                  </p>
                  <CodeMatch match={matches[0]} label="BAMINDS" />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-5">
                  {MASTER_COLUMNS.slice(1).map((column, index) => (
                    <div key={column.label} className="min-w-0">
                      <p className="mb-2 truncate text-xs font-medium tracking-wide text-muted uppercase">
                        {column.label}
                      </p>
                      <CodeMatch match={matches[index + 1]} label={column.label} />
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className="px-6 py-12 text-center">
          <p className="font-medium">No se encontraron códigos</p>
          <p className="mt-1 text-sm text-muted">
            Probá con un código de BAMinds o de alguna de las fuentes.
          </p>
        </div>
      )}

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
