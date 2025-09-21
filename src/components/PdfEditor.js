import React, { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";

// Load PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const PdfEditor = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [viewport, setViewport] = useState(null);
  const [coordinates, setCoordinates] = useState([]);
  const [symbol, setSymbol] = useState("0");
  const [formType, setFormType] = useState("0");
  const [dragging, setDragging] = useState(null);

  // placeholders (initial data)
  const placeholders = [
    { key: "ApplicationNo1", x: 150, y: 150, value: "55556666", wordspaceCount: 0, fontSize: 12 },
    { key: "ApplicationNo2", x: 200, y: 200, value: "55556666", wordspaceCount: 0, fontSize: 12 },
    { key: "ApplicationNo3", x: 208, y: 208, value: "55556666" , wordspaceCount: 0, fontSize: 12 },
    { key: "email1", x: 250, y: 250, value: "youremail@domain.com", wordspaceCount: 0, fontSize: 12 },
    { key: "email2", x: 250, y: 250, value: "youremail@domain.com" , wordspaceCount: 0, fontSize: 12 },
    { key: "MobileNo1", x: 300, y: 300, value: "1112227778", wordspaceCount: 0, fontSize: 12 },
    { key: "MobileNo2", x: 350, y: 300, value: "1112227778", wordspaceCount: 0, fontSize: 12 },
    { key: "ApplicantName1", x: 400, y: 300, value: "Dynamite Technology Private Limited" , wordspaceCount: 0, fontSize: 12 },
    { key: "ApplicantName2", x: 450, y: 300, value: "Dynamite Technology Private Limited" , wordspaceCount: 0, fontSize: 12 },
    { key: "ApplicantName3", x: 500, y: 300, value: "Dynamite Technology Private Limited" , wordspaceCount: 0, fontSize: 12 },
    { key: "amount1", x: 500, y: 300, value: "100000", wordspaceCount: 0, fontSize: 12 },
    { key: "amount2", x: 500, y: 300, value: "100000" , wordspaceCount: 0, fontSize: 12 },
    { key: "no_of_bid1", x: 500, y: 300, value: "50" , wordspaceCount: 0, fontSize: 12 },
    { key: "no_of_bid2", x: 500, y: 300, value: "50" , wordspaceCount: 0, fontSize: 12 },
    { key: "bid_price1", x: 500, y: 300, value: "500" , wordspaceCount: 0, fontSize: 12 },
    { key: "bid_price2", x: 500, y: 300, value: "500" , wordspaceCount: 0, fontSize: 12 },
    { key: "amount_in_word", x: 500, y: 300, value: "Five Thousand ninty nine" , wordspaceCount: 0, fontSize: 12 },
    { key: "dpid1", x: 500, y: 300, value: "IN12345678950" , wordspaceCount: 0, fontSize: 12 },
    { key: "dpid2", x: 500, y: 300, value: "IN12345678950" , wordspaceCount: 0, fontSize: 12 },
    { key: "panNo1", x: 500, y: 300, value: "AYCPV8888G" , wordspaceCount: 0, fontSize: 12 },
    { key: "panNo2", x: 500, y: 300, value: "AYCPV8888G" , wordspaceCount: 0, fontSize: 12 },
    { key: "UPI", x: 550, y: 300, value: "dynamitetechnology@icicibank" , wordspaceCount: 0, fontSize: 12 },
  ];

  useEffect(() => {
    setCoordinates(placeholders.map((p) => ({ ...p, isActive: false })));
  }, []);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      const fileReader = new FileReader();
      fileReader.onload = async (event) => {
        const typedArray = new Uint8Array(event.target.result);
        const pdf = await pdfjsLib.getDocument(typedArray).promise;
        setPdfDoc(pdf);
        renderPage(pdf, 1);
      };
      fileReader.readAsArrayBuffer(file);
    }
  };

  const renderPage = async (pdf, pageNumber) => {
    const page = await pdf.getPage(pageNumber);
    const vp = page.getViewport({ scale: 1 });
    setViewport(vp);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = vp.width;
    canvas.height = vp.height;

    await page.render({ canvasContext: ctx, viewport: vp }).promise;
  };

  const insertSpaces = (input, count) => {
    const spaces = " ".repeat(count);
    return input.split("").join(spaces);
  };

  const handleDrag = (e, key) => {
    if (!dragging) return;

    const { offsetX, offsetY } = dragging;
    const rect = containerRef.current.getBoundingClientRect();
    const newX = e.clientX - rect.left - offsetX;
    const newY = e.clientY - rect.top - offsetY;

    setCoordinates((prev) =>
      prev.map((c) =>
        c.key === key
          ? {
              ...c,
              x: Math.round(newX),
              y: Math.round(viewport.height - newY)
            }
          : c
      )
    );
  };

  const handleMouseDown = (e, key) => {
    setDragging({
      key,
      offsetX: e.nativeEvent.offsetX,
      offsetY: e.nativeEvent.offsetY
    });
  };

  const handleMouseUp = () => setDragging(null);

  const buildJSON = () => {
    const activeCoords = coordinates
      .filter((c) => c.isActive)
      .map((c) => ({
        ...c,
        value: insertSpaces(c.value, c.wordspaceCount)
      }));

    const finalData = {
      symbol,
      type: formType,
      coordinates: activeCoords
    };

    console.log(JSON.stringify(finalData, null, 2));
    alert("Check console for JSON output!");
  };

  return (
    <div
      className="container-fluid"
      onMouseMove={(e) => handleDrag(e, dragging?.key)}
      onMouseUp={handleMouseUp}
    >
      <h1 className="mt-2">IPO ASBA PDF Form Editor</h1>
      <div className="row">
        {/* Left Panel */}
        <div className="col-md-5">
          <select
            className="form-select mb-2 rounded-0"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
          >
            <option value="0">Select Symbol</option>
            <option value="ARUNAYA">ARUNAYA</option>
            <option value="ATHER">ATHER</option>
            <option value="MANOJJEWEL">MANOJJEWEL</option>
          </select>

          <input
            type="file"
            className="form-control rounded-0"
            onChange={handleFile}
            accept="application/pdf"
          />

          <select
            className="form-select mt-2 rounded-0"
            value={formType}
            onChange={(e) => setFormType(e.target.value)}
          >
            <option value="0">Select Form Type</option>
            <option value="PRINTED_FORM">Printed Form</option>
            <option value="BLANK_FORM">Blank Form</option>
          </select>

          <button className="btn btn-sm btn-danger mt-2 rounded-0" onClick={buildJSON}>
            Final Submission
          </button>

          <table
            className="table table-bordered table-striped table-sm mt-3"
            style={{ maxHeight: 450, overflowY: "auto", display: "block" }}
          >
            <thead>
              <tr>
                <th>Key</th>
                <th>X</th>
                <th>Y</th>
                <th>Font Size</th>
                <th>Font Spacing</th>
                <th>Value</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {coordinates.map((c) => (
                <tr key={c.key}>
                  <td>{c.key}</td>
                  <td>{c.x}</td>
                  <td>{c.y}</td>
                  <td>
                    <input
                      type="number"
                      value={c.fontSize}
                      onChange={(e) =>
                        setCoordinates((prev) =>
                          prev.map((p) => (p.key === c.key ? { ...p, fontSize: +e.target.value } : p))
                        )
                      }
                      className="form-control rounded-0"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={c.wordspaceCount}
                      onChange={(e) =>
                        setCoordinates((prev) =>
                          prev.map((p) => (p.key === c.key ? { ...p, wordspaceCount: +e.target.value } : p))
                        )
                      }
                      className="form-control rounded-0"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={c.value}
                      onChange={(e) =>
                        setCoordinates((prev) =>
                          prev.map((p) => (p.key === c.key ? { ...p, value: e.target.value } : p))
                        )
                      }
                      className="form-control rounded-0"
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={c.isActive}
                      onChange={(e) =>
                        setCoordinates((prev) =>
                          prev.map((p) => (p.key === c.key ? { ...p, isActive: e.target.checked } : p))
                        )
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PDF + Overlays */}
        <div className="col-md-7">
          <div id="pdf-container" ref={containerRef} style={{ position: "relative", display: "inline-block" }}>
            <canvas ref={canvasRef} style={{ border: "1px solid #ccc", display: "block" }} />
            {coordinates
              .filter((c) => c.isActive)
              .map((c) => {
                const canvasY = viewport ? viewport.height - c.y : c.y;
                return (
                  <div
                    key={c.key}
                    data-key={c.key}
                    style={{
                      position: "absolute",
                      left: `${c.x}px`,
                      top: `${canvasY}px`,
                      fontSize: `${c.fontSize}px`,
                      wordSpacing: `${c.wordspaceCount}px`,
                      background: "rgba(255,255,0,0.7)",
                      border: "1px solid #000",
                      padding: "2px 5px",
                      cursor: "move",
                      color: "fuchsia"
                    }}
                    onMouseDown={(e) => handleMouseDown(e, c.key)}
                  >
                    {insertSpaces(c.value, c.wordspaceCount)}
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfEditor;
