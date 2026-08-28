import { useEffect, useMemo, useState } from "react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ArrowUpDown,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Pencil,
  RotateCcw,
  Trash2,
  Wrench,
} from "lucide-react";
import { MatchBar, MatchPercent } from "@/components/match-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ConfirmationState, MatchBand, RowMatch, Source } from "@/lib/matching";
import {
  confirmationState,
  decisionBand,
  originalMatchScore,
  resolveCellMatch,
} from "@/lib/matching";
import { matchDecisionKey, useCatalog } from "@/lib/store";
import { cn } from "@/lib/utils";

type SortKey = "code" | "score" | "status";
type ConfirmedFilter = "all" | ConfirmationState;

const PAGE_SIZE = 100;
const CONFIRMED_FILTERS: { id: ConfirmedFilter; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "pending", label: "Pendientes" },
  { id: "corrected", label: "Corregidos" },
  { id: "exact", label: "Exactos" },
];

function SortIcon({ active, dir }: { active: boolean; dir: "asc" | "desc" }) {
  if (!active) return <ArrowUpDown className="size-3.5 text-subtle" />;
  return dir === "asc" ? <ArrowUp className="size-3.5" /> : <ArrowDown className="size-3.5" />;
}

function StateBadge({ state }: { state: ConfirmationState }) {
  if (state === "exact") {
    return <Badge tone="high" className="gap-1 px-2.5 py-1.5"><CheckCircle2 className="size-3.5" /> Exacto de origen</Badge>;
  }
  if (state === "corrected") {
    return <Badge tone="high" className="gap-1 px-2.5 py-1.5"><Check className="size-3.5" /> Corregido</Badge>;
  }
  return <Badge tone="mid" className="gap-1 px-2.5 py-1.5"><Wrench className="size-3.5" /> Corrección pendiente</Badge>;
}

function OriginalScore({ score, state }: { score: number; state?: ConfirmationState | null }) {
  if (state === "corrected") {
    return (
      <div className="flex items-center gap-2 font-mono text-sm font-semibold tabular-nums">
        <span className="text-muted">{Math.round(score)}%</span>
        <ArrowRight className="size-3.5 text-subtle" />
        <span className="text-match-high">100%</span>
      </div>
    );
  }
  return (
    <div className="min-w-0">
      <MatchPercent score={score} by={score > 0 ? "code" : "none"} />
      <MatchBar score={score} by={score > 0 ? "code" : "none"} className="mt-1.5" />
    </div>
  );
}

