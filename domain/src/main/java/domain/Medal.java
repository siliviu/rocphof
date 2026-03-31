package domain;

public enum Medal {
	GOLD, SILVER, BRONZE;

	public static Medal fromString(String s) {
        return switch (s) {
            case "Aur" -> GOLD;
            case "Argint" -> SILVER;
            case "Bronz" -> BRONZE;
            default -> null;
        };
    }
}
