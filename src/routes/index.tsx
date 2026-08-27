import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Toaster, toast } from "sonner";
import { Download, Search, Trash2, X } from "lucide-react";
import { MatchTable } from "@/components/match-table";
import { MasterTable } from "@/components/master-table";
import { RowDetail } from "@/components/row-detail";
import { UploadDialog } from "@/components/upload-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TiltCard } from "@/components/ui/tilt-card";
import { NumberTicker } from "@/components/ui/number-ticker";
import { tableToCsv } from "@/lib/csv";
import {
  resolveCellMatch,
  type MatchBand,
  type RowMatch,
} from "@/lib/matching";
import { loadFixedSources } from "@/lib/fixed-sources";
import { loadBamindsReference } from "@/lib/sample-data";
import { matchDecisionKey, useCatalog } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({ component: Home });

const BANDS: { id: MatchBand; label: string }[] = [
  { id: "confirmed", label: "Confirmados" },
  { id: "near", label: "90–99%" },
  { id: "high", label: "70–89%" },
  { id: "mid", label: "45–69%" },
  { id: "low", label: "< 45%" },
  { id: "none", label: "Sin match" },
];

type WorkerResponse =
  | { jobId: number; ok: true; rows: RowMatch[] }
  | { jobId: number; ok: false; error: string };

// Traduce el % de confirmación a la misma escala de color que ya usan
// MatchBar/MatchPercent, para que "cuánto está confirmado" se lea de un
// vistazo por color y no solo por número.
function confirmTone(percentage: number) {
  if (percentage >= 80) return "match-high";
  if (percentage >= 50) return "match-mid";
  if (percentage > 0) return "match-low";
  return "match-none";
}

