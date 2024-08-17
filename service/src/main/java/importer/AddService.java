package importer;

import domain.Contest;
import domain.Institution;
import domain.Person;
import domain.Result;
import importer.merge.InstitutionMergeService;
import importer.merge.PersonMergeService;
import repo.*;

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;

public class AddService {
	private final ContestRepository contestRepository;
	private final ResultRepository resultRepository;
	private final InstitutionMergeService institutionMergeService;
	private final PersonMergeService personMergeService;
	private List<Result> data;
	private Contest contest;

	public AddService(ContestRepository contestRepository, ResultRepository resultRepository, InstitutionMergeService mergeService, PersonMergeService personMergeService) {
		this.contestRepository = contestRepository;
		this.resultRepository = resultRepository;
		this.institutionMergeService = mergeService;
		this.personMergeService = personMergeService;
	}

	public void addDataFromFile(String file, Contest contest) {
		this.contest = contest;
		try {
			data = ParserService.parse(file, contest);
			List<Institution> institutions = data.stream()
					.map(Result::getInstitution)
					.sorted(Comparator.comparing(x -> x.getRegion().length()))
					.distinct()
					.toList();
			List<Person> people = data.stream()
					.map(Result::getPerson)
					.toList();
			institutionMergeService.beginMerge(institutions);
			personMergeService.beginMerge(people);
			addProcessedData();
			institutionMergeService.autoHandleSuggestions();
			personMergeService.autoHandleSuggestions();
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}

	public void addProcessedData() {
		contest = contestRepository.add(contest);
		HashMap<Institution, Institution> institutionMap = institutionMergeService.getMap();
		HashMap<Person, Person> personMap = personMergeService.getMap();
		for (Result result : data) {
			result.setPerson(personMap.get(result.getPerson()));
			result.setInstitution(institutionMap.get(result.getInstitution()));
			result.setContest(contest);
			resultRepository.add(result);
		}
	}

}
