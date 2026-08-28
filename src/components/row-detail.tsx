import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, CheckCircle2, PencilLine, RotateCcw, Trash2, Undo2, Wrench } from "lucide-react";
import { MatchBar, MatchPercent } from "@/components/match-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { RowMatch, Source } from "@/lib/matching";
import {
  confirmationState,
  matchTone,
  normalizeCode,
  originalMatchScore,
  resolveCellMatch,
} from "@/lib/matching";
import { matchDecisionKey, useCatalog } from "@/lib/store";

export function RowDetail({ row, source }: { row: RowMatch | null; source: Source | null }) {
  const [manualCode, setManualCode] = useState("");
  const setSelectedRowId = useCatalog((state) => state.setSelectedRowId);
  const decisions = useCatalog((state) => state.decisions);
  const confirmMatch = useCatalog((state) => state.confirmMatch);
  const confirmManualMatch = useCatalog((state) => state.confirmManualMatch);
  const rejectMatch = useCatalog((state) => state.rejectMatch);
  const undoMatch = useCatalog((state) => state.undoMatch);
  const markCorrection = useCatalog((state) => state.markCorrection);
  const undoCorrection = useCatalog((state) => state.undoCorrection);
  const cell = row && source ? row.cells.find((item) => item.sourceId === source.id) : null;
  const decision = row && source ? decisions[matchDecisionKey(source.id, row.bam.id)] : undefined;
  const resolved = cell ? resolveCellMatch(cell, decision) : null;
  const state = cell ? confirmationState(cell, decision) : null;

  useEffect(() => {
    setManualCode("");
  }, [row?.bam.id, source?.id]);

  async function confirm(candidateRowId?: string) {
    if (!row || !source) return;
    try {
      const candidateScore = candidateRowId
        ? cell?.candidates.find((candidate) => candidate.row.id === candidateRowId)?.score
        : cell?.score;
      await confirmMatch(source.id, row.bam.id, candidateRowId, candidateScore);
      setSelectedRowId(null);
      toast.success("Coincidencia confirmada, compartida y movida a Confirmados");
    } catch {
      toast.error("No se pudo guardar la confirmación");
    }
  }

  async function reject() {
    if (!row || !source) return;
    try {
      await rejectMatch(source.id, row.bam.id);
      setSelectedRowId(null);
      toast.message("Sugerencia eliminada para todos");
    } catch {
      toast.error("No se pudo guardar el cambio");
    }
  }

  async function confirmManual() {
    if (!row || !source) return;
    const code = manualCode.trim();
    const normalized = normalizeCode(code);
    if (!normalized) {
      toast.error("Ingresá un código válido");
      return;
    }

    const sourceRow = source.rows.find((candidate) => normalizeCode(candidate.code) === normalized);
    try {
      await confirmManualMatch(
        source.id,
        row.bam.id,
        sourceRow ?? {
          id: `manual-${source.id}-${row.bam.id}-${normalized}`,
          code,
          name: "Código ingresado manualmente",
          extra: {},
        },
        cell?.score ?? 0,
      );
      setSelectedRowId(null);
      toast.success(
        sourceRow
          ? "Código localizado, confirmado y compartido"
          : "Código manual confirmado y compartido",
      );
    } catch {
      toast.error("No se pudo guardar el código confirmado");
    }
  }

  async function undo() {
    if (!row || !source) return;
    try {
      await undoMatch(source.id, row.bam.id);
      toast.success("Confirmación deshecha; ya podés corregir la coincidencia");
    } catch {
      toast.error("No se pudo deshacer la confirmación");
    }
  }

  async function markAsCorrected() {
    if (!row || !source) return;
    try {
      await markCorrection(source.id, row.bam.id);
      toast.success("Corrección registrada; se conserva el match original");
    } catch {
      toast.error("No se pudo registrar la corrección");
    }
  }

  async function restorePending() {
    if (!row || !source) return;
    try {
      await undoCorrection(source.id, row.bam.id);
      toast.success("La corrección vuelve a quedar pendiente");
    } catch {
      toast.error("No se pudo deshacer la corrección");
    }
  }

  return (
    <Sheet
      open={!!row && !!source}
      onOpenChange={(open) => {
        if (!open) setSelectedRowId(null);
      }}
    >
      <SheetContent className="overflow-y-auto">
        {row && source && cell && resolved ? (
          <>
            <SheetHeader>
              <p className="font-mono text-xs tracking-wide text-muted">{row.bam.code}</p>
              <SheetTitle>{row.bam.name}</SheetTitle>
              <SheetDescription>
                Descripción completa y propuestas de coincidencia en {source.name}.
              </SheetDescription>
            </SheetHeader>

            <div className="flex flex-col gap-4 px-5 pb-8">
              <section className="rounded-lg border border-border bg-elevated p-4">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium tracking-wide text-muted uppercase">
                      Sugerencia actual
                    </p>
                    <h3 className="mt-1 font-medium">{source.name}</h3>
                  </div>
                  {state === "exact" ? (
                    <Badge tone="high" className="gap-1">
                      <CheckCircle2 className="size-3.5" /> Exacto de origen
                    </Badge>
                  ) : state === "corrected" ? (
                    <Badge tone="high" className="gap-1">
                      <Check className="size-3.5" /> Corregido
                    </Badge>
                  ) : state === "pending" ? (
                    <Badge tone="mid" className="gap-1">
                      <Wrench className="size-3.5" /> Corrección pendiente
                    </Badge>
                  ) : (
                    <MatchPercent score={resolved.score} by={resolved.by} />
                  )}
                </div>
                <MatchBar
                  score={cell ? originalMatchScore(cell, decision) : resolved.score}
                  by={resolved.by}
                  className="mb-3"
                />
                {resolved.matched ? (
                  <div>
                    <p className="font-mono text-xs text-muted">{resolved.matched.code}</p>
                    {resolved.matched.name ? (
                      <p className="mt-1 text-sm leading-relaxed">{resolved.matched.name}</p>
                    ) : null}
                  </div>
                ) : (
                  <p className="text-sm text-muted">
                    {resolved.rejected
                      ? "Esta sugerencia fue eliminada. Podés elegir otra propuesta debajo."
                      : "No hay un equivalente claro en esta base."}
                  </p>
                )}

                {!resolved.confirmed && resolved.matched ? (
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Button onClick={() => void confirm()}>
                      <Check />
                      Confirmar
                    </Button>
                    <Button
                      variant="outline"
                      className="text-match-low"
                      onClick={() => void reject()}
                    >
                      <Trash2 />
                      Eliminar
                    </Button>
                  </div>
                ) : null}
                {state === "pending" ? (
                  <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <Button onClick={() => void markAsCorrected()}>
                      <Wrench /> Marcar corregido
                    </Button>
                    <Button variant="outline" onClick={() => void undo()}>
                      <Undo2 /> Deshacer match
                    </Button>
                  </div>
                ) : state === "corrected" ? (
                  <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <Button variant="outline" onClick={() => void restorePending()}>
                      <RotateCcw /> Volver a pendiente
                    </Button>
                    <Button variant="outline" onClick={() => void undo()}>
                      <Undo2 /> Deshacer match
                    </Button>
                  </div>
                ) : resolved.confirmed && decision?.status === "confirmed" ? (
                  <Button variant="outline" className="mt-4 w-full" onClick={() => void undo()}>
                    <Undo2 /> Deshacer match
                  </Button>
                ) : null}
              </section>

              <section>
                <div className="mb-2">
                  <h3 className="font-medium">Editar coincidencia</h3>
                  <p className="text-sm text-muted">
                    Elegí una propuesta o ingresá el código correcto manualmente.
                  </p>
                </div>
                <form
                  className="mb-3 rounded-lg border border-border bg-elevated p-3"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void confirmManual();
                  }}
                >
                  <Label htmlFor="manual-code">Código manual</Label>
                  <p className="mt-1 text-xs text-muted">
                    Si existe en {source.name}, recuperaremos su descripción automáticamente.
                  </p>
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <Input
                      id="manual-code"
                      value={manualCode}
                      onChange={(event) => setManualCode(event.target.value)}
                      placeholder="Escribí el código exacto"
                      autoComplete="off"
                    />
                    <Button type="submit" disabled={!manualCode.trim()}>
                      <PencilLine />
                      Confirmar código
                    </Button>
                  </div>
                </form>
                {cell.candidates.length ? (
                  <ul className="flex flex-col gap-2">
                    {cell.candidates.map((candidate) => (
                      <li
                        key={candidate.row.id}
                        className="rounded-lg border border-border bg-surface p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-mono text-xs text-muted">{candidate.row.code}</p>
                            <p className="mt-1 text-sm leading-relaxed">{candidate.row.name}</p>
                          </div>
                          <Badge tone={matchTone(candidate.score, candidate.by)}>
                            {candidate.score}%
                          </Badge>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3 w-full"
                          onClick={() => void confirm(candidate.row.id)}
                        >
                          Seleccionar y confirmar
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="rounded-lg border border-dashed border-border-strong px-4 py-6 text-center text-sm text-muted">
                    No se encontraron otras propuestas para este código.
                  </div>
                )}
              </section>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
