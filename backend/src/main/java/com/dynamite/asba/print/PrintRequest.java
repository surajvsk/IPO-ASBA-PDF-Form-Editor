package com.dynamite.asba.print;

import java.util.ArrayList;
import java.util.List;

public class PrintRequest {

    private String symbol;
    private String type;
    private List<FieldPlacement> coordinates = new ArrayList<>();

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public List<FieldPlacement> getCoordinates() {
        return coordinates;
    }

    public void setCoordinates(List<FieldPlacement> coordinates) {
        this.coordinates = coordinates;
    }
}
