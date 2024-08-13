package domain;

import jakarta.persistence.*;

import java.util.Objects;

@Entity
public class Result extends Identifiable<Integer> {
	private Person person;
	private Institution institution;
	private Contest contest;
	private int year;
	private int score;
	private int place;
	private Prize prize;
	private Medal medal;

	public Result() {
	}

	public Result(Person person, Institution institution, Contest contest, int year, int place) {
		this.person = person;
		this.institution = institution;
		this.contest = contest;
		this.year = year;
		this.place=place;
	}

	@ManyToOne
	@JoinColumn
	public Person getPerson() {
		return person;
	}

	public void setPerson(Person person) {
		this.person = person;
	}

	@ManyToOne
	@JoinColumn
	public Institution getInstitution() {
		return institution;
	}

	public void setInstitution(Institution institution) {
		this.institution = institution;
	}

	@ManyToOne
	@JoinColumn
	public Contest getContest() {
		return contest;
	}

	public void setContest(Contest contest) {
		this.contest = contest;
	}

	@Column
	public int getYear() {
		return year;
	}

	public void setYear(int year) {
		this.year = year;
	}

	@Column
	public int getScore() {
		return score;
	}

	public void setScore(int score) {
		this.score = score;
	}

	@Enumerated(EnumType.STRING)
	@Column
	public Prize getPrize() {
		return prize;
	}

	public void setPrize(Prize prize) {
		this.prize = prize;
	}

	@Enumerated(EnumType.STRING)
	@Column
	public Medal getMedal() {
		return medal;
	}

	public void setMedal(Medal medal) {
		this.medal = medal;
	}

	@Column
	public int getPlace() {
		return place;
	}

	public void setPlace(int place) {
		this.place = place;
	}
	@Override
	public boolean equals(Object o) {
		if (this == o) return true;
		if (o == null || getClass() != o.getClass()) return false;
		Result result = (Result) o;
		return year == result.year && score == result.score && Objects.equals(person, result.person) && Objects.equals(institution, result.institution) && Objects.equals(contest, result.contest) && prize == result.prize && medal == result.medal;
	}

	@Override
	public int hashCode() {
		return Objects.hash(person, institution, contest, year, score, prize, medal);
	}

	@Override
	public String toString() {
		return "Result{" +
				"person=" + person +
				", institution=" + institution +
				", contest=" + contest +
				", year=" + year +
				", score=" + score +
				", prize=" + prize +
				", medal=" + medal +
				'}';
	}


}
