package domain;

import lombok.*;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * A person's row in the international ranking: the overall tally plus a
 * breakdown per contest column. Columns a person never took part in are absent
 * from the map rather than held as zeroes.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
@ToString
public class RankingByColumn {
	private Person person;
	private Long gold;
	private Long silver;
	private Long bronze;
	private Long medals;
	private Long participations;
	private Map<String, ColumnTally> columns = new LinkedHashMap<>();

	public RankingByColumn(Person person) {
		this.person = person;
		this.gold = 0L;
		this.silver = 0L;
		this.bronze = 0L;
		this.medals = 0L;
		this.participations = 0L;
		this.columns = new LinkedHashMap<>();
	}

	/** Folds one result into both the overall tally and its column. */
	public void add(String columnKey, Medal medal) {
		if (medal == Medal.GOLD)
			++gold;
		else if (medal == Medal.SILVER)
			++silver;
		else if (medal == Medal.BRONZE)
			++bronze;
		if (medal != null)
			++medals;
		++participations;
		columns.computeIfAbsent(columnKey, key -> ColumnTally.empty()).add(medal);
	}
}
