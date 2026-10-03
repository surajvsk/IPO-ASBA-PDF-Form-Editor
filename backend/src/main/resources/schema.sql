CREATE TABLE IF NOT EXISTS layout (
    symbol TEXT NOT NULL,
    form_type TEXT NOT NULL,
    fields_json TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    PRIMARY KEY (symbol, form_type)
);
