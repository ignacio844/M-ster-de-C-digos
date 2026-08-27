import { matchCatalog, type RowMatch, type Source } from "../lib/matching";

type MatchRequest = {
  jobId: number;
  reference: Source;
  sources: Source[];
};

type MatchResponse =
  | { jobId: number; ok: true; rows: RowMatch[] }
  | { jobId: number; ok: false; error: string };

self.onmessage = (event: MessageEvent<MatchRequest>) => {
  const { jobId, reference, sources } = event.data;

  try {
    const rows = matchCatalog(reference, sources);
    const response: MatchResponse = { jobId, ok: true, rows };
    self.postMessage(response);
  } catch (error) {
    const response: MatchResponse = {
      jobId,
      ok: false,
      error: error instanceof Error ? error.message : "Error desconocido al comparar",
    };
    self.postMessage(response);
  }
};