function Home() {
  const [ready, setReady] = useState(false);
  const [rows, setRows] = useState<RowMatch[]>([]);
  const [isComparing, setIsComparing] = useState(false);
  // Fuerza un remount de los tickers cada vez que se activa una fuente,
  // para que la animación se reproduzca siempre al abrir la tarjeta.
  const [tickerRun, setTickerRun] = useState(0);
  const jobIdRef = useRef(0);

  const reference = useCatalog((s) => s.reference);
  const sources = useCatalog((s) => s.sources);
  const activeSourceId = useCatalog((s) => s.activeSourceId);
  const decisions = useCatalog((s) => s.decisions);
  const query = useCatalog((s) => s.query);
  const band = useCatalog((s) => s.band);
  const selectedRowId = useCatalog((s) => s.selectedRowId);
  const setReference = useCatalog((s) => s.setReference);
  const setFixedSources = useCatalog((s) => s.setFixedSources);
  const setActiveSourceId = useCatalog((s) => s.setActiveSourceId);
  const setQuery = useCatalog((s) => s.setQuery);
  const setBand = useCatalog((s) => s.setBand);
  const setSelectedRowId = useCatalog((s) => s.setSelectedRowId);
  const removeSource = useCatalog((s) => s.removeSource);
  const clearSources = useCatalog((s) => s.clearSources);

  const activeSource = useMemo(
    () => {
      if (activeSourceId === "baminds") return null;
      return (
        sources.find((source) => source.id === activeSourceId) ??
        sources[0] ??
        null
      );
    },
    [sources, activeSourceId],
  );

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      try {
        await useCatalog.persist.rehydrate();
        const [baminds, fixedSources] = await Promise.all([
          loadBamindsReference(),
          loadFixedSources(),
        ]);

        if (!cancelled) {
          setReference(baminds);
          setFixedSources(fixedSources);
        }
      } catch (error) {
        console.error(error);

        if (!cancelled) {
          toast.error("No se pudieron cargar las bases conectadas");
        }
      } finally {
        if (!cancelled) {
          setReady(true);
        }
      }
    }

    void initialize();

    return () => {
      cancelled = true;
    };
  }, [setFixedSources, setReference]);

  useEffect(() => {
    if (!reference) {
      setRows([]);
      setIsComparing(false);
      return;
    }

    if (!sources.length) {
      setRows(reference.rows.map((bam) => ({ bam, cells: [], average: 0 })));
      setIsComparing(false);
      return;
    }

    const jobId = ++jobIdRef.current;
    setIsComparing(true);
    setSelectedRowId(null);

    // La comparación pesada corre fuera del hilo principal para que la interfaz
    // no quede congelada mientras se procesan decenas de miles de registros.
    const worker = new Worker(
      new URL("../workers/matching.worker.ts", import.meta.url),
      { type: "module" },
    );

    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const result = event.data;
      if (result.jobId !== jobId || jobIdRef.current !== jobId) return;

      if (result.ok) {
        setRows(result.rows);
      } else {
        console.error(result.error);
        toast.error("No se pudo completar la comparación");
      }
      setIsComparing(false);
      worker.terminate();
    };

    worker.onerror = (event) => {
      if (jobIdRef.current !== jobId) return;
      console.error(event);
      toast.error("La comparación encontró un error inesperado");
      setIsComparing(false);
      worker.terminate();
    };

    worker.postMessage({ jobId, reference, sources });

    return () => {
      worker.terminate();
    };
  }, [reference, sources, setSelectedRowId]);

  const selected = useMemo(
    () => rows.find((r) => r.bam.id === selectedRowId) ?? null,
    [rows, selectedRowId],
  );

  const hasManualSources = sources.some((source) => !source.fixed);

  const stats = useMemo(
    () =>
      sources.map((source) => {
        let confirmed = 0;
        let reviewable = 0;

        for (const row of rows) {
          const cell = row.cells.find((item) => item.sourceId === source.id);
          if (!cell) continue;
          const decision = decisions[matchDecisionKey(source.id, row.bam.id)];
          if (cell.by === "none" && !decision) continue;
          reviewable += 1;
          if (resolveCellMatch(cell, decision).confirmed) confirmed += 1;
        }

        return {
          sourceId: source.id,
          confirmed,
          reviewable,
          percentage: reviewable
            ? Math.round((confirmed / reviewable) * 100)
            : 0,
        };
      }),
    [rows, sources, decisions],
  );

  function exportCsv() {
    if (!reference || isComparing) return;

    const headers = [
      "codigo_baminds",
      "nombre_baminds",
      "fuente",
      "codigo_fuente",
      "nombre_fuente",
      "coincidencia_nombre",
      "vinculo",
      "estado",
    ];
    const out: string[][] = [];

    for (const r of rows) {
      if (!sources.length) {
        out.push([r.bam.code, r.bam.name, "", "", "", "", "", ""]);
        continue;
      }
      for (const cell of r.cells) {
        const src = sources.find((s) => s.id === cell.sourceId);
        const decision = decisions[matchDecisionKey(cell.sourceId, r.bam.id)];
        const resolved = resolveCellMatch(cell, decision);
        out.push([
          r.bam.code,
          r.bam.name,
          src?.name ?? "",
          resolved.matched?.code ?? "",
          resolved.matched?.name ?? "",
          resolved.by === "none" ? "" : String(resolved.score),
          resolved.by,
          resolved.confirmed
            ? "confirmado"
            : resolved.rejected
              ? "eliminado"
              : "pendiente",
        ]);
      }
    }

    const csv = tableToCsv(headers, out);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cruce-baminds.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Cruce exportado");
  }

  return (
    <div className="min-h-screen bg-bg">
      <Toaster position="bottom-center" richColors closeButton />
      <header className="bg-bg">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold tracking-widest text-muted uppercase">
                Catálogo de productos
              </p>
              <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                Máster de Códigos SKU
              </h1>
              <p className="text-sm text-muted">
                Códigos BAMinds vs. cómo los nombran las otras bases.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <UploadDialog triggerLabel="Cargar base" />
            <Button
              variant="outline"
              size="sm"
              onClick={exportCsv}
              disabled={!reference || isComparing}
            >
              <Download />
              <span className="hidden sm:inline">Exportar</span>
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              title="Eliminar bases cargadas manualmente"
              disabled={isComparing || !hasManualSources}
              onClick={() => {
                clearSources();
                toast.message("Bases manuales eliminadas");
              }}
            >
              <Trash2 />
              <span className="sr-only">Vaciar</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-[1400px] flex-col gap-3 px-4 py-4 sm:px-6">
        {!ready ? (
          <div className="rounded-xl border border-border bg-surface px-4 py-10 text-center text-sm text-muted">
            Cargando catálogo…
          </div>
        ) : (
          <>
            <section className="flex items-stretch gap-3 overflow-x-auto pb-1">
              {/* La base maestra es la referencia fija de todo el cruce, así que
                  se le da más tamaño, color propio y se la fija al hacer scroll
                  horizontal para que nunca se pierda de vista. Las tarjetas de
                  fuentes (más abajo) igualan esta altura con items-stretch. */}
              <div className="sticky left-0 z-10 shrink-0 self-stretch bg-bg pr-3">
                <TiltCard
                  max={8}
                  className={cn(
                    "h-full min-w-56 border border-primary/80 bg-primary text-primary-fg shadow-md transition-shadow hover:shadow-lg sm:min-w-64",
                    !activeSource &&
                      "ring-2 ring-primary-fg/20 ring-offset-2 ring-offset-bg",
                  )}
                >
                  <article className="flex h-full min-h-[142px] flex-col p-4">
                    <button
                      type="button"
                      className="relative z-10 h-full w-full rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-primary-fg/60"
                      style={{ transform: "translateZ(24px)" }}
                      aria-pressed={!activeSource}
                      onClick={() => setActiveSourceId("baminds")}
                    >
                      <span className="flex items-center gap-1.5 text-xs font-semibold tracking-widest text-primary-fg/80 uppercase">
                        Base maestra
                      </span>
                      <span className="mt-2 block font-mono text-3xl font-semibold text-primary-fg tabular-nums">
                        {reference?.rows.length ?? 0}
                      </span>
                      <span className="mt-0.5 block text-xs text-primary-fg/80">
                        códigos BAMinds
                      </span>
                    </button>
                  </article>
                </TiltCard>
              </div>

              {!sources.length ? (
                <article className="flex min-w-56 flex-1 flex-col justify-center self-stretch rounded-lg border border-dashed border-border-strong bg-surface px-3 py-2.5">
                  <p className="text-sm font-medium">Sumá una base comparativa</p>
                  <p className="text-xs text-muted">BAMinds ya está conectada desde el JSON maestro.</p>
                </article>
              ) : isComparing ? (
                sources.map((src) => (
                  <article
                    key={src.id}
                    className="flex min-w-48 flex-1 flex-col justify-center self-stretch rounded-lg border border-border bg-surface px-3 py-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-[11px] font-medium tracking-wide text-muted uppercase">
                        {src.name}
                      </p>
                    </div>
                    <p className="mt-1 text-sm font-medium text-primary">Procesando comparación…</p>
                    <p className="text-xs text-muted">{src.rows.length} códigos cargados</p>
                  </article>
                ))
              ) : (
                stats.map((st) => {
                  const src = sources.find((s) => s.id === st.sourceId);
                  const isActive = activeSource?.id === st.sourceId;
                  const tone = confirmTone(st.percentage);
                  const initial = src?.name?.trim().charAt(0).toUpperCase() || "?";
                  const progressDegrees = st.percentage * 3.6;
                  const avatar = (
                    <div
                      className="flex size-9 shrink-0 items-center justify-center rounded-full transition-[background] duration-500 ease-out"
                      style={{
                        background: `conic-gradient(
                          from -90deg,
                          color-mix(in srgb, var(--color-${tone}) 48%, white) 0deg,
                          var(--color-${tone}) ${progressDegrees * 0.58}deg,
                          color-mix(in srgb, var(--color-${tone}) 78%, white) ${progressDegrees}deg,
                          var(--color-border) ${progressDegrees}deg 360deg
                        )`,
                      }}
                    >
                      <span className="flex size-7 items-center justify-center rounded-full bg-surface text-xs font-bold">
                        {initial}
                      </span>
                    </div>
                  );
                  return (
                    <article
                      key={st.sourceId}
                      className={cn(
                        "group relative shrink-0 self-stretch overflow-hidden rounded-lg bg-surface transition-[width,border-width,box-shadow] duration-300 ease-out",
                        isActive
                          ? "w-56 border-2 border-transparent shadow-sm sm:w-64"
                          : "w-16 border border-border hover:border-border-strong",
                      )}
                      style={
                        isActive
                          ? {
                              background:
                                "linear-gradient(var(--color-surface), var(--color-surface)) padding-box, linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 48%, white), var(--color-primary), color-mix(in srgb, var(--color-primary) 68%, white)) border-box",
                            }
                          : undefined
                      }
                    >
                      {/* La tarjeta iguala el alto de la maestra (items-stretch en el
                          contenedor). Colapsada, es angosta y solo muestra el avatar
                          con inicial + el anillo de progreso (el mismo color que el
                          % confirmado) y el número debajo, todo en horizontal. Al
                          activarla se ensancha y aparece el detalle completo — las
                          dos vistas conviven en la misma celda y se cruzan con
                          opacidad mientras el ancho anima, para que sea una sola
                          transición fluida en vez de un corte. */}
                      <button
                        type="button"
                        className="grid h-full w-full grid-cols-1 grid-rows-1 text-left hover:bg-chip"
                        aria-pressed={isActive}
                        onClick={() => {
                          setTickerRun((run) => run + 1);
                          setActiveSourceId(st.sourceId);
                        }}
                      >
                        <div
                          className={cn(
                            "col-start-1 row-start-1 flex h-full flex-col items-center justify-center gap-2 px-1 py-3 transition-opacity duration-200 ease-out",
                            isActive
                              ? "pointer-events-none opacity-0"
                              : "opacity-100 delay-100",
                          )}
                        >
                          {avatar}
                          <span
                            className="font-mono text-xs font-bold tabular-nums"
                            style={{ color: `var(--color-${tone})` }}
                          >
                            {st.percentage}%
                          </span>
                        </div>

                        <div
                          className={cn(
                            "relative col-start-1 row-start-1 flex h-full flex-col gap-2 px-3 py-3 transition-opacity duration-200 ease-out",
                            isActive
                              ? "opacity-100"
                              : "pointer-events-none opacity-0",
                          )}
                        >
                          <div className="flex items-center gap-2 pr-4">
                            {avatar}
                            <span className="min-w-0 flex-1 truncate text-xs font-medium tracking-wide text-muted uppercase">
                              {src?.name}
                            </span>
                            <span
                              className="shrink-0 font-mono text-xs font-bold tabular-nums"
                              style={{ color: `var(--color-${tone})` }}
                            >
                              {isActive ? (
                                <NumberTicker
                                  key={`percentage-${st.sourceId}-${tickerRun}`}
                                  value={st.percentage}
                                  suffix="%"
                                  startOnView={false}
                                  duration={1.15}
                                  stagger={0.07}
                                  blur
                                />
                              ) : null}
                            </span>
                          </div>
                          {/* El contador de confirmados es el dato que más importa
                              de un vistazo, así que se lleva el mismo tratamiento
                              tipográfico que el número grande de la tarjeta maestra. */}
                          <p className="absolute inset-x-3 top-[57%] flex -translate-y-1/2 items-baseline justify-center text-center font-mono text-2xl leading-none font-bold tabular-nums">
                            {isActive ? (
                              <NumberTicker
                                key={`confirmed-${st.sourceId}-${tickerRun}`}
                                value={st.confirmed}
                                startOnView={false}
                                duration={1.2}
                                stagger={0.065}
                                blur
                              />
                            ) : null}
                            <span className="ml-1 flex items-baseline gap-1 font-sans text-xs font-normal text-muted">
                              <span>/</span>
                              {isActive ? (
                                <NumberTicker
                                  key={`reviewable-${st.sourceId}-${tickerRun}`}
                                  value={st.reviewable}
                                  startOnView={false}
                                  duration={1.2}
                                  stagger={0.055}
                                  blur
                                />
                              ) : null}
                              <span>confirmados</span>
                            </span>
                          </p>
                        </div>
                      </button>
                      {!src?.fixed ? (
                        <button
                          type="button"
                          className={cn(
                            "absolute top-1 right-1 rounded-sm p-1.5 text-subtle transition-opacity duration-200 ease-out hover:bg-chip hover:text-fg",
                            isActive
                              ? "opacity-100 delay-100"
                              : "pointer-events-none opacity-0",
                          )}
                          aria-label={`Quitar ${src?.name}`}
                          onClick={() => removeSource(st.sourceId)}
                        >
                          <X className="size-4" />
                        </button>
                      ) : null}
                    </article>
                  );
                })
              )}
            </section>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar código o descripción…"
                  className="h-10 pl-10"
                  aria-label="Buscar"
                  disabled={isComparing}
                />
              </div>
              {activeSource ? (
                <div className="flex flex-wrap gap-1">
                  {BANDS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setBand(item.id)}
                      disabled={isComparing}
                      className={cn(
                        "h-10 rounded-full border px-2.5 text-xs font-medium disabled:opacity-50 sm:text-sm",
                        band === item.id
                          ? "border-primary bg-primary text-primary-fg"
                          : "border-border bg-surface text-muted hover:bg-chip hover:text-fg",
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            {isComparing ? (
              <div className="rounded-xl border border-border bg-surface px-4 py-8 text-center text-sm text-muted">
                <p className="font-medium text-fg">Procesando comparación en segundo plano…</p>
                <p className="mt-1">La página debería seguir respondiendo mientras se analizan los registros.</p>
              </div>
            ) : activeSource ? (
              <MatchTable
                rows={rows}
                source={activeSource}
                query={query}
                band={band}
                onSelect={setSelectedRowId}
              />
            ) : reference ? (
              <MasterTable rows={reference.rows} query={query} />
            ) : (
              <div className="rounded-xl border border-border bg-surface px-6 py-12 text-center text-sm text-muted">
                No se pudo cargar la base maestra BAMinds.
              </div>
            )}

            <RowDetail row={isComparing ? null : selected} source={activeSource} />
          </>
        )}
      </main>
    </div>
  );
}