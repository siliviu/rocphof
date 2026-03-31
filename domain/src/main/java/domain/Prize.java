package domain;

public enum Prize {
	FIRST, SECOND, THIRD, MENTION;

	public static Prize fromString(String s) {
        return switch (s) {
            case "I" -> FIRST;
            case "II" -> SECOND;
            case "III" -> THIRD;
            case "M" -> MENTION;
            default -> null;
        };
    }
}
