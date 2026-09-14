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
	/**
	 * Null on editions archived before the column existed; readers treat that as
	 * {@link Constants#SUBJECT_DEFAULT}.
	 */
	@Column
	private String subject;
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
		return new Contest(year, name, subject, desc, country, city, participants, site, start, end);
	}

	/**
	 * Subject to treat this contest as, defaulting for the editions imported
	 * before the column existed.
	 */
	public String effectiveSubject() {
		return subject == null || subject.isBlank() ? Constants.SUBJECT_DEFAULT : subject;
	}
}
