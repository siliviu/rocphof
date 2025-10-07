package domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
@ToString(callSuper = true)
public class Result extends Identifiable<Integer> {
	@ManyToOne
	@JoinColumn
	@NotNull
	private Person person;
	@ManyToOne
	@JoinColumn
	private Institution institution;
	@ManyToOne
	@JoinColumn
	@NotNull
	private Contest contest;
	@Column
	private int year;
	@Column
	private Float score;
	@Column
	private Integer place;
	@Enumerated(EnumType.STRING)
	@Column
	private Prize prize;
	@Enumerated(EnumType.STRING)
	@Column
	private Medal medal;
	@Column
	private Boolean unofficial;

	@Override
	public Identifiable<Integer> copy() {
		return new Result(person, institution, contest, year, score, place, prize, medal, unofficial);
	}
}
