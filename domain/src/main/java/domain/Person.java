package domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
@ToString(callSuper = true)
public class Person extends Identifiable<Integer> {
	@NotNull
	@Column
	private String name;
	@NotNull
	@Column
	private int schoolYear;

	@Override
	public Identifiable<Integer> copy() {
		return new Person(name, schoolYear);
	}
}
