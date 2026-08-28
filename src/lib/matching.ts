export type CatalogRow = {
  id: string;
  code: string;
  name: string;
  extra: Record<string, string>;
};

export type Source = {
  id: string;
  name: string;
  fixed?: boolean;
  rows: CatalogRow[];
};

export type MatchBy = "code" | "name" | "none";

export type Candidate = {
  row: CatalogRow;
  score: number;
  by: Exclude<MatchBy, "none">;
};

export type CellMatch = {
  sourceId: string;
  matched: CatalogRow | null;
  score: number;
  by: MatchBy;
  nameScore: number;
  candidates: Candidate[];
};

export type RowMatch = {
  bam: CatalogRow;
  cells: CellMatch[];
  average: number;
};

export type MatchDecision = {
  status: "confirmed" | "rejected";
  candidateRowId?: string;
  manualMatch?: CatalogRow;
  originalScore?: number;
  correctionStatus?: "pending" | "corrected";
  correctedAt?: string;
};

export type ConfirmationState = "exact" | "pending" | "corrected";

const STOP = new Set([
  "de",
  "del",
  "la",
  "el",
  "los",
  "las",
  "y",
  "o",
  "en",
  "a",
  "un",
  "una",
  "para",
  "con",
  "por",
  "al",
  "the",
  "of",
  "and",
  "or",
]);

// El código siempre manda.
// Por debajo de este nivel, la descripción NO puede rescatar el match.
const MIN_CODE_SIGNAL = 55;

// El resultado combinado mínimo para aceptar el vínculo.
const MIN_FINAL_MATCH = 45;

function fold(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
}

export function normalizeName(s: string): string {
  return fold(s)
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function normalizeCode(s: string): string {
  return fold(s).replace(/[^a-z0-9]/g, "");
}

function tokens(s: string): string[] {
  return normalizeName(s)
    .split(" ")
    .filter((token) => token.length > 1 && !STOP.has(token));
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);

  for (let i = 1; i <= a.length; i++) {
    const cur = [i];

    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(
        cur[j - 1] + 1,
        prev[j] + 1,
        prev[j - 1] + cost,
      );
    }

    prev = cur;
  }

  return prev[b.length] ?? b.length;
}

function levenshteinSimilarity(a: string, b: string): number {
  if (!a || !b) return 0;
  if (a === b) return 1;

  const distance = levenshtein(a, b);
  return 1 - distance / Math.max(a.length, b.length);
}

function ngrams(s: string, size: number): string[] {
  if (!s) return [];
  if (s.length <= size) return [s];

  const out: string[] = [];
  for (let i = 0; i <= s.length - size; i++) {
    out.push(s.slice(i, i + size));
  }
  return out;
}

function diceFromArrays(a: string[], b: string[]): number {
  if (!a.length || !b.length) return 0;

  const counts = new Map<string, number>();
  for (const item of a) {
    counts.set(item, (counts.get(item) ?? 0) + 1);
  }

  let intersection = 0;

  for (const item of b) {
    const count = counts.get(item) ?? 0;
    if (count > 0) {
      intersection += 1;
      counts.set(item, count - 1);
    }
  }

  return (2 * intersection) / (a.length + b.length);
}

function commonPrefixRatio(a: string, b: string): number {
  const max = Math.min(a.length, b.length);
  let common = 0;

  while (common < max && a[common] === b[common]) {
    common += 1;
  }

  return max ? common / max : 0;
}

function tokenJaccard(a: string[], b: string[]): number {
  if (!a.length || !b.length) return 0;

  const A = new Set(a);
  const B = new Set(b);

  let intersection = 0;
  for (const token of A) {
    if (B.has(token)) intersection += 1;
  }

  const union = A.size + B.size - intersection;
  return union ? intersection / union : 0;
}

export function nameSimilarity(a: string, b: string): number {
  const na = normalizeName(a);
  const nb = normalizeName(b);

  if (!na || !nb) return 0;
  if (na === nb) return 100;

  const jac = tokenJaccard(tokens(a), tokens(b));
  const charDice = diceFromArrays(ngrams(na, 2), ngrams(nb, 2));

  return Math.round(
    Math.max(0, Math.min(1, 0.65 * jac + 0.35 * charDice)) * 100,
  );
}

export function codeSimilarity(a: string, b: string): number {
  const ca = normalizeCode(a);
  const cb = normalizeCode(b);

  if (!ca || !cb) return 0;
  if (ca === cb) return 100;

  const charDice = diceFromArrays(ngrams(ca, 2), ngrams(cb, 2));
  const lev = levenshteinSimilarity(ca, cb);
  const prefix = commonPrefixRatio(ca, cb);
  const lengthRatio =
    Math.min(ca.length, cb.length) / Math.max(ca.length, cb.length);

  let score =
    0.45 * charDice +
    0.35 * lev +
    0.15 * prefix +
    0.05 * lengthRatio;

  // Si un código contiene completamente al otro, suele tratarse de
  // sufijos/prefijos agregados por otra base.
  if (ca.includes(cb) || cb.includes(ca)) {
    score = Math.max(score, 0.72 + 0.18 * lengthRatio);
  }

  return Math.round(Math.max(0, Math.min(1, score)) * 100);
}