export function MatchTable({ rows, source, query, band, onSelect }: {
  rows: RowMatch[];
  source: Source;
  query: string;
  band: MatchBand;
  onSelect: (id: string) => void;
}) {
  const [sortKey, setSortKey] = useState<SortKey>(band === "confirmed" ? "status" : "code");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [confirmedFilter, setConfirmedFilter] = useState<ConfirmedFilter>("all");
  const [page, setPage] = useState(1);
  const [correctionRow, setCorrectionRow] = useState<RowMatch | null>(null);
  const decisions = useCatalog((state) => state.decisions);
  const confirmMatch = useCatalog((state) => state.confirmMatch);
  const rejectMatch = useCatalog((state) => state.rejectMatch);
  const markCorrection = useCatalog((state) => state.markCorrection);
  const undoCorrection = useCatalog((state) => state.undoCorrection);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      const cell = row.cells.find((item) => item.sourceId === source.id);
      if (!cell) return false;
      const decision = decisions[matchDecisionKey(source.id, row.bam.id)];
      if (decisionBand(cell, decision) !== band) return false;
      if (band === "confirmed" && confirmedFilter !== "all" && confirmationState(cell, decision) !== confirmedFilter) return false;
      if (!q) return true;
      const resolved = resolveCellMatch(cell, decision);
      return [row.bam.code, row.bam.name, ...Object.values(row.bam.extra), resolved.matched?.code, resolved.matched?.name]
        .filter(Boolean).join(" ").toLowerCase().includes(q);
    });
  }, [rows, source.id, query, band, decisions, confirmedFilter]);

  const sorted = useMemo(() => {
    const multiplier = sortDir === "asc" ? 1 : -1;
    const statusRank: Record<ConfirmationState, number> = { pending: 0, corrected: 1, exact: 2 };
    return [...filtered].sort((a, b) => {
      const cellA = a.cells.find((item) => item.sourceId === source.id);
      const cellB = b.cells.find((item) => item.sourceId === source.id);
      const decisionA = decisions[matchDecisionKey(source.id, a.bam.id)];
      const decisionB = decisions[matchDecisionKey(source.id, b.bam.id)];
      if (sortKey === "status" && band === "confirmed" && cellA && cellB) {
        const stateA = confirmationState(cellA, decisionA) ?? "exact";
        const stateB = confirmationState(cellB, decisionB) ?? "exact";
        const difference = statusRank[stateA] - statusRank[stateB];
        return difference ? difference * multiplier : a.bam.code.localeCompare(b.bam.code);
      }
      if (sortKey === "score" && cellA && cellB) {
        return (originalMatchScore(cellA, decisionA) - originalMatchScore(cellB, decisionB)) * multiplier;
      }
      return a.bam.code.localeCompare(b.bam.code) * multiplier;
    });
  }, [filtered, sortKey, sortDir, source.id, decisions, band]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = useMemo(() => sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE), [sorted, safePage]);

  useEffect(() => { setPage(1); }, [query, band, sortKey, sortDir, source.id, confirmedFilter]);
  useEffect(() => {
    setSortKey(band === "confirmed" ? "status" : "code");
    setSortDir("asc");
    if (band !== "confirmed") setConfirmedFilter("all");
  }, [band]);
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) return setSortDir((direction) => direction === "asc" ? "desc" : "asc");
    setSortKey(key);
    setSortDir(key === "score" ? "desc" : "asc");
  }

  async function confirm(row: RowMatch) {
    const cell = row.cells.find((item) => item.sourceId === source.id);
    if (!cell) return;
    try {
      await confirmMatch(source.id, row.bam.id, undefined, cell.score);
      toast.success("Match confirmado; queda registrado como corrección pendiente");
    } catch { toast.error("No se pudo guardar la confirmación"); }
  }

  async function reject(row: RowMatch) {
    try { await rejectMatch(source.id, row.bam.id); toast.message("Sugerencia eliminada para todos"); }
    catch { toast.error("No se pudo guardar el cambio"); }
  }

  async function markAsCorrected(row: RowMatch) {
    try {
      await markCorrection(source.id, row.bam.id);
      setCorrectionRow(null);
      toast.success("Corrección registrada; se conserva el match original");
    } catch { toast.error("No se pudo registrar la corrección"); }
  }

  async function restorePending(row: RowMatch) {
    try { await undoCorrection(source.id, row.bam.id); toast.success("La corrección vuelve a quedar pendiente"); }
    catch { toast.error("No se pudo deshacer la corrección"); }
  }

  const from = (safePage - 1) * PAGE_SIZE + 1;
  const to = Math.min(safePage * PAGE_SIZE, sorted.length);
  const correctionCell = correctionRow?.cells.find((item) => item.sourceId === source.id);
  const correctionDecision = correctionRow ? decisions[matchDecisionKey(source.id, correctionRow.bam.id)] : undefined;
  const correctionMatch = correctionCell ? resolveCellMatch(correctionCell, correctionDecision).matched : null;

  const pager = sorted.length ? (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-2 text-xs text-muted">
      <span>Mostrando {from}–{to} de {sorted.length} códigos</span>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={safePage <= 1}><ChevronLeft /> Anterior</Button>
        <span className="min-w-24 text-center tabular-nums">Página {safePage} de {totalPages}</span>
        <Button size="sm" variant="outline" onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={safePage >= totalPages}>Siguiente <ChevronRight /></Button>
      </div>
    </div>
  ) : null;

  return (
    <>
      {band === "confirmed" ? (
        <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2" aria-label="Filtrar confirmados por estado">
          <span className="mr-1 text-xs font-medium text-muted">Estado</span>
          {CONFIRMED_FILTERS.map((item) => (
            <button key={item.id} type="button" onClick={() => setConfirmedFilter(item.id)} aria-pressed={confirmedFilter === item.id}
              className={cn("h-8 rounded-full border px-3 text-xs font-medium transition-colors", confirmedFilter === item.id ? "border-primary bg-primary text-primary-fg" : "border-border bg-elevated text-muted hover:bg-chip hover:text-fg")}
            >{item.label}</button>
          ))}
        </div>
      ) : null}

      {!sorted.length ? (
        <div className="rounded-xl border border-border bg-surface px-6 py-12 text-center">
          <p className="font-medium">No hay códigos en esta sección</p>
          <p className="mt-1 text-sm text-muted">Probá otro estado o modificá la búsqueda.</p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-xl border border-border bg-surface md:block">
            <table className="w-full table-fixed text-left text-sm">
              <thead className="border-b border-border bg-chip/70 text-xs font-medium tracking-wide text-muted uppercase">
                <tr>
                  <th className="w-1/4 px-4 py-2.5"><button type="button" className="inline-flex items-center gap-1.5" onClick={() => toggleSort("code")}>Código BAMinds <SortIcon active={sortKey === "code"} dir={sortDir} /></button></th>
                  <th className="w-1/4 px-4 py-2.5">{band === "confirmed" ? `Código confirmado en ${source.name}` : `Sugerencia en ${source.name}`}</th>
                  <th className="w-1/5 px-4 py-2.5"><button type="button" className="inline-flex items-center gap-1.5" onClick={() => toggleSort("score")}>{band === "confirmed" ? "Match original" : "Coincidencia"}<SortIcon active={sortKey === "score"} dir={sortDir} /></button></th>
                  <th className="w-[30%] px-4 py-2.5 text-right">{band === "confirmed" ? <button type="button" className="ml-auto inline-flex items-center gap-1.5" onClick={() => toggleSort("status")}>Estado y acción <SortIcon active={sortKey === "status"} dir={sortDir} /></button> : "Acciones"}</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row) => {
                  const cell = row.cells.find((item) => item.sourceId === source.id);
                  if (!cell) return null;
                  const decision = decisions[matchDecisionKey(source.id, row.bam.id)];
                  const resolved = resolveCellMatch(cell, decision);
                  const state = confirmationState(cell, decision);
                  const score = originalMatchScore(cell, decision);
                  return (
                    <tr key={row.bam.id} className="cursor-pointer border-t border-border transition-colors hover:bg-chip/60" onClick={() => onSelect(row.bam.id)}>
                      <td className="px-4 py-3"><p className="truncate font-mono" title={row.bam.code}>{row.bam.code}</p></td>
                      <td className="px-4 py-3">{resolved.matched ? <p className="truncate font-mono" title={resolved.matched.code}>{resolved.matched.code}</p> : <span className="text-muted">{resolved.rejected ? "Sugerencia eliminada" : "Sin equivalente"}</span>}</td>
                      <td className="px-4 py-3"><OriginalScore score={score} state={state} /></td>
                      <td className="px-4 py-3" onClick={(event) => event.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          {state ? (
                            <>
                              <StateBadge state={state} />
                              {state === "pending" ? <Button size="sm" onClick={() => setCorrectionRow(row)}><Wrench /> Marcar corregido</Button> : state === "corrected" ? <Button size="icon-sm" variant="outline" title="Volver a corrección pendiente" aria-label="Volver a corrección pendiente" onClick={() => void restorePending(row)}><RotateCcw /></Button> : null}
                            </>
                          ) : (
                            <>
                              <Button size="sm" title="Confirmar match" onClick={() => void confirm(row)} disabled={!resolved.matched}><Check /><span className="hidden xl:inline">Confirmar match</span></Button>
                              <Button size="icon-sm" title="Eliminar sugerencia" aria-label="Eliminar sugerencia" variant="ghost" className="text-match-low" onClick={() => void reject(row)} disabled={!resolved.matched}><Trash2 /></Button>
                              <Button size="icon-sm" title="Editar match" aria-label="Editar match" variant="outline" onClick={() => onSelect(row.bam.id)}><Pencil /></Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {pager}
          </div>

          <div className="md:hidden">
            <ul className="flex flex-col gap-3">
              {pageRows.map((row) => {
                const cell = row.cells.find((item) => item.sourceId === source.id);
                if (!cell) return null;
                const decision = decisions[matchDecisionKey(source.id, row.bam.id)];
                const resolved = resolveCellMatch(cell, decision);
                const state = confirmationState(cell, decision);
                const score = originalMatchScore(cell, decision);
                return (
                  <li key={row.bam.id} className="rounded-xl border border-border bg-surface p-4">
                    <button type="button" className="w-full text-left" onClick={() => onSelect(row.bam.id)}>
                      <p className="text-xs font-medium tracking-wide text-muted uppercase">Código BAMinds</p>
                      <p className="mt-1 truncate font-mono text-sm" title={row.bam.code}>{row.bam.code}</p>
                      <div className="mt-3 flex items-end justify-between gap-3 rounded-md bg-elevated p-3">
                        <div className="min-w-0"><p className="text-xs text-muted">{source.name}</p><p className="mt-1 truncate font-mono text-sm" title={resolved.matched?.code}>{resolved.matched?.code ?? (resolved.rejected ? "Sugerencia eliminada" : "Sin equivalente")}</p></div>
                        <OriginalScore score={score} state={state} />
                      </div>
                    </button>
                    <div className="mt-3 flex flex-col gap-2">
                      {state ? (
                        <><StateBadge state={state} />{state === "pending" ? <Button onClick={() => setCorrectionRow(row)}><Wrench /> Marcar corregido</Button> : state === "corrected" ? <Button variant="outline" onClick={() => void restorePending(row)}><RotateCcw /> Volver a pendiente</Button> : null}</>
                      ) : (
                        <div className="grid grid-cols-3 gap-2"><Button onClick={() => void confirm(row)} disabled={!resolved.matched}>Confirmar</Button><Button variant="ghost" className="text-match-low" onClick={() => void reject(row)} disabled={!resolved.matched}>Eliminar</Button><Button variant="outline" onClick={() => onSelect(row.bam.id)}>Editar</Button></div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="mt-3 rounded-xl border border-border bg-surface">{pager}</div>
          </div>
        </>
      )}

      <AlertDialog.Root open={!!correctionRow} onOpenChange={(open) => { if (!open) setCorrectionRow(null); }}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 z-50 bg-fg/35" />
          <AlertDialog.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-surface p-5 shadow-xl">
            <AlertDialog.Title className="text-lg font-semibold">Registrar corrección en {source.name}</AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-sm leading-relaxed text-muted">Confirmá que actualizaste el código <span className="font-mono text-fg">{correctionMatch?.code}</span> por <span className="font-mono text-fg">{correctionRow?.bam.code}</span> en la fuente. Conservaremos el porcentaje original para mantener la trazabilidad.</AlertDialog.Description>
            <div className="mt-5 flex justify-end gap-2"><AlertDialog.Cancel asChild><Button variant="outline">Cancelar</Button></AlertDialog.Cancel><AlertDialog.Action asChild><Button onClick={() => correctionRow && void markAsCorrected(correctionRow)}><Check /> Confirmar corrección</Button></AlertDialog.Action></div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </>
  );
}
