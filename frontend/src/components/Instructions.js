import React from "react";

const Instructions = () => {
  return (
    <main className="instructions">
      <h1>How to use this app</h1>
      <p className="instructions-lead">
        Place your own fields on an IPO ASBA PDF, map them to your data, and download a filled PDF.
      </p>

      <ol className="instruction-list">
        <li>
          <h2>Name the form</h2>
          <p>Enter the IPO symbol and choose Printed form or Blank form. Layouts are saved under that pair.</p>
        </li>
        <li>
          <h2>Open the PDF</h2>
          <p>Upload the ASBA PDF, or click Open sample form to practice on a two-page sheet.</p>
        </li>
        <li>
          <h2>Add your keys</h2>
          <p>
            Click Add field and rename the key, for example PAN or ApplicantName. Turn the checkbox on, then drag the
            label onto the matching box. Arrow keys nudge the selected field. Hold Shift to move 10 points.
          </p>
        </li>
        <li>
          <h2>Set how the text prints</h2>
          <p>Each value is in PDF points, measured from the bottom-left. Y is the text baseline.</p>
          <ul>
            <li>Page — which PDF page receives the field.</li>
            <li>Size — font size.</li>
            <li>Weight — Normal or Bold.</li>
            <li>Gap — extra space between characters.</li>
            <li>Break — line width. 0 keeps the text on one line.</li>
          </ul>
        </li>
        <li>
          <h2>Map your data</h2>
          <p>Paste JSON and click Apply data. Matching keys are filled. Keys that are not on the form yet are added.</p>
          <pre className="json-preview">{`{
  "PAN": "AYCPV8888G",
  "ApplicantName": "Dynamite Technology"
}`}</pre>
          <p>You can also paste a saved field list, or the print JSON from Download JSON.</p>
        </li>
        <li>
          <h2>Save and print</h2>
          <p>
            Save layout keeps the positions for this symbol and form type in this browser. Load layout brings them
            back. Download filled PDF sends the form and the field map to the print service. Copy JSON and Download
            JSON give you the same map.
          </p>
        </li>
      </ol>

      <p>
        <a className="btn btn-sm btn-primary" href="#/">
          Back to the editor
        </a>
      </p>
    </main>
  );
};

export default Instructions;
