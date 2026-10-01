package com.dynamite.asba.print;

public class FieldPlacement {

    private String key;
    private float x;
    private float y;
    private String value;
    private float fontSize = 12f;
    private int wordspaceCount;
    private float gap;
    private int fontWeight = 400;
    private float breakWidth;
    private int page = 1;

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public float getX() {
        return x;
    }

    public void setX(float x) {
        this.x = x;
    }

    public float getY() {
        return y;
    }

    public void setY(float y) {
        this.y = y;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public float getFontSize() {
        return fontSize;
    }

    public void setFontSize(float fontSize) {
        this.fontSize = fontSize;
    }

    public int getWordspaceCount() {
        return wordspaceCount;
    }

    public void setWordspaceCount(int wordspaceCount) {
        this.wordspaceCount = wordspaceCount;
    }

    public float getGap() {
        return gap;
    }

    public void setGap(float gap) {
        this.gap = gap;
    }

    public int getFontWeight() {
        return fontWeight;
    }

    public void setFontWeight(int fontWeight) {
        this.fontWeight = fontWeight;
    }

    public float getBreakWidth() {
        return breakWidth;
    }

    public void setBreakWidth(float breakWidth) {
        this.breakWidth = breakWidth;
    }

    public int getPage() {
        return page;
    }

    public void setPage(int page) {
        this.page = page;
    }
}
