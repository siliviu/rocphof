package repo;

import domain.Result;

import java.util.List;

public interface ResultRepository extends MyRepository<Result, Integer> {
	List<Result> getResultsByContest(Integer contestId, int year);
	List<Result> getResultsByPerson(Integer personId);

	List<Result> getResultsByInstitution(Integer id);

	List<Result> getResultsByRegion(String name);
}
