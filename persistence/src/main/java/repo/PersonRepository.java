package repo;

import domain.Institution;
import domain.Person;

import java.util.List;

public interface PersonRepository extends MergeRepository<Person, Integer> {
	List<Person> getByName(String name);
	Institution getMostRecentInstitution(Person person);
	void replace(Person original, Person replacement);
}
