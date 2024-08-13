package repo;

import domain.Identifiable;

import java.io.Serializable;
import java.util.Collection;
import java.util.List;
import java.util.SequencedCollection;

public interface Repository<T extends Identifiable<ID>, ID extends Serializable> {
	T add(T elem);
	void delete(ID id);
	void update(T elem, ID id);
	T getById(ID id);
	List<T> getAll();
}

