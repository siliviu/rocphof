package importer;

import domain.Contest;
import domain.Institution;
import domain.Person;
import domain.Result;
import merge.InstitutionMergeService;
import merge.PersonMergeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import repo.*;

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;

@Service
public class AddService {
	@Autowired
	private ContestRepository contestRepository;
	@Autowired
	private ResultRepository resultRepository;
	@Autowired
	private InstitutionMergeService institutionMergeService;
	@Autowired
	private PersonMergeService personMergeService;
	private List<Result> data;
	private Contest contest;

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
		contest = contestRepository.save(contest);
		HashMap<Institution, Institution> institutionMap = institutionMergeService.getMap();
		HashMap<Person, Person> personMap = personMergeService.getMap();
		for (Result result : data) {
			result.setPerson(personMap.get(result.getPerson()));
			result.setInstitution(institutionMap.get(result.getInstitution()));
			result.setContest(contest);
			resultRepository.save(result);
		}
	}

}
