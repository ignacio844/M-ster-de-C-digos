import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import type { CatalogRow, MatchDecision } from "@/lib/matching";

const catalogRowSchema = z.object({
  id: z.string().min(1).max(500),
  code: z.string().min(1).max(500),
  name: z.string().max(5_000),
  extra: z.record(z.string(), z.string().max(5_000)),
});

const sharedDecisionSchema = z.object({
  sourceId: z
    .string()
    .regex(/^fixed-[a-z0-9-]+$/)
    .max(200),
  bamId: z.string().min(1).max(500),
  decision: z.object({
    status: z.enum(["confirmed", "rejected"]),
    candidateRowId: z.string().max(500).optional(),
    manualMatch: catalogRowSchema.optional(),
  }),
});

export type SharedDecisionRecord = {
  sourceId: string;
  bamId: string;
  decision: MatchDecision;
};

export type SharedDecisionsSnapshot = {
  records: SharedDecisionRecord[];
  lastUpdatedAt: string | null;
};

export type SharedDecisionWriteResult = {
  updatedAt: string;
};

type DecisionRow = {
  sourceId: string;
  bamId: string;
  status: "confirmed" | "rejected";
  candidateRowId: string | null;
  manualMatch: CatalogRow | null;
  updatedAt: string;
};

export const listSharedDecisions = createServerFn({ method: "GET" }).handler(
  async (): Promise<SharedDecisionsSnapshot> => {
    const sql = await getSql();
    const rows = await sql<DecisionRow>`
      select
        source_id as "sourceId",
        bam_id as "bamId",
        status,
        candidate_row_id as "candidateRowId",
        manual_match as "manualMatch",
        to_char(
          updated_at at time zone 'UTC',
          'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
        ) as "updatedAt"
      from match_decisions
      order by updated_at asc
    `;

    return {
      records: rows.map((row) => ({
        sourceId: row.sourceId,
        bamId: row.bamId,
        decision: {
          status: row.status,
          ...(row.candidateRowId ? { candidateRowId: row.candidateRowId } : {}),
          ...(row.manualMatch ? { manualMatch: row.manualMatch } : {}),
        },
      })),
      lastUpdatedAt: rows.at(-1)?.updatedAt ?? null,
    };
  },
);

export const saveSharedDecision = createServerFn({ method: "POST" })
  .validator(sharedDecisionSchema)
  .handler(async ({ data }): Promise<SharedDecisionWriteResult> => {
    const sql = await getSql();
    const manualMatch = data.decision.manualMatch
      ? JSON.stringify(data.decision.manualMatch)
      : null;

    const [saved] = await sql.query<SharedDecisionWriteResult>(
      `insert into match_decisions (
        source_id,
        bam_id,
        status,
        candidate_row_id,
        manual_match,
        updated_at
      ) values ($1, $2, $3, $4, $5::jsonb, now())
      on conflict (source_id, bam_id) do update set
        status = excluded.status,
        candidate_row_id = excluded.candidate_row_id,
        manual_match = excluded.manual_match,
        updated_at = now()
      returning to_char(
        updated_at at time zone 'UTC',
        'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
      ) as "updatedAt"`,
      [
        data.sourceId,
        data.bamId,
        data.decision.status,
        data.decision.candidateRowId ?? null,
        manualMatch,
      ],
    );

    if (!saved) throw new Error("La decisión no devolvió una fecha de actualización");
    return saved;
  });
