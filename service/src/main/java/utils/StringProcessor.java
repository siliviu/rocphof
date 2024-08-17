package utils;

import importer.merge.MergeService;
import org.apache.commons.lang3.StringUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

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

	public static String uglifyString(String string) {
		return string
				.replace("\"", "")
				.replace("-", " ")
				.replace("\\.", "")
				.trim();
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

	public static String normaliseInstitution(String institutionName) {
		if (institutionName.contains("/") || institutionName.contains(",") || institutionName.contains(";")) {
			if (institutionName.contains("/"))
				institutionName = institutionName.substring(0, institutionName.indexOf('/'));
			if (institutionName.contains(","))
				institutionName = institutionName.substring(0, institutionName.indexOf(','));
			if (institutionName.contains(";"))
				institutionName = institutionName.substring(0, institutionName.indexOf(';'));
		}
		institutionName = institutionName.replaceAll("(?<=[^ ])\"(?!(\\s|$))", " \"")
				.replaceAll("\\.(?=[^ ])", ". ")
				.replaceAll("Nr(?!\\.)", "Nr.")
				.replace("C. N.", "Colegiul National")
				.replace("C. N", "Colegiul National")
				.replace("Cn", "Colegiul National")
				.replace("L. T.", "Liceul Teoretic")
				.replace("S. G.", "Scoala Gimnaziala")
				.replace("Al.", "Alexandru")
				.replace("Gh.", "Gheorghe")
				.replace("Sf.", "Sfantul")
				.replace("I. L.", "Ion Luca")
				.replace("Gr.", "Grigore");
		institutionName = normaliseDash(institutionName.replace('\'', '"'));
		if (institutionName.contains("\"") && institutionName.substring(institutionName.indexOf("\"") + 1).contains("\""))
			institutionName = institutionName.substring(0, institutionName.indexOf("\"", institutionName.indexOf("\"") + 1) + 1);
		return institutionName;
	}


	public static String normaliseChild(String childName) {
		childName = childName
				.replaceAll(" [a-zA-Z]\\.[a-zA-Z] ", "")
				.replaceAll("[A-Z]\\.", "")
				.replaceAll("[a-zA-Z][a-zA-Z]\\.", "")
				.replaceAll(" [a-zA-Z][a-zA-Z] ", "");
		return normaliseDash(childName);
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
				.replace("ă", "a").replace("Ă", "A")
				.replace("â", "a").replace("Â", "A")
				.replace("î", "i").replace("Î", "I")
				.replace("ș", "s").replace("Ș", "S")
				.replace("ț", "t").replace("Ț", "T")
		);
	}
}
