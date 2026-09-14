package spring;

import domain.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.web.bind.annotation.*;
import query.QueryService;

import java.util.List;

@RestController
@CrossOrigin
@RequestMapping("/results")
public class ResultsController {
	@Autowired
	private QueryService queryService;


	@GetMapping(value = "/people/{id}")
	public Person getPerson(@PathVariable Integer id) {
		return queryService.getPersonById(id);
	}

	@GetMapping(value = "/people")
	public List<Person> searchPeople(@RequestParam String name) {
		return queryService.getPeopleByName(name);
	}

	@GetMapping(value = "/people/{id}/results")
	public List<Result> getResultByPerson(@PathVariable Integer id) {
		return queryService.getResultsByPerson(id);
	}


	@GetMapping(value = "/institutions")
	public List<Institution> getInstitutions() {
		return queryService.getInstitutions();
	}


	@GetMapping(value = "/institutions/{id}")
	public Institution getInstitutionById(@PathVariable Integer id) {
		return queryService.getInstitutionById(id);
	}

	@GetMapping(value = "/institutions/{id}/results")
	public List<Result> getInstitutionResults(@PathVariable Integer id) {
		return queryService.getResultsByInstitution(id);
	}

	@Cacheable(value = "regionResults", key = "#name")
	@GetMapping(value = "/regions/{name}/results")
	public List<Result> getRegionResults(@PathVariable String name) {
		return queryService.getResultsByRegion(name);
	}

	@Cacheable(value = "allContests")
	@GetMapping(value = "/contests")
	public List<Contest> getContests() {
		return queryService.getContests();
	}

	@Cacheable(value = "contestById", key = "#id")
	@GetMapping(value = "/contests/{id}")
	public Contest getContestById(@PathVariable Integer id) {
		return queryService.getContest(id);
	}

	@Cacheable(value = "previousContest", key = "#id")
	@GetMapping(value = "/contests/{id}/previous")
	public Contest getPreviousContest(@PathVariable Integer id) {
		return queryService.getPreviousContest(id);
	}

	@Cacheable(value = "nextContest", key = "#id")
	@GetMapping(value = "/contests/{id}/next")
	public Contest getNextContest(@PathVariable Integer id) {
		return queryService.getNextContest(id);
	}

	@Cacheable(value = "contestYearResults", key = "{#id, #year}")
	@GetMapping(value = "/contests/{id}/results/{year}")
	public List<Result> getContestYear(@PathVariable Integer id, @PathVariable Integer year) {
		return queryService.getResultsByContest(id, year);
	}

	@Cacheable(value = "contestNameResults", key = "#name")
	@GetMapping(value = "/contests/name/{name}/results")
	public List<Result> getContestNameResults(@PathVariable String name) {
		return queryService.getResultsByContestName(name);
	}

	@Cacheable(value = "contestYearParticipants", key = "{#id, #year}")
	@GetMapping(value = "/contests/{id}/participants/{year}")
	public Long getContestYearParticipants(@PathVariable Integer id, @PathVariable Integer year) {
		return queryService.getParticipantsByContest(id, year);
	}

	@Cacheable(value = "rankingPeople", key = "{#region, #institution, #year, #subject, #scope}")
	@GetMapping(value = "/rankings/people")
	public List<RankingResult> getPeopleRanking(@RequestParam(required = false) String region, @RequestParam(required = false) String institution, @RequestParam(required = false) Integer year, @RequestParam(required = false) String subject, @RequestParam(required = false) String scope) {
		return queryService.getRanking(region, institution, year, subject, scope);
	}

	@Cacheable(value = "rankingInstitutions", key = "{#startYear, #endYear, #subject, #scope}")
	@GetMapping(value = "/rankings/institutions")
	public List<domain.RankingInstitution> getInstitutionRankings(@RequestParam(required = false) Integer startYear, @RequestParam(required = false) Integer endYear, @RequestParam(required = false) String subject, @RequestParam(required = false) String scope) {
		return queryService.getInstitutionRanking(startYear, endYear, subject, scope);
	}

	@Cacheable(value = "rankingRegions", key = "{#startYear, #endYear, #subject, #scope}")
	@GetMapping(value = "/rankings/regions")
	public List<domain.RankingRegion> getRegionRankings(@RequestParam(required = false) Integer startYear, @RequestParam(required = false) Integer endYear, @RequestParam(required = false) String subject, @RequestParam(required = false) String scope) {
		return queryService.getRegionRanking(startYear, endYear, subject, scope);
	}

	@Cacheable(value = "rankingInternational", key = "{#startYear, #endYear, #subject, #region, #institution, #year}")
	@GetMapping(value = "/rankings/international")
	public List<RankingByColumn> getInternationalRanking(@RequestParam(required = false) Integer startYear, @RequestParam(required = false) Integer endYear, @RequestParam(required = false) String subject, @RequestParam(required = false) String region, @RequestParam(required = false) String institution, @RequestParam(required = false) Integer year) {
		return queryService.getInternationalRanking(startYear, endYear, subject, region, institution, year);
	}

	/** Lets the table render its columns in the order the backend defines. */
	@Cacheable(value = "internationalColumns")
	@GetMapping(value = "/rankings/international/columns")
	public InternationalColumns getInternationalColumns() {
		return new InternationalColumns(
				queryService.getInternationalColumns(),
				queryService.getParticipationOnlyColumns()
		);
	}

	/**
	 * Column layout for the international ranking: the display order, plus which
	 * of those columns award no medals.
	 */
	public record InternationalColumns(List<String> order, List<String> participationOnly) {}
}