type PreparedRow = {
  row: CatalogRow;
  normalizedCode: string;
};

type PreparedSource = {
  source: Source;
  rows: PreparedRow[];
  byCode: Map<string, PreparedRow[]>;
  gramIndex: Map<string, number[]>;
};

const preparedCache = new WeakMap<Source, PreparedSource>();

function prepareSource(source: Source): PreparedSource {
  const cached = preparedCache.get(source);
  if (cached) return cached;

  const rows: PreparedRow[] = [];
  const byCode = new Map<string, PreparedRow[]>();
  const gramIndex = new Map<string, number[]>();

  source.rows.forEach((row, index) => {
    const normalizedCode = normalizeCode(row.code);
    const preparedRow = { row, normalizedCode };
    rows.push(preparedRow);

    if (!normalizedCode) return;

    const exact = byCode.get(normalizedCode);
    if (exact) exact.push(preparedRow);
    else byCode.set(normalizedCode, [preparedRow]);

    for (const gram of new Set(ngrams(normalizedCode, 3))) {
      const bucket = gramIndex.get(gram);
      if (bucket) bucket.push(index);
      else gramIndex.set(gram, [index]);
    }
  });

  const prepared = {
    source,
    rows,
    byCode,
    gramIndex,
  };

  preparedCache.set(source, prepared);
  return prepared;
}

function shortlistByCode(
  bamCode: string,
  prepared: PreparedSource,
  limit = 24,
): number[] {
  const grams = [...new Set(ngrams(bamCode, 3))];

  if (!grams.length) return [];

  const hits = new Map<number, number>();

  for (const gram of grams) {
    const bucket = prepared.gramIndex.get(gram);
    if (!bucket) continue;

    for (const index of bucket) {
      hits.set(index, (hits.get(index) ?? 0) + 1);
    }
  }

  if (!hits.size) return [];

  return [...hits.entries()]
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];

      const codeA = prepared.rows[a[0]]?.normalizedCode ?? "";
      const codeB = prepared.rows[b[0]]?.normalizedCode ?? "";

      return (
        Math.abs(codeA.length - bamCode.length) -
        Math.abs(codeB.length - bamCode.length)
      );
    })
    .slice(0, limit)
    .map(([index]) => index);
}

function combinedScore(codeScore: number, nameScore: number): number {
  // La descripción solo ajusta un candidato que ya tiene señal real por código.
  // Nunca puede convertir un código sin relación en match.
  return Math.round(0.8 * codeScore + 0.2 * nameScore);
}

