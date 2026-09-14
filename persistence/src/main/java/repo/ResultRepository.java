package repo;

import domain.RankingByColumn;
import domain.RankingResult;
import domain.RankingInstitution;
import domain.RankingRegion;
import domain.Result;

import java.util.List;

public interface ResultRepository extends Repository<Result, Integer> {
	List<Result> getResultsByContest(Integer contestId, int year);

	List<Result> getResultsByContestName(String name);

	List<Result> getResultsByPerson(Integer personId);

	List<Result> getResultsByInstitution(Integer id);

	List<Result> getResultsByRegion(String name);

	Result getResultByContestAndPerson(Integer contestId, Integer personId);

	void mergeQualified(Integer qualifiedId, Integer originalId);

	List<RankingResult> getRanking(String region, String institution, Integer year, String subject, String scope);

	List<RankingInstitution> getInstitutionRanking(Integer startYear, Integer endYear, String subject, String scope);

	List<RankingRegion> getRegionRanking(Integer startYear, Integer endYear, String subject, String scope);

	List<RankingByColumn> getInternationalRanking(Integer startYear, Integer endYear, String subject, String region, String institution, Integer year);

	Long getParticipants(Integer contestId, Integer year);
}
