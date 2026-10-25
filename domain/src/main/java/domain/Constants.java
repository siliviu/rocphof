package domain;

import java.util.List;

public final class Constants {
	public static final String CONTEST_ONI = "ONI";
	public static final String CONTEST_ONM = "ONM";
	public static final String CONTEST_LOT = "LOT";

	/**
	 * National olympiads: one sheet per grade, and the only contests whose results
	 * record an institution. Each belongs to one subject, which the rankings use
	 * to tell them apart.
	 */
	public static final List<String> NATIONAL_CONTESTS = List.of(CONTEST_ONI, CONTEST_ONM);

	/**
	 * Which contests a ranking covers. SCOPE_ONI is the national olympiad of the
	 * requested subject (ONI or ONM); the value stays "ONI" because it is part of
	 * the API. INTERNATIONAL covers LOT together with every international contest,
	 * since both are steps on the same path and neither records an institution.
	 */
	public static final String SCOPE_ONI = "ONI";
	public static final String SCOPE_INTERNATIONAL = "INTERNATIONAL";
	public static final String SCOPE_DEFAULT = SCOPE_ONI;

	/**
	 * Subject a contest belongs to. Editions archived before the column existed
	 * have no value stored, so reads fall back to the default.
	 */
	public static final String SUBJECT_INFORMATICS = "Informatics";
	public static final String SUBJECT_MATHS = "Maths";
	public static final String SUBJECT_DEFAULT = SUBJECT_INFORMATICS;

	/**
	 * Not a stored subject: asks the rankings to count every subject together.
	 * Results without an institution are then attributed to the national
	 * olympiad of their own subject, so nothing is counted twice.
	 */
	public static final String SUBJECT_ALL = "All";

	/** Grades taking part in the national olympiad, used as the ONI sheet range. */
	public static final int MIN_GRADE = 5;
	public static final int MAX_GRADE = 12;

	/** LOT selections have no grade, so the column holds the level instead. */
	public static final int LOT_LEVEL_GIRL = 0;
	public static final int LOT_LEVEL_JUNIOR = 1;
	public static final int LOT_LEVEL_SENIOR = 2;

	/**
	 * Columns of the international ranking, in display order. Adding a contest to
	 * the archive does not add a column: it has to be listed here, so the table
	 * keeps a deliberate order rather than whatever the data happens to contain.
	 * EGOI and the girls' LOT are deliberately absent for now; add their keys here
	 * to surface them.
	 */
	public static final String COLUMN_LOT_SENIOR = "Lot Seniori";
	public static final String COLUMN_LOT_JUNIOR = "Lot Juniori";
	public static final String COLUMN_LOT_GIRL = "Lot Fete";

	public static final List<String> INTERNATIONAL_COLUMNS = List.of(
			"IOI", "IMO", "CEOI", "BOI", COLUMN_LOT_SENIOR, "EJOI", "JBOI", COLUMN_LOT_JUNIOR
	);

	/** Columns of maths contests; every other column is informatics. */
	public static final List<String> MATHS_COLUMNS = List.of("IMO");

	/** The international columns of one subject, or of every subject for SUBJECT_ALL. */
	public static List<String> internationalColumns(String subject) {
		if (subject == null || subject.isBlank() || SUBJECT_ALL.equals(subject))
			return INTERNATIONAL_COLUMNS;
		boolean maths = SUBJECT_MATHS.equals(subject);
		return INTERNATIONAL_COLUMNS.stream().filter(c -> MATHS_COLUMNS.contains(c) == maths).toList();
	}

	/**
	 * Columns that award no medals, so only their participation count is worth
	 * showing. The LOT selections are attendance, not a podium.
	 */
	public static final List<String> PARTICIPATION_ONLY_COLUMNS = List.of(
			COLUMN_LOT_SENIOR, COLUMN_LOT_JUNIOR, COLUMN_LOT_GIRL
	);

	public static boolean awardsMedals(String columnKey) {
		return !PARTICIPATION_ONLY_COLUMNS.contains(columnKey);
	}

	/**
	 * Column a result belongs to. LOT is split by level, since senior and junior
	 * selections are ranked as separate columns; every other contest is its own
	 * column. Returns null for results that no listed column covers.
	 */
	public static String columnKeyOf(String contestName, int level) {
		if (contestName == null)
			return null;
		String key = CONTEST_LOT.equals(contestName)
				? switch (level) {
					case LOT_LEVEL_SENIOR -> COLUMN_LOT_SENIOR;
					case LOT_LEVEL_JUNIOR -> COLUMN_LOT_JUNIOR;
					case LOT_LEVEL_GIRL -> COLUMN_LOT_GIRL;
					default -> null;
				}
				: contestName;
		return key != null && INTERNATIONAL_COLUMNS.contains(key) ? key : null;
	}

	public static final String INSTITUTION_UNKNOWN = "Unknown";
	public static final int SCHOOL_YEAR_UNKNOWN = 1337;

	private Constants() {}
}
