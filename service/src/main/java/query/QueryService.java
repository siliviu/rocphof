package query;

import domain.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import repo.*;
import utils.StringProcessor;

import java.util.Comparator;
import java.util.List;

@Service
public class QueryService {
	@Autowired
	private ResultRepository resultRepository;
	@Autowired
	private PersonRepository personRepository;
	@Autowired
	private ContestRepository contestRepository;
	@Autowired
	private InstitutionRepository institutionRepository;

//	@Cacheable
	public List<Person> getPeopleByName(String person) {
		String name = StringProcessor.normaliseChild(person);
		return personRepository.findAll().stream()
				.parallel()
				.filter(x -> StringProcessor.areSimilar(x.getName(), name) ||
						StringProcessor.namesAreStrictlySimilar(x.getName(), name))
				.sorted(Comparator.comparing(Person::getSchoolYear).reversed())
				.toList();
	}

//	@Cacheable
	public List<Result> getResultsByContest(int contestId, int year) {
		return resultRepository.getResultsByContest(contestId, year);
	}

//	@Cacheable
	public List<Result> getResultsByPerson(Integer personId) {
		return resultRepository.getResultsByPerson(personId);
	}

//	@Cacheable
	public List<Contest> getContests() {
		return contestRepository.findAll();
	}

//	@Cacheable
	public List<Institution> getInstitutions() {
		return institutionRepository.findAll();
	}

//	@Cacheable
	public List<Result> getResultsByInstitution(Integer id) {
		return resultRepository.getResultsByInstitution(id);
	}

//	@Cacheable
	public List<Result> getResultsByRegion(String name) {
		return resultRepository.getResultsByRegion(name);
	}

	public void replaceName(int original, int replacement) {
		personRepository.replace(personRepository.findById(original), personRepository.findById(replacement));
	}

	public void replaceInstitution(int original, int replacement) {
		institutionRepository.replace(institutionRepository.findById(original), institutionRepository.findById(replacement));
	}

//	@Cacheable
	public Person getPersonById(Integer id) {
		return personRepository.findById(id);
	}

//	@Cacheable
	public Contest getContest(Integer id) {
		return contestRepository.findById(id);
	}

//	@Cacheable
	public Institution getInstitutionById(Integer id) {
		return institutionRepository.findById(id);
	}

//	@Cacheable
	public Contest getPreviousContest(Integer id) {
		return contestRepository.findPrevious(contestRepository.findById(id));
	}

//	@Cacheable
	public Contest getNextContest(Integer id) {
		return contestRepository.findNext(contestRepository.findById(id));
	}

//	@Cacheable
	public List<RankingResult> getRanking(String region, String institution, Integer year) {
		return resultRepository.getRanking(region, institution,year);
	}

	public Long getParticipantsByContest(Integer id, Integer year) {
		return resultRepository.getParticipants(id, year);
	}
}
