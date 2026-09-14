package domain;

import lombok.*;

/**
 * Medal tally for one column of the international ranking. Participations counts
 * every appearance, medal or not, so it is not the sum of the other three.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
@ToString
public class ColumnTally {
	private Long gold;
	private Long silver;
	private Long bronze;
	private Long participations;

	public static ColumnTally empty() {
		return new ColumnTally(0L, 0L, 0L, 0L);
	}

	public void add(Medal medal) {
		if (medal == Medal.GOLD)
			++gold;
		else if (medal == Medal.SILVER)
			++silver;
		else if (medal == Medal.BRONZE)
			++bronze;
		++participations;
	}
}
