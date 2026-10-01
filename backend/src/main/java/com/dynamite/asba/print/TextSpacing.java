package com.dynamite.asba.print;

public final class TextSpacing {

    private TextSpacing() {
    }

    public static String apply(String value, int wordspaceCount) {
        if (value == null || value.isEmpty()) {
            return "";
        }
        int count = Math.max(0, wordspaceCount);
        if (count == 0) {
            return value;
        }
        String gap = " ".repeat(count);
        StringBuilder spaced = new StringBuilder(value.length() * (count + 1));
        for (int index = 0; index < value.length(); index++) {
            if (index > 0) {
                spaced.append(gap);
            }
            spaced.append(value.charAt(index));
        }
        return spaced.toString();
    }
}
