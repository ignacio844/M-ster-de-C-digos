import { useMemo, useState } from "react";
import { toast } from "sonner";
import { FileSpreadsheet, LoaderCircle, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  guessCodeColumn,
  guessNameColumn,
  parseDelimited,
  tableFromSpreadsheetRows,
  type ParsedTable,
} from "@/lib/csv";
import type { CatalogRow, Source } from "@/lib/matching";
import { useCatalog } from "@/lib/store";

function rowsFromTable(
  table: ParsedTable,
  codeIdx: number,
  nameIdx: number,
  prefix: string,
): CatalogRow[] {
  const out: CatalogRow[] = [];
  const seen = new Set<string>();

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
      // Para la comparación solo necesitamos código y descripción. No conservar
      // decenas de columnas del Excel reduce mucho el uso de memoria.
      extra: {},
    });
  });

  return out;
}

function isExcelFile(file: File): boolean {
  return file.name.toLowerCase().endsWith(".xlsx");
}

function isDelimitedFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return name.endsWith(".csv") || name.endsWith(".tsv") || name.endsWith(".txt");
}

export function UploadDialog() {
  const addSource = useCatalog((s) => s.addSource);
  const [open, setOpen] = useState(false);
  const [sourceName, setSourceName] = useState("");
  const [table, setTable] = useState<ParsedTable | null>(null);
  const [codeIdx, setCodeIdx] = useState(0);
  const [nameIdx, setNameIdx] = useState(1);
  const [paste, setPaste] = useState("");
  const [fileName, setFileName] = useState("");
  const [isReading, setIsReading] = useState(false);

  function applyTable(parsed: ParsedTable, label: string) {
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

  function applyText(text: string, label: string) {
    const parsed = parseDelimited(text);
    if (!parsed.rows.length) {
      toast.error("No se encontraron filas. Revisá el CSV o el pegado.");
      return;
    }

    applyTable(parsed, label);
  }

  async function onFile(file: File) {
    setIsReading(true);

    try {
      if (isExcelFile(file)) {
        const { readSheet } = await import("read-excel-file/browser");
        const excelRows = await readSheet(file);
        applyTable(tableFromSpreadsheetRows(excelRows), file.name);
        return;
      }

      if (isDelimitedFile(file)) {
        applyText(await file.text(), file.name);
        return;
      }

      if (file.name.toLowerCase().endsWith(".xls")) {
        toast.error(
          "El formato .xls antiguo no está soportado. Guardalo como .xlsx e intentá de nuevo.",
        );
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

  const preview = useMemo(() => table?.rows.slice(0, 5) ?? [], [table]);

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

    const source: Source = { id, name, rows, fixed: false };
    addSource(source);

    toast.success(
      `${name}: ${rows.length} código${rows.length === 1 ? "" : "s"} cargado${rows.length === 1 ? "" : "s"}.`,
    );

    setOpen(false);
    reset();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        if (!value) reset();
      }}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button size="icon" aria-label="Cargar una base manual">
              <Upload />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>Cargar una base excepcional desde Excel, CSV o texto.</TooltipContent>
      </Tooltip>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Cargar base para comparar</DialogTitle>
          <DialogDescription>
            Excel (.xlsx), CSV, TSV o pegado desde Excel. La base central BAMinds se carga
            automáticamente desde el catálogo del proyecto.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="src-name">Nombre de la base</Label>
            <Input
              id="src-name"
              value={sourceName}
              onChange={(e) => setSourceName(e.target.value)}
              placeholder="ERP, comercial…"
            />
          </div>

          <label
            className="flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border-strong bg-elevated px-4 py-6 text-center transition-colors hover:bg-chip"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              const file = event.dataTransfer.files?.[0];
              if (file) void onFile(file);
            }}
          >
            {isReading ? (
              <LoaderCircle className="size-5 animate-spin text-muted" />
            ) : (
              <FileSpreadsheet className="size-5 text-muted" />
            )}
            <span className="text-sm font-medium">
              {isReading ? "Leyendo archivo…" : fileName || "Soltar Excel o CSV, o elegir archivo"}
            </span>
            <span className="text-xs text-muted">Formatos admitidos: .xlsx, .csv, .tsv y .txt</span>
            <input
              type="file"
              accept=".xlsx,.csv,.tsv,.txt,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv,text/tab-separated-values,text/plain"
              className="sr-only"
              disabled={isReading}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void onFile(f);
                e.currentTarget.value = "";
              }}
            />
          </label>

          <div className="grid gap-1.5">
            <Label htmlFor="paste">Pegar desde Excel</Label>
            <textarea
              id="paste"
              value={paste}
              onChange={(e) => setPaste(e.target.value)}
              onBlur={() => {
                if (paste.trim()) applyText(paste, sourceName || "pegado");
              }}
              rows={4}
              placeholder={"codigo,nombre\nABC-001,Producto ejemplo"}
              className="w-full resize-y rounded-sm border border-border bg-elevated px-3 py-2 font-mono text-xs text-fg placeholder:text-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>

        {table ? (
          <div className="grid gap-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor="col-code">Columna de código</Label>
                <select
                  id="col-code"
                  value={codeIdx}
                  onChange={(e) => setCodeIdx(Number(e.target.value))}
                  className="h-11 rounded-sm border border-border bg-elevated px-3 text-sm"
                >
                  {table.headers.map((h, i) => (
                    <option key={`${h}-${i}`} value={i}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="col-name">Columna de nombre</Label>
                <select
                  id="col-name"
                  value={nameIdx}
                  onChange={(e) => setNameIdx(Number(e.target.value))}
                  className="h-11 rounded-sm border border-border bg-elevated px-3 text-sm"
                >
                  {table.headers.map((h, i) => (
                    <option key={`${h}-${i}`} value={i}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <p className="text-xs text-muted">
              {table.rows.length} filas leídas
              {fileName ? ` · ${fileName}` : ""}
            </p>

            <div className="overflow-x-auto rounded-md border border-border">
              <table className="w-full min-w-80 text-left text-xs">
                <thead className="bg-chip text-muted">
                  <tr>
                    <th className="px-3 py-2 font-medium">Código</th>
                    <th className="px-3 py-2 font-medium">Nombre</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((r, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="px-3 py-2 font-mono">{r[codeIdx]}</td>
                      <td className="px-3 py-2">{r[nameIdx]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={commit} disabled={!table || isReading}>
            Cargar base
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
