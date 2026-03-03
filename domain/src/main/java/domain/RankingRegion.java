package domain;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
@ToString
public class RankingRegion {
    private String region;
    private Long gold;
    private Long silver;
    private Long bronze;
    private Long medals;
    private Long participations;
}
