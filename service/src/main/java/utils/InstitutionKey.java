package utils;

import domain.Institution;

import java.text.Normalizer;
import java.util.*;
import java.util.regex.Pattern;

/**
 * A spelling-independent key for a school's name, used to recognise the same
 * school written differently: "Sc. Gen. Nr. 11 \"St. O. Iosif\"" and "Scoala
 * Gimnaziala Nr. 11 \"Stefan Octavian Iosif\"" share the key "sg 11 stefan
 * octavian iosif".
 *
 * Built from the names already in the archive, which supply the given names
 * behind initials: "M. Eminescu" becomes "mihai eminescu" because the archive
 * spells "Mihai Eminescu" in full elsewhere. The kind of school is reduced to
 * one word ("Scoala cu clasele I-VIII", "Scoala generala", "Sc. Gimn." are all
 * "sg", the old names of today's Scoala Gimnaziala), and a town or county
 * written into the name is dropped.
 *
 * The key says nothing about the town: two schools with one key in different
 * towns are different schools ("Scoala Gimnaziala Nr. 1" exists in most of
 * them). {@link #town} and {@link #townsCompatible} handle that side.
 */
public final class InstitutionKey {
	private static final String[][] KINDS = {
			{"colegiul national (de )?informatica", "cni"},
			{"(colegiul|colegiu|col|c) (national|nationa|nat|n)", "cn"},
			{"cn", "cn"},
			{"(liceul|lic|l) (teoretic|teor|t) (international|internat) de informatica", "lii"},
			{"(liceul|lic|l) (teoretic|teor|t)", "lt"},
			{"lt", "lt"},
			{"(liceul|lic) (tehnologic|teh)", "ltehn"},
			{"(colegiul|col) (tehnic|teh)", "ctehn"},
			{"(colegiul|col) (economic|ec)", "cec"},
			{"liceul (international|internat) de informatica", "lii"},
			{"(scoala|sc|s) (gimnaziala|gimn|gim|gimaziala|gimnziala|g|generala|gen)( gimnaziala)*( cu clasele| cu cklasele| cu clase| cu cls)?( i viiii| i viii| i vii| 1 8)*", "sg"},
			{"(scoala|sc) (cu clasele|cu cklasele|cu clase|cu cls|cls)( i viiii| i viii| i vii| 1 8)*", "sg"},
			{"liceultehn", "ltehn"},
			{"sg", "sg"},
			{"sc", "sg"},
			{"scoala", "sg"},
			{"liceul", "lic"},
			{"colegiul", "col"},
			{"seminarul teologic", "semt"},
			{"palatul copiilor", "pc"},
	};
	private static final List<Map.Entry<Pattern, String>> KIND_PATTERNS = new ArrayList<>();
	static {
		for (String[] kind : KINDS)
			KIND_PATTERNS.add(Map.entry(Pattern.compile("(?<= )" + kind[0] + "(?= )"), kind[1]));
	}
	private static final Set<String> TYPE_WORDS = Set.of("cn", "lt", "ltehn", "ctehn", "cec", "cni", "lii", "sg", "lic", "col", "semt", "pc");
	private static final Set<String> STOP = Set.of("de", "din", "si", "cu", "pentru", "al", "a", "nr", "numarul",
			"structura", "municipiul", "orasul", "jud", "judetul");
	/** Abbreviated given names longer than an initial. */
	private static final Map<String, String> ABBR = Map.ofEntries(Map.entry("al", "alexandru"), Map.entry("gh", "gheorghe"),
			Map.entry("st", "stefan"), Map.entry("sf", "sfantul"), Map.entry("sfintul", "sfantul"), Map.entry("gr", "grigore"),
			Map.entry("th", "theodor"), Map.entry("dr", "doctor"), Map.entry("mih", "mihail"), Map.entry("const", "constantin"),
			Map.entry("cpt", "capitan"), Map.entry("av", "aviator"), Map.entry("acad", "academician"));
	/** Kinds too common to tell a school by when its town is unknown. */
	private static final Set<String> COMMON_KINDS = Set.of("sg", "lic", "col");
	private static final Map<String, String> TOWN_ALIAS = Map.of("tg", "targu", "tirgu", "targu", "rm", "ramnicu",
			"sf", "sfantu", "sfantul", "sfantu", "dr", "drobeta", "tr", "turnu", "birlad", "barlad", "rosiori", "rosiorii");

	/** (initials, surname) -> the given names spelled in full before it most often. */
	private final Map<String, List<String>> expansions = new HashMap<>();
	/** Towns seen per county, as word lists, to recognise one written into a name. */
	private final Map<String, Set<List<String>>> townsByRegion = new HashMap<>();
	/** Counties each name (a key without its kind word) occurs in. */
	private final Map<String, Set<String>> regionsByName = new HashMap<>();

