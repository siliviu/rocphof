package importer;

import domain.Contest;
import domain.Institution;
import domain.Person;
import domain.Result;
import merge.InstitutionMergeService;
import merge.PersonMergeService;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import repo.*;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.IdentityHashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.function.Predicate;
import java.util.stream.Collectors;

import static domain.Constants.CONTEST_LOT;
import static domain.Constants.MAX_GRADE;
import static domain.Constants.MIN_GRADE;

@Service
public class AddService {
	private static final Logger logger = LogManager.getLogger(AddService.class.getName());

	@Autowired
	private ContestRepository contestRepository;
	@Autowired
	private ResultRepository resultRepository;
	@Autowired
	private InstitutionMergeService institutionMergeService;
	@Autowired
	private PersonMergeService personMergeService;
	@Autowired
	private PersonRepository personRepository;
	private List<Result> data;
	private Contest contest;
	/* Rows whose person resolveNamesakes chose, by identity of the row. */
	private final Map<Result, Person> resolvedPeople = new IdentityHashMap<>();

	/**
	 * LOT is the only contest without grades or institutions. Every other name
	 * (ONI, ONM, ...) is a national olympiad with one sheet per grade.
	 */
	private static boolean hasInstitutions(Contest contest) {
		return !CONTEST_LOT.equals(contest.getName());
	}

