package admin;

import domain.Contest;
import domain.Institution;
import domain.Person;
import domain.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import repo.ContestRepository;
import repo.InstitutionRepository;
import repo.PersonRepository;
import repo.ResultRepository;

/**
 * Write operations for the local-only admin tooling. Kept separate from
 * QueryService so the read path stays free of mutating methods.
 */
@Service
public class AdminService {
	@Autowired
	private ContestRepository contestRepository;
	@Autowired
	private ResultRepository resultRepository;
	@Autowired
	private PersonRepository personRepository;
	@Autowired
	private InstitutionRepository institutionRepository;

	public Contest addContest(Contest contest) {
		return contestRepository.add(contest);
	}

	/**
	 * Only the fields present on the incoming contest are applied, so a partial
	 * edit from the admin form cannot blank out the rest of the record.
	 */
	public Contest updateContest(Integer id, Contest changes) {
		Contest existing = contestRepository.findById(id);
		if (existing == null)
			throw new IllegalArgumentException("No contest with id " + id);

		if (changes.getYear() != 0)
			existing.setYear(changes.getYear());
		if (changes.getName() != null)
			existing.setName(changes.getName());
		if (changes.getDesc() != null)
			existing.setDesc(changes.getDesc());
		if (changes.getCountry() != null)
			existing.setCountry(changes.getCountry());
		if (changes.getCity() != null)
			existing.setCity(changes.getCity());
		if (changes.getParticipants() != null)
			existing.setParticipants(changes.getParticipants());
		if (changes.getSite() != null)
			existing.setSite(changes.getSite());
		if (changes.getStart() != null)
			existing.setStart(changes.getStart());
		if (changes.getEnd() != null)
			existing.setEnd(changes.getEnd());

		contestRepository.update(existing, id);
		return contestRepository.findById(id);
	}

	public Person addPerson(Person person) {
		return personRepository.add(person);
	}

	/**
	 * Resolves the referenced contest, person and institution from their ids so
	 * the caller only has to send identifiers.
	 */
	public Result addResult(Integer contestId, Integer personId, Integer institutionId, Result result) {
		Contest contest = contestRepository.findById(contestId);
		if (contest == null)
			throw new IllegalArgumentException("No contest with id " + contestId);
		Person person = personRepository.findById(personId);
		if (person == null)
			throw new IllegalArgumentException("No person with id " + personId);

		Institution institution = null;
		if (institutionId != null) {
			institution = institutionRepository.findById(institutionId);
			if (institution == null)
				throw new IllegalArgumentException("No institution with id " + institutionId);
		}

		result.setContest(contest);
		result.setPerson(person);
		result.setInstitution(institution);
		return resultRepository.add(result);
	}

	public void deleteResult(Integer id) {
		resultRepository.delete(id);
	}
}