	public InstitutionKey(Collection<Institution> corpus) {
		Map<String, Map<List<String>, Integer>> seen = new HashMap<>();
		for (Institution institution : corpus) {
			List<String> t = rawTokens(institution.getName());
			for (int i = 0; i < t.size(); i++)
				for (int k = 1; k <= 3 && i - k >= 0; k++) {
					List<String> given = t.subList(i - k, i);
					if (t.get(i).length() <= 2 || !given.stream().allMatch(g -> g.length() > 2 && !TYPE_WORDS.contains(g) && !isNumber(g)))
						continue;
					StringBuilder initials = new StringBuilder();
					given.forEach(g -> initials.append(g.charAt(0)));
					seen.computeIfAbsent(initials + "|" + t.get(i), x -> new HashMap<>()).merge(List.copyOf(given), 1, Integer::sum);
				}
			if (institution.getCity() != null && !institution.getCity().isBlank() && !fold(institution.getCity()).startsWith("sector"))
				townsByRegion.computeIfAbsent(institution.getRegion(), x -> new HashSet<>()).add(words(institution.getCity()));
		}
		seen.forEach((key, counts) -> expansions.put(key, counts.entrySet().stream()
				.max(Map.Entry.<List<String>, Integer>comparingByValue())
				.map(Map.Entry::getKey).orElseThrow()));
		for (Institution institution : corpus) {
			List<String> w = List.of(of(institution).split(" "));
			if (w.size() > 1 && w.stream().noneMatch(InstitutionKey::isNumber))
				regionsByName.computeIfAbsent(String.join(" ", w.subList(1, w.size())), x -> new HashSet<>()).add(institution.getRegion());
		}
	}

	/** Register a school added during an import, so later rows can match it. */
	public void add(Institution institution) {
		if (institution.getCity() != null && !institution.getCity().isBlank() && !fold(institution.getCity()).startsWith("sector"))
			townsByRegion.computeIfAbsent(institution.getRegion(), x -> new HashSet<>()).add(words(institution.getCity()));
	}

	public String of(Institution institution) {
		return of(institution.getName(), institution.getCity(), institution.getRegion());
	}

	public String of(String name, String city, String region) {
		List<String> t = rawTokens(name);
		Set<String> drop = new HashSet<>(placeWords(city));
		drop.addAll(placeWords(region));
		// A town of this county written at the end of the name.
		List<String> nameWords = words(name);
		for (List<String> town : townsByRegion.getOrDefault(region, Set.of()))
			if (!town.isEmpty() && nameWords.size() > town.size()
					&& nameWords.subList(nameWords.size() - town.size(), nameWords.size()).equals(town))
				town.stream().filter(w -> w.length() > 2).forEach(drop::add);

		List<String> out = new ArrayList<>();
		int i = 0;
		while (i < t.size()) {
			int j = i;
			while (j < t.size() && (t.get(j).length() == 1 && Character.isLetter(t.get(j).charAt(0)) || ABBR.containsKey(t.get(j)))
					&& !TYPE_WORDS.contains(t.get(j)))
				j++;
			if (j > i && j < t.size() && t.get(j).length() > 2) {
				StringBuilder initials = new StringBuilder();
				t.subList(i, j).forEach(x -> initials.append(x.charAt(0)));
				List<String> full = expansions.get(initials + "|" + t.get(j));
				boolean fits = full != null;
				for (int k = 0; fits && k < full.size(); k++)
					fits = full.get(k).startsWith(t.get(i + k));
				if (fits)
					out.addAll(full);
				else
					t.subList(i, j).forEach(x -> out.add(ABBR.getOrDefault(x, x)));
				i = j;
				continue;
			}
			out.add(t.get(i).length() > 1 ? ABBR.getOrDefault(t.get(i), t.get(i)) : t.get(i));
			i++;
		}
		out.removeIf(STOP::contains);
		while (out.size() > 2 && drop.contains(out.get(out.size() - 1)))
			out.remove(out.size() - 1);
		return String.join(" ", out);
	}

	/**
	 * Whether a key identifies one school in its county even when a town is
	 * missing: a bare kind ("sg") or a number ("sg 7") does not, nor a common
	 * kind with a name found in other counties too ("sg mihai eminescu").
	 * Bucharest counts as one town.
	 */
	public boolean distinctive(String key, String region) {
		List<String> w = List.of(key.split(" "));
		if (w.size() < 2)
			return false;
		if ("Bucuresti".equals(region))
			return true;
		if (w.stream().anyMatch(InstitutionKey::isNumber))
			return false;
		if (!COMMON_KINDS.contains(w.get(0)))
			return true;
		Set<String> regions = regionsByName.getOrDefault(String.join(" ", w.subList(1, w.size())), Set.of());
		return regions.size() <= 1;
	}

