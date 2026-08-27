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

type DecisionRow = {
  sourceId: string;
  bamId: string;
  status: "confirmed" | "rejected";
  candidateRowId: string | null;
  manualMatch: CatalogRow | null;
};

export const listSharedDecisions = createServerFn({ method: "GET" }).handler(
  async (): Promise<SharedDecisionRecord[]> => {
    const sql = await getSql();
    const rows = await sql<DecisionRow>`
      select
        source_id as "sourceId",
        bam_id as "bamId",
        status,
        candidate_row_id as "candidateRowId",
        manual_match as "manualMatch"
      from match_decisions
      order by updated_at asc
    `;

    return rows.map((row) => ({
      sourceId: row.sourceId,
      bamId: row.bamId,
      decision: {
        status: row.status,
        ...(row.candidateRowId ? { candidateRowId: row.candidateRowId } : {}),
        ...(row.manualMatch ? { manualMatch: row.manualMatch } : {}),
      },
    }));
  },
);

export const saveSharedDecision = createServerFn({ method: "POST" })
  .validator(sharedDecisionSchema)
  .handler(async ({ data }): Promise<void> => {
    const sql = await getSql();
    const manualMatch = data.decision.manualMatch
      ? JSON.stringify(data.decision.manualMatch)
      : null;

    await sql.query(
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
        updated_at = now()`,
      [
        data.sourceId,
        data.bamId,
        data.decision.status,
        data.decision.candidateRowId ?? null,
        manualMatch,
      ],
    );
  });
