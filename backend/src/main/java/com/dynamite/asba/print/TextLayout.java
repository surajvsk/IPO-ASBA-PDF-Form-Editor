package com.dynamite.asba.print;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public final class TextLayout {

    private static final Map<Character, Integer> WIDTHS = new HashMap<>();

    static {
        define(" ", 278);
        define("!", 278);
        define("\"", 355);
        define("#$0123456789", 556);
        define("%", 889);
        define("&", 667);
        define("'", 191);
        define("(),./:;[]\\", 278);
        define("*", 389);
        define("+<=>", 584);
        define("-", 333);
        define("?", 556);
        define("@", 1015);
        define("AB", 667);
        define("C", 722);
        define("D", 722);
        define("E", 667);
        define("F", 611);
        define("G", 778);
        define("H", 722);
        define("I", 278);
        define("J", 500);
        define("K", 667);
        define("L", 556);
        define("M", 833);
        define("N", 722);
        define("O", 778);
        define("P", 667);
        define("Q", 778);
        define("R", 722);
        define("S", 667);
        define("T", 611);
        define("U", 722);
        define("V", 667);
        define("W", 944);
        define("X", 667);
        define("Y", 667);
        define("Z", 611);
        define("^", 469);
        define("_", 556);
        define("`", 333);
        define("a", 556);
        define("b", 556);
        define("c", 500);
        define("d", 556);
        define("e", 556);
        define("f", 278);
        define("g", 556);
        define("h", 556);
        define("ijl", 222);
        define("k", 500);
        define("m", 833);
        define("n", 556);
        define("o", 556);
        define("p", 556);
        define("q", 556);
        define("r", 333);
        define("s", 500);
        define("t", 278);
        define("u", 556);
        define("v", 500);
        define("w", 722);
        define("x", 500);
        define("y", 500);
        define("z", 500);
        define("{", 334);
        define("|", 260);
        define("}", 334);
        define("~", 584);
    }

    private TextLayout() {
    }

    public static List<String> wrap(String value, float fontSize, float gap, float breakWidth, boolean bold) {
        List<String> lines = new ArrayList<>();
        if (value == null || value.isEmpty()) {
            return lines;
        }
        float size = fontSize > 0 ? fontSize : 12f;
        float spacing = Math.max(0f, gap);
        float scale = bold ? 1.08f : 1f;
        if (breakWidth <= 0 || width(value, size, spacing) * scale <= breakWidth + 0.05f) {
            lines.add(value);
            return lines;
        }

        String rest = value;
        while (!rest.isEmpty()) {
            if (width(rest, size, spacing) * scale <= breakWidth + 0.05f) {
                lines.add(rest);
                break;
            }
            int cut = 1;
            for (int index = 1; index <= rest.length(); index++) {
                if (width(rest.substring(0, index), size, spacing) * scale <= breakWidth + 0.05f) {
                    cut = index;
                } else {
                    break;
                }
            }
            int space = rest.lastIndexOf(' ', cut);
            if (space > 0) {
                lines.add(rest.substring(0, space));
                rest = rest.substring(space + 1);
            } else {
                lines.add(rest.substring(0, cut));
                rest = rest.substring(cut);
            }
        }
        return lines;
    }

    private static float width(String text, float fontSize, float gap) {
        int units = 0;
        for (int index = 0; index < text.length(); index++) {
            units += WIDTHS.getOrDefault(text.charAt(index), 500);
        }
        return (units / 1000f) * fontSize + Math.max(0, text.length() - 1) * gap;
    }

    private static void define(String chars, int width) {
        for (int index = 0; index < chars.length(); index++) {
            WIDTHS.put(chars.charAt(index), width);
        }
    }
}