	/**
	 * The school's town: its city, or failing that a town of its county written
	 * at the end of its name ("Scoala Gimnaziala Nr. 1 Videle"), in the form
	 * {@link #town(String)} gives. Empty when neither says.
	 */
	public String townOf(Institution institution) {
		String city = town(institution.getCity());
		if (!city.isEmpty())
			return city;
		List<String> nameWords = words(institution.getName());
		List<String> best = null;
		for (List<String> t : townsByRegion.getOrDefault(institution.getRegion(), Set.of()))
			if (!t.isEmpty() && nameWords.size() > t.size() + 1
					&& nameWords.subList(nameWords.size() - t.size(), nameWords.size()).equals(t)
					&& (best == null || t.size() > best.size()))
				best = t;
		return best == null ? "" : town(String.join(" ", best));
	}

	/**
	 * Whether two keys name one school once the town is known to agree. Equal
	 * keys do; so do the same kind and number where one side leaves out the
	 * name ("sg 7" / "sg 7 octav bancila"), and the same kind and name where one
	 * side leaves out the number ("sg 146 ion gheorghe duca" / "sg ion gheorghe
	 * duca"). A town has one school of a kind by each number and by each name.
	 * Two different numbers, or two different names, are never the same.
	 */
	public static boolean sameSchool(String a, String b) {
		if (a.equals(b))
			return true;
		List<String> wa = List.of(a.split(" ")), wb = List.of(b.split(" "));
		if (wa.size() < 2 || wb.size() < 2 || !wa.get(0).equals(wb.get(0)))
			return false;
		List<String> na = numbers(wa), nb = numbers(wb);
		List<String> ra = rest(wa), rb = rest(wb);
		if (!na.isEmpty() && na.equals(nb))
			return ra.isEmpty() || rb.isEmpty();
		if (!ra.isEmpty() && ra.equals(rb))
			return na.isEmpty() || nb.isEmpty();
		return false;
	}

	private static List<String> numbers(List<String> w) {
		return w.subList(1, w.size()).stream().filter(InstitutionKey::isNumber).toList();
	}

	private static List<String> rest(List<String> w) {
		return w.subList(1, w.size()).stream().filter(x -> !isNumber(x)).toList();
	}

	/**
	 * The key with the kind reduced further, for suggestions only: "Liceul" and
	 * "Liceul Teoretic", "Colegiul" and "Colegiul National" are often one school
	 * written two ways, but not always, so the user decides.
	 */
	public static String loose(String key) {
		String[] w = key.split(" ", 2);
		String kind = switch (w[0]) {
			case "lt" -> "lic";
			case "cn" -> "col";
			default -> w[0];
		};
		return w.length > 1 ? kind + " " + w[1] : kind;
	}

	/** A comparable town: "Tg. Mures" and "Targu-Mures" give "targumures"; a Bucharest sector gives "bucuresti". */
	public static String town(String city) {
		if (city == null)
			return "";
		List<String> w = words(city);
		if (!w.isEmpty() && w.get(0).equals("sector"))
			return "bucuresti";
		StringBuilder b = new StringBuilder();
		w.forEach(x -> b.append(TOWN_ALIAS.getOrDefault(x, x)));
		return b.toString();
	}

	/** Same town, allowing one spelling to stop short ("Drobeta Turnu" / "Drobeta Turnu Severin"). */
	public static boolean townsCompatible(String a, String b) {
		return a.startsWith(b) || b.startsWith(a);
	}

	static String fold(String s) {
		if (s == null)
			return "";
		String n = Normalizer.normalize(s.replace('ş', 'ș').replace('ţ', 'ț').replace('Ş', 'Ș').replace('Ţ', 'Ț'), Normalizer.Form.NFD);
		return n.replaceAll("\\p{M}", "").toLowerCase(Locale.ROOT);
	}

	private static List<String> words(String s) {
		String f = fold(s).replaceAll("[^a-z]+", " ").trim();
		return f.isEmpty() ? new ArrayList<>() : new ArrayList<>(List.of(f.split(" ")));
	}

	private static Set<String> placeWords(String s) {
		Set<String> out = new HashSet<>();
		for (String w : words(s))
			if (w.length() > 2)
				out.add(w);
		return out;
	}

	private static List<String> rawTokens(String name) {
		String s = " " + fold(name).replaceAll("[^a-z0-9]+", " ").trim() + " ";
		for (var kind : KIND_PATTERNS)
			s = kind.getKey().matcher(s).replaceAll(kind.getValue());
		s = s.trim();
		return s.isEmpty() ? new ArrayList<>() : new ArrayList<>(List.of(s.split(" +")));
	}

	private static boolean isNumber(String s) {
		return !s.isEmpty() && s.chars().allMatch(Character::isDigit);
	}
}
