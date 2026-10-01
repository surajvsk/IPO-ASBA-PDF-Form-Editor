import React, { useEffect, useState } from "react";
import Instructions from "./components/Instructions";
import Navbar from "./components/Navbar";
import PdfEditor from "./components/PdfEditor";

function currentPage() {
  return window.location.hash === "#/instructions" ? "instructions" : "editor";
}

const App = () => {
  const [page, setPage] = useState(currentPage);

  useEffect(() => {
    const onHashChange = () => setPage(currentPage());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return (
    <div className="editor-shell">
      <Navbar page={page} />
      {page === "instructions" ? <Instructions /> : <PdfEditor />}
    </div>
  );
};

export default App;
