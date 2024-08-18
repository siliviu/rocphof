package repo;

import domain.Identifiable;

import java.io.Serializable;
import java.util.List;

public interface MergeRepository<T extends Identifiable<ID>, ID extends Serializable> extends MyRepository<T, ID> {
	void replace(T original, T replacement);

	List<T> getByName(String name);

}
