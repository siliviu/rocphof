package query;

import domain.*;
import merge.InstitutionMergeService;
import merge.PersonMergeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import repo.ContestRepository;
import repo.InstitutionRepository;
import repo.PersonRepository;
import repo.ResultRepository;
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
	@Autowired
	private PersonMergeService personMergeService;
	@Autowired
	private InstitutionMergeService institutionMergeService;

	public List<Person> getPeopleByName(String person) {
		String name = StringProcessor.normaliseChild(person);
		return personRepository.findAll().stream()
				.parallel()
				.filter(x -> StringProcessor.areSimilar(x.getName(), name) ||
						StringProcessor.namesAreSearchSimilar(x.getName(), name))
				.sorted(Comparator.comparing(Person::getSchoolYear).reversed())
				.limit(25)
				.toList();
	}

	public List<Result> getResultsByContest(int contestId, int year) {
		return resultRepository.getResultsByContest(contestId, year);
	}

	public List<Result> getResultsByContestName(String name) {
		return resultRepository.getResultsByContestName(name);
	}

	public List<Result> getResultsByPerson(Integer personId) {
		return resultRepository.getResultsByPerson(personId);
	}

	public List<Contest> getContests() {
		return contestRepository.findAll();
	}

	public List<Institution> getInstitutions() {
		return institutionRepository.findAll();
	}

	public List<Result> getResultsByInstitution(Integer id) {
		return resultRepository.getResultsByInstitution(id);
	}

	public List<Result> getResultsByRegion(String name) {
		return resultRepository.getResultsByRegion(name);
	}

	public void replaceName(int original, int replacement) {
		personMergeService.replace(personRepository.findById(original), personRepository.findById(replacement));
	}

	public void replaceInstitution(int original, int replacement) {
		institutionMergeService.replace(institutionRepository.findById(original), institutionRepository.findById(replacement));
	}

	public Person getPersonById(Integer id) {
		return personRepository.findById(id);
	}

	public Contest getContest(Integer id) {
		return contestRepository.findById(id);
	}

	public Institution getInstitutionById(Integer id) {
		return institutionRepository.findById(id);
	}

	public Contest getPreviousContest(Integer id) {
		return contestRepository.findPrevious(contestRepository.findById(id));
	}

	public Contest getNextContest(Integer id) {
		return contestRepository.findNext(contestRepository.findById(id));
	}

	public List<RankingResult> getRanking(String region, String institution, Integer year, String subject, String scope) {
		return resultRepository.getRanking(region, institution, year, subject, scope);
	}

	public List<RankingInstitution> getInstitutionRanking(Integer startYear, Integer endYear, String subject, String scope) {
		return resultRepository.getInstitutionRanking(startYear, endYear, subject, scope);
	}

	public List<RankingRegion> getRegionRanking(Integer startYear, Integer endYear, String subject, String scope) {
		return resultRepository.getRegionRanking(startYear, endYear, subject, scope);
	}

	public List<RankingByColumn> getInternationalRanking(Integer startYear, Integer endYear, String subject, String region, String institution, Integer year) {
		return resultRepository.getInternationalRanking(startYear, endYear, subject, region, institution, year);
	}

	/** Display order for the international ranking's columns. */
	public List<String> getInternationalColumns(String subject) {
		return Constants.internationalColumns(subject);
	}

	/** Columns that award no medals, so only participations are shown for them. */
	public List<String> getParticipationOnlyColumns() {
		return Constants.PARTICIPATION_ONLY_COLUMNS;
	}

	public Long getParticipantsByContest(Integer id, Integer year) {
		return resultRepository.getParticipants(id, year);
	}
}
