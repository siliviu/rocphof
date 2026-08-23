package spring;

import admin.AdminService;
import domain.Contest;
import domain.Person;
import domain.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.CacheManager;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin
@Profile("admin")
@RequestMapping("/results/admin")
public class AdminController {
	@Autowired
	private AdminService adminService;
	@Autowired
	private CacheManager cacheManager;

	private void clearCaches() {
		cacheManager.getCacheNames()
				.forEach(name -> cacheManager.getCache(name).clear());
	}

	@PostMapping(value = "/contests")
	public Contest addContest(@RequestBody Contest contest) {
		Contest saved = adminService.addContest(contest);
		clearCaches();
		return saved;
	}

	@PatchMapping(value = "/contests/{id}")
	public Contest updateContest(@PathVariable Integer id, @RequestBody Contest contest) {
		Contest saved = adminService.updateContest(id, contest);
		clearCaches();
		return saved;
	}

	@PostMapping(value = "/people")
	public Person addPerson(@RequestBody Person person) {
		Person saved = adminService.addPerson(person);
		clearCaches();
		return saved;
	}

	@PostMapping(value = "/results")
	public Result addResult(
			@RequestParam Integer contestId,
			@RequestParam Integer personId,
			@RequestParam(required = false) Integer institutionId,
			@RequestBody Result result) {
		Result saved = adminService.addResult(contestId, personId, institutionId, result);
		clearCaches();
		return saved;
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<String> onBadRequest(IllegalArgumentException e) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
	}
}
