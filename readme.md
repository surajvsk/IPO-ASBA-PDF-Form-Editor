# IPO ASBA PDF Form Editor

Place your own fields on an IPO ASBA PDF, map them to your data, and download a filled PDF.

The editor runs in the browser. A Spring Boot service stamps the fields onto the PDF with iText.

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

Open **Instructions** in the navbar, or follow these steps:

1. Enter the IPO symbol and choose Printed form or Blank form.
2. Upload the ASBA PDF, or click **Open sample form**.
3. Click **Add field**, name the key, turn it on, and drag it onto the matching box. Arrow keys nudge the selected field. Shift moves it 10 points.
4. Set page, size, weight, gap, and break width.
5. Paste a data JSON and click **Apply data**.
6. **Save layout**, then **Download filled PDF**.

**Load sample keys** restores the practice field names used by the sample form. **Clear** removes every field.

Layouts are stored in this browser, one layout per symbol and form type.

### Field settings

Coordinates are PDF points from the bottom-left. `y` is the text baseline.

| Setting | Meaning |
| --- | --- |
| Page | PDF page that receives the field |
| Size | Font size in points |
| Weight | Normal or Bold |
| Gap | Extra space between characters, in points |
| Break | Line width in points. `0` keeps one line |

### Data JSON

**Apply data** fills keys that already exist and adds keys that do not.

```json
{
  "PAN": "AYCPV8888G",
  "ApplicantName": "Dynamite Technology"
}
```

You can also paste a saved field list, or the JSON from **Download JSON**.

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
      "fontWeight": 400,
      "breakWidth": 0,
      "page": 1
    }
  ]
}
```

`fontWeight` is `400` for normal and `700` for bold.

## Print service

`POST /api/print` accepts multipart form data:

- `pdf` — the uploaded form
- `data` — the print JSON above

The response is the filled PDF. `GET /api/health` returns `{"status":"ok"}`.

Deploy `backend/target/asba-print.war` to Tomcat, or run it with `java -jar`. When the WAR is not the root application, the print URL is under `/asba-print`.

iText 7 is AGPL. A public release of this service needs a commercial iText license or a different PDF library.

## Project structure

```
IPO-ASBA-PDF-Form-Editor/
├── run.bat
├── run.sh
├── frontend/          React editor
│   └── src/
│       ├── components/PdfEditor.js
│       ├── components/Instructions.js
│       └── data/fields.js
└── backend/           Spring Boot WAR
    └── src/main/java/com/dynamite/asba/print/
        ├── PdfPrintService.java
        └── TextLayout.java
```

## License

MIT License © 2025 Dynamite Technology
