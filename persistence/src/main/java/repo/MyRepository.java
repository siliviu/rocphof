package repo;

import domain.Identifiable;

import java.io.Serializable;
import java.util.List;

public interface MyRepository<T extends Identifiable<ID>, ID extends Serializable> {
	T add(T elem);
	void delete(ID id);
	void update(T elem, ID id);
	T findById(ID id);
	List<T> findAll();
}

