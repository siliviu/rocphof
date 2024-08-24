package repo;

import domain.Contest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

public interface ContestRepository extends MyRepository<Contest, Integer> {
	Contest findPrevious(Contest byId);

	Contest findNext(Contest byId);
}
