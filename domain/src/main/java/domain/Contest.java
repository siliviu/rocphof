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
public class Contest extends Identifiable<Integer> {
	@Column
	@NotNull
	private int year;
	@Column
	@NotNull
	private String name;
	@Column
	private String desc;
	@Column
	private String country;
	@Column
	private String city;
	@Column
	private Integer participants;
	@Column
	private String site;
	@Column
	private String start;
	@Column
	private String end;

	@Override
	public Identifiable<Integer> copy() {
		return new Contest(year, name, desc, country, city, participants,site,start,end);
	}
}
