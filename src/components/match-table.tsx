import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Check,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
} from "lucide-react";
import { MatchBar, MatchPercent } from "@/components/match-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { MatchBand, RowMatch, Source } from "@/lib/matching";
import { decisionBand, resolveCellMatch } from "@/lib/matching";
import { matchDecisionKey, useCatalog } from "@/lib/store";

type SortKey = "code" | "name" | "score";

const PAGE_SIZE = 100;

function SortIcon({ active, dir }: { active: boolean; dir: "asc" | "desc" }) {
  if (!active) return <ArrowUpDown className="size-3.5 text-subtle" />;
  return dir === "asc" ? <ArrowUp className="size-3.5" /> : <ArrowDown className="size-3.5" />;
}

export function MatchTable({
  rows,
  source,
  query,
  band,
  onSelect,
}: {
  rows: RowMatch[];
  source: Source;
  query: string;
  band: MatchBand;
  onSelect: (id: string) => void;
}) {
  const [sortKey, setSortKey] = useState<SortKey>("code");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const decisions = useCatalog((state) => state.decisions);
  const confirmMatch = useCatalog((state) => state.confirmMatch);
  const rejectMatch = useCatalog((state) => state.rejectMatch);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      const cell = row.cells.find((item) => item.sourceId === source.id);
      if (!cell) return false;
      const decision = decisions[matchDecisionKey(source.id, row.bam.id)];
      if (decisionBand(cell, decision) !== band) return false;
      if (!q) return true;

      const resolved = resolveCellMatch(cell, decision);
      return [
        row.bam.code,
        row.bam.name,
        ...Object.values(row.bam.extra),
        resolved.matched?.code,
        resolved.matched?.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [rows, source.id, query, band, decisions]);

  const sorted = useMemo(() => {
    const multiplier = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (sortKey === "code") {
        return a.bam.code.localeCompare(b.bam.code) * multiplier;
      }
      if (sortKey === "name") {
        return a.bam.name.localeCompare(b.bam.name) * multiplier;
      }
      const cellA = a.cells.find((item) => item.sourceId === source.id);
      const cellB = b.cells.find((item) => item.sourceId === source.id);
      const scoreA = cellA
        ? resolveCellMatch(cellA, decisions[matchDecisionKey(source.id, a.bam.id)]).score
        : -1;
      const scoreB = cellB
        ? resolveCellMatch(cellB, decisions[matchDecisionKey(source.id, b.bam.id)]).score
        : -1;
      return (scoreA - scoreB) * multiplier;
    });
  }, [filtered, sortKey, sortDir, source.id, decisions]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return sorted.slice(start, start + PAGE_SIZE);
  }, [sorted, safePage]);

  useEffect(() => {
    setPage(1);
  }, [query, band, sortKey, sortDir, source.id]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((direction) => (direction === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir(key === "score" ? "desc" : "asc");
  }

  async function confirm(row: RowMatch) {
    try {
      await confirmMatch(source.id, row.bam.id);
      toast.success("Coincidencia confirmada y compartida");
    } catch {
      toast.error("No se pudo guardar la confirmación");
    }
  }

  async function reject(row: RowMatch) {
    try {
      await rejectMatch(source.id, row.bam.id);
      toast.message("Sugerencia eliminada para todos");
    } catch {
      toast.error("No se pudo guardar el cambio");
    }
  }

  if (!sorted.length) {
    return (
      <div className="rounded-xl border border-border bg-surface px-6 py-12 text-center">
        <p className="font-medium">No hay códigos en esta sección</p>
        <p className="mt-1 text-sm text-muted">
          Probá otra banda de coincidencia o modificá la búsqueda.
        </p>
      </div>
    );
  }

  const from = (safePage - 1) * PAGE_SIZE + 1;
  const to = Math.min(safePage * PAGE_SIZE, sorted.length);

  const pager = (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-2 text-xs text-muted">
      <span>
        Mostrando {from}–{to} de {sorted.length} códigos
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
  );

  return (
    <>
      <div className="hidden overflow-hidden rounded-xl border border-border bg-surface md:block">
        <div className="overflow-hidden">
          <table className="w-full table-fixed text-left text-sm">
            <thead className="border-b border-border bg-chip/70 text-xs font-medium tracking-wide text-muted uppercase">
              <tr>
                <th className="w-1/6 px-3 py-2.5">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5"
                    onClick={() => toggleSort("code")}
                  >
                    Código
                    <SortIcon active={sortKey === "code"} dir={sortDir} />
                  </button>
                </th>
                <th className="w-1/4 px-3 py-2.5">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5"
                    onClick={() => toggleSort("name")}
                  >
                    Descripción BAMinds
                    <SortIcon active={sortKey === "name"} dir={sortDir} />
                  </button>
                </th>
                <th className="w-1/4 px-3 py-2.5">Sugerencia en {source.name}</th>
                <th className="w-1/8 px-3 py-2.5">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5"
                    onClick={() => toggleSort("score")}
                  >
                    Coincidencia
                    <SortIcon active={sortKey === "score"} dir={sortDir} />
                  </button>
                </th>
                <th className="w-1/5 px-3 py-2.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row) => {
                const cell = row.cells.find((item) => item.sourceId === source.id);
                if (!cell) return null;
                const decision = decisions[matchDecisionKey(source.id, row.bam.id)];
                const resolved = resolveCellMatch(cell, decision);
                return (
                  <tr
                    key={row.bam.id}
                    className="cursor-pointer border-t border-border transition-colors hover:bg-chip/60"
                    onClick={() => onSelect(row.bam.id)}
                  >
                    <td className="px-3 py-3">
                      <p className="truncate" title={row.bam.code}>
                        {row.bam.code}
                      </p>
                    </td>
                    <td className="px-3 py-3">
                      <p className="truncate" title={row.bam.name}>
                        {row.bam.name}
                      </p>
                    </td>
                    <td className="px-3 py-3">
                      {resolved.matched ? (
                        <div className="min-w-0">
                          <p className="truncate text-muted" title={resolved.matched.code}>
                            {resolved.matched.code}
                          </p>
                          {resolved.matched.name ? (
                            <p className="truncate" title={resolved.matched.name}>
                              {resolved.matched.name}
                            </p>
                          ) : null}
                        </div>
                      ) : (
                        <span className="text-muted">
                          {resolved.rejected ? "Sugerencia eliminada" : "Sin equivalente"}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <div className="min-w-0">
                        <MatchPercent score={resolved.score} by={resolved.by} />
                        <MatchBar score={resolved.score} by={resolved.by} className="mt-1.5" />
                      </div>
                    </td>
                    <td className="px-3 py-3" onClick={(event) => event.stopPropagation()}>
                      <div className="flex justify-end gap-1.5">
                        {resolved.confirmed ? (
                          <Badge tone="high" className="gap-1 px-2.5 py-1.5">
                            <Check className="size-3.5" /> Confirmado
                          </Badge>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              title="Confirmar"
                              aria-label="Confirmar"
                              onClick={() => void confirm(row)}
                              disabled={!resolved.matched}
                            >
                              <Check />
                              <span className="hidden 2xl:inline">Confirmar</span>
                            </Button>
                            <Button
                              size="sm"
                              title="Eliminar"
                              aria-label="Eliminar"
                              variant="ghost"
                              className="text-match-low"
                              onClick={() => void reject(row)}
                              disabled={!resolved.matched}
                            >
                              <Trash2 />
                              <span className="hidden 2xl:inline">Eliminar</span>
                            </Button>
                            <Button
                              size="sm"
                              title="Editar"
                              aria-label="Editar"
                              variant="outline"
                              onClick={() => onSelect(row.bam.id)}
                            >
                              <Pencil />
                              <span className="hidden 2xl:inline">Editar</span>
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {pager}
      </div>

      <div className="md:hidden">
        <ul className="flex flex-col gap-3">
          {pageRows.map((row) => {
            const cell = row.cells.find((item) => item.sourceId === source.id);
            if (!cell) return null;
            const decision = decisions[matchDecisionKey(source.id, row.bam.id)];
            const resolved = resolveCellMatch(cell, decision);
            return (
              <li key={row.bam.id} className="rounded-xl border border-border bg-surface p-4">
                <button
                  type="button"
                  className="w-full text-left"
                  onClick={() => onSelect(row.bam.id)}
                >
                  <p className="truncate text-sm text-muted" title={row.bam.code}>
                    {row.bam.code}
                  </p>
                  <p className="mt-1 truncate text-sm" title={row.bam.name}>
                    {row.bam.name}
                  </p>
                </button>
                <div className="mt-3 rounded-md bg-elevated p-3">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="text-sm text-muted">{source.name}</span>
                    <MatchPercent score={resolved.score} by={resolved.by} />
                  </div>
                  <MatchBar score={resolved.score} by={resolved.by} />
                  <p className="mt-2 truncate text-sm">
                    {resolved.matched
                      ? [resolved.matched.code, resolved.matched.name].filter(Boolean).join(" · ")
                      : resolved.rejected
                        ? "Sugerencia eliminada"
                        : "Sin equivalente"}
                  </p>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {resolved.confirmed ? (
                    <Badge tone="high" className="col-span-3 justify-center gap-1 py-2.5">
                      <Check className="size-3.5" />
                      Confirmado
                    </Badge>
                  ) : (
                    <>
                      <Button onClick={() => void confirm(row)} disabled={!resolved.matched}>
                        Confirmar
                      </Button>
                      <Button
                        variant="ghost"
                        className="text-match-low"
                        onClick={() => void reject(row)}
                        disabled={!resolved.matched}
                      >
                        Eliminar
                      </Button>
                      <Button variant="outline" onClick={() => onSelect(row.bam.id)}>
                        Editar
                      </Button>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
        <div className="mt-3 rounded-xl border border-border bg-surface">{pager}</div>
      </div>
    </>
  );
}
