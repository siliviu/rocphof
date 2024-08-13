import domain.Contest;
import domain.Institution;
import domain.Person;
import domain.Result;
import repo.PersonRepository;
import repo.ResultRepository;
import utils.StringProcessor;

import java.util.List;

public class QueryService {
	private final ResultRepository resultRepository;
	private final PersonRepository personRepository;

	public QueryService(ResultRepository repository, PersonRepository personRepository) {
		this.resultRepository = repository;
		this.personRepository = personRepository;
	}

	public List<Person> getPeopleByName(String person) {
		return personRepository.getAll().stream()
				.parallel()
				.filter(x -> StringProcessor.areSimilar(x.getName(), person))
				.toList();
	}

	public List<Result> getResultsByContest(Contest contest, int year){
		return resultRepository.getResultsByContest(contest, year);
	}
	public List<Result> getResultsByPerson(Person person) {
		return resultRepository.getResultsByPerson(person);
	}
}
