package query;

import domain.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
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

	@Cacheable("myCache")
	public List<Person> getPeopleByName(String person) {
		String name = StringProcessor.normaliseChild(person);
		return personRepository.findAll().stream()
				.parallel()
				.filter(x -> StringProcessor.areSimilar(x.getName(), name) ||
						StringProcessor.namesAreStrictlySimilar(x.getName(), name))
				.sorted(Comparator.comparing(Person::getSchoolYear).reversed())
				.toList();
	}

	@Cacheable("myCache")
	public List<Result> getResultsByContest(int contestId, int year) {
		return resultRepository.getResultsByContest(contestId, year);
	}

	@Cacheable("myCache")
	public List<Result> getResultsByPerson(Integer personId) {
		return resultRepository.getResultsByPerson(personId);
	}

	@Cacheable("myCache")
	public List<Contest> getContests() {
		return contestRepository.findAll();
	}

	@Cacheable("myCache")
	public List<Institution> getInstitutions() {
		return institutionRepository.findAll();
	}

	@Cacheable("myCache")
	public List<Result> getResultsByInstitution(Integer id) {
		return resultRepository.getResultsByInstitution(id);
	}

	@Cacheable("myCache")
	public List<Result> getResultsByRegion(String name) {
		return resultRepository.getResultsByRegion(name);
	}

	public void replaceName(int original, int replacement) {
		personRepository.replace(personRepository.findById(original), personRepository.findById(replacement));
	}

	public void replaceInstitution(int original, int replacement) {
		institutionRepository.replace(institutionRepository.findById(original), institutionRepository.findById(replacement));
	}

	@Cacheable("myCache")
	public Person getPersonById(Integer id) {
		return personRepository.findById(id);
	}

	@Cacheable("myCache")
	public Contest getContest(Integer id) {
		return contestRepository.findById(id);
	}

	@Cacheable("myCache")
	public Institution getInstitutionById(Integer id) {
		return institutionRepository.findById(id);
	}

	@Cacheable("myCache")
	public Contest getPreviousContest(Integer id) {
		return contestRepository.findPrevious(contestRepository.findById(id));
	}

	@Cacheable("myCache")
	public Contest getNextContest(Integer id) {
		return contestRepository.findNext(contestRepository.findById(id));
	}

	@Cacheable("myCache")
	public List<RankingResult> getRanking(String region, Integer year) {
		return resultRepository.getRanking(region, year);
	}
}
