package merge;

import domain.Person;
import domain.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import repo.PersonRepository;
import repo.ResultRepository;
import utils.StringProcessor;
import utils.Tuple;

import java.util.ArrayList;
import java.util.Collections;
import java.util.IdentityHashMap;
import java.util.List;
import java.util.Objects;
import java.util.Set;

import static domain.Constants.NATIONAL_CONTESTS;
import static domain.Constants.SCHOOL_YEAR_UNKNOWN;

@Service
public class PersonMergeService extends MergeService<Person, Integer> {
	/* By identity: namesakes are equal as Person values but are different people. */
	private final Set<Person> manualOnly = Collections.newSetFromMap(new IdentityHashMap<>());
	@Autowired
	private ResultRepository resultRepository;

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
		/* Candidates the results rule out are rejected without asking. */
		suggestionList.second().removeIf(candidate -> {
			boolean conflict = cannotBeSamePerson(suggestionList.first(), candidate);
			if (conflict)
				logger.info("Rejected suggestion {} for {}: same contest, or same year in another county",
						candidate, suggestionList.first());
			return conflict;
		});
		if (suggestionList.second().isEmpty()) {
			manualOnly.remove(suggestionList.first());
			return true;
		}
		/* The candidates share the person's exact name and school year, so the
		   rules below cannot tell them apart; only the user can. */
		if (manualOnly.contains(suggestionList.first()))
			return false;
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
						!Objects.equals(originalResult.getContest().getId(), suggestedResult.getContest().getId()) &&
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

	/**
	 * Asks the user whether a person the importer created is one of the given
	 * candidates. Used for namesakes the importer could not match on its own;
	 * these are never merged automatically.
	 */
	public void addManualSuggestion(Person person, List<Person> candidates) {
		suggestions.add(new Tuple<>(person, new ArrayList<>(candidates)));
		manualOnly.add(person);
	}

	/**
	 * Two people are certainly different if both appear in the same national
	 * olympiad (ONI, ONM), or if in one year they sat national olympiads in
	 * different counties.
	 *
	 * The school is not compared: in the archive every one of the 25 people at
	 * ONI and ONM in the same year under different schools is one child, listed
	 * once under a school and once under a county excellence centre or club,
	 * under a school they moved to, or under a duplicate record of the same
	 * school. All 25 were in the same county both times.
	 *
	 * Only finds anything once the import's results are stored, so the check
	 * in beginMerge passes everything and the one after addProcessedData acts.
	 */
	private boolean cannotBeSamePerson(Person a, Person b) {
		List<Result> national = resultRepository.getResultsByPerson(b.getId()).stream()
				.filter(PersonMergeService::isNational)
				.toList();
		if (national.isEmpty())
			return false;
		for (Result x : resultRepository.getResultsByPerson(a.getId())) {
			if (!isNational(x))
				continue;
			for (Result y : national) {
				if (Objects.equals(x.getContest().getId(), y.getContest().getId()))
					return true;
				if (x.getContest().getYear() == y.getContest().getYear()
						&& x.getInstitution() != null && y.getInstitution() != null
						&& !Objects.equals(x.getInstitution().getRegion(), y.getInstitution().getRegion()))
					return true;
			}
		}
		return false;
	}

	private static boolean isNational(Result result) {
		return NATIONAL_CONTESTS.contains(result.getContest().getName());
	}

	@Override
	public void handleSuggestions(List<Integer> replies) throws Exception {
		super.handleSuggestions(replies);
		manualOnly.clear();
	}
}
