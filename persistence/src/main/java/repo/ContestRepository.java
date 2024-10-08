package repo;

import domain.Contest;

public interface ContestRepository extends Repository<Contest, Integer> {
	Contest findPrevious(Contest byId);

	Contest findNext(Contest byId);
}
