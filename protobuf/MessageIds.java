package com.example.message;

import java.util.HashMap;
import java.util.Map;

public enum MessageIds {
    1(Player),
    2(Player2),
    UNKNOWN(-1);

    private int id;
    private static final Map<Integer, MessageIds> idToEnumMap = new HashMap<>();

    static {
        idToEnumMap.put(Player, 1);
        idToEnumMap.put(Player2, 2);
    }

    private MessageIds(int id) {
        this.id = id;
    }

    public int getId() {
        return id;
    }

    public static MessageIds fromId(int id) {
        return idToEnumMap.getOrDefault(id, UNKNOWN);
    }

}