	public void addDataFromFile(String file, Contest contest) {
		this.contest = contest;
		try {
			boolean withInstitutions = hasInstitutions(contest);
			data = withInstitutions ? ParserService.parseONI(file, contest) : ParserService.parseLOT(file);

			List<Institution> institutions = new ArrayList<>();
			if (withInstitutions)
				institutions = data.stream()
						.map(Result::getInstitution)
						.sorted(Comparator.comparing(x -> x.getRegion().length()))
						.distinct()
						.toList();
			if (withInstitutions)
				institutionMergeService.beginMerge(institutions);
			resolvedPeople.clear();
			if (withInstitutions)
				resolveNamesakes();
			/* Namesakes are resolved above; the generic merge keys people by name and
			   school year, so it would fold them back into one person. */
			List<Person> people = data.stream()
					.filter(result -> !resolvedPeople.containsKey(result))
					.map(Result::getPerson)
					.toList();
			personMergeService.beginMerge(people);
			addProcessedData();
			if (withInstitutions)
				institutionMergeService.autoHandleSuggestions();
			personMergeService.autoHandleSuggestions();
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}

	/**
	 * Namesakes: people who share a name and school year, which is all the generic
	 * merge uses to identify someone. They come up two ways: the file has the same
	 * name at two schools in one grade, or the archive already holds two people by
	 * that name. Either way the generic merge would fold them into one person.
	 *
	 * Each such row is matched to an existing person by school, then by county,
	 * with every existing person claimed by at most one row. A row left over gets
	 * a new person, and if unclaimed candidates remain the user is asked.
	 */
	private void resolveNamesakes() {
		HashMap<Institution, Institution> institutionMap = institutionMergeService.getMap();
		Map<Person, List<Result>> byPerson = new LinkedHashMap<>();
		for (Result result : data)
			byPerson.computeIfAbsent(result.getPerson(), k -> new ArrayList<>()).add(result);

		for (var entry : byPerson.entrySet()) {
			Person key = entry.getKey();
			/* Rows at the same school are one person listed twice, not namesakes. */
			Map<Integer, List<Result>> bySchool = new LinkedHashMap<>();
			for (Result result : entry.getValue())
				bySchool.computeIfAbsent(institutionMap.get(result.getInstitution()).getId(), k -> new ArrayList<>()).add(result);
			List<Person> existing = personRepository.getByName(key.getName()).stream()
					.filter(person -> person.getSchoolYear() == key.getSchoolYear())
					.toList();
			if (bySchool.size() < 2 && existing.size() < 2)
				continue;

			logger.warn("Namesakes: {} ({}) appears at {} school(s) in this file, {} in the archive",
					key.getName(), key.getSchoolYear(), bySchool.size(), existing.size());
			Map<Person, Set<Integer>> schoolsOf = new IdentityHashMap<>();
			Map<Person, Set<String>> regionsOf = new IdentityHashMap<>();
			for (Person person : existing) {
				List<Result> history = resultRepository.getResultsByPerson(person.getId());
				schoolsOf.put(person, history.stream().map(Result::getInstitution).filter(Objects::nonNull)
						.map(Institution::getId).collect(Collectors.toSet()));
				regionsOf.put(person, history.stream().map(Result::getInstitution).filter(Objects::nonNull)
						.map(Institution::getRegion).collect(Collectors.toSet()));
			}

			List<Person> unclaimed = new ArrayList<>(existing);
			Map<Integer, Person> assigned = new HashMap<>();
			/* Schools first across all rows, so a county match cannot take a person
			   another row matches by school. */
			for (Integer school : bySchool.keySet())
				claim(unclaimed, person -> schoolsOf.get(person).contains(school))
						.ifPresent(person -> assigned.put(school, person));
			for (var school : bySchool.entrySet()) {
				if (assigned.containsKey(school.getKey()))
					continue;
				String region = institutionMap.get(school.getValue().get(0).getInstitution()).getRegion();
				claim(unclaimed, person -> regionsOf.get(person).contains(region))
						.ifPresent(person -> assigned.put(school.getKey(), person));
			}

			for (var school : bySchool.entrySet()) {
				Person person = assigned.get(school.getKey());
				if (person == null) {
					person = personRepository.add(new Person(key.getName(), key.getSchoolYear()));
					if (!unclaimed.isEmpty())
						personMergeService.addManualSuggestion(person, unclaimed);
					logger.warn("  new person {} for {}", person, school.getValue().get(0).getInstitution());
				} else
					logger.warn("  matched {} for {}", person, school.getValue().get(0).getInstitution());
				for (Result result : school.getValue())
					resolvedPeople.put(result, person);
			}
		}
	}

	/** Removes and returns the only unclaimed person matching, if exactly one does. */
	private static Optional<Person> claim(List<Person> unclaimed, Predicate<Person> matches) {
		List<Person> found = unclaimed.stream().filter(matches).toList();
		if (found.size() != 1)
			return Optional.empty();
		/* By identity: the candidates are all equal as Person values, so
		   remove(Object) would drop whichever comes first, not the one found. */
		Person person = found.get(0);
		unclaimed.removeIf(candidate -> candidate == person);
		return Optional.of(person);
	}

	public void addProcessedData() {
		contest = contestRepository.add(contest);
		HashMap<Institution, Institution> institutionMap = institutionMergeService.getMap();
		HashMap<Person, Person> personMap = personMergeService.getMap();
		for (Result result : data) {
			result.setPerson(resolvedPeople.containsKey(result)
					? resolvedPeople.get(result)
					: personMap.get(result.getPerson()));
			result.setInstitution(hasInstitutions(contest) ?
					institutionMap.get(result.getInstitution()) :
					null);
			result.setContest(contest);
			resultRepository.add(result);
		}
	}

	/**
	 * Folds the qualifier list into the results. Everyone in the results should be
	 * on the qualifier list, so each grade should end with exactly as many entries
	 * as the list had. More means someone in the results was not matched to their
	 * qualifier entry (an unmerged duplicate) or is missing from the list.
	 */
	public void mergeQualified(Integer qualifiedId, Integer originalId) {
		Map<Integer, Set<Integer>> qualifiedPeople = new HashMap<>();
		for (int grade = MIN_GRADE; grade <= MAX_GRADE; ++grade)
			qualifiedPeople.put(grade, resultRepository.getResultsByContest(qualifiedId, grade).stream()
					.map(result -> result.getPerson().getId())
					.collect(Collectors.toSet()));

		resultRepository.mergeQualified(qualifiedId, originalId);
		contestRepository.delete(qualifiedId);

		for (int grade = MIN_GRADE; grade <= MAX_GRADE; ++grade) {
			Set<Integer> expected = qualifiedPeople.get(grade);
			List<Result> merged = resultRepository.getResultsByContest(originalId, grade);
			if (merged.size() == expected.size())
				continue;
			logger.error("Grade {}: {} entries after merging the qualifier list, expected {}",
					grade, merged.size(), expected.size());
			for (Result result : merged)
				if (!expected.contains(result.getPerson().getId()))
					logger.error("  grade {} not on the qualifier list: {}", grade, result);
		}
	}
}
