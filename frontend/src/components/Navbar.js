import React from "react";

const Navbar = ({ page }) => {
  return (
    <header className="editor-header">
      <a className="brand" href="#/">
        IPO ASBA PDF Form Editor
      </a>
      <nav className="editor-nav" aria-label="Main">
        <a className={page === "editor" ? "active" : ""} href="#/">
          Editor
        </a>
        <a className={page === "instructions" ? "active" : ""} href="#/instructions">
          Instructions
        </a>
      </nav>
    </header>
  );
};

export default Navbar;
