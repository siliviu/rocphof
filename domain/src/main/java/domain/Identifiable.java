package domain;


import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.io.Serializable;

@MappedSuperclass
@Getter
@Setter
@ToString
public abstract class Identifiable<ID extends Serializable> implements Serializable {
	@Id
	@GeneratedValue(generator="increment")
	@ToString.Include
	private ID id;
	public abstract Identifiable<ID> copy();
}