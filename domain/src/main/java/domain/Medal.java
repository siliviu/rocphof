package domain;

public enum Medal {
	GOLD, SILVER, BRONZE;

	public static Medal fromString(String s) {
		if (s.equals("Aur"))
			return GOLD;
		if (s.equals("Argint"))
			return SILVER;
		if (s.equals("Bronz"))
			return BRONZE;
		return null;
	}
}
