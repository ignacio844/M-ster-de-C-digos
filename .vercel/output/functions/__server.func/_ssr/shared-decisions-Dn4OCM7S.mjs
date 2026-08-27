import { a as record, i as object, o as string, t as _enum } from "../_libs/zod.mjs";
import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/shared-decisions-Dn4OCM7S.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var _0002_shared_match_decisions_default = "create table if not exists match_decisions (\n  source_id        text not null,\n  bam_id           text not null,\n  status           text not null check (status in ('confirmed', 'rejected')),\n  candidate_row_id text,\n  manual_match     jsonb,\n  updated_at       timestamptz not null default now(),\n  primary key (source_id, bam_id)\n);\n\ncreate index if not exists match_decisions_updated_at_idx\n  on match_decisions (updated_at desc);\n";
/**
* Migration bookkeeping shared by the two appliers — `scripts/migrate.mjs`
* (deploy, `readdir`) and `src/lib/db.ts` (PGLite preview, `import.meta.glob`).
*
* Applied files are keyed by BASENAME, so the same file applies once no matter
* which directory it is globbed from. That is what makes the auth schema safe to
* copy from `migrations/auth/` into `migrations/` when an app turns sign-in on:
* a database that already has `0001_auth.sql` will not re-run it.
*
* Neither applier descends into subdirectories, so `migrations/auth/*.sql` is
* out of scope for both until it is copied up.
*/
/**
* The `_migrations` key for a migration path (or bare filename).
* @param {string} path
* @returns {string}
*/
function migrationName(path) {
	return path.split("/").pop() ?? path;
}
/**
* @param {string} path
* @returns {boolean}
*/
function isMigrationFile(path) {
	return path.endsWith(".sql");
}
/**
* Migrations in `paths` that are not yet in `applied`, in apply order.
* Non-`.sql` entries (a `readdir` also yields `migrations/auth/`) are dropped.
* @param {Iterable<string>} paths
* @param {Iterable<string>} applied
* @returns {Array<{ name: string, path: string }>}
*/
function pendingMigrations(paths, applied) {
	const done = new Set(applied);
	return [...paths].filter(isMigrationFile).map((path) => ({
		name: migrationName(path),
		path
	})).sort((a, b) => a.name.localeCompare(b.name)).filter(({ name }) => !done.has(name));
}
var rawDatabaseUrl = typeof process !== "undefined" ? process.env.DATABASE_URL : void 0;
var databaseUrl = rawDatabaseUrl && rawDatabaseUrl.trim() ? rawDatabaseUrl : void 0;
/**
* Active backend: real **Neon** when `DATABASE_URL` is set (deployed / configured
* sandbox), otherwise a local embedded **PGLite** (Postgres compiled to WASM) so
* the app has a working database even with nothing configured — the live preview
* included. Swap in Neon later by just setting `DATABASE_URL`; no code changes.
*/
var dbSource = databaseUrl ? "neon" : "pglite";
/**
* Init state lives on globalThis as promises: dev HMR creates new instances of
* this module, and two instances racing module-level state would open a second
* pool or run two concurrent PGLite migration passes (whose duplicate
* `_migrations` insert rejects — and would get memoized, poisoning every later
* `getSql()`). A failed init clears its slot so the next call retries.
*/
var globalRef = globalThis;
/**
* Result-type parity: Postgres sends every value as text plus a type OID — the
* JS value is the DRIVER's parsing choice, and pg and PGLite disagree (pg:
* int8 -> string, date -> local-midnight Date; PGLite: int8 -> BigInt, which
* JSON.stringify rejects, date -> UTC Date). Normalize both so preview and
* production return identical, JSON-safe shapes:
*   int8/bigint (incl. count(*)) -> number (past 2^53 loses precision — cast
*                                   `::text` if you ever need huge integers)
*   date                         -> 'YYYY-MM-DD' string
*   interval                     -> Postgres interval text
* numeric already comes back as a string on both (arbitrary precision).
*/
var OID_INT8 = 20;
var OID_DATE = 1082;
var OID_INTERVAL = 1186;
var identity = (v) => v;
/** Wrap a query runner in the tagged-template + `.query()` `Sql` surface. */
function toSql(run) {
	const sql = (async (strings, ...values) => {
		let text = strings[0];
		for (let i = 0; i < values.length; i += 1) text += `$${i + 1}${strings[i + 1]}`;
		return run(text, values);
	});
	sql.query = (text, params = []) => run(text, params);
	return sql;
}
function createNeonSql() {
	globalRef.__pgSqlPromise__ ??= (async () => {
		const { Pool, types } = await import("../_libs/pg.mjs").then((n) => n.t);
		types.setTypeParser(OID_INT8, Number);
		types.setTypeParser(OID_DATE, identity);
		types.setTypeParser(OID_INTERVAL, identity);
		const pool = new Pool({ connectionString: databaseUrl });
		return toSql(async (text, params) => {
			return (await pool.query(text, params)).rows;
		});
	})().catch((err) => {
		globalRef.__pgSqlPromise__ = void 0;
		throw err;
	});
	return globalRef.__pgSqlPromise__;
}
async function createPgliteSql() {
	globalRef.__pgliteInstance__ ??= (async () => {
		const { PGlite } = await import("@electric-sql/pglite");
		const pg = new PGlite({ parsers: {
			[OID_INT8]: Number,
			[OID_DATE]: identity,
			[OID_INTERVAL]: identity
		} });
		await pg.waitReady;
		await pg.exec("create table if not exists _migrations (name text primary key, applied_at timestamptz not null default now())");
		return pg;
	})().catch((err) => {
		globalRef.__pgliteInstance__ = void 0;
		throw err;
	});
	const pg = await globalRef.__pgliteInstance__;
	const migrate = async () => {
		const migrations = /* #__PURE__ */ Object.assign({ "/migrations/0002_shared_match_decisions.sql": _0002_shared_match_decisions_default });
		const done = (await pg.query("select name from _migrations")).rows.map((r) => r.name);
		for (const { name, path } of pendingMigrations(Object.keys(migrations), done)) await pg.transaction(async (tx) => {
			await tx.exec(migrations[path]);
			await tx.query("insert into _migrations (name) values ($1)", [name]);
		});
	};
	const pass = (globalRef.__pgliteMigrateChain__ ?? Promise.resolve()).catch(() => void 0).then(migrate);
	globalRef.__pgliteMigrateChain__ = pass;
	await pass;
	return toSql(async (text, params) => {
		return (await pg.query(text, params)).rows;
	});
}
var sqlPromise = null;
async function createSql() {
	if (typeof window !== "undefined") throw new Error("@/lib/db is server-only — call getSql() from a createServerFn handler or a server route loader, never from client code.");
	return dbSource === "neon" ? createNeonSql() : createPgliteSql();
}
/**
* Get the shared, **server-only** SQL client. Neon when `DATABASE_URL` is set,
* otherwise the local PGLite fallback. Memoized — safe to call per request.
*
* Schema comes from `migrations/*.sql`, auto-applied before the first query on
* both backends — define tables there, never inline in server functions.
*/
function getSql() {
	sqlPromise ??= createSql().catch((err) => {
		sqlPromise = null;
		throw err;
	});
	return sqlPromise;
}
/**
* Finish DB bootstrap before the server handles traffic.
*
* - **PGLite** (preview / no `DATABASE_URL`): open the in-memory DB and apply
*   `migrations/*.sql`. Idempotent — concurrent callers share one promise.
* - **Neon**: no-op (pool is created lazily on first query).
*
* Vite `configureServer` awaits this at dev startup; production imports of this
* module kick it off immediately (see bottom of file).
*/
function ensureDbReady() {
	if (dbSource !== "pglite") return Promise.resolve();
	return getSql().then(() => void 0);
}
var globalBoot = globalThis;
if (typeof window === "undefined" && dbSource === "pglite") globalBoot.__pgBootstrapPromise__ ??= ensureDbReady().catch((err) => {
	globalBoot.__pgBootstrapPromise__ = void 0;
	console.error("[db] PGLite bootstrap failed:", err);
	throw err;
});
var catalogRowSchema = object({
	id: string().min(1).max(500),
	code: string().min(1).max(500),
	name: string().max(5e3),
	extra: record(string(), string().max(5e3))
});
var sharedDecisionSchema = object({
	sourceId: string().regex(/^fixed-[a-z0-9-]+$/).max(200),
	bamId: string().min(1).max(500),
	decision: object({
		status: _enum(["confirmed", "rejected"]),
		candidateRowId: string().max(500).optional(),
		manualMatch: catalogRowSchema.optional()
	})
});
var listSharedDecisions_createServerFn_handler = createServerRpc({
	id: "4fbd5c3253bea5dd3855ea3c3d7ee5182a6a0e392c0c06fc2750881c699732f1",
	name: "listSharedDecisions",
	filename: "src/lib/shared-decisions.ts"
}, (opts) => listSharedDecisions.__executeServer(opts));
var listSharedDecisions = createServerFn({ method: "GET" }).handler(listSharedDecisions_createServerFn_handler, async () => {
	return (await (await getSql())`
      select
        source_id as "sourceId",
        bam_id as "bamId",
        status,
        candidate_row_id as "candidateRowId",
        manual_match as "manualMatch"
      from match_decisions
      order by updated_at asc
    `).map((row) => ({
		sourceId: row.sourceId,
		bamId: row.bamId,
		decision: {
			status: row.status,
			...row.candidateRowId ? { candidateRowId: row.candidateRowId } : {},
			...row.manualMatch ? { manualMatch: row.manualMatch } : {}
		}
	}));
});
var saveSharedDecision_createServerFn_handler = createServerRpc({
	id: "16284a7454792051e968f6fad0c66c256d4c1b7a65e6e54cd31a0094c56b3912",
	name: "saveSharedDecision",
	filename: "src/lib/shared-decisions.ts"
}, (opts) => saveSharedDecision.__executeServer(opts));
var saveSharedDecision = createServerFn({ method: "POST" }).validator(sharedDecisionSchema).handler(saveSharedDecision_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const manualMatch = data.decision.manualMatch ? JSON.stringify(data.decision.manualMatch) : null;
	await sql.query(`insert into match_decisions (
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
        updated_at = now()`, [
		data.sourceId,
		data.bamId,
		data.decision.status,
		data.decision.candidateRowId ?? null,
		manualMatch
	]);
});
//#endregion
export { listSharedDecisions_createServerFn_handler, saveSharedDecision_createServerFn_handler };
