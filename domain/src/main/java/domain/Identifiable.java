package domain;


import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;

import java.io.Serializable;

@MappedSuperclass
public class Identifiable<ID extends Serializable> implements Serializable {
	private ID id;
	@Id
	@GeneratedValue(generator="increment")
	public ID getId() {
		return id;
	}
	public void setId(ID id) {
		this.id = id;
	}
}