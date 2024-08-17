package importer.merge;

import domain.Institution;
import org.apache.commons.lang3.StringUtils;
import repo.InstitutionRepository;
import utils.StringProcessor;
import utils.Tuple;

import java.util.ArrayList;
import java.util.List;

public class InstitutionMergeService extends MergeService<Institution, Integer> {
	public InstitutionMergeService(InstitutionRepository repository) {
		super(repository);
	}

	protected List<Institution> tryAutoReplace(Institution institution) {
		List<Institution> currentSuggestions = new ArrayList<>();
		for (Institution similarInstitution : repository.getByName(institution.getName()))
			if (similarInstitution.getRegion().equals(institution.getRegion())) {
				tryMergeObjects(institution, similarInstitution);
				cache.put(institution, similarInstitution);
				return null;
			}
		return currentSuggestions;
	}

	protected void addMoreSuggestions(Institution institution, List<Institution> currentSuggestions) {
		repository.getAll().stream()
				.filter(x -> !x.getName().contains("Scoala Gimnaziala")
						&& StringProcessor.areSimilar(institution.getName(), x.getName())
						&& institution.getRegion().equals(x.getRegion()))
				.forEach(currentSuggestions::add);
	}

	protected boolean tryAutoHandleSuggestion(Tuple<Institution, List<Institution>> suggestion) {
		for (var suggested : suggestion.second()) {
			Institution original = suggestion.first();
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
		if (replacement.getCity() == null && object.getCity() != null)
			replacement.setCity(object.getCity());
	}
}
