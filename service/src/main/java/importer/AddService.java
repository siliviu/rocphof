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

import java.util.ArrayList;
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
			data = contest.getName().equals("ONI") ? ParserService.parseONI(file, contest) : ParserService.parseLOT(file);

			List<Institution> institutions = new ArrayList<>();
			if (contest.getName().equals("ONI"))
				institutions = data.stream()
						.map(Result::getInstitution)
						.sorted(Comparator.comparing(x -> x.getRegion().length()))
						.distinct()
						.toList();
			List<Person> people = data.stream()
					.map(Result::getPerson)
					.toList();
			if (contest.getName().equals("ONI"))
				institutionMergeService.beginMerge(institutions);
			personMergeService.beginMerge(people);
			addProcessedData();
			if (contest.getName().equals("ONI"))
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
			result.setInstitution(contest.getName().equals("ONI") ?
					institutionMap.get(result.getInstitution()) :
					null);
			result.setContest(contest);
			resultRepository.add(result);
		}
	}

	public void mergeQualified(Integer qualifiedId, Integer originalId) {
		resultRepository.mergeQualified(qualifiedId, originalId);
	}
}
