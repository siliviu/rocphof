package importer.merge;

import domain.Institution;
import domain.Person;
import importer.merge.MergeService;
import repo.PersonRepository;
import utils.StringProcessor;
import utils.Tuple;

import java.util.ArrayList;
import java.util.List;

public class PersonMergeService extends MergeService<Person, Integer> {

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
		repository.getAll().stream()
				.filter(x -> StringProcessor.areStrictlySimilar(x.getName(), person.getName())
						&& Math.abs(x.getSchoolYear() - person.getSchoolYear()) <= 1)
				.forEach(currentSuggestions::add);
	}

	@Override
	protected boolean tryAutoHandleSuggestion(Tuple<Person, List<Person>> suggestionList) {
		for (var suggested : suggestionList.second()) {
			Person original = suggestionList.first();
			if (original.getSchoolYear() == suggested.getSchoolYear()) {
				Institution institution = ((PersonRepository) repository).getMostRecentInstitution(original);
				if (!(institution == null || institution.equals(((PersonRepository) repository).getMostRecentInstitution(suggested))))
					continue;
				if (original.getName().length() > suggested.getName().length() || original.getName().contains("-"))
					replace(suggested, original);
				else
					replace(original, suggested);
				return true;
			}
		}
		return false;
	}

	public Institution getRecentInstitution(Person person) {
		return ((PersonRepository) repository).getMostRecentInstitution(person);
	}
}
