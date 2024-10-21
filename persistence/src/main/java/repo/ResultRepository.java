package repo;

import domain.RankingResult;
import domain.Result;

import java.util.List;

public interface ResultRepository extends Repository<Result, Integer> {
	List<Result> getResultsByContest(Integer contestId, int year);

	List<Result> getResultsByPerson(Integer personId);

	List<Result> getResultsByInstitution(Integer id);

	List<Result> getResultsByRegion(String name);

	Result getResultByContestAndPerson(Integer contestId, Integer personId);

	void mergeQualified(Integer qualifiedId, Integer originalId);

	List<RankingResult> getRanking(String region, String institution, Integer year);

	Long getParticipants(Integer contestId, Integer year);
}
