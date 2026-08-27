import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CatalogRow, MatchBand, MatchDecision, Source } from "@/lib/matching";
import { saveSharedDecision, type SharedDecisionsSnapshot } from "@/lib/shared-decisions";

export function matchDecisionKey(sourceId: string, bamId: string) {
  return `${sourceId}::${bamId}`;
}

export type CatalogState = {
  reference: Source | null;
  sources: Source[];
  activeSourceId: string | null;
  decisions: Record<string, MatchDecision>;
  lastSharedUpdateAt: string | null;
  threshold: number;
  query: string;
  band: MatchBand;
  selectedRowId: string | null;
  setReference: (source: Source) => void;
  setFixedSources: (sources: Source[]) => void;
  setSharedDecisions: (snapshot: SharedDecisionsSnapshot) => void;
  setActiveSourceId: (id: string) => void;
  addSource: (source: Source) => void;
  replaceSource: (source: Source) => void;
  removeSource: (id: string) => void;
  setThreshold: (n: number) => void;
  setQuery: (q: string) => void;
  setBand: (b: MatchBand) => void;
  setSelectedRowId: (id: string | null) => void;
  confirmMatch: (sourceId: string, bamId: string, candidateRowId?: string) => Promise<void>;
  confirmManualMatch: (sourceId: string, bamId: string, match: CatalogRow) => Promise<void>;
  rejectMatch: (sourceId: string, bamId: string) => Promise<void>;
  clearSources: () => void;
  clearAll: () => void;
};

export const useCatalog = create<CatalogState>()(
  persist(
    (set, get) => {
      async function commitDecision(
        sourceId: string,
        bamId: string,
        decision: MatchDecision,
      ): Promise<void> {
        const key = matchDecisionKey(sourceId, bamId);
        const previous = get().decisions[key];

        set((state) => ({
          decisions: { ...state.decisions, [key]: decision },
        }));

        const isFixed = get().sources.some((source) => source.id === sourceId && source.fixed);
        if (!isFixed) return;

        try {
          const saved = await saveSharedDecision({ data: { sourceId, bamId, decision } });
          set({ lastSharedUpdateAt: saved.updatedAt });
        } catch (error) {
          set((state) => {
            if (state.decisions[key] !== decision) return {};
            const decisions = { ...state.decisions };
            if (previous) decisions[key] = previous;
            else delete decisions[key];
            return { decisions };
          });
          throw error;
        }
      }

      return {
        reference: null,
        sources: [],
        activeSourceId: null,
        decisions: {},
        lastSharedUpdateAt: null,
        threshold: 50,
        query: "",
        band: "confirmed",
        selectedRowId: null,

        setReference: (source) =>
          set({
            reference: source,
            selectedRowId: null,
          }),

        setFixedSources: (fixedSources) =>
          set((state) => {
            const manualSources = state.sources.filter((source) => !source.fixed);
            const sources = [...fixedSources, ...manualSources];
            const activeSourceId = sources.some((source) => source.id === state.activeSourceId)
              ? state.activeSourceId
              : (fixedSources[0]?.id ?? manualSources[0]?.id ?? "baminds");
            return { sources, activeSourceId };
          }),

        setSharedDecisions: (snapshot) =>
          set((state) => {
            const fixedIds = new Set(
              state.sources.filter((source) => source.fixed).map((source) => source.id),
            );
            const decisions = Object.fromEntries(
              Object.entries(state.decisions).filter(([key]) => {
                const sourceId = key.slice(0, key.indexOf("::"));
                return !fixedIds.has(sourceId);
              }),
            );
            for (const record of snapshot.records) {
              if (!fixedIds.has(record.sourceId)) continue;
              decisions[matchDecisionKey(record.sourceId, record.bamId)] = record.decision;
            }
            return { decisions, lastSharedUpdateAt: snapshot.lastUpdatedAt };
          }),

        setActiveSourceId: (id) => set({ activeSourceId: id, selectedRowId: null }),

        addSource: (source) =>
          set((state) => ({
            sources: [...state.sources.filter((item) => item.id !== source.id), source],
            activeSourceId: source.id,
            band: "confirmed",
            selectedRowId: null,
          })),

        replaceSource: (source) =>
          set((state) => ({
            sources: state.sources.map((item) => (item.id === source.id ? source : item)),
            selectedRowId: null,
          })),

        removeSource: (id) =>
          set((state) => {
            if (state.sources.find((source) => source.id === id)?.fixed) {
              return {};
            }
            const sources = state.sources.filter((item) => item.id !== id);
            return {
              sources,
              activeSourceId:
                state.activeSourceId === id ? (sources[0]?.id ?? null) : state.activeSourceId,
              decisions: Object.fromEntries(
                Object.entries(state.decisions).filter(([key]) => !key.startsWith(`${id}::`)),
              ),
              selectedRowId: null,
            };
          }),

        setThreshold: (n) => set({ threshold: n }),
        setQuery: (q) => set({ query: q }),
        setBand: (b) => set({ band: b }),
        setSelectedRowId: (id) => set({ selectedRowId: id }),
        confirmMatch: (sourceId, bamId, candidateRowId) =>
          commitDecision(sourceId, bamId, {
            status: "confirmed",
            candidateRowId,
          }),
        confirmManualMatch: (sourceId, bamId, match) =>
          commitDecision(sourceId, bamId, {
            status: "confirmed",
            manualMatch: match,
          }),
        rejectMatch: (sourceId, bamId) => commitDecision(sourceId, bamId, { status: "rejected" }),

        clearSources: () =>
          set((state) => {
            const fixedSources = state.sources.filter((source) => source.fixed);
            const fixedIds = new Set(fixedSources.map((source) => source.id));
            return {
              sources: fixedSources,
              activeSourceId:
                state.activeSourceId === "baminds" || fixedIds.has(state.activeSourceId ?? "")
                  ? state.activeSourceId
                  : (fixedSources[0]?.id ?? "baminds"),
              decisions: Object.fromEntries(
                Object.entries(state.decisions).filter(([key]) => {
                  const sourceId = key.slice(0, key.indexOf("::"));
                  return fixedIds.has(sourceId);
                }),
              ),
              query: "",
              band: "confirmed",
              selectedRowId: null,
            };
          }),

        clearAll: () =>
          set({
            reference: null,
            sources: [],
            activeSourceId: null,
            decisions: {},
            lastSharedUpdateAt: null,
            query: "",
            band: "confirmed",
            selectedRowId: null,
          }),
      };
    },
    {
      // v2 evita rehidratar bases grandes guardadas por versiones anteriores.
      name: "cruce-baminds-v2",
      skipHydration: true,
      // Las bases cargadas pueden tener decenas de miles de filas. Guardarlas en
      // localStorage congela el navegador y puede superar la cuota disponible.
      partialize: (state) => ({
        threshold: state.threshold,
      }),
    },
  ),
);
