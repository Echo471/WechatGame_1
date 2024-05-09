package com.example.message;

import java.util.HashMap;
import java.util.Map;

public enum MessageIds {
    1(Player1),
    2(Player12),
    3(Player13),
    4(Player14),
    5(Player15),
    6(Player16),
    7(Player17),
    8(Player18),
    9(Player19),
    10(Player110),
    UNKNOWN(-1);

    private int id;
    private static final Map<Integer, MessageIds> idToEnumMap = new HashMap<>();

    static {
        idToEnumMap.put(Player1, 1);
        idToEnumMap.put(Player12, 2);
        idToEnumMap.put(Player13, 3);
        idToEnumMap.put(Player14, 4);
        idToEnumMap.put(Player15, 5);
        idToEnumMap.put(Player16, 6);
        idToEnumMap.put(Player17, 7);
        idToEnumMap.put(Player18, 8);
        idToEnumMap.put(Player19, 9);
        idToEnumMap.put(Player110, 10);
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
