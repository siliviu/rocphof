package merge;

import domain.Institution;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import repo.InstitutionRepository;
import utils.InstitutionKey;
import utils.StringProcessor;
import utils.Tuple;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
public class InstitutionMergeService extends MergeService<Institution, Integer> {
	/** Built from the archive on the first school of an import. */
	private InstitutionKey key;
	private List<Institution> archive;

	@Autowired
	public InstitutionMergeService(InstitutionRepository repository) {
		super(repository);
	}

	private void ensureKey() {
		if (key == null) {
			archive = repository.findAll();
			key = new InstitutionKey(archive);
		}
	}

	/** Schools already in the archive, plus those created earlier in this import. */
	private List<Institution> candidates(String region) {
		Map<Integer, Institution> byId = new LinkedHashMap<>();
		for (Institution institution : archive)
			if (institution.getRegion().equals(region))
				byId.put(institution.getId(), institution);
		for (Institution institution : cache.values())
			if (institution != null && institution.getId() != null && institution.getRegion().equals(region))
				byId.putIfAbsent(institution.getId(), institution);
		return new ArrayList<>(byId.values());
	}

	/** -1: known to be different towns; 1: the same town; 0: one town unknown. */
	private int sameTown(Institution a, Institution b) {
		ensureKey();
		String ta = key.townOf(a), tb = key.townOf(b);
		if (ta.isEmpty() || tb.isEmpty())
			return 0;
		return InstitutionKey.townsCompatible(ta, tb) ? 1 : -1;
	}

	/**
	 * The same school is taken without asking when its key matches (the name up
	 * to spelling: abbreviations, initials, the old "Scoala cu clasele I-VIII",
	 * a town written into the name) and the towns agree. With a town missing on
	 * either side, only a key that names one school in the county is enough.
	 * Two schools with different known towns are never the same, whatever their
	 * names: every town has its "Scoala Gimnaziala Nr. 1".
	 */
	protected List<Institution> tryAutoReplace(Institution institution) {
		ensureKey();
		String k = key.of(institution);
		Institution best = null;
		int bestScore = Integer.MIN_VALUE;
		for (Institution existing : candidates(institution.getRegion())) {
			int town = sameTown(institution, existing);
			String ke = key.of(existing);
			if (town < 0)
				continue;
			/* In the same known town a number or a name may be missing on one
			   side ("Nr. 7" / "Nr. 7 \"Octav Bancila\""); without a town only an
			   equal, distinctive key will do. */
			if (town > 0 ? !InstitutionKey.sameSchool(k, ke) : !(k.equals(ke) && key.distinctive(k, institution.getRegion())))
				continue;
			int score = (town > 0 ? 4 : 0) + (k.equals(ke) ? 2 : 0) + (existing.getName().equals(institution.getName()) ? 1 : 0);
			if (score > bestScore) {
				best = existing;
				bestScore = score;
			}
		}
		if (best != null) {
			tryMergeObjects(institution, best);
			cache.put(institution, best);
			return null;
		}
		return new ArrayList<>();
	}

	/** Similar names in the county are offered, except schools in another known town. */
	protected void addMoreSuggestions(Institution institution, List<Institution> currentSuggestions) {
		String k = key.of(institution);
		for (Institution x : candidates(institution.getRegion())) {
			if (sameTown(institution, x) < 0 || currentSuggestions.contains(x))
				continue;
			String kx = key.of(x);
			if (k.equals(kx) || typo(k, kx) || InstitutionKey.loose(k).equals(InstitutionKey.loose(kx))
					|| StringProcessor.institutionsAreStrictlySimilar(institution.getName(), x.getName())
					|| (!x.getName().contains("Scoala Gimnaziala") && StringProcessor.areSimilar(institution.getName(), x.getName())))
				currentSuggestions.add(x);
		}
		key.add(institution);
	}

	/**
	 * Keys one or two letters apart, with the same kind and the same numbers:
	 * a typo in either spelling ("Contantin Brancusi", "Liviu Reberanu"). Only
	 * ever a suggestion; the user decides.
	 */
	private static boolean typo(String a, String b) {
		String[] wa = a.split(" "), wb = b.split(" ");
		if (wa.length < 2 || wb.length < 2 || !wa[0].equals(wb[0]))
			return false;
		if (!a.replaceAll("[^0-9 ]", "").trim().equals(b.replaceAll("[^0-9 ]", "").trim()))
			return false;
		int d = StringProcessor.editDistance(a, b);
		return d > 0 && d <= Math.max(1, Math.min(a.length(), b.length()) / 10);
	}

	protected boolean tryAutoHandleSuggestion(Tuple<Institution, List<Institution>> suggestion) {
		for (var suggested : suggestion.second()) {
			Institution original = suggestion.first();
			/* The same rule as tryAutoReplace: a near-identical name is not enough
			   on its own when a town is missing ("Scoala Gimnaziala Nr. 1"). This
			   step used to take any such pair, and put pupils in the wrong town. */
			int town = sameTown(original, suggested);
			if (Objects.equals(original.getId(), suggested.getId()) || town < 0
					|| town == 0 && !key.distinctive(key.of(original), original.getRegion()))
				continue;
			if (StringProcessor.institutionsAreStrictlySimilar(original.getName(), suggested.getName())) {
				if (original.getName().length() > suggested.getName().length() ||
						StringUtils.countMatches(original.getName(), "-") > StringUtils.countMatches(suggested.getName(), "-") ||
						StringUtils.countMatches(original.getName(), "\"") > StringUtils.countMatches(suggested.getName(), "\"")) {
					replace(suggested, original);
				} else {
					replace(original, suggested);
				}
				return true;
			}
		}
		return false;
	}

	@Override
	protected void tryMergeObjects(Institution object, Institution replacement) {
		if ((replacement.getCity() == null || replacement.getCity().isEmpty()) && object.getCity() != null)
			replacement.setCity(object.getCity());
	}
}
