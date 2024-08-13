package repo;

import domain.Institution;

import java.util.List;

public interface InstitutionRepository extends MergeRepository<Institution, Integer> {
	List<Institution> getByName(String institution);
}
