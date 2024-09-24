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
	@Cacheable("myCache")
	public Person getPerson(@PathVariable Integer id) {
		return queryService.getPersonById(id);
	}

	@GetMapping(value = "/people")
	@Cacheable("myCache")
	public List<Person> searchPeople(@RequestParam String name) {
		return queryService.getPeopleByName(name);
	}

	@GetMapping(value = "/people/{id}/results")
	@Cacheable("myCache")
	public List<Result> getResultByPerson(@PathVariable Integer id) {
		return queryService.getResultsByPerson(id);
	}


	@GetMapping(value = "/institutions")
	@Cacheable("myCache")
	public List<Institution> getInstitutions() {
		return queryService.getInstitutions();
	}


	@GetMapping(value = "/institutions/{id}")
	@Cacheable("myCache")
	public Institution getInstitutionById(@PathVariable Integer id) {
		return queryService.getInstitutionById(id);
	}

	@GetMapping(value = "/institutions/{id}/results")
	@Cacheable("myCache")
	public List<Result> getInstitutionResults(@PathVariable Integer id) {
		return queryService.getResultsByInstitution(id);
	}


	@GetMapping(value = "/regions/{name}/results")
	@Cacheable("myCache")
	public List<Result> getRegionResults(@PathVariable String name) {
		return queryService.getResultsByRegion(name);
	}


	@GetMapping(value = "/contests")
	@Cacheable("myCache")
	public List<Contest> getContests() {
		return queryService.getContests();
	}

	@GetMapping(value = "/contests/{id}")
	@Cacheable("myCache")
	public Contest getContestById(@PathVariable Integer id) {
		return queryService.getContest(id);
	}

	@GetMapping(value = "/contests/{id}/previous")
	@Cacheable("myCache")
	public Contest getPreviousContest(@PathVariable Integer id) {
		return queryService.getPreviousContest(id);
	}

	@GetMapping(value = "/contests/{id}/next")
	@Cacheable("myCache")
	public Contest getNextContest(@PathVariable Integer id) {
		return queryService.getNextContest(id);
	}


	@GetMapping(value = "/contests/{id}/results/{year}")
	@Cacheable("myCache")
	public List<Result> getContestYear(@PathVariable Integer id, @PathVariable Integer year) {
		return queryService.getResultsByContest(id, year);
	}

	@GetMapping(value = "/ranking")
	@Cacheable("myCache")
	public List<RankingResult> getContestYear(@RequestParam(required = false) String region, @RequestParam(required = false) Integer year) {
		return queryService.getRanking(region,year);
	}
}