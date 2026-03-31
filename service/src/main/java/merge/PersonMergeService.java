package merge;

import domain.Person;
import domain.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import repo.PersonRepository;
import utils.StringProcessor;
import utils.Tuple;

import java.util.ArrayList;
import java.util.List;

import static domain.Constants.SCHOOL_YEAR_UNKNOWN;

@Service
public class PersonMergeService extends MergeService<Person, Integer> {

	@Autowired
	public PersonMergeService(PersonRepository repository) {
		super(repository);
	}

	@Override
	protected List<Person> tryAutoReplace(Person person) {
		for (Person similarPerson : repository.getByName(person.getName()))
			if (person.equals(similarPerson)) {
				cache.put(person, similarPerson);
				return null;
			}
		return new ArrayList<>();
	}

	@Override
	protected void addMoreSuggestions(Person person, List<Person> currentSuggestions) {
		repository.findAll().stream()
				.filter(x -> StringProcessor.namesAreStrictlySimilar(x.getName(), person.getName())
						&& (Math.abs(x.getSchoolYear() - person.getSchoolYear()) <= 1 || person.getSchoolYear() == SCHOOL_YEAR_UNKNOWN))
				.forEach(currentSuggestions::add);
	}

	@Override
	protected boolean tryAutoHandleSuggestion(Tuple<Person, List<Person>> suggestionList) {
		for (var suggested : suggestionList.second()) {
			Person original = suggestionList.first();
			if (original.getSchoolYear() == suggested.getSchoolYear() || (original.getSchoolYear() == SCHOOL_YEAR_UNKNOWN && suggestionList.second().size() == 1)) {
				Result originalResult = ((PersonRepository) repository).getMostRecentResult(original);
				Result suggestedResult = ((PersonRepository) repository).getMostRecentResult(suggested);
				if (original.getSchoolYear() == SCHOOL_YEAR_UNKNOWN) {
					replace(original, suggested);
					return true;
				}
				if ((originalResult != null && suggestedResult != null &&
						!originalResult.getContest().equals(suggestedResult.getContest()) &&
						originalResult.getInstitution().getRegion().equals(suggestedResult.getInstitution().getRegion()))) {
					if (original.getName().length() > suggested.getName().length() || original.getName().contains("-"))
						replace(suggested, original);
					else
						replace(original, suggested);
					return true;
				}
			}
		}
		return false;
	}

	@Override
	protected void tryMergeObjects(Person object, Person replacement) {

	}

	public Result getRecentResult(Person person) {
		return ((PersonRepository) repository).getMostRecentResult(person);
	}
}
