package domain;

public enum Prize {
	FIRST, SECOND, THIRD, MENTION;

	public static Prize fromString(String s) {
		if (s.equals("I"))
			return FIRST;
		if (s.equals("II"))
			return SECOND;
		if (s.equals("III"))
			return THIRD;
		if (s.equals("M"))
			return MENTION;
		return null;
	}
}
