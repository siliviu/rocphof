package repo;

import domain.Institution;
import domain.Person;
import domain.Result;

import java.util.List;

public interface PersonRepository extends MergeRepository<Person, Integer> {
	List<Person> getByName(String name);
	Result getMostRecentResult(Person person);
	void replace(Person original, Person replacement);
}
