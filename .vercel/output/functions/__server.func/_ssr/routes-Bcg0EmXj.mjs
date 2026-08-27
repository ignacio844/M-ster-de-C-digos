import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as Search, c as LoaderCircle, d as ChevronRight, f as ChevronLeft, g as ArrowDown, h as ArrowUpDown, i as Trash2, l as FileSpreadsheet, m as ArrowUp, n as Upload, o as Pencil, p as Check, s as PencilLine, t as X, u as Download } from "../_libs/lucide-react.mjs";
import { a as DialogOverlay$1, c as DialogTrigger$1, i as DialogDescription$1, l as Slot, n as DialogClose, o as DialogPortal$1, r as DialogContent$1, s as DialogTitle$1, t as Dialog$1 } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { n as toast, t as Toaster } from "../_libs/sonner.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
import { a as useMotionValue, i as useMotionTemplate, n as useReducedMotion, r as useSpring, t as useInView } from "../_libs/framer-motion+[...].mjs";
import { t as motion } from "../_libs/motion.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-Bcg0EmXj.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function fold(s) {
	return s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}
function normalizeCode(s) {
	return fold(s).replace(/[^a-z0-9]/g, "");
}
function bandOf(score, by) {
	if (by === "none") return "none";
	if (score === 100) return "confirmed";
	if (score >= 90) return "near";
	if (score >= 70) return "high";
	if (score >= 45) return "mid";
	return "low";
}
function resolveCellMatch(cell, decision) {
	if (decision?.status === "rejected") return {
		...cell,
		matched: null,
		score: 0,
		by: "none",
		confirmed: false,
		rejected: true
	};
	const selected = decision?.candidateRowId ? cell.candidates.find((candidate) => candidate.row.id === decision.candidateRowId) : null;
	const manualMatch = decision?.manualMatch;
	return {
		...cell,
		matched: manualMatch ?? selected?.row ?? cell.matched,
		score: manualMatch ? 100 : selected?.score ?? cell.score,
		by: manualMatch ? "code" : selected?.by ?? cell.by,
		nameScore: manualMatch ? 100 : cell.nameScore,
		confirmed: decision?.status === "confirmed" || !decision && cell.by !== "none" && cell.score === 100,
		rejected: false
	};
}
function decisionBand(cell, decision) {
	const resolved = resolveCellMatch(cell, decision);
	if (resolved.confirmed) return "confirmed";
	return bandOf(resolved.score, resolved.by);
}
function matchTone(score, by) {
	if (by === "none") return "none";
	if (score >= 90) return "high";
	if (score >= 70) return "mid";
	return "low";
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function MatchPercent({ score, by, className }) {
	const toneColor = `var(--color-match-${matchTone(score, by)})`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("font-mono text-sm font-medium tabular-nums", by === "none" ? "text-subtle" : void 0, className),
		style: by !== "none" ? { color: toneColor } : void 0,
		children: by === "none" ? "—" : `${Math.round(score)}%`
	});
}
function MatchBar({ score, by, className }) {
	const toneColor = `var(--color-match-${matchTone(score, by)})`;
	const percentage = by === "none" ? 0 : Math.max(0, Math.min(100, Math.round(score)));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("h-1.5 w-full overflow-hidden rounded-full bg-border", className),
		"aria-hidden": "true",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-full rounded-full transition-[width] duration-500 ease-out",
			style: {
				width: `${percentage}%`,
				background: by === "none" ? "transparent" : `linear-gradient(
                  90deg,
                  color-mix(in srgb, ${toneColor} 52%, white) 0%,
                  ${toneColor} 52%,
                  color-mix(in srgb, ${toneColor} 82%, black) 100%
                )`
			}
		})
	});
}
var badgeVariants = cva("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium tabular-nums", {
	variants: { tone: {
		high: "bg-match-high/12 text-match-high",
		mid: "bg-match-mid/12 text-match-mid",
		low: "bg-match-low/12 text-match-low",
		none: "bg-chip text-muted",
		neutral: "bg-chip text-fg"
	} },
	defaultVariants: { tone: "neutral" }
});
function Badge({ className, tone, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn(badgeVariants({ tone }), className),
		...props
	});
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-medium transition-[opacity,transform,background-color,color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]", {
	variants: {
		variant: {
			default: "bg-primary text-primary-fg hover:opacity-90",
			secondary: "bg-chip text-fg hover:bg-border",
			outline: "border border-border-strong bg-elevated text-fg hover:bg-chip",
			ghost: "text-fg hover:bg-chip",
			destructive: "bg-match-low text-elevated hover:opacity-90"
		},
		size: {
			default: "h-11 px-4",
			sm: "h-9 px-3 text-sm",
			lg: "h-12 px-5",
			icon: "size-11",
			"icon-sm": "size-9"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function Button({ className, variant, size, asChild = false, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		...props
	});
}
function matchDecisionKey(sourceId, bamId) {
	return `${sourceId}::${bamId}`;
}
var useCatalog = create()(persist((set) => ({
	reference: null,
	sources: [],
	activeSourceId: null,
	decisions: {},
	threshold: 50,
	query: "",
	band: "confirmed",
	selectedRowId: null,
	setReference: (source) => set({
		reference: source,
		selectedRowId: null
	}),
	setFixedSources: (fixedSources) => set((state) => {
		const manualSources = state.sources.filter((source) => !source.fixed);
		const sources = [...fixedSources, ...manualSources];
		return {
			sources,
			activeSourceId: sources.some((source) => source.id === state.activeSourceId) ? state.activeSourceId : fixedSources[0]?.id ?? manualSources[0]?.id ?? "baminds"
		};
	}),
	setActiveSourceId: (id) => set({
		activeSourceId: id,
		selectedRowId: null
	}),
	addSource: (source) => set((state) => ({
		sources: [...state.sources.filter((item) => item.id !== source.id), source],
		activeSourceId: source.id,
		band: "confirmed",
		selectedRowId: null
	})),
	replaceSource: (source) => set((state) => ({
		sources: state.sources.map((item) => item.id === source.id ? source : item),
		selectedRowId: null
	})),
	removeSource: (id) => set((state) => {
		if (state.sources.find((source) => source.id === id)?.fixed) return {};
		const sources = state.sources.filter((item) => item.id !== id);
		return {
			sources,
			activeSourceId: state.activeSourceId === id ? sources[0]?.id ?? null : state.activeSourceId,
			decisions: Object.fromEntries(Object.entries(state.decisions).filter(([key]) => !key.startsWith(`${id}::`))),
			selectedRowId: null
		};
	}),
	setThreshold: (n) => set({ threshold: n }),
	setQuery: (q) => set({ query: q }),
	setBand: (b) => set({ band: b }),
	setSelectedRowId: (id) => set({ selectedRowId: id }),
	confirmMatch: (sourceId, bamId, candidateRowId) => set((state) => ({ decisions: {
		...state.decisions,
		[matchDecisionKey(sourceId, bamId)]: {
			status: "confirmed",
			candidateRowId
		}
	} })),
	confirmManualMatch: (sourceId, bamId, match) => set((state) => ({ decisions: {
		...state.decisions,
		[matchDecisionKey(sourceId, bamId)]: {
			status: "confirmed",
			manualMatch: match
		}
	} })),
	rejectMatch: (sourceId, bamId) => set((state) => ({ decisions: {
		...state.decisions,
		[matchDecisionKey(sourceId, bamId)]: { status: "rejected" }
	} })),
	clearSources: () => set((state) => {
		const fixedSources = state.sources.filter((source) => source.fixed);
		const fixedIds = new Set(fixedSources.map((source) => source.id));
		return {
			sources: fixedSources,
			activeSourceId: state.activeSourceId === "baminds" || fixedIds.has(state.activeSourceId ?? "") ? state.activeSourceId : fixedSources[0]?.id ?? "baminds",
			decisions: Object.fromEntries(Object.entries(state.decisions).filter(([key]) => {
				const sourceId = key.slice(0, key.indexOf("::"));
				return fixedIds.has(sourceId);
			})),
			query: "",
			band: "confirmed",
			selectedRowId: null
		};
	}),
	clearAll: () => set({
		reference: null,
		sources: [],
		activeSourceId: null,
		decisions: {},
		query: "",
		band: "confirmed",
		selectedRowId: null
	})
}), {
	name: "cruce-baminds-v2",
	skipHydration: true,
	partialize: (state) => ({ threshold: state.threshold })
}));
var PAGE_SIZE$1 = 100;
function SortIcon({ active, dir }) {
	if (!active) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpDown, { className: "size-3.5 text-subtle" });
	return dir === "asc" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUp, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDown, { className: "size-3.5" });
}
function MatchTable({ rows, source, query, band, onSelect }) {
	const [sortKey, setSortKey] = (0, import_react.useState)("code");
	const [sortDir, setSortDir] = (0, import_react.useState)("asc");
	const [page, setPage] = (0, import_react.useState)(1);
	const decisions = useCatalog((state) => state.decisions);
	const confirmMatch = useCatalog((state) => state.confirmMatch);
	const rejectMatch = useCatalog((state) => state.rejectMatch);
	const filtered = (0, import_react.useMemo)(() => {
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
				resolved.matched?.name
			].filter(Boolean).join(" ").toLowerCase().includes(q);
		});
	}, [
		rows,
		source.id,
		query,
		band,
		decisions
	]);
	const sorted = (0, import_react.useMemo)(() => {
		const multiplier = sortDir === "asc" ? 1 : -1;
		return [...filtered].sort((a, b) => {
			if (sortKey === "code") return a.bam.code.localeCompare(b.bam.code) * multiplier;
			if (sortKey === "name") return a.bam.name.localeCompare(b.bam.name) * multiplier;
			const cellA = a.cells.find((item) => item.sourceId === source.id);
			const cellB = b.cells.find((item) => item.sourceId === source.id);
			return ((cellA ? resolveCellMatch(cellA, decisions[matchDecisionKey(source.id, a.bam.id)]).score : -1) - (cellB ? resolveCellMatch(cellB, decisions[matchDecisionKey(source.id, b.bam.id)]).score : -1)) * multiplier;
		});
	}, [
		filtered,
		sortKey,
		sortDir,
		source.id,
		decisions
	]);
	const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE$1));
	const safePage = Math.min(page, totalPages);
	const pageRows = (0, import_react.useMemo)(() => {
		const start = (safePage - 1) * PAGE_SIZE$1;
		return sorted.slice(start, start + PAGE_SIZE$1);
	}, [sorted, safePage]);
	(0, import_react.useEffect)(() => {
		setPage(1);
	}, [
		query,
		band,
		sortKey,
		sortDir,
		source.id
	]);
	(0, import_react.useEffect)(() => {
		if (page > totalPages) setPage(totalPages);
	}, [page, totalPages]);
	function toggleSort(key) {
		if (sortKey === key) {
			setSortDir((direction) => direction === "asc" ? "desc" : "asc");
			return;
		}
		setSortKey(key);
		setSortDir(key === "score" ? "desc" : "asc");
	}
	function confirm(row) {
		confirmMatch(source.id, row.bam.id);
		toast.success("Coincidencia confirmada");
	}
	function reject(row) {
		rejectMatch(source.id, row.bam.id);
		toast.message("Sugerencia eliminada");
	}
	if (!sorted.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border border-border bg-surface px-6 py-12 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-medium",
			children: "No hay códigos en esta sección"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-muted",
			children: "Probá otra banda de coincidencia o modificá la búsqueda."
		})]
	});
	const from = (safePage - 1) * PAGE_SIZE$1 + 1;
	const to = Math.min(safePage * PAGE_SIZE$1, sorted.length);
	const pager = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-2 text-xs text-muted",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
			"Mostrando ",
			from,
			"–",
			to,
			" de ",
			sorted.length,
			" códigos"
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "inline-flex h-9 items-center gap-1 rounded-md border border-border bg-surface px-2.5 font-medium text-fg disabled:cursor-not-allowed disabled:opacity-40",
					onClick: () => setPage((value) => Math.max(1, value - 1)),
					disabled: safePage <= 1,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-3.5" }), "Anterior"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "min-w-24 text-center tabular-nums",
					children: [
						"Página ",
						safePage,
						" de ",
						totalPages
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "inline-flex h-9 items-center gap-1 rounded-md border border-border bg-surface px-2.5 font-medium text-fg disabled:cursor-not-allowed disabled:opacity-40",
					onClick: () => setPage((value) => Math.min(totalPages, value + 1)),
					disabled: safePage >= totalPages,
					children: ["Siguiente", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-3.5" })]
				})
			]
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "hidden overflow-hidden rounded-xl border border-border bg-surface md:block",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "overflow-hidden",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full table-fixed text-left text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					className: "border-b border-border bg-chip/70 text-xs font-medium tracking-wide text-muted uppercase",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "w-1/6 px-3 py-2.5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "inline-flex items-center gap-1.5",
								onClick: () => toggleSort("code"),
								children: ["Código", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortIcon, {
									active: sortKey === "code",
									dir: sortDir
								})]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "w-1/4 px-3 py-2.5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "inline-flex items-center gap-1.5",
								onClick: () => toggleSort("name"),
								children: ["Descripción BAMinds", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortIcon, {
									active: sortKey === "name",
									dir: sortDir
								})]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("th", {
							className: "w-1/4 px-3 py-2.5",
							children: ["Sugerencia en ", source.name]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "w-1/8 px-3 py-2.5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "inline-flex items-center gap-1.5",
								onClick: () => toggleSort("score"),
								children: ["Coincidencia", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortIcon, {
									active: sortKey === "score",
									dir: sortDir
								})]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "w-1/5 px-3 py-2.5 text-right",
							children: "Acciones"
						})
					] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: pageRows.map((row) => {
					const cell = row.cells.find((item) => item.sourceId === source.id);
					if (!cell) return null;
					const decision = decisions[matchDecisionKey(source.id, row.bam.id)];
					const resolved = resolveCellMatch(cell, decision);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "cursor-pointer border-t border-border transition-colors hover:bg-chip/60",
						onClick: () => onSelect(row.bam.id),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate",
									title: row.bam.code,
									children: row.bam.code
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate",
									title: row.bam.name,
									children: row.bam.name
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-3",
								children: resolved.matched ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "truncate text-muted",
										title: resolved.matched.code,
										children: resolved.matched.code
									}), resolved.matched.name ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "truncate",
										title: resolved.matched.name,
										children: resolved.matched.name
									}) : null]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted",
									children: resolved.rejected ? "Sugerencia eliminada" : "Sin equivalente"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MatchPercent, {
										score: resolved.score,
										by: resolved.by
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MatchBar, {
										score: resolved.score,
										by: resolved.by,
										className: "mt-1.5"
									})]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-3",
								onClick: (event) => event.stopPropagation(),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex justify-end gap-1.5",
									children: resolved.confirmed ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
										tone: "high",
										className: "gap-1 px-2.5 py-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3.5" }), " Confirmado"]
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											size: "sm",
											title: "Confirmar",
											"aria-label": "Confirmar",
											onClick: () => confirm(row),
											disabled: !resolved.matched,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "hidden 2xl:inline",
												children: "Confirmar"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											size: "sm",
											title: "Eliminar",
											"aria-label": "Eliminar",
											variant: "ghost",
											className: "text-match-low",
											onClick: () => reject(row),
											disabled: !resolved.matched,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "hidden 2xl:inline",
												children: "Eliminar"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											size: "sm",
											title: "Editar",
											"aria-label": "Editar",
											variant: "outline",
											onClick: () => onSelect(row.bam.id),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "hidden 2xl:inline",
												children: "Editar"
											})]
										})
									] })
								})
							})
						]
					}, row.bam.id);
				}) })]
			})
		}), pager]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "md:hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "flex flex-col gap-3",
			children: pageRows.map((row) => {
				const cell = row.cells.find((item) => item.sourceId === source.id);
				if (!cell) return null;
				const decision = decisions[matchDecisionKey(source.id, row.bam.id)];
				const resolved = resolveCellMatch(cell, decision);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-xl border border-border bg-surface p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "w-full text-left",
							onClick: () => onSelect(row.bam.id),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-sm text-muted",
								title: row.bam.code,
								children: row.bam.code
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 truncate text-sm",
								title: row.bam.name,
								children: row.bam.name
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 rounded-md bg-elevated p-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mb-2 flex items-center justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-sm text-muted",
										children: source.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MatchPercent, {
										score: resolved.score,
										by: resolved.by
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MatchBar, {
									score: resolved.score,
									by: resolved.by
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 truncate text-sm",
									children: resolved.matched ? [resolved.matched.code, resolved.matched.name].filter(Boolean).join(" · ") : resolved.rejected ? "Sugerencia eliminada" : "Sin equivalente"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 grid grid-cols-3 gap-2",
							children: resolved.confirmed ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
								tone: "high",
								className: "col-span-3 justify-center gap-1 py-2.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3.5" }), "Confirmado"]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									onClick: () => confirm(row),
									disabled: !resolved.matched,
									children: "Confirmar"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									className: "text-match-low",
									onClick: () => reject(row),
									disabled: !resolved.matched,
									children: "Eliminar"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									onClick: () => onSelect(row.bam.id),
									children: "Editar"
								})
							] })
						})
					]
				}, row.bam.id);
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-3 rounded-xl border border-border bg-surface",
			children: pager
		})]
	})] });
}
var PAGE_SIZE = 100;
function MasterTable({ rows, query }) {
	const [page, setPage] = (0, import_react.useState)(1);
	const filtered = (0, import_react.useMemo)(() => {
		const normalizedQuery = query.trim().toLowerCase();
		if (!normalizedQuery) return rows;
		return rows.filter((row) => `${row.code} ${row.name}`.toLowerCase().includes(normalizedQuery));
	}, [rows, query]);
	const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
	const safePage = Math.min(page, totalPages);
	const pageRows = (0, import_react.useMemo)(() => {
		const start = (safePage - 1) * PAGE_SIZE;
		return filtered.slice(start, start + PAGE_SIZE);
	}, [filtered, safePage]);
	(0, import_react.useEffect)(() => setPage(1), [query]);
	(0, import_react.useEffect)(() => {
		if (page > totalPages) setPage(totalPages);
	}, [page, totalPages]);
	const from = filtered.length ? (safePage - 1) * PAGE_SIZE + 1 : 0;
	const to = Math.min(safePage * PAGE_SIZE, filtered.length);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "overflow-hidden rounded-xl border border-border bg-surface",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "hidden overflow-x-auto md:block",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full min-w-96 text-left text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "border-b border-border bg-chip/70 text-xs font-medium tracking-wide text-muted uppercase",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "w-64 px-4 py-2.5",
							children: "Código BAMinds"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-2.5",
							children: "Descripción maestra"
						})] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: pageRows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-t border-border",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "whitespace-nowrap px-4 py-3 text-sm",
							children: row.code
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-sm",
								title: row.name,
								children: row.name
							})
						})]
					}, row.id)) })]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "divide-y divide-border md:hidden",
				children: pageRows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate text-sm text-muted",
						children: row.code
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 truncate text-sm",
						title: row.name,
						children: row.name
					})]
				}, row.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-2 text-xs text-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
					"Mostrando ",
					from,
					"–",
					to,
					" de ",
					filtered.length,
					" códigos BAMinds"
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "inline-flex h-9 items-center gap-1 rounded-md border border-border bg-surface px-2.5 font-medium text-fg disabled:cursor-not-allowed disabled:opacity-40",
							onClick: () => setPage((value) => Math.max(1, value - 1)),
							disabled: safePage <= 1,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-3.5" }), "Anterior"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "min-w-24 text-center tabular-nums",
							children: [
								"Página ",
								safePage,
								" de ",
								totalPages
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "inline-flex h-9 items-center gap-1 rounded-md border border-border bg-surface px-2.5 font-medium text-fg disabled:cursor-not-allowed disabled:opacity-40",
							onClick: () => setPage((value) => Math.min(totalPages, value + 1)),
							disabled: safePage >= totalPages,
							children: ["Siguiente", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-3.5" })]
						})
					]
				})]
			})
		]
	});
}
function Input({ className, type, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		type,
		className: cn("flex h-11 w-full rounded-sm border border-border bg-elevated px-3 text-sm text-fg shadow-none transition-colors placeholder:text-subtle hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50", className),
		...props
	});
}
function Label({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
		className: cn("text-sm font-medium text-fg", className),
		...props
	});
}
var Sheet = Dialog$1;
function SheetContent({ className, children, side = "right", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal$1, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay$1, { className: "fixed inset-0 z-50 bg-fg/40" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
		className: cn("fixed z-50 flex flex-col bg-surface shadow-panel", side === "right" ? "inset-y-0 right-0 h-full w-full max-w-md border-l border-border" : "inset-x-0 bottom-0 max-h-[88vh] rounded-t-xl border-t border-border", className),
		...props,
		children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
			className: "absolute top-3 right-3 rounded-sm p-2 text-muted hover:bg-chip hover:text-fg",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "sr-only",
				children: "Cerrar"
			})]
		})]
	})] });
}
function SheetHeader({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex flex-col gap-1 p-5 pr-12", className),
		...props
	});
}
function SheetTitle({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, {
		className: cn("text-lg font-semibold leading-snug tracking-tight", className),
		...props
	});
}
function SheetDescription({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription$1, {
		className: cn("text-sm text-muted", className),
		...props
	});
}
function RowDetail({ row, source }) {
	const [manualCode, setManualCode] = (0, import_react.useState)("");
	const setSelectedRowId = useCatalog((state) => state.setSelectedRowId);
	const decisions = useCatalog((state) => state.decisions);
	const confirmMatch = useCatalog((state) => state.confirmMatch);
	const confirmManualMatch = useCatalog((state) => state.confirmManualMatch);
	const rejectMatch = useCatalog((state) => state.rejectMatch);
	const cell = row && source ? row.cells.find((item) => item.sourceId === source.id) : null;
	const decision = row && source ? decisions[matchDecisionKey(source.id, row.bam.id)] : void 0;
	const resolved = cell ? resolveCellMatch(cell, decision) : null;
	(0, import_react.useEffect)(() => {
		setManualCode("");
	}, [row?.bam.id, source?.id]);
	function confirm(candidateRowId) {
		if (!row || !source) return;
		confirmMatch(source.id, row.bam.id, candidateRowId);
		setSelectedRowId(null);
		toast.success("Coincidencia confirmada y movida a Confirmados");
	}
	function reject() {
		if (!row || !source) return;
		rejectMatch(source.id, row.bam.id);
		setSelectedRowId(null);
		toast.message("Sugerencia eliminada");
	}
	function confirmManual() {
		if (!row || !source) return;
		const code = manualCode.trim();
		const normalized = normalizeCode(code);
		if (!normalized) {
			toast.error("Ingresá un código válido");
			return;
		}
		const sourceRow = source.rows.find((candidate) => normalizeCode(candidate.code) === normalized);
		confirmManualMatch(source.id, row.bam.id, sourceRow ?? {
			id: `manual-${source.id}-${row.bam.id}-${normalized}`,
			code,
			name: "Código ingresado manualmente",
			extra: {}
		});
		setSelectedRowId(null);
		toast.success(sourceRow ? "Código localizado en la base y confirmado" : "Código manual confirmado");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
		open: !!row && !!source,
		onOpenChange: (open) => {
			if (!open) setSelectedRowId(null);
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetContent, {
			className: "overflow-y-auto",
			children: row && source && cell && resolved ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetHeader, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-xs tracking-wide text-muted",
					children: row.bam.code
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTitle, { children: row.bam.name }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetDescription, { children: [
					"Descripción completa y propuestas de coincidencia en ",
					source.name,
					"."
				] })
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-4 px-5 pb-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-lg border border-border bg-elevated p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-3 flex items-start justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium tracking-wide text-muted uppercase",
								children: "Sugerencia actual"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "mt-1 font-medium",
								children: source.name
							})] }), resolved.confirmed ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
								tone: "high",
								className: "gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3.5" }), "Confirmado"]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MatchPercent, {
								score: resolved.score,
								by: resolved.by
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MatchBar, {
							score: resolved.score,
							by: resolved.by,
							className: "mb-3"
						}),
						resolved.matched ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-xs text-muted",
							children: resolved.matched.code
						}), resolved.matched.name ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm leading-relaxed",
							children: resolved.matched.name
						}) : null] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: resolved.rejected ? "Esta sugerencia fue eliminada. Podés elegir otra propuesta debajo." : "No hay un equivalente claro en esta base."
						}),
						!resolved.confirmed && resolved.matched ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 grid grid-cols-2 gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								onClick: () => confirm(),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {}), "Confirmar"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								className: "text-match-low",
								onClick: reject,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {}), "Eliminar"]
							})]
						}) : null
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-medium",
							children: "Editar coincidencia"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: "Elegí una propuesta o ingresá el código correcto manualmente."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "mb-3 rounded-lg border border-border bg-elevated p-3",
						onSubmit: (event) => {
							event.preventDefault();
							confirmManual();
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "manual-code",
								children: "Código manual"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-xs text-muted",
								children: [
									"Si existe en ",
									source.name,
									", recuperaremos su descripción automáticamente."
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 flex flex-col gap-2 sm:flex-row",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "manual-code",
									value: manualCode,
									onChange: (event) => setManualCode(event.target.value),
									placeholder: "Escribí el código exacto",
									autoComplete: "off"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									type: "submit",
									disabled: !manualCode.trim(),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PencilLine, {}), "Confirmar código"]
								})]
							})
						]
					}),
					cell.candidates.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "flex flex-col gap-2",
						children: cell.candidates.map((candidate) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "rounded-lg border border-border bg-surface p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-mono text-xs text-muted",
										children: candidate.row.code
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-sm leading-relaxed",
										children: candidate.row.name
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
									tone: matchTone(candidate.score, candidate.by),
									children: [candidate.score, "%"]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								size: "sm",
								className: "mt-3 w-full",
								onClick: () => confirm(candidate.row.id),
								children: "Seleccionar y confirmar"
							})]
						}, candidate.row.id))
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "rounded-lg border border-dashed border-border-strong px-4 py-6 text-center text-sm text-muted",
						children: "No se encontraron otras propuestas para este código."
					})
				] })]
			})] }) : null
		})
	});
}
var Dialog = Dialog$1;
var DialogTrigger = DialogTrigger$1;
var DialogPortal = DialogPortal$1;
function DialogOverlay({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay$1, {
		className: cn("fixed inset-0 z-50 bg-fg/40 data-[state=open]:animate-in data-[state=closed]:animate-out", className),
		...props
	});
}
function DialogContent({ className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
		className: cn("fixed top-1/2 left-1/2 z-50 grid w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl border border-border bg-surface p-5 shadow-panel max-h-[min(90vh,720px)] overflow-y-auto", className),
		...props,
		children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
			className: "absolute top-3 right-3 rounded-sm p-2 text-muted hover:bg-chip hover:text-fg",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "sr-only",
				children: "Cerrar"
			})]
		})]
	})] });
}
function DialogHeader({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex flex-col gap-1 pr-8", className),
		...props
	});
}
function DialogTitle({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, {
		className: cn("text-lg font-semibold leading-snug tracking-tight", className),
		...props
	});
}
function DialogDescription({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription$1, {
		className: cn("text-sm text-muted", className),
		...props
	});
}
function detectDelimiter(text) {
	const first = text.split(/\r?\n/).find((l) => l.trim().length > 0) ?? "";
	const tabs = (first.match(/\t/g) ?? []).length;
	const semis = (first.match(/;/g) ?? []).length;
	const commas = (first.match(/,/g) ?? []).length;
	if (tabs > 0 && tabs >= commas && tabs >= semis) return "	";
	if (semis > commas) return ";";
	return ",";
}
function normalizeTable(rows) {
	const nonEmptyRows = rows.filter((row) => row.some((cell) => cell.trim().length > 0));
	const headers = (nonEmptyRows.shift() ?? []).map((header, index) => header.trim() || `columna_${index + 1}`);
	const width = Math.max(headers.length, ...nonEmptyRows.map((row) => row.length), 1);
	while (headers.length < width) headers.push(`columna_${headers.length + 1}`);
	return {
		headers,
		rows: nonEmptyRows.map((row) => {
			const copy = row.map((cell) => cell.trim());
			while (copy.length < width) copy.push("");
			return copy.slice(0, width);
		})
	};
}
function cellToText(value) {
	if (value === null || value === void 0) return "";
	if (value instanceof Date) return value.toISOString();
	if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
	return String(value).trim();
}
function tableFromSpreadsheetRows(rows) {
	return normalizeTable(rows.map((row) => row.map(cellToText)));
}
function parseDelimited(text) {
	const raw = text.replace(/^\uFEFF/, "");
	const delimiter = detectDelimiter(raw);
	const rows = [];
	let cell = "";
	let row = [];
	let inQuotes = false;
	for (let i = 0; i < raw.length; i++) {
		const ch = raw[i];
		const next = raw[i + 1];
		if (inQuotes) {
			if (ch === "\"" && next === "\"") {
				cell += "\"";
				i += 1;
			} else if (ch === "\"") inQuotes = false;
			else cell += ch;
			continue;
		}
		if (ch === "\"") {
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
var CODE_RE = /^(codigo|código|code|cod|id|sku|clave|nro|numero|número)$/i;
var NAME_RE = /^(nombre|name|descripcion|descripción|description|titulo|título|label|denominacion|denominación|detalle)$/i;
function guessCodeColumn(headers) {
	const idx = headers.findIndex((h) => CODE_RE.test(h.trim()));
	return idx >= 0 ? idx : 0;
}
function guessNameColumn(headers) {
	const idx = headers.findIndex((h) => NAME_RE.test(h.trim()));
	if (idx >= 0) return idx;
	return headers.length > 1 ? 1 : 0;
}
function tableToCsv(headers, rows) {
	const esc = (v) => {
		if (/[",\n;]/.test(v)) return `"${v.replace(/"/g, "\"\"")}"`;
		return v;
	};
	return [headers, ...rows].map((r) => r.map(esc).join(",")).join("\n");
}
function rowsFromTable(table, codeIdx, nameIdx, prefix) {
	const out = [];
	const seen = /* @__PURE__ */ new Set();
	table.rows.forEach((r, idx) => {
		const code = (r[codeIdx] ?? "").trim();
		const name = (r[nameIdx] ?? "").trim();
		if (!code && !name) return;
		const key = `${code}::${name}`.toLowerCase();
		if (seen.has(key)) return;
		seen.add(key);
		out.push({
			id: `${prefix}-${idx}-${code || name}`,
			code: code || `FILA-${idx + 1}`,
			name: name || code,
			extra: {}
		});
	});
	return out;
}
function isExcelFile(file) {
	return file.name.toLowerCase().endsWith(".xlsx");
}
function isDelimitedFile(file) {
	const name = file.name.toLowerCase();
	return name.endsWith(".csv") || name.endsWith(".tsv") || name.endsWith(".txt");
}
function UploadDialog({ triggerLabel = "Cargar base" }) {
	const addSource = useCatalog((s) => s.addSource);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [sourceName, setSourceName] = (0, import_react.useState)("");
	const [table, setTable] = (0, import_react.useState)(null);
	const [codeIdx, setCodeIdx] = (0, import_react.useState)(0);
	const [nameIdx, setNameIdx] = (0, import_react.useState)(1);
	const [paste, setPaste] = (0, import_react.useState)("");
	const [fileName, setFileName] = (0, import_react.useState)("");
	const [isReading, setIsReading] = (0, import_react.useState)(false);
	function applyTable(parsed, label) {
		if (!parsed.rows.length) {
			toast.error("No se encontraron filas en el archivo.");
			return;
		}
		setTable(parsed);
		setCodeIdx(guessCodeColumn(parsed.headers));
		setNameIdx(guessNameColumn(parsed.headers));
		setFileName(label);
		if (!sourceName) {
			const base = label.replace(/\.[^.]+$/, "");
			setSourceName(base || "Nueva base");
		}
	}
	function applyText(text, label) {
		const parsed = parseDelimited(text);
		if (!parsed.rows.length) {
			toast.error("No se encontraron filas. Revisá el CSV o el pegado.");
			return;
		}
		applyTable(parsed, label);
	}
	async function onFile(file) {
		setIsReading(true);
		try {
			if (isExcelFile(file)) {
				const { readSheet } = await import("../_libs/read-excel-file+worker-f.mjs").then((n) => n.t);
				applyTable(tableFromSpreadsheetRows(await readSheet(file)), file.name);
				return;
			}
			if (isDelimitedFile(file)) {
				applyText(await file.text(), file.name);
				return;
			}
			if (file.name.toLowerCase().endsWith(".xls")) {
				toast.error("El formato .xls antiguo no está soportado. Guardalo como .xlsx e intentá de nuevo.");
				return;
			}
			toast.error("Formato no compatible. Usá Excel (.xlsx), CSV, TSV o TXT.");
		} catch (error) {
			console.error(error);
			toast.error("No se pudo leer el archivo. Revisá que no esté dañado o protegido.");
		} finally {
			setIsReading(false);
		}
	}
	const preview = (0, import_react.useMemo)(() => table?.rows.slice(0, 5) ?? [], [table]);
	function reset() {
		setTable(null);
		setPaste("");
		setFileName("");
		setSourceName("");
		setIsReading(false);
	}
	function commit() {
		if (!table) return;
		const name = sourceName.trim() || "Nueva base";
		const id = `src-${Date.now().toString(36)}`;
		const rows = rowsFromTable(table, codeIdx, nameIdx, id);
		if (!rows.length) {
			toast.error("No hay filas con código o nombre.");
			return;
		}
		addSource({
			id,
			name,
			rows,
			fixed: false
		});
		toast.success(`${name}: ${rows.length} código${rows.length === 1 ? "" : "s"} cargado${rows.length === 1 ? "" : "s"}.`);
		setOpen(false);
		reset();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
		open,
		onOpenChange: (value) => {
			setOpen(value);
			if (!value) reset();
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				size: "sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, {}), triggerLabel]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-2xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Cargar base para comparar" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Excel (.xlsx), CSV, TSV o pegado desde Excel. La base central BAMinds se carga automáticamente desde el catálogo del proyecto." })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "src-name",
								children: "Nombre de la base"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "src-name",
								value: sourceName,
								onChange: (e) => setSourceName(e.target.value),
								placeholder: "ERP, comercial…"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border-strong bg-elevated px-4 py-6 text-center transition-colors hover:bg-chip",
							onDragOver: (event) => event.preventDefault(),
							onDrop: (event) => {
								event.preventDefault();
								const file = event.dataTransfer.files?.[0];
								if (file) onFile(file);
							},
							children: [
								isReading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-5 animate-spin text-muted" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileSpreadsheet, { className: "size-5 text-muted" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm font-medium",
									children: isReading ? "Leyendo archivo…" : fileName || "Soltar Excel o CSV, o elegir archivo"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted",
									children: "Formatos admitidos: .xlsx, .csv, .tsv y .txt"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "file",
									accept: ".xlsx,.csv,.tsv,.txt,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv,text/tab-separated-values,text/plain",
									className: "sr-only",
									disabled: isReading,
									onChange: (e) => {
										const f = e.target.files?.[0];
										if (f) onFile(f);
										e.currentTarget.value = "";
									}
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "paste",
								children: "Pegar desde Excel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								id: "paste",
								value: paste,
								onChange: (e) => setPaste(e.target.value),
								onBlur: () => {
									if (paste.trim()) applyText(paste, sourceName || "pegado");
								},
								rows: 4,
								placeholder: "codigo,nombre\nABC-001,Producto ejemplo",
								className: "w-full resize-y rounded-sm border border-border bg-elevated px-3 py-2 font-mono text-xs text-fg placeholder:text-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
							})]
						})
					]
				}),
				table ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-1 gap-3 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "col-code",
									children: "Columna de código"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
									id: "col-code",
									value: codeIdx,
									onChange: (e) => setCodeIdx(Number(e.target.value)),
									className: "h-11 rounded-sm border border-border bg-elevated px-3 text-sm",
									children: table.headers.map((h, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: i,
										children: h
									}, `${h}-${i}`))
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "col-name",
									children: "Columna de nombre"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
									id: "col-name",
									value: nameIdx,
									onChange: (e) => setNameIdx(Number(e.target.value)),
									className: "h-11 rounded-sm border border-border bg-elevated px-3 text-sm",
									children: table.headers.map((h, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: i,
										children: h
									}, `${h}-${i}`))
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted",
							children: [
								table.rows.length,
								" filas leídas",
								fileName ? ` · ${fileName}` : ""
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "overflow-x-auto rounded-md border border-border",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
								className: "w-full min-w-80 text-left text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
									className: "bg-chip text-muted",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-3 py-2 font-medium",
										children: "Código"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-3 py-2 font-medium",
										children: "Nombre"
									})] })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: preview.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "border-t border-border",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-2 font-mono",
										children: r[codeIdx]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-2",
										children: r[nameIdx]
									})]
								}, i)) })]
							})
						})
					]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-end gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						onClick: () => setOpen(false),
						children: "Cancelar"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: commit,
						disabled: !table || isReading,
						children: "Cargar base"
					})]
				})
			]
		})]
	});
}
var SPRING_MOUSE = {
	stiffness: 180,
	damping: 22,
	mass: .55
};
function useHoverCapable() {
	const [canHover, setCanHover] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const media = window.matchMedia("(hover: hover) and (pointer: fine)");
		const update = () => setCanHover(media.matches);
		update();
		media.addEventListener("change", update);
		return () => media.removeEventListener("change", update);
	}, []);
	return canHover;
}
function TiltCard({ children, max = 12, glare = true, className }) {
	const ref = (0, import_react.useRef)(null);
	const reduce = useReducedMotion();
	const canHover = useHoverCapable();
	const enabled = !reduce && canHover;
	const rx = useMotionValue(0);
	const ry = useMotionValue(0);
	const gx = useMotionValue(50);
	const gy = useMotionValue(50);
	const srx = useSpring(rx, SPRING_MOUSE);
	const sry = useSpring(ry, SPRING_MOUSE);
	const onMove = (event) => {
		const element = ref.current;
		if (!element || !enabled) return;
		const rect = element.getBoundingClientRect();
		const px = (event.clientX - rect.left) / rect.width;
		const py = (event.clientY - rect.top) / rect.height;
		ry.set((px - .5) * max);
		rx.set((.5 - py) * max);
		gx.set(px * 100);
		gy.set(py * 100);
	};
	const onLeave = () => {
		rx.set(0);
		ry.set(0);
		gx.set(50);
		gy.set(50);
	};
	const transform = useMotionTemplate`perspective(1000px) rotateX(${srx}deg) rotateY(${sry}deg)`;
	const glareBg = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.42), transparent 50%)`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
		ref,
		onMouseMove: onMove,
		onMouseLeave: onLeave,
		style: {
			transform,
			transformStyle: "preserve-3d"
		},
		className: cn("relative overflow-hidden rounded-2xl will-change-transform", className),
		children: [children, glare && enabled ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
			"aria-hidden": true,
			style: { background: glareBg },
			className: "pointer-events-none absolute inset-0 opacity-20"
		}) : null]
	});
}
var EASE_OUT = [
	.16,
	1,
	.3,
	1
];
var DIGIT_HEIGHT_EM = 1.1;
var DIGITS = Array.from({ length: 10 }, (_, n) => n);
function NumberTicker({ value, pad, duration = .9, stagger = .04, startOnView = true, prefix, suffix, blur = false, className, digitClassName, locale, format }) {
	const containerRef = (0, import_react.useRef)(null);
	const inView = useInView(containerRef, {
		once: true,
		amount: .6
	});
	const [armed, setArmed] = (0, import_react.useState)(!startOnView);
	const enteredRef = (0, import_react.useRef)(false);
	(0, import_react.useEffect)(() => {
		if (startOnView && inView) setArmed(true);
	}, [startOnView, inView]);
	const text = (0, import_react.useMemo)(() => {
		const rounded = Math.round(value);
		const formatted = format ? format(rounded) : locale ? rounded.toLocaleString() : rounded.toString();
		return pad ? formatted.padStart(pad, "0") : formatted;
	}, [
		value,
		pad,
		format,
		locale
	]);
	const glyphs = (0, import_react.useMemo)(() => {
		const chars = text.split("");
		return chars.map((char, i) => ({
			char,
			id: `g-${chars.length - 1 - i}`
		}));
	}, [text]);
	const readableText = `${prefix ?? ""}${text}${suffix ?? ""}`;
	(0, import_react.useEffect)(() => {
		if (!armed || enteredRef.current) return;
		const total = (duration + glyphs.length * stagger) * 1e3;
		const timer = window.setTimeout(() => {
			enteredRef.current = true;
		}, total);
		return () => window.clearTimeout(timer);
	}, [
		armed,
		duration,
		stagger,
		glyphs.length
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		ref: containerRef,
		className: cn("inline-flex items-center tabular-nums", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: readableText
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			"aria-hidden": "true",
			className: "inline-flex items-center",
			children: [
				prefix ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: prefix }) : null,
				glyphs.map(({ char, id }, i) => {
					if (!/\d/.test(char)) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "inline-block",
						children: char
					}, id);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Digit, {
						digit: armed ? Number(char) : 0,
						delay: enteredRef.current ? 0 : i * stagger,
						duration,
						blur,
						className: digitClassName
					}, id);
				}),
				suffix ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: suffix }) : null
			]
		})]
	});
}
function Digit({ digit, delay, duration, blur, className }) {
	const reduce = useReducedMotion();
	const digitColumn = DIGITS.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "flex h-[1.1em] items-center justify-center leading-none",
		children: n
	}, n));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("relative inline-block overflow-hidden", className),
		style: {
			height: `${DIGIT_HEIGHT_EM}em`,
			width: "1ch"
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.span, {
			initial: { y: 0 },
			animate: { y: `-${digit * DIGIT_HEIGHT_EM}em` },
			transition: reduce ? { duration: 0 } : {
				duration,
				delay,
				ease: EASE_OUT
			},
			className: "absolute inset-x-0 top-0 will-change-transform",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "flex flex-col items-center",
				children: digitColumn
			}), blur && !reduce ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.span, {
				"aria-hidden": "true",
				initial: { opacity: .55 },
				animate: { opacity: 0 },
				transition: {
					duration: Math.min(duration * .5, .3),
					delay,
					ease: EASE_OUT
				},
				className: "pointer-events-none absolute inset-x-0 top-0 flex flex-col items-center will-change-opacity",
				style: {
					filter: "blur(6px)",
					transform: "translateZ(0)"
				},
				children: DIGITS.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "flex h-[1.1em] items-center justify-center leading-none",
					children: n
				}, n))
			}) : null]
		})
	});
}
var FIXED_SOURCE_FILES = [
	"torettos.json",
	"warnes-market.json",
	"kobo.json",
	"octosis.json",
	"facturacion.json"
];
async function loadFixedSource(fileName) {
	const response = await fetch(`/data/fixed-sources/${fileName}`);
	if (!response.ok) throw new Error(`No se pudo cargar la vista fija ${fileName}`);
	const payload = await response.json();
	return {
		id: payload.id,
		name: payload.name,
		fixed: true,
		rows: payload.rows.map((row, index) => ({
			id: `${payload.id}-${index}`,
			code: row.code,
			name: row.name,
			extra: {}
		}))
	};
}
function loadFixedSources() {
	return Promise.all(FIXED_SOURCE_FILES.map(loadFixedSource));
}
async function loadBamindsReference() {
	const response = await fetch("/data/Codigos_Baminds.json");
	if (!response.ok) throw new Error("No se pudo cargar la base central de BAMinds");
	return {
		id: "baminds",
		name: "BAMinds",
		rows: (await response.json()).map((item, index) => ({
			id: `bam-${item.codigo}-${index}`,
			code: item.codigo,
			name: item.descripcion,
			extra: {}
		}))
	};
}
var BANDS = [
	{
		id: "confirmed",
		label: "Confirmados"
	},
	{
		id: "near",
		label: "90–99%"
	},
	{
		id: "high",
		label: "70–89%"
	},
	{
		id: "mid",
		label: "45–69%"
	},
	{
		id: "low",
		label: "< 45%"
	},
	{
		id: "none",
		label: "Sin match"
	}
];
function confirmTone(percentage) {
	if (percentage >= 80) return "match-high";
	if (percentage >= 50) return "match-mid";
	if (percentage > 0) return "match-low";
	return "match-none";
}
function Home() {
	const [ready, setReady] = (0, import_react.useState)(false);
	const [rows, setRows] = (0, import_react.useState)([]);
	const [isComparing, setIsComparing] = (0, import_react.useState)(false);
	const [tickerRun, setTickerRun] = (0, import_react.useState)(0);
	const jobIdRef = (0, import_react.useRef)(0);
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
	const activeSource = (0, import_react.useMemo)(() => {
		if (activeSourceId === "baminds") return null;
		return sources.find((source) => source.id === activeSourceId) ?? sources[0] ?? null;
	}, [sources, activeSourceId]);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		async function initialize() {
			try {
				await useCatalog.persist.rehydrate();
				const [baminds, fixedSources] = await Promise.all([loadBamindsReference(), loadFixedSources()]);
				if (!cancelled) {
					setReference(baminds);
					setFixedSources(fixedSources);
				}
			} catch (error) {
				console.error(error);
				if (!cancelled) toast.error("No se pudieron cargar las bases conectadas");
			} finally {
				if (!cancelled) setReady(true);
			}
		}
		initialize();
		return () => {
			cancelled = true;
		};
	}, [setFixedSources, setReference]);
	(0, import_react.useEffect)(() => {
		if (!reference) {
			setRows([]);
			setIsComparing(false);
			return;
		}
		if (!sources.length) {
			setRows(reference.rows.map((bam) => ({
				bam,
				cells: [],
				average: 0
			})));
			setIsComparing(false);
			return;
		}
		const jobId = ++jobIdRef.current;
		setIsComparing(true);
		setSelectedRowId(null);
		const worker = new Worker(new URL("../workers/matching.worker.ts", import.meta.url), { type: "module" });
		worker.onmessage = (event) => {
			const result = event.data;
			if (result.jobId !== jobId || jobIdRef.current !== jobId) return;
			if (result.ok) setRows(result.rows);
			else {
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
		worker.postMessage({
			jobId,
			reference,
			sources
		});
		return () => {
			worker.terminate();
		};
	}, [
		reference,
		sources,
		setSelectedRowId
	]);
	const selected = (0, import_react.useMemo)(() => rows.find((r) => r.bam.id === selectedRowId) ?? null, [rows, selectedRowId]);
	const hasManualSources = sources.some((source) => !source.fixed);
	const stats = (0, import_react.useMemo)(() => sources.map((source) => {
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
			percentage: reviewable ? Math.round(confirmed / reviewable * 100) : 0
		};
	}), [
		rows,
		sources,
		decisions
	]);
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
			"estado"
		];
		const out = [];
		for (const r of rows) {
			if (!sources.length) {
				out.push([
					r.bam.code,
					r.bam.name,
					"",
					"",
					"",
					"",
					"",
					""
				]);
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
					resolved.confirmed ? "confirmado" : resolved.rejected ? "eliminado" : "pendiente"
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-bg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
				position: "bottom-center",
				richColors: true,
				closeButton: true
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "bg-bg",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-[1400px] flex-col gap-3 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex min-w-0 items-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] font-semibold tracking-widest text-muted uppercase",
									children: "Catálogo de productos"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "text-xl font-semibold tracking-tight sm:text-2xl",
									children: "Máster de Códigos SKU"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted",
									children: "Códigos BAMinds vs. cómo los nombran las otras bases."
								})
							]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UploadDialog, { triggerLabel: "Cargar base" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								size: "sm",
								onClick: exportCsv,
								disabled: !reference || isComparing,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "hidden sm:inline",
									children: "Exportar"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "ghost",
								size: "icon-sm",
								title: "Eliminar bases cargadas manualmente",
								disabled: isComparing || !hasManualSources,
								onClick: () => {
									clearSources();
									toast.message("Bases manuales eliminadas");
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "sr-only",
									children: "Vaciar"
								})]
							})
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "mx-auto flex max-w-[1400px] flex-col gap-3 px-4 py-4 sm:px-6",
				children: !ready ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-xl border border-border bg-surface px-4 py-10 text-center text-sm text-muted",
					children: "Cargando catálogo…"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "flex items-stretch gap-3 overflow-x-auto pb-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "sticky left-0 z-10 shrink-0 self-stretch bg-bg pr-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TiltCard, {
								max: 8,
								className: cn("h-full min-w-56 border border-primary/80 bg-primary text-primary-fg shadow-md transition-shadow hover:shadow-lg sm:min-w-64", !activeSource && "ring-2 ring-primary-fg/20 ring-offset-2 ring-offset-bg"),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("article", {
									className: "flex h-full min-h-[142px] flex-col p-4",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										className: "relative z-10 h-full w-full rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-primary-fg/60",
										style: { transform: "translateZ(24px)" },
										"aria-pressed": !activeSource,
										onClick: () => setActiveSourceId("baminds"),
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "flex items-center gap-1.5 text-xs font-semibold tracking-widest text-primary-fg/80 uppercase",
												children: "Base maestra"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "mt-2 block font-mono text-3xl font-semibold text-primary-fg tabular-nums",
												children: reference?.rows.length ?? 0
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "mt-0.5 block text-xs text-primary-fg/80",
												children: "códigos BAMinds"
											})
										]
									})
								})
							})
						}), !sources.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							className: "flex min-w-56 flex-1 flex-col justify-center self-stretch rounded-lg border border-dashed border-border-strong bg-surface px-3 py-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium",
								children: "Sumá una base comparativa"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted",
								children: "BAMinds ya está conectada desde el JSON maestro."
							})]
						}) : isComparing ? sources.map((src) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							className: "flex min-w-48 flex-1 flex-col justify-center self-stretch rounded-lg border border-border bg-surface px-3 py-2.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex items-center justify-between gap-2",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "truncate text-[11px] font-medium tracking-wide text-muted uppercase",
										children: src.name
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm font-medium text-primary",
									children: "Procesando comparación…"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted",
									children: [src.rows.length, " códigos cargados"]
								})
							]
						}, src.id)) : stats.map((st) => {
							const src = sources.find((s) => s.id === st.sourceId);
							const isActive = activeSource?.id === st.sourceId;
							const tone = confirmTone(st.percentage);
							const initial = src?.name?.trim().charAt(0).toUpperCase() || "?";
							const progressDegrees = st.percentage * 3.6;
							const avatar = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex size-9 shrink-0 items-center justify-center rounded-full transition-[background] duration-500 ease-out",
								style: { background: `conic-gradient(
                          from -90deg,
                          color-mix(in srgb, var(--color-${tone}) 48%, white) 0deg,
                          var(--color-${tone}) ${progressDegrees * .58}deg,
                          color-mix(in srgb, var(--color-${tone}) 78%, white) ${progressDegrees}deg,
                          var(--color-border) ${progressDegrees}deg 360deg
                        )` },
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "flex size-7 items-center justify-center rounded-full bg-surface text-xs font-bold",
									children: initial
								})
							});
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
								className: cn("group relative shrink-0 self-stretch overflow-hidden rounded-lg bg-surface transition-[width,border-width,box-shadow] duration-300 ease-out", isActive ? "w-56 border-2 border-transparent shadow-sm sm:w-64" : "w-16 border border-border hover:border-border-strong"),
								style: isActive ? { background: "linear-gradient(var(--color-surface), var(--color-surface)) padding-box, linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 48%, white), var(--color-primary), color-mix(in srgb, var(--color-primary) 68%, white)) border-box" } : void 0,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "grid h-full w-full grid-cols-1 grid-rows-1 text-left hover:bg-chip",
									"aria-pressed": isActive,
									onClick: () => {
										setTickerRun((run) => run + 1);
										setActiveSourceId(st.sourceId);
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: cn("col-start-1 row-start-1 flex h-full flex-col items-center justify-center gap-2 px-1 py-3 transition-opacity duration-200 ease-out", isActive ? "pointer-events-none opacity-0" : "opacity-100 delay-100"),
										children: [avatar, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "font-mono text-xs font-bold tabular-nums",
											style: { color: `var(--color-${tone})` },
											children: [st.percentage, "%"]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: cn("relative col-start-1 row-start-1 flex h-full flex-col gap-2 px-3 py-3 transition-opacity duration-200 ease-out", isActive ? "opacity-100" : "pointer-events-none opacity-0"),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2 pr-4",
											children: [
												avatar,
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "min-w-0 flex-1 truncate text-xs font-medium tracking-wide text-muted uppercase",
													children: src?.name
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "shrink-0 font-mono text-xs font-bold tabular-nums",
													style: { color: `var(--color-${tone})` },
													children: isActive ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberTicker, {
														value: st.percentage,
														suffix: "%",
														startOnView: false,
														duration: 1.15,
														stagger: .07,
														blur: true
													}, `percentage-${st.sourceId}-${tickerRun}`) : null
												})
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "absolute inset-x-3 top-[57%] flex -translate-y-1/2 items-baseline justify-center text-center font-mono text-2xl leading-none font-bold tabular-nums",
											children: [isActive ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberTicker, {
												value: st.confirmed,
												startOnView: false,
												duration: 1.2,
												stagger: .065,
												blur: true
											}, `confirmed-${st.sourceId}-${tickerRun}`) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "ml-1 flex items-baseline gap-1 font-sans text-xs font-normal text-muted",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "/" }),
													isActive ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberTicker, {
														value: st.reviewable,
														startOnView: false,
														duration: 1.2,
														stagger: .055,
														blur: true
													}, `reviewable-${st.sourceId}-${tickerRun}`) : null,
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "confirmados" })
												]
											})]
										})]
									})]
								}), !src?.fixed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: cn("absolute top-1 right-1 rounded-sm p-1.5 text-subtle transition-opacity duration-200 ease-out hover:bg-chip hover:text-fg", isActive ? "opacity-100 delay-100" : "pointer-events-none opacity-0"),
									"aria-label": `Quitar ${src?.name}`,
									onClick: () => removeSource(st.sourceId),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
								}) : null]
							}, st.sourceId);
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-2 sm:flex-row sm:items-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: query,
								onChange: (e) => setQuery(e.target.value),
								placeholder: "Buscar código o descripción…",
								className: "h-10 pl-10",
								"aria-label": "Buscar",
								disabled: isComparing
							})]
						}), activeSource ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-1",
							children: BANDS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setBand(item.id),
								disabled: isComparing,
								className: cn("h-10 rounded-full border px-2.5 text-xs font-medium disabled:opacity-50 sm:text-sm", band === item.id ? "border-primary bg-primary text-primary-fg" : "border-border bg-surface text-muted hover:bg-chip hover:text-fg"),
								children: item.label
							}, item.id))
						}) : null]
					}),
					isComparing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-border bg-surface px-4 py-8 text-center text-sm text-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium text-fg",
							children: "Procesando comparación en segundo plano…"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1",
							children: "La página debería seguir respondiendo mientras se analizan los registros."
						})]
					}) : activeSource ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MatchTable, {
						rows,
						source: activeSource,
						query,
						band,
						onSelect: setSelectedRowId
					}) : reference ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MasterTable, {
						rows: reference.rows,
						query
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "rounded-xl border border-border bg-surface px-6 py-12 text-center text-sm text-muted",
						children: "No se pudo cargar la base maestra BAMinds."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowDetail, {
						row: isComparing ? null : selected,
						source: activeSource
					})
				] })
			})
		]
	});
}
//#endregion
export { Home as component };
