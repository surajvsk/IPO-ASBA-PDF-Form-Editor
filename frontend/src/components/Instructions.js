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
            <li>Gap — extra space between characters. Use this when Cell is 0.</li>
            <li>Cell — width of one printed box. Each character is centered in the next box. 0 turns this off.</li>
            <li>Break — line width. 0 keeps the text on one line. Ignored while Cell is set.</li>
            <li>Copy — duplicates the field 28 points lower, for the next bid row.</li>
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
          <h2>Print many applications</h2>
          <p>
            Paste a JSON list and click Print batch. The print service copies the PDF once per object and fills each
            copy from that object’s keys. One download contains every form.
          </p>
          <pre className="json-preview">{`[
  { "PAN": "AYCPV8888G", "ApplicantName": "Ada" },
  { "PAN": "ABCDE1234F", "ApplicantName": "Ravi" }
]`}</pre>
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
