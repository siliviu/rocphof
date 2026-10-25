package utils;

import merge.MergeService;
import org.apache.commons.lang3.StringUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.text.Normalizer;
import java.util.*;

import static java.util.Map.entry;
import static org.apache.commons.lang3.math.NumberUtils.min;

public class StringProcessor {
	protected static final Logger logger = LogManager.getLogger(MergeService.class.getName());

	public static int editDistance(String source, String target) {
		int sourceLength = source.length();
		int targetLength = target.length();

		int[][] distance = new int[sourceLength + 1][targetLength + 1];

		for (int i = 0; i <= sourceLength; i++)
			distance[i][0] = i;
		for (int j = 0; j <= targetLength; j++)
			distance[0][j] = j;

		for (int i = 1; i <= sourceLength; i++)
			for (int j = 1; j <= targetLength; j++) {
				int cost = source.charAt(i - 1) == target.charAt(j - 1) ? 0 : 1;

				distance[i][j] = Math.min(Math.min(
								distance[i - 1][j] + 1,
								distance[i][j - 1] + 1),
						distance[i - 1][j - 1] + cost);

				if (i > 1 && j > 1 &&
						source.charAt(i - 1) == target.charAt(j - 2) &&
						source.charAt(i - 2) == target.charAt(j - 1)) {
					distance[i][j] = Math.min(distance[i][j], distance[i - 2][j - 2] + cost);
				}
			}

		return distance[sourceLength][targetLength];
	}

	public static boolean areSimilar(String a, String b) {
		return a.contains(b) || b.contains(a) || editDistance(a, b) <= min(min(a.length(), b.length()) / 3, 5);
	}

	public static boolean namesAreStrictlySimilar(String a, String b) {
		if (a.startsWith(b) || b.startsWith(a))
			return true;
		String normalisedA = normalise(a.replace("-", " "));
		String normalisedB = normalise(b.replace("-", " "));
		int editDistance = editDistance(normalisedA, normalisedB);
		if (editDistance <= 1)
			return true;
		var namesA = new java.util.ArrayList<>(Arrays.stream(normalisedA.split(" ")).toList());
		var namesB = new java.util.ArrayList<>(Arrays.stream(normalisedB.split(" ")).toList());
		if (!namesA.remove(0).equals(namesB.remove(0)))
			return false;
		if (editDistance == 2)
			return true;
		namesA.sort(String::compareTo);
		namesB.sort(String::compareTo);
		return Collections.indexOfSubList(namesA, namesB) != -1 || Collections.indexOfSubList(namesB, namesA) != -1;
	}

	private static boolean partialListMatch(List<String> namesA, List<String> namesB) {
		int prefixCount = 0;

		for (String nameA : namesA) {
			boolean matchFound = false;
			for (String nameB : namesB) {
				if (nameA.equals(nameB)) {
					matchFound = true;
					break;
				} else if (nameB.startsWith(nameA)) {
					if (prefixCount == 0) {
						prefixCount++;
						matchFound = true;
						break;
					} else {
						return false;
					}
				}
			}
			if (!matchFound) {
				return false;
			}
		}
		return true;
	}

	public static boolean namesAreSearchSimilar(String a, String b) {
		if (a.startsWith(b) || b.startsWith(a))
			return true;
		String normalisedA = normalise(a.replace("-", " "));
		String normalisedB = normalise(b.replace("-", " "));
		int editDistance = editDistance(normalisedA, normalisedB);
		if (editDistance <= 1)
			return true;
		var namesA = new java.util.ArrayList<>(Arrays.stream(normalisedA.split(" ")).toList());
		var namesB = new java.util.ArrayList<>(Arrays.stream(normalisedB.split(" ")).toList());
		if (editDistance == 2)
			return true;
		namesA.sort(String::compareTo);
		namesB.sort(String::compareTo);
		return partialListMatch(namesA, namesB) || partialListMatch(namesB, namesA);
	}

	public static String uglifyString(String string) {
		String stripped = string
				.replace("\"", " ")
				.replace("-", " ")
				.replace(".", " ");          // was replace("\\.", ""): a literal backslash-dot, so dots were never removed
		stripped = Normalizer.normalize(stripped, Normalizer.Form.NFD).replaceAll("\\p{M}", "");
		return StringUtils.normalizeSpace(stripped);
	}

	public static boolean institutionsAreStrictlySimilar(String a, String b) {
		a = uglifyString(a);
		b = uglifyString(b);
		if (a.contains("Nr") || a.contains("Scoala Gimnaziala"))
			return a.equals(b);
		if (editDistance(a, b) == 1)
			logger.warn("{} similar with {}", a, b);
		return editDistance(a, b) <= 1;
	}

	public static String normalisePrize(String s) {
		return normalise(s)
				.replace("Premiul", "").replace("Premiu", "")
				.replace("Al", "")
				.replace("-", "")
				.replace("Lea", "")
				.replace("entiune", "")
				.replace("MEN", "")
				.replace("1", "I")
				.replace("2", "II")
				.replace("3", "III")
				.trim()
				.toUpperCase();
	}

