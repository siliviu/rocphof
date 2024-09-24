package domain;

public class RankingResult {
	private Person person;
	private Long gold;
	private Long silver;
	private Long bronze;
	private Long medals;
	private Long participations;

	public RankingResult() {
	}

	public RankingResult(Person person, Long gold, Long silver, Long bronze, Long medals, Long participations) {
		this.person = person;
		this.gold = gold;
		this.silver = silver;
		this.bronze = bronze;
		this.medals = medals;
		this.participations = participations;
	}

	public Long getGold() {
		return gold;
	}

	public void setGold(Long gold) {
		this.gold = gold;
	}

	public Long getSilver() {
		return silver;
	}

	public void setSilver(Long silver) {
		this.silver = silver;
	}

	public Long getBronze() {
		return bronze;
	}

	public void setBronze(Long bronze) {
		this.bronze = bronze;
	}

	public Long getMedals() {
		return medals;
	}

	public void setMedals(Long medals) {
		this.medals = medals;
	}

	public Long getParticipations() {
		return participations;
	}

	public void setParticipations(Long participations) {
		this.participations = participations;
	}

	public Person getPerson() {
		return person;
	}

	public void setPerson(Person person) {
		this.person = person;
	}
}