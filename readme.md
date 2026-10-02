# IPO ASBA PDF Form Editor

Place your own fields on an IPO ASBA PDF, map them to your data, and download a filled PDF.

This is a plug-and-play print tool. The keys are yours. You place them once, then send JSON from your own application, or run the editor and the print service in-house.

The editor runs in the browser. A Spring Boot service stamps the fields onto the PDF with iText.

## Features

- **Your own keys.** Add, rename, and remove fields. Nothing is locked to a fixed ASBA field list.
- **Drag and nudge.** Drag a field onto the PDF. Arrow keys move it 1 point. Shift moves it 10 points.
- **Multi-page forms.** Each field has a page. The preview shows only the fields for the page you are on.
- **Zoom.** Zoom in, zoom out, and fit the page to the panel width.
- **Font size and weight.** Normal (400) or Bold (700), in Helvetica.
- **Gap.** Extra space between characters, in PDF points. Used when Cell is 0.
- **Cell width.** Centers each character in the next printed box. Set it to the width of one box on the form. `0` turns it off.
- **Break width.** Wraps text when it is wider than this many points. `0` keeps one line. Ignored while Cell is set.
- **Copy a row.** Copies the selected field 28 points lower, with the same key and print settings, for the next bid line.
- **Show or hide fields.** A checkbox per field. Enable shown and Disable shown apply to the filtered list. Only checked fields are printed.
- **Filter.** Narrow the field list by key or value.
- **Map data.** Paste `{ "key": "value" }` and click Apply data. Matching keys are filled. New keys are added.
- **Load a saved map.** Paste a field list, or the JSON from Download JSON, and Apply data replaces the fields.
- **Save and load layouts.** One layout per IPO symbol and form type, stored in this browser.
- **Copy JSON and Download JSON.** Export the active fields for another system.
- **Download filled PDF.** One form, filled from the values on screen.
- **Print batch.** Paste a JSON list and download one PDF with a copy of the form for each application. Up to 200 forms.
- **Sample form.** A two-page practice PDF, plus Load sample keys for the practice field names.
- **Instructions page.** How to use the editor, linked from the navbar.
- **Print API.** `POST /api/print` takes the PDF and the JSON, so your application can print without the editor.

## Requirements

- Java 17 or newer
- Node.js 18 or newer
- Maven, only if `backend/target/asba-print.war` is not already built

## Run the project

From the repository root:

**Windows**

```bat
run.bat
```

**macOS or Linux**

```sh
chmod +x run.sh
./run.sh
```

- Editor: http://localhost:3000
- Print service: http://localhost:8080

The script builds the WAR when it is missing, starts the print service, then starts the editor. On Windows the print service opens in its own window. On macOS and Linux it stops when you stop the script.

## Run each part yourself

Print service:

```bat
cd backend
mvn package
java -jar target\asba-print.war
```

Editor:

```bat
cd frontend
npm install
npm start
```

`frontend/package.json` proxies `/api` to http://localhost:8080, so the editor can download a filled PDF while both are running.

## How to use the editor

Open **Instructions** in the navbar (`#/instructions`), or follow these steps:

1. Enter the IPO symbol and choose Printed form or Blank form. Suggested symbols are ARUNAYA, ATHER, and MANOJJEWEL. Any symbol is accepted and stored in uppercase.
2. Upload the ASBA PDF, or click **Open sample form**.
3. Click **Add field**, name the key, turn it on, and drag it onto the matching box.
4. Set page, size, weight, gap, cell width, and break width.
5. Click **Copy** on a field to place the same key on the next row.
6. Paste a data JSON and click **Apply data**.
7. **Save layout**, then **Download filled PDF**.
8. For many applicants, paste a JSON list and click **Print batch**.

**Load sample keys** restores the practice field names used by the sample form. **Clear** removes every field.

Empty fields show their key on the preview so you can place them before the data arrives. Coordinates are PDF points from the bottom-left. `y` is the text baseline.

### Field settings

| Setting | Meaning |
| --- | --- |
| Key | Name matched to your JSON. The same key can appear on more than one row. |
| Value | Text printed for this field when you download one form. |
| X, Y | Position in PDF points. Y is the text baseline. |
| Page | PDF page that receives the field. |
| Size | Font size in points. |
| Weight | Normal (`400`) or Bold (`700`). |
| Gap | Extra space between characters, in points. Used when Cell is 0. |
| Cell | Width of one printed box, in points. Each character is centered in the next box. `0` turns this off. |
| Break | Line width in points. `0` keeps one line. Ignored while Cell is set. |

### Data JSON

**Apply data** fills keys that already exist and adds keys that do not.

```json
{
  "PAN": "AYCPV8888G",
  "ApplicantName": "Dynamite Technology"
}
```

You can also paste a saved field list, or the print JSON from **Download JSON**. A field list replaces the fields on screen. Print JSON also sets the symbol and form type.

### Batch JSON

**Print batch** expects a list. Each object is one application. Keys must match the field keys on the layout. A key missing from an object keeps that field's value from the layout.

```json
[
  { "PAN": "AYCPV8888G", "ApplicantName": "Ada" },
  { "PAN": "ABCDE1234F", "ApplicantName": "Ravi" }
]
```

The download is `{symbol}-{formType}-batch.pdf`. One copy of the uploaded PDF is appended for each object. A batch can contain at most 200 forms.

### Print JSON

Active fields are sent to the print service in this shape:

```json
{
  "symbol": "ARUNAYA",
  "type": "PRINTED_FORM",
  "coordinates": [
    {
      "key": "PAN",
      "x": 206,
      "y": 740,
      "value": "AYCPV8888G",
      "fontSize": 11,
      "gap": 0,
      "cellWidth": 16,
      "fontWeight": 400,
      "breakWidth": 0,
      "page": 1
    }
  ],
  "records": [
    { "PAN": "AYCPV8888G" },
    { "PAN": "ABCDE1234F" }
  ]
}
```

`fontWeight` is `400` for normal and `700` for bold. Omit `records` to stamp the `value` of each field onto the uploaded PDF once. Include `records` to print one form per object.

Text must be letters and numbers supported by Helvetica. A character outside that set returns an error for that field.

## Print service

`GET /api/health` returns `{"status":"ok"}`.

`POST /api/print` accepts multipart form data:

- `pdf` — the blank or printed form, up to 25 MB
- `data` — the print JSON above

The response is `application/pdf`. The file name is `{symbol}-{type}.pdf`.

Errors return JSON `{ "message": "..." }` with status 400 for a bad request, and 500 when the PDF cannot be printed.

Deploy `backend/target/asba-print.war` to Tomcat, or run it with `java -jar`. When the WAR is not the root application, the API is under `/asba-print`. The browser editor allows `http://localhost:3000`.

iText 7 is AGPL. A public release of this service needs a commercial iText license or a different PDF library.

## Project structure

```
IPO-ASBA-PDF-Form-Editor/
├── run.bat
├── run.sh
├── frontend/          React editor
│   └── src/
│       ├── App.js
│       ├── components/PdfEditor.js
│       ├── components/Instructions.js
│       ├── components/Navbar.js
│       ├── data/fields.js
│       └── pdf/sampleForm.js
└── backend/           Spring Boot WAR
    └── src/main/java/com/dynamite/asba/
        ├── print/PdfPrintService.java
        ├── print/TextLayout.java
        └── web/PrintController.java
```

## License

MIT License © 2025 Dynamite Technology