	public static String toTitleCase(String content) {
		if (content == null || content.isEmpty())
			return content;
		HashSet<Character> splitSet = new HashSet<>(Arrays.asList(' ', '-', '\'', '\"', '.'));
		char[] titleCased = new char[content.length()];
		for (int i = 0; i < content.length(); i++) {
			boolean applyTitleCase = i == 0 || splitSet.contains(content.charAt(i - 1));
			char targetChar = content.charAt(i);
			titleCased[i] = applyTitleCase ? Character.toTitleCase(targetChar) : Character.toLowerCase(targetChar);
		}
		return new String(titleCased);
	}

	/**
	 * Title case lowers Roman numerals ("I-VIII" became "I-Viii"); put them back.
	 * Only whole words that are valid numerals up to XXXIX, and of two letters
	 * or more, since a lone "I" or "V" is already upper case.
	 */
	static String romanNumeralsUpper(String s) {
		java.util.regex.Matcher m = java.util.regex.Pattern
				.compile("(?<![\\p{L}])(?i:x{0,3}(?:ix|iv|v?i{0,3}))(?![\\p{L}])").matcher(s);
		StringBuilder out = new StringBuilder();
		while (m.find())
			m.appendReplacement(out, m.group().length() >= 2 ? m.group().toUpperCase() : m.group());
		m.appendTail(out);
		return out.toString();
	}

	public static String normaliseInstitution(String institutionName) {
		/* Some lists type the low opening quote „ as two commas (,,Mihai Viteazul”),
		   or put a stray comma before it (,„Frații Buzești"). Read as commas they
		   would cut the name before its quoted part. A comma before a plain quote
		   still ends the name, since there it separates a suffix
		   (Racoviță,"Hai la Olimpiada"). Curly quotes are unified here too, so a
		   quote glued to the previous word (Național„Silvania”) gets its space
		   from the regex below. Two apostrophes (''Andrei Șaguna'') are one quote;
		   read as two they left an empty "" as the whole name. */
		institutionName = institutionName.replace("''", "\"")
				.replaceAll(",+„", "„")
				.replace(",,", "\"")
				.replaceAll("[”“„]", "\"");
		if (institutionName.contains("/") || institutionName.contains(",") || institutionName.contains(";")) {
			if (institutionName.contains("/"))
				institutionName = institutionName.substring(0, institutionName.indexOf('/'));
			if (institutionName.contains(","))
				institutionName = institutionName.substring(0, institutionName.indexOf(','));
			if (institutionName.contains(";"))
				institutionName = institutionName.substring(0, institutionName.indexOf(';'));
		}
		/* Abbreviations, matched as whole words in any case: the sources write
		   "GH. VRÂNCEANU" and "nr 56" as often as "Gh." and "Nr". "C. N" is
		   "Colegiul National" only when the N stands alone; inside a name ("C.
		   Negruzzi", "C. Negri") it once made "Colegiul Nationalegruzzi". */
		institutionName = institutionName.replaceAll("(?<=[^ ])\"(?!(\\s|$))", " \"")
				.replaceAll("\\.(?=[^ ])", ". ")
				.replaceAll("(?i)\\bNr\\.?\\s*(?=\\d)", "Nr. ")
				.replaceAll("(?i)\\bNr\\b(?!\\.)", "Nr.")
				.replaceAll("(?i)\\bC\\. N\\b\\.?", "Colegiul National")
				.replaceAll("(?i)\\bCn\\b", "Colegiul National")
				.replaceAll("(?i)\\bL\\. T\\.", "Liceul Teoretic")
				.replaceAll("(?i)\\bS\\. G\\.", "Scoala Gimnaziala")
				.replaceAll("(?i)\\bAl\\.", "Alexandru")
				.replaceAll("(?i)\\bGh\\.", "Gheorghe")
				.replaceAll("(?i)\\bSf\\.", "Sfantul")
				.replaceAll("(?i)\\bI\\. L\\.", "Ion Luca")
				.replaceAll("(?i)\\bGr\\.", "Grigore");
		institutionName = normaliseDash(institutionName.replace('\'', '"'));
		institutionName = romanNumeralsUpper(institutionName);
		/* "Scoala cu clasele I-VIII" and "Scoala generala" are the old names of
		   today's Scoala Gimnaziala, and the archive stores them under that. */
		institutionName = institutionName
				.replaceFirst("^(Scoala|Sc\\.?) (Cu C[k]?lase(le)?|Cu Cls\\.?)( I ?-? ?VIII+)*(?= |$)", "Scoala Gimnaziala")
				.replaceFirst("^(Scoala|Sc\\.?) (Generala|Gen\\.)(?= |$)", "Scoala Gimnaziala");
		if (institutionName.contains("\"") && institutionName.substring(institutionName.indexOf("\"") + 1).contains("\""))
			institutionName = institutionName.substring(0, institutionName.indexOf("\"", institutionName.indexOf("\"") + 1) + 1);
		institutionName = institutionName.replaceAll("\\s+\"$", "\"");
		/* Liceul Teoretic Internațional de Informatică (Bucharest, and its
		   Constanța branch; the region tells them apart) is also listed without
		   "Teoretic", or as ICHB, its English initials (ICHB Colentina too). The
		   Cluj "Liceul Internațional de Informatică Spectrum" is another school. */
		if (institutionName.equals("Liceul International De Informatica") || institutionName.matches("Ichb( .*)?"))
			return "Liceul Teoretic International De Informatica";
		return institutionName;
	}


