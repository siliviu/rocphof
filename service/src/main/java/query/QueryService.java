package query;

import domain.Contest;
import domain.Institution;
import domain.Person;
import domain.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import repo.*;
import utils.StringProcessor;

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


	public List<Person> getPeopleByName(String person) {
		return personRepository.findAll().stream()
				.parallel()
				.filter(x -> StringProcessor.areSimilar(x.getName(), person))
				.toList();
	}

	public List<Result> getResultsByContest(int contestId, int year){
		return resultRepository.getResultsByContest(contestId, year);
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
}
