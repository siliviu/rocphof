package domain;


import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;

import java.io.Serializable;

@MappedSuperclass
public abstract class Identifiable<ID extends Serializable> implements Serializable {
	@Id
	@GeneratedValue(generator="increment")
	private ID id;
	public abstract Identifiable<ID> copy();
	public ID getId() {
		return id;
	}
	public void setId(ID id) {
		this.id = id;
	}
}