package repo;

import domain.Contest;

import java.util.List;
import java.util.Optional;

public interface ContestRepository extends MyRepository<Contest, Integer> {
	Contest findPrevious(Contest byId);

	Contest findNext(Contest byId);
}
