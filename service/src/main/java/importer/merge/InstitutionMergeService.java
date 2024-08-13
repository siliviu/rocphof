package importer.merge;

import domain.Institution;
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
			if (StringProcessor.areSimilar(similarInstitution.getRegion(), institution.getRegion())) {
				cache.put(institution, similarInstitution);
				if (!similarInstitution.getRegion().equals(institution.getRegion()))
					logger.warn(similarInstitution.getRegion() + " vs " + institution.getRegion() + "|" + institution.getName());
				return null;
			} else {
				currentSuggestions.add(similarInstitution);
			}
		return currentSuggestions;
	}

	protected void addMoreSuggestions(Institution institution, List<Institution> currentSuggestions) {
		repository.getAll().stream()
				.filter(x -> StringProcessor.areSimilar(institution.getName(), x.getName()) &&
						StringProcessor.areSimilar(institution.getRegion(), x.getRegion()))
				.forEach(currentSuggestions::add);
	}

	private Institution uglifyInstitution(Institution institution) {
		Institution ans = new Institution(StringProcessor.uglifyString(institution.getRegion()), StringProcessor.uglifyString(institution.getCity()), StringProcessor.uglifyString(institution.getName()));
		ans.tryFix();
		return ans;
	}

	protected boolean tryAutoHandleSuggestion(Tuple<Institution, List<Institution>> suggestion) {
		for (var suggested : suggestion.second()) {
			Institution original = suggestion.first();
			if (uglifyInstitution(original).equals(suggested)) {
				replace(suggested, original);
				return true;
			} else if (uglifyInstitution(suggested).equals(original)) {
				replace(original, suggested);
				return true;
			}
		}
		return false;
	}
}
