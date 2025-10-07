package domain;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
@ToString
public class RankingResult {
	private Person person;
	private Long gold;
	private Long silver;
	private Long bronze;
	private Long medals;
	private Long participations;
}