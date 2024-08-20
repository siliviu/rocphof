package spring;

import domain.Contest;
import domain.Institution;
import domain.Person;
import domain.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import query.QueryService;

import java.util.List;

@RestController
@CrossOrigin
@RequestMapping("/results")
public class ResultsController {
	@Autowired
	private QueryService queryService;

	@GetMapping(value = "/people")
	public List<Person> searchPeople(@RequestParam String name) {
		return queryService.getPeopleByName(name);
	}

	@GetMapping(value = "/people/{id}")
	public List<Result> getPersonResult(@PathVariable Integer id) {
		return queryService.getResultsByPerson(id);
	}

	@GetMapping(value = "/institutions")
	public List<Institution> getInstitutions() {
		return queryService.getInstitutions();
	}

	@GetMapping(value = "/institutions/{id}")
	public List<Result> getInstitutionResults(@PathVariable Integer id) {
		return queryService.getResultsByInstitution(id);
	}

	@GetMapping(value = "/regions/{name}")
	public List<Result> getRegionResults(@PathVariable String name) {
		return queryService.getResultsByRegion(name);
	}

	@GetMapping(value = "/contests")
	public List<Contest> getContests() {
		return queryService.getContests();
	}

	@GetMapping(value = "/contests/{id}/year/{year}")
	public List<Result> getContestYear(@PathVariable Integer id, @PathVariable Integer year) {
		return queryService.getResultsByContest(id, year);
	}
}