function matchPreparedSource(
  bam: CatalogRow,
  prepared: PreparedSource,
  topN = 3,
): CellMatch {
  const bamCode = normalizeCode(bam.code);

  if (!bamCode) {
    return {
      sourceId: prepared.source.id,
      matched: null,
      score: 0,
      by: "none",
      nameScore: 0,
      candidates: [],
    };
  }

  // 1) Código exacto: siempre 100%.
  const exactMatches = prepared.byCode.get(bamCode);

  if (exactMatches?.length) {
    const ranked = exactMatches
      .map((item) => ({
        row: item.row,
        nameScore: nameSimilarity(bam.name, item.row.name),
      }))
      .sort((a, b) => b.nameScore - a.nameScore);

    const best = ranked[0];

    return {
      sourceId: prepared.source.id,
      matched: best.row,
      score: 100,
      by: "code",
      nameScore: best.nameScore,
      candidates: ranked.slice(0, topN).map((item) => ({
        row: item.row,
        score: 100,
        by: "code" as const,
      })),
    };
  }

  // 2) Sin código exacto: buscamos SOLO candidatos con parecido de código.
  //    La descripción nunca genera candidatos por sí sola.
  const indexes = shortlistByCode(bamCode, prepared);

  const ranked = indexes
    .map((index) => {
      const candidate = prepared.rows[index];
      if (!candidate?.normalizedCode) return null;

      const codeScore = codeSimilarity(bamCode, candidate.normalizedCode);

      // Regla clave: si el código no tiene suficiente relación,
      // la descripción no puede rescatar el match.
      if (codeScore < MIN_CODE_SIGNAL) return null;

      const nameScore = nameSimilarity(bam.name, candidate.row.name);
      const score = combinedScore(codeScore, nameScore);

      return {
        row: candidate.row,
        codeScore,
        nameScore,
        score,
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.codeScore - a.codeScore;
    });

  const best = ranked[0];

  if (!best || best.score < MIN_FINAL_MATCH) {
    return {
      sourceId: prepared.source.id,
      matched: null,
      score: 0,
      by: "none",
      nameScore: best?.nameScore ?? 0,
      candidates: [],
    };
  }

  return {
    sourceId: prepared.source.id,
    matched: best.row,
    score: best.score,
    by: "code",
    nameScore: best.nameScore,
    candidates: ranked.slice(0, topN).map((item) => ({
      row: item.row,
      score: item.score,
      by: "code" as const,
    })),
  };
}

export function matchAgainstSource(
  bam: CatalogRow,
  source: Source,
  topN = 3,
): CellMatch {
  return matchPreparedSource(bam, prepareSource(source), topN);
}

export function matchCatalog(reference: Source, sources: Source[]): RowMatch[] {
  if (!sources.length) {
    return reference.rows.map((bam) => ({
      bam,
      cells: [],
      average: 0,
    }));
  }

  const preparedSources = sources.map(prepareSource);

  return reference.rows.map((bam) => {
    const cells = preparedSources.map((source) =>
      matchPreparedSource(bam, source),
    );

    const scores = cells.map((cell) =>
      cell.by === "none" ? 0 : cell.score,
    );

    const average = scores.length
      ? Math.round(
          scores.reduce((sum, score) => sum + score, 0) / scores.length,
        )
      : 0;

    return {
      bam,
      cells,
      average,
    };
  });
}

export type SourceStats = {
  sourceId: string;
  coverage: number;
  byCode: number;
  naming: number;
  namedCount: number;
};

export function sourceStats(
  rows: RowMatch[],
  sourceId: string,
  threshold: number,
): SourceStats {
  if (!rows.length) {
    return {
      sourceId,
      coverage: 0,
      byCode: 0,
      naming: 0,
      namedCount: 0,
    };
  }

  let covered = 0;
  let byCode = 0;
  let nameSum = 0;
  let namedCount = 0;

  for (const row of rows) {
    const cell = row.cells.find((item) => item.sourceId === sourceId);
    if (!cell) continue;

    if (cell.by !== "none" && cell.score >= threshold) {
      covered += 1;
    }

    if (cell.by === "code") {
      byCode += 1;
    }

    if (cell.by !== "none") {
      nameSum += cell.nameScore;
      namedCount += 1;
    }
  }

  return {
    sourceId,
    coverage: Math.round((covered / rows.length) * 100),
    byCode: Math.round((byCode / rows.length) * 100),
    naming: namedCount ? Math.round(nameSum / namedCount) : 0,
    namedCount,
  };
}

export type MatchBand =
  | "confirmed"
  | "near"
  | "high"
  | "mid"
  | "low"
  | "none";

export function bandOf(score: number, by: MatchBy): MatchBand {
  if (by === "none") return "none";
  if (score === 100) return "confirmed";
  if (score >= 90) return "near";
  if (score >= 70) return "high";
  if (score >= 45) return "mid";
  return "low";
}

export function resolveCellMatch(
  cell: CellMatch,
  decision?: MatchDecision,
): CellMatch & { confirmed: boolean; rejected: boolean } {
  if (decision?.status === "rejected") {
    return {
      ...cell,
      matched: null,
      score: 0,
      by: "none",
      confirmed: false,
      rejected: true,
    };
  }

  const selected = decision?.candidateRowId
    ? cell.candidates.find((candidate) => candidate.row.id === decision.candidateRowId)
    : null;
  const manualMatch = decision?.manualMatch;

  return {
    ...cell,
    matched: manualMatch ?? selected?.row ?? cell.matched,
    score: manualMatch ? 100 : (selected?.score ?? cell.score),
    by: manualMatch ? "code" : (selected?.by ?? cell.by),
    nameScore: manualMatch ? 100 : cell.nameScore,
    confirmed:
      decision?.status === "confirmed" ||
      (!decision && cell.by !== "none" && cell.score === 100),
    rejected: false,
  };
}

export function originalMatchScore(cell: CellMatch, decision?: MatchDecision): number {
  if (decision?.originalScore != null) return decision.originalScore;
  if (decision?.candidateRowId) {
    return (
      cell.candidates.find((candidate) => candidate.row.id === decision.candidateRowId)?.score ??
      cell.score
    );
  }
  return cell.score;
}

export function confirmationState(
  cell: CellMatch,
  decision?: MatchDecision,
): ConfirmationState | null {
  const resolved = resolveCellMatch(cell, decision);
  if (!resolved.confirmed) return null;
  if (decision?.correctionStatus === "corrected") return "corrected";
  if (decision?.manualMatch || originalMatchScore(cell, decision) < 100) return "pending";
  return "exact";
}

export function decisionBand(
  cell: CellMatch,
  decision?: MatchDecision,
): MatchBand {
  const resolved = resolveCellMatch(cell, decision);
  if (resolved.confirmed) return "confirmed";
  return bandOf(resolved.score, resolved.by);
}

export function matchTone(
  score: number,
  by: MatchBy,
): "high" | "mid" | "low" | "none" {
  if (by === "none") return "none";
  if (score >= 90) return "high";
  if (score >= 70) return "mid";
  return "low";
}
