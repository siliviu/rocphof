package repo;

import domain.Contest;
import domain.Person;
import domain.Result;

import java.util.List;

public interface ResultRepository extends Repository<Result, Integer>{
	List<Result> getResultsByContest(Contest contest, int year);
	List<Result> getResultsByPerson(Person person);
}
