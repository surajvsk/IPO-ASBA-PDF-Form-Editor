import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.entry";
import {
  FORM_TYPES,
  SYMBOLS,
  createField,
  layoutStorageKey,
  sampleFields,
  toPrintField,
  wrapLines,
} from "../data/fields";
import { buildSamplePdf } from "../pdf/sampleForm";

const MIN_SCALE = 0.4;
const MAX_SCALE = 2.5;

function clampScale(value) {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, value));
}

function downloadBlob(data, filename, type) {
  const blob = data instanceof Blob ? data : new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

const PdfEditor = () => {
  const canvasRef = useRef(null);
  const stageRef = useRef(null);
  const scaleRef = useRef(1);
  const dragRef = useRef(null);
  const pdfBytesRef = useRef(null);
  const pdfDocRef = useRef(null);
  const loadSeq = useRef(0);
  const pendingFit = useRef(false);

  const [pdfDoc, setPdfDoc] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [pageSize, setPageSize] = useState(null);
  const [coordinates, setCoordinates] = useState([]);
  const [symbol, setSymbol] = useState("");
  const [formType, setFormType] = useState("");
  const [filter, setFilter] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [dataJson, setDataJson] = useState("");
  const [status, setStatus] = useState(null);
  const [fileName, setFileName] = useState("");

  scaleRef.current = scale;

  const updateField = (id, patch) => {
    setCoordinates((prev) => prev.map((field) => (field.id === id ? { ...field, ...patch } : field)));
  };

  const activeFields = useMemo(
    () => coordinates.filter((field) => field.isActive),
    [coordinates]
  );

  const payload = useMemo(
    () => ({
      symbol: symbol.trim(),
      type: formType,
      coordinates: activeFields.map(toPrintField),
    }),
    [activeFields, formType, symbol]
  );

  const visibleFields = useMemo(() => {
    const query = filter.trim().toLowerCase();
    if (!query) return coordinates;
    return coordinates.filter(
      (field) =>
        field.key.toLowerCase().includes(query) ||
        String(field.value).toLowerCase().includes(query)
    );
  }, [coordinates, filter]);

  const loadPdfBytes = useCallback(async (bytes, name) => {
    const seq = ++loadSeq.current;
    const data = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    pdfBytesRef.current = data.slice(0);

    try {
      const pdf = await pdfjsLib.getDocument({ data: data.slice(0) }).promise;
      if (seq !== loadSeq.current) {
        pdf.destroy();
        return;
      }
      if (pdfDocRef.current) pdfDocRef.current.destroy();
      pdfDocRef.current = pdf;
      pendingFit.current = true;
      setPdfDoc(pdf);
      setPageCount(pdf.numPages);
      setPageNumber(1);
      setFileName(name);
      setStatus({
        type: "ok",
        text: `Loaded ${name} (${pdf.numPages} page${pdf.numPages === 1 ? "" : "s"}).`,
      });
    } catch (error) {
      if (seq !== loadSeq.current) return;
      pdfBytesRef.current = null;
      setPdfDoc(null);
      setPageCount(0);
      setPageSize(null);
      setFileName("");
      setStatus({ type: "error", text: error?.message || "Could not read that PDF." });
    }
  }, []);

  useEffect(() => {
    if (!pdfDoc) return undefined;
    let cancelled = false;
    let renderTask = null;

    (async () => {
      try {
        const page = await pdfDoc.getPage(pageNumber);
        if (cancelled) return;
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext("2d");
        const outputScale = window.devicePixelRatio || 1;
        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;
        setPageSize({
          width: viewport.width,
          height: viewport.height,
          pageWidth: viewport.width / scale,
          pageHeight: viewport.height / scale,
        });
        const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;
        renderTask = page.render({ canvasContext: context, viewport, transform });
        await renderTask.promise;
      } catch (error) {
        if (cancelled || error?.name === "RenderingCancelledException") return;
        setStatus({ type: "error", text: "Could not draw this PDF page." });
      }
    })();

    return () => {
      cancelled = true;
      if (renderTask) renderTask.cancel();
    };
  }, [pdfDoc, pageNumber, scale]);

  useEffect(() => {
    if (!pendingFit.current || !pageSize || !stageRef.current) return;
    pendingFit.current = false;
    const next = (stageRef.current.clientWidth - 24) / pageSize.pageWidth;
    setScale(clampScale(Math.round(next * 100) / 100));
  }, [pageSize]);

  useEffect(() => {
    const onMove = (event) => {
      const drag = dragRef.current;
      if (!drag) return;
      const dx = (event.clientX - drag.clientX) / scaleRef.current;
      const dy = (event.clientY - drag.clientY) / scaleRef.current;
      const x = Math.round(drag.originX + dx);
      const y = Math.round(drag.originY - dy);
      setCoordinates((prev) => prev.map((field) => (field.id === drag.id ? { ...field, x, y } : field)));
    };
    const onUp = () => {
      dragRef.current = null;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  useEffect(() => {
    const onKey = (event) => {
      if (!selectedId) return;
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
      const step = event.shiftKey ? 10 : 1;
      const delta = {
        ArrowLeft: [-step, 0],
        ArrowRight: [step, 0],
        ArrowUp: [0, step],
        ArrowDown: [0, -step],
      }[event.key];
      if (!delta) return;
      event.preventDefault();
      setCoordinates((prev) =>
        prev.map((field) =>
          field.id === selectedId ? { ...field, x: field.x + delta[0], y: field.y + delta[1] } : field
        )
      );
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId]);

  const requireIdentity = () => {
    if (!symbol.trim() || !formType) {
      setStatus({ type: "error", text: "Enter the IPO symbol and choose a form type first." });
      return false;
    }
    return true;
  };

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setStatus({ type: "error", text: "Choose a PDF file." });
      return;
    }
    const bytes = new Uint8Array(await file.arrayBuffer());
    await loadPdfBytes(bytes, file.name);
  };

  const openSample = async () => {
    const bytes = await buildSamplePdf();
    await loadPdfBytes(bytes, "sample-asba.pdf");
  };

  const startDrag = (event, field) => {
    event.preventDefault();
    setSelectedId(field.id);
    dragRef.current = {
      id: field.id,
      originX: field.x,
      originY: field.y,
      clientX: event.clientX,
      clientY: event.clientY,
    };
  };

  const saveLayout = () => {
    if (!requireIdentity()) return;
    localStorage.setItem(layoutStorageKey(symbol, formType), JSON.stringify(coordinates));
    setStatus({
      type: "ok",
      text: `Saved the layout for ${symbol.trim()} / ${formType} in this browser.`,
    });
  };

  const loadLayout = () => {
    if (!requireIdentity()) return;
    const raw = localStorage.getItem(layoutStorageKey(symbol, formType));
    if (!raw) {
      setStatus({ type: "error", text: "No saved layout for this symbol and form type." });
      return;
    }
    try {
      const saved = JSON.parse(raw);
      if (!Array.isArray(saved)) throw new Error("invalid");
      setCoordinates(saved.map((item) => createField(item)));
      setSelectedId(null);
      setStatus({ type: "ok", text: `Loaded ${saved.length} field${saved.length === 1 ? "" : "s"}.` });
    } catch {
      setStatus({ type: "error", text: "The saved layout could not be read." });
    }
  };

  const copyJson = async () => {
    if (!requireIdentity()) return;
    if (activeFields.length === 0) {
      setStatus({ type: "error", text: "Turn on at least one field before exporting." });
      return;
    }
    const text = JSON.stringify(payload, null, 2);
    try {
      await navigator.clipboard.writeText(text);
      setStatus({ type: "ok", text: "Copied the coordinate JSON." });
    } catch {
      setStatus({ type: "error", text: "Could not copy. Use Download JSON instead." });
    }
  };

  const downloadJson = () => {
    if (!requireIdentity()) return;
    if (activeFields.length === 0) {
      setStatus({ type: "error", text: "Turn on at least one field before exporting." });
      return;
    }
    const text = JSON.stringify(payload, null, 2);
    downloadBlob(text, `${symbol.trim()}-${formType}.json`, "application/json");
    setStatus({ type: "ok", text: "Downloaded the coordinate JSON." });
  };

  const downloadFilledPdf = async () => {
    if (!pdfBytesRef.current) {
      setStatus({ type: "error", text: "Upload a PDF or open the sample form first." });
      return;
    }
    if (!requireIdentity()) return;
    if (activeFields.length === 0) {
      setStatus({ type: "error", text: "Turn on at least one field before downloading." });
      return;
    }
    try {
      const form = new FormData();
      form.append("pdf", new Blob([pdfBytesRef.current], { type: "application/pdf" }), fileName || "form.pdf");
      form.append("data", JSON.stringify(payload));
      const response = await fetch("/api/print", { method: "POST", body: form });
      if (!response.ok) {
        let message = "Could not print the PDF.";
        try {
          const body = await response.json();
          if (body.message) message = body.message;
        } catch {
          /* The print service returned a non-JSON error. */
        }
        throw new Error(message);
      }
      const bytes = await response.arrayBuffer();
      downloadBlob(bytes, `${symbol.trim()}-${formType}.pdf`, "application/pdf");
      setStatus({ type: "ok", text: "Downloaded the filled PDF." });
    } catch (error) {
      const message = error?.message || "Could not print the PDF.";
      setStatus({
        type: "error",
        text: message === "Failed to fetch"
          ? "Could not reach the print service. Start the backend on port 8080."
          : message,
      });
    }
  };

  const fitWidth = () => {
    if (!pageSize || !stageRef.current) return;
    const next = (stageRef.current.clientWidth - 24) / pageSize.pageWidth;
    setScale(clampScale(Math.round(next * 100) / 100));
  };

  const setVisibleActive = (isActive) => {
    const keys = new Set(visibleFields.map((field) => field.id));
    setCoordinates((prev) => prev.map((field) => (keys.has(field.id) ? { ...field, isActive } : field)));
  };

  const addField = () => {
    const field = createField({
      key: `field${coordinates.length + 1}`,
      x: 72,
      y: pageSize ? Math.round(pageSize.pageHeight - 80 - coordinates.length * 24) : 720,
      page: pageNumber || 1,
      isActive: true,
    });
    setCoordinates((prev) => [...prev, field]);
    setSelectedId(field.id);
    if (field.page >= 1 && field.page <= pageCount) setPageNumber(field.page);
  };

  const applyData = () => {
    let parsed;
    try {
      parsed = JSON.parse(dataJson);
    } catch {
      setStatus({ type: "error", text: "Data must be JSON, either { \"key\": \"value\" } or a saved field list." });
      return;
    }
    if (Array.isArray(parsed)) {
      setCoordinates(parsed.map((item) => createField(item)));
      setSelectedId(null);
      setStatus({ type: "ok", text: `Loaded ${parsed.length} fields from the data.` });
      return;
    }
    if (parsed && Array.isArray(parsed.coordinates)) {
      setCoordinates(parsed.coordinates.map((item) => createField({ ...item, isActive: true })));
      if (parsed.symbol) setSymbol(String(parsed.symbol).toUpperCase());
      if (parsed.type) setFormType(String(parsed.type));
      setSelectedId(null);
      setStatus({ type: "ok", text: "Loaded the field map from the print JSON." });
      return;
    }
    if (!parsed || typeof parsed !== "object") {
      setStatus({ type: "error", text: "Data must be a JSON object of keys and values." });
      return;
    }
    const entries = Object.entries(parsed);
    setCoordinates((prev) => {
      const known = new Set(prev.map((field) => field.key));
      const next = prev.map((field) =>
        Object.prototype.hasOwnProperty.call(parsed, field.key)
          ? { ...field, value: parsed[field.key] == null ? "" : String(parsed[field.key]), isActive: true }
          : field
      );
      let stack = 0;
      entries.forEach(([key, value]) => {
        if (known.has(key)) return;
        next.push(
          createField({
            key,
            value: value == null ? "" : String(value),
            x: 72,
            y: (pageSize ? Math.round(pageSize.pageHeight - 80) : 720) - stack * 24,
            page: pageNumber || 1,
            isActive: true,
          })
        );
        stack += 1;
      });
      return next;
    });
    setStatus({ type: "ok", text: "Mapped the data onto the fields." });
  };

  const overlays = pageSize
    ? coordinates.filter((field) => field.isActive && field.page === pageNumber)
    : [];

  return (
    <div className="editor-body">
        <section className="panel">
          <h2>Form</h2>
          {status && (
            <div className={`alert ${status.type === "error" ? "alert-danger" : "alert-success"} py-2`} role="status">
              {status.text}
            </div>
          )}

          <label className="form-label mb-1" htmlFor="symbol">
            IPO symbol
          </label>
          <input
            id="symbol"
            className="form-control form-control-sm mb-2"
            list="ipo-symbols"
            value={symbol}
            placeholder="Type or choose a symbol"
            onChange={(event) => setSymbol(event.target.value.toUpperCase())}
          />
          <datalist id="ipo-symbols">
            {SYMBOLS.map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>

          <label className="form-label mb-1" htmlFor="form-type">
            Form type
          </label>
          <select
            id="form-type"
            className="form-select form-select-sm mb-2"
            value={formType}
            onChange={(event) => setFormType(event.target.value)}
          >
            <option value="">Select form type</option>
            {FORM_TYPES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          <label className="form-label mb-1" htmlFor="pdf-file">
            ASBA PDF
          </label>
          <input id="pdf-file" className="form-control form-control-sm" type="file" accept="application/pdf,.pdf" onChange={handleFile} />
          <div className="action-row mt-2">
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={openSample}>
              Open sample form
            </button>
            <button type="button" className="btn btn-sm btn-outline-primary" onClick={saveLayout}>
              Save layout
            </button>
            <button type="button" className="btn btn-sm btn-outline-primary" onClick={loadLayout}>
              Load layout
            </button>
          </div>
          <div className="action-row mt-2">
            <button type="button" className="btn btn-sm btn-primary" onClick={copyJson}>
              Copy JSON
            </button>
            <button type="button" className="btn btn-sm btn-primary" onClick={downloadJson}>
              Download JSON
            </button>
            <button type="button" className="btn btn-sm btn-danger" onClick={downloadFilledPdf}>
              Download filled PDF
            </button>
          </div>

          <div className="d-flex justify-content-between align-items-center mt-3 mb-2">
            <h2 className="mb-0">Fields</h2>
            <span className="text-secondary small">{activeFields.length} on the form</span>
          </div>
          <div className="action-row mb-2">
            <button type="button" className="btn btn-sm btn-primary" onClick={addField}>
              Add field
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={() => {
                setCoordinates(sampleFields());
                setSelectedId(null);
              }}
            >
              Load sample keys
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={() => {
                setCoordinates([]);
                setSelectedId(null);
              }}
            >
              Clear
            </button>
          </div>
          <textarea
            className="form-control form-control-sm mb-2"
            rows={3}
            placeholder={'Map data JSON, for example {"PAN":"AYCPV8888G","Name":"Ada"}'}
            value={dataJson}
            onChange={(event) => setDataJson(event.target.value)}
          />
          <div className="action-row mb-2">
            <button type="button" className="btn btn-sm btn-outline-primary" onClick={applyData}>
              Apply data
            </button>
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setVisibleActive(true)}>
              Enable shown
            </button>
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setVisibleActive(false)}>
              Disable shown
            </button>
          </div>
          <input
            className="form-control form-control-sm mb-2"
            placeholder="Filter by key or value"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          />
          <p className="text-secondary small mb-2">
            Add a key, drag it on the PDF, then paste your own data. Size, gap, and break width are PDF points. Weight is
            normal or bold. Break width 0 keeps one line. Arrow keys nudge the selected field (Shift moves 10 points).
          </p>
          <div className="field-list">
            {visibleFields.length === 0 && <p className="text-secondary small mb-0">No fields yet. Add one, or load the sample keys.</p>}
            {visibleFields.map((field) => (
              <div
                key={field.id}
                className={`field-card${field.id === selectedId ? " selected" : ""}`}
                onClick={() => {
                  setSelectedId(field.id);
                  if (field.page >= 1 && field.page <= pageCount) setPageNumber(field.page);
                }}
              >
                <div className="field-card-head">
                  <input
                    type="checkbox"
                    checked={field.isActive}
                    aria-label={`Show ${field.key}`}
                    onClick={(event) => event.stopPropagation()}
                    onChange={(event) => updateField(field.id, { isActive: event.target.checked })}
                  />
                  <input
                    className="form-control form-control-sm"
                    value={field.key}
                    aria-label="Field key"
                    onClick={(event) => event.stopPropagation()}
                    onChange={(event) => updateField(field.id, { key: event.target.value })}
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={(event) => {
                      event.stopPropagation();
                      setCoordinates((prev) => prev.filter((item) => item.id !== field.id));
                      if (selectedId === field.id) setSelectedId(null);
                    }}
                  >
                    Remove
                  </button>
                </div>
                <label className="mini-label" htmlFor={`value-${field.id}`}>
                  Value
                </label>
                <input
                  id={`value-${field.id}`}
                  className="form-control form-control-sm mb-2"
                  value={field.value}
                  onClick={(event) => event.stopPropagation()}
                  onChange={(event) => updateField(field.id, { value: event.target.value })}
                />
                <div className="field-metrics">
                  {[
                    ["X", "x", field.x, 0],
                    ["Y", "y", field.y, 0],
                    ["Page", "page", field.page, 1],
                    ["Size", "fontSize", field.fontSize, 1],
                    ["Gap", "gap", field.gap, 0],
                    ["Break", "breakWidth", field.breakWidth, 0],
                  ].map(([label, prop, value, minimum]) => (
                    <label key={prop}>
                      <span className="mini-label">{label}</span>
                      <input
                        type="number"
                        min={minimum}
                        step="any"
                        className="form-control form-control-sm"
                        value={value}
                        onClick={(event) => event.stopPropagation()}
                        onChange={(event) =>
                          updateField(field.id, {
                            [prop]: Math.max(minimum, Number(event.target.value) || 0),
                          })
                        }
                      />
                    </label>
                  ))}
                  <label>
                    <span className="mini-label">Weight</span>
                    <select
                      className="form-select form-select-sm"
                      aria-label="Font weight"
                      value={field.fontWeight >= 600 ? 700 : 400}
                      onClick={(event) => event.stopPropagation()}
                      onChange={(event) => updateField(field.id, { fontWeight: Number(event.target.value) })}
                    >
                      <option value={400}>Normal</option>
                      <option value={700}>Bold</option>
                    </select>
                  </label>
                </div>
              </div>
            ))}
          </div>

          <details className="mt-3">
            <summary>JSON preview</summary>
            <pre className="json-preview mt-2">{JSON.stringify(payload, null, 2)}</pre>
          </details>
        </section>

        <section className="panel">
          <div className="pdf-toolbar mb-2">
            <h2 className="mb-0 me-2">Preview{fileName ? ` — ${fileName}` : ""}</h2>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              disabled={pageNumber <= 1}
              onClick={() => setPageNumber((page) => Math.max(1, page - 1))}
            >
              Previous
            </button>
            <span className="small">
              Page {pageCount ? pageNumber : 0} / {pageCount}
            </span>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              disabled={pageNumber >= pageCount}
              onClick={() => setPageNumber((page) => Math.min(pageCount, page + 1))}
            >
              Next
            </button>
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setScale((value) => clampScale(Math.round((value - 0.1) * 10) / 10))} disabled={!pdfDoc}>
              −
            </button>
            <span className="small">{Math.round(scale * 100)}%</span>
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setScale((value) => clampScale(Math.round((value + 0.1) * 10) / 10))} disabled={!pdfDoc}>
              +
            </button>
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={fitWidth} disabled={!pdfDoc}>
              Fit width
            </button>
          </div>

          <div className="pdf-stage" ref={stageRef}>
            {pdfDoc ? (
              <div className="pdf-canvas-wrap" style={{ width: pageSize?.width, height: pageSize?.height }}>
                <canvas ref={canvasRef} />
                {overlays.map((field) => {
                  const lines = wrapLines(field);
                  const shown = lines.length ? lines.join("\n") : field.key;
                  return (
                    <button
                      key={field.id}
                      type="button"
                      className={`field-overlay${field.id === selectedId ? " selected" : ""}${lines.length ? "" : " placeholder"}`}
                      style={{
                        left: field.x * scale,
                        top: (pageSize.pageHeight - field.y) * scale,
                        fontSize: field.fontSize * scale,
                        fontWeight: field.fontWeight >= 600 ? 700 : 400,
                        letterSpacing: `${field.gap * scale}px`,
                        lineHeight: 1.15,
                        transform: "translateY(-0.8em)",
                        transformOrigin: "0 0.8em",
                      }}
                      onPointerDown={(event) => startDrag(event, field)}
                    >
                      {shown}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="empty-pdf">
                <div>
                  <p className="mb-2">Upload an ASBA PDF, or open the sample form to practice placing fields.</p>
                  <button type="button" className="btn btn-sm btn-secondary" onClick={openSample}>
                    Open sample form
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
    </div>
  );
};

export default PdfEditor;
