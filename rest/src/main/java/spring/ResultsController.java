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


	@GetMapping(value = "/regions/{name}/results")
	public List<Result> getRegionResults(@PathVariable String name) {
		return queryService.getResultsByRegion(name);
	}


	@GetMapping(value = "/contests")
	public List<Contest> getContests() {
		return queryService.getContests();
	}

	@GetMapping(value = "/contests/{id}")
	public Contest getContestById(@PathVariable Integer id) {
		return queryService.getContest(id);
	}

	@GetMapping(value = "/contests/{id}/previous")
	public Contest getPreviousContest(@PathVariable Integer id) {
		return queryService.getPreviousContest(id);
	}

	@GetMapping(value = "/contests/{id}/next")
	public Contest getNextContest(@PathVariable Integer id) {
		return queryService.getNextContest(id);
	}


	@GetMapping(value = "/contests/{id}/results/{year}")
	public List<Result> getContestYear(@PathVariable Integer id, @PathVariable Integer year) {
		return queryService.getResultsByContest(id, year);
	}
	@GetMapping(value = "/contests/{id}/participants/{year}")
	public Long getContestYearParticipants(@PathVariable Integer id, @PathVariable Integer year) {
		return queryService.getParticipantsByContest(id, year);
	}

	@GetMapping(value = "/ranking")
	public List<RankingResult> getRanking(@RequestParam(required = false) String region, @RequestParam(required = false) Integer year) {
		return queryService.getRanking(region,year);
	}
}