	public static String normaliseChild(String childName) {
		String spaced = childName
				.replaceAll("[‐‑–—]", "-")
				.replace('\u0130', 'I')
				.replaceAll("\\.(?=\\p{L})", ". ");
		String[] words = StringUtils.normalizeSpace(spaced).split(" ");
		List<String> kept = new ArrayList<>();
		kept.add(words[0].replaceAll("\\.+$", ""));
		for (int i = 1; i < words.length; ++i)
			if (!isInitials(words[i], i == words.length - 1))
				kept.add(words[i]);
		return normaliseDash(String.join(" ", kept));
	}

	private static boolean isInitials(String word, boolean last) {
		if (word.contains("."))
			return word.matches("[\\p{L}.\\-]+")
					&& Arrays.stream(word.split("[.\\-]+")).allMatch(part -> part.length() <= 2);
		if (word.length() == 1)
			return Character.isLetter(word.charAt(0));
		return word.length() == 2 && !last && word.chars().allMatch(Character::isLetter);
	}

	public static String normaliseRegion(String region) {
		region = normaliseDash(region)
				.replace(", ", "")
				.replaceAll("[0-9]", "")
				.trim();
		if (region.contains("Sector") || region.contains("sector"))
			return "Bucuresti";
		if (region.endsWith("-"))
			region = region.replace("-", "")
					.trim();
		List<Map.Entry<String, String>> map = List.of(
				entry("AB", "Alba"),
				entry("AR", "Arad"),
				entry("AG", "Arges"),
				entry("BC", "Bacau"),
				entry("BH", "Bihor"),
				entry("BN", "Bistrita-Nasaud"),
				entry("BT", "Botosani"),
				entry("BR", "Braila"),
				entry("BV", "Brasov"),
				entry("BZ", "Buzau"),
				entry("CL", "Calarasi"),
				entry("CS", "Caras-Severin"),
				entry("CJ", "Cluj"),
				entry("CT", "Constanta"),
				entry("CV", "Covasna"),
				entry("DB", "Dambovita"),
				entry("DJ", "Dolj"),
				entry("GL", "Galati"),
				entry("GR", "Giurgiu"),
				entry("GJ", "Gorj"),
				entry("HR", "Harghita"),
				entry("HD", "Hunedoara"),
				entry("IL", "Ialomita"),
				entry("IS", "Iasi"),
				entry("IF", "Ilfov"),
				entry("MM", "Maramures"),
				entry("MH", "Mehedinti"),
				entry("MS", "Mures"),
				entry("NT", "Neamt"),
				entry("OT", "Olt"),
				entry("PH", "Prahova"),
				entry("SJ", "Salaj"),
				entry("SM", "Satu Mare"),
				entry("SB", "Sibiu"),
				entry("SV", "Suceava"),
				entry("TR", "Teleorman"),
				entry("TM", "Timis"),
				entry("TL", "Tulcea"),
				entry("VL", "Valcea"),
				entry("VS", "Vaslui"),
				entry("VN", "Vrancea"),
				entry("B", "Bucuresti")
		);
		for (var entry : map)
			if (region.toUpperCase().equals(entry.getKey()))
				return normalise(entry.getValue());
		String finalRegion = region;
		return map.stream()
				.map(Map.Entry::getValue)
				.min(Comparator.comparingInt(x -> editDistance(finalRegion, x)))
				.get();
	}

	public static String normaliseDash(String name) {
		name = StringUtils.normalizeSpace(name)
				.replace(" -", "-")
				.replace("- ", "-");
		return normalise(name);
	}

	public static String normalise(String s) {
		return toTitleCase(StringUtils.normalizeSpace(s)
				.trim()
				.toLowerCase()
				.replaceAll("[”“’„]", "\"")
				.replaceAll("\" ", "\"")
				.replace("˜", "")
				.replace("ş", "ș")
				.replace("Ş", "Ș")
				.replace("ţ", "ț")
				.replace("Ţ", "Ț")
				.replace("ã", "a")
				.replace("ă", "a").replace("Ă", "A")
				.replace("â", "a").replace("Â", "A")
				.replace("î", "i").replace("Î", "I")
				.replace("ș", "s").replace("Ș", "S")
				.replace("ț", "t").replace("Ț", "T")
		);
	}
}
