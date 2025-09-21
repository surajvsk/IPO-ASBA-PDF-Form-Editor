---

# 📄 IPO ASBA PDF Form Editor (ReactJS)

This project is a **ReactJS-based PDF editor** that allows you to **view, overlay, and edit IPO ASBA forms** dynamically.
It replaces the old **Bootstrap + jQuery + PDF.js** implementation with a **modern React functional component** using hooks and state management.

---

## 🚀 Features

* 📑 Upload and preview **PDF forms** using **PDF.js**
* 📝 Overlay editable fields (Application No, Email, Mobile No, Name, Amount, UPI, etc.)
* 🎯 Drag and move fields directly on top of the PDF
* ⚡ Update font size, spacing, and values from a live table
* ✅ Select IPO symbol and form type
* 📤 Generate JSON output with all active field coordinates (for backend processing or API integration)
* 🖼 Real-time preview with accurate PDF coordinates
* 🔄 Fully React-based (no jQuery)

---

## 🏗 Project Structure

```
pdf-editor-react/
│── public/                # Static assets
│   └── index.html
│
│── src/
│   ├── components/
│   │   └── PdfEditor.js   # Main PDF editor component
│   ├── App.js             # Root app file
│   ├── index.js           # React entry point
│   └── styles.css         # Optional custom styles
│
│── package.json           # Dependencies & scripts
│── README.md              # Project documentation
```

---

## 📦 Dependencies

* [React](https://reactjs.org/) (UI Framework)
* [Bootstrap 5](https://getbootstrap.com/) (UI Styling)
* [pdf.js](https://mozilla.github.io/pdf.js/) (PDF rendering)

---

## ⚙️ Installation

1. Clone this repo:

   ```bash
   git clone https://github.com/surajvsk/IPO-ASBA-PDF-Form-Editor.git
   cd IPO-ASBA-PDF-Form-Editor
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

   ⚠️ Fix for `ajv` mismatch error:

   ```bash
   npm install ajv@6 ajv-keywords@3 --save
   ```

3. Start development server:

   ```bash
   npm start
   ```

4. Open in browser:

   ```
   http://localhost:3000
   ```

---

## 📋 Usage Instructions

1. **Select IPO Symbol** (e.g., `ARUNAYA`, `ATHER`)
2. **Upload ASBA PDF Form** (`.pdf`)
3. **Select Form Type** (`Printed Form` / `Blank Form`)
4. Enable/disable overlay fields using the **checkboxes in the table**
5. Drag fields on the PDF to match the correct placement
6. Adjust **font size**, **spacing**, and **values** directly from the table
7. Click **Final Submission** → JSON data will be generated in console

   ```json
   {
     "symbol": "ARUNAYA",
     "type": "PRINTED_FORM",
     "coordinates": [
       {
         "key": "ApplicationNo1",
         "x": 150,
         "y": 150,
         "value": "55556666",
         "fontSize": 10,
         "wordspaceCount": 0
       },
       ...
     ]
   }
   ```

---

## 🔧 Future Enhancements

* ✅ Export filled PDF with overlays (Preview & Download)
* ✅ Save JSON data to backend API
* 🔍 Add zoom & multi-page navigation
* 📱 Make drag-and-drop mobile-friendly

---

## 👨‍💻 Developer Notes

* This tool is tailored for **IPO ASBA application forms**, but can be adapted to any kind of **PDF form overlay project**.
* JSON output can be directly consumed by backend services for **auto-filling forms, validation, and submission workflows**.

---

## 📜 License

MIT License © 2025 Dynamite Technology

