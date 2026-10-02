export const SYMBOLS = ["ARUNAYA", "ATHER", "MANOJJEWEL"];

export const FORM_TYPES = [
  { value: "PRINTED_FORM", label: "Printed form" },
  { value: "BLANK_FORM", label: "Blank form" },
];

const WIDTH = {};

function defineWidth(chars, width) {
  for (const char of chars) WIDTH[char] = width;
}

defineWidth(" ", 278);
defineWidth("!", 278);
defineWidth('"', 355);
defineWidth("#$0123456789", 556);
defineWidth("%", 889);
defineWidth("&", 667);
defineWidth("'", 191);
defineWidth("(),./:;[]\\", 278);
defineWidth("*", 389);
defineWidth("+<=>", 584);
defineWidth("-", 333);
defineWidth("?", 556);
defineWidth("@", 1015);
defineWidth("AB", 667);
defineWidth("C", 722);
defineWidth("D", 722);
defineWidth("E", 667);
defineWidth("F", 611);
defineWidth("G", 778);
defineWidth("H", 722);
defineWidth("I", 278);
defineWidth("J", 500);
defineWidth("K", 667);
defineWidth("L", 556);
defineWidth("M", 833);
defineWidth("N", 722);
defineWidth("O", 778);
defineWidth("P", 667);
defineWidth("Q", 778);
defineWidth("R", 722);
defineWidth("S", 667);
defineWidth("T", 611);
defineWidth("U", 722);
defineWidth("V", 667);
defineWidth("W", 944);
defineWidth("X", 667);
defineWidth("Y", 667);
defineWidth("Z", 611);
defineWidth("^", 469);
defineWidth("_", 556);
defineWidth("`", 333);
defineWidth("a", 556);
defineWidth("b", 556);
defineWidth("c", 500);
defineWidth("d", 556);
defineWidth("e", 556);
defineWidth("f", 278);
defineWidth("g", 556);
defineWidth("h", 556);
defineWidth("ijl", 222);
defineWidth("k", 500);
defineWidth("m", 833);
defineWidth("n", 556);
defineWidth("o", 556);
defineWidth("p", 556);
defineWidth("q", 556);
defineWidth("r", 333);
defineWidth("s", 500);
defineWidth("t", 278);
defineWidth("u", 556);
defineWidth("v", 500);
defineWidth("w", 722);
defineWidth("x", 500);
defineWidth("y", 500);
defineWidth("z", 500);
defineWidth("{", 334);
defineWidth("|", 260);
defineWidth("}", 334);
defineWidth("~", 584);

const SAMPLE_VALUES = [
  ["ApplicationNo1", "55556666"],
  ["ApplicationNo2", "55556666"],
  ["ApplicationNo3", "55556666"],
  ["email1", "youremail@domain.com"],
  ["email2", "youremail@domain.com"],
  ["MobileNo1", "1112227778"],
  ["MobileNo2", "1112227778"],
  ["ApplicantName1", "Dynamite Technology Private Limited"],
  ["ApplicantName2", "Dynamite Technology Private Limited"],
  ["ApplicantName3", "Dynamite Technology Private Limited"],
  ["amount1", "100000"],
  ["amount2", "100000"],
  ["no_of_bid1", "50"],
  ["no_of_bid2", "50"],
  ["bid_price1", "500"],
  ["bid_price2", "500"],
  ["amount_in_word", "Five Thousand ninty nine"],
  ["dpid1", "IN12345678950"],
  ["dpid2", "IN12345678950"],
  ["panNo1", "AYCPV8888G"],
  ["panNo2", "AYCPV8888G"],
  ["UPI", "dynamitetechnology@icicibank"],
];

export function layoutStorageKey(symbol, formType) {
  return `asba-layout:${symbol.trim()}:${formType}`;
}

export function createField(partial = {}) {
  const id = partial.id || (globalThis.crypto?.randomUUID ? crypto.randomUUID() : `field-${Date.now()}-${Math.random()}`);
  return {
    id,
    key: String(partial.key || "field").trim() || "field",
    value: partial.value == null ? "" : String(partial.value),
    x: Number.isFinite(Number(partial.x)) ? Number(partial.x) : 72,
    y: Number.isFinite(Number(partial.y)) ? Number(partial.y) : 700,
    page: Math.max(1, Number(partial.page) || 1),
    fontSize: Math.max(1, Number(partial.fontSize) || 11),
    gap: Math.max(0, Number(partial.gap) || 0),
    cellWidth: Math.max(0, Number(partial.cellWidth) || 0),
    fontWeight: Number(partial.fontWeight) >= 600 ? 700 : 400,
    breakWidth: Math.max(0, Number(partial.breakWidth) || 0),
    isActive: partial.isActive !== undefined ? Boolean(partial.isActive) : true,
  };
}

export function sampleFields() {
  return SAMPLE_VALUES.map(([key, value], index) =>
    createField({
      key,
      value,
      x: 206,
      y: 740 - index * 32,
      page: 1,
      fontSize: 11,
      isActive: false,
    })
  );
}

export function toPrintField(field) {
  return {
    key: field.key,
    x: field.x,
    y: field.y,
    value: field.value,
    fontSize: field.fontSize,
    gap: field.gap,
    cellWidth: field.cellWidth,
    fontWeight: field.fontWeight >= 600 ? 700 : 400,
    breakWidth: field.breakWidth,
    page: Math.max(1, Math.round(Number(field.page) || 1)),
  };
}

function textWidth(text, fontSize, gap) {
  let units = 0;
  for (const char of text) units += WIDTH[char] ?? 500;
  return (units / 1000) * fontSize + Math.max(0, text.length - 1) * gap;
}

export function wrapLines(field) {
  const text = String(field.value ?? "");
  if (!text) return [];
  const limit = Number(field.breakWidth) || 0;
  const fontSize = Math.max(1, Number(field.fontSize) || 11);
  const gap = Math.max(0, Number(field.gap) || 0);
  const scale = Number(field.fontWeight) >= 600 ? 1.08 : 1;
  if (limit <= 0) return [text];

  const fits = (chunk) => textWidth(chunk, fontSize, gap) * scale <= limit + 0.05;
  const lines = [];
  let rest = text;
  while (rest) {
    if (fits(rest)) {
      lines.push(rest);
      break;
    }
    let cut = 1;
    for (let index = 1; index <= rest.length; index += 1) {
      if (fits(rest.slice(0, index))) cut = index;
      else break;
    }
    const space = rest.lastIndexOf(" ", cut);
    if (space > 0) {
      lines.push(rest.slice(0, space));
      rest = rest.slice(space + 1);
    } else {
      lines.push(rest.slice(0, cut));
      rest = rest.slice(cut);
    }
  }
  return lines;
}
