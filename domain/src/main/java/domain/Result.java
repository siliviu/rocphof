package domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.util.Objects;

@Entity
public class Result extends Identifiable<Integer> {
	@ManyToOne
	@JoinColumn
	@NotNull
	private Person person;
	@ManyToOne
	@JoinColumn
	@NotNull
	private Institution institution;
	@ManyToOne
	@JoinColumn
	@NotNull
	private Contest contest;
	@Column
	@NotNull
	private int year;
	@Column
	private Integer score;
	@Column
	private Integer place;
	@Enumerated(EnumType.STRING)
	@Column
	private Prize prize;
	@Enumerated(EnumType.STRING)
	@Column
	private Medal medal;

	public Result() {
	}

	public Result(Person person, Institution institution, Contest contest, int year, int place) {
		this.person = person;
		this.institution = institution;
		this.contest = contest;
		this.year = year;
		this.place = place;
	}


	public Person getPerson() {
		return person;
	}

	public void setPerson(Person person) {
		this.person = person;
	}


	public Institution getInstitution() {
		return institution;
	}

	public void setInstitution(Institution institution) {
		this.institution = institution;
	}


	public Contest getContest() {
		return contest;
	}

	public void setContest(Contest contest) {
		this.contest = contest;
	}


	public int getYear() {
		return year;
	}

	public void setYear(int year) {
		this.year = year;
	}

	public Integer getScore() {
		return score;
	}

	public void setScore(Integer score) {
		this.score = score;
	}


	public Prize getPrize() {
		return prize;
	}

	public void setPrize(Prize prize) {
		this.prize = prize;
	}

	public Medal getMedal() {
		return medal;
	}

	public void setMedal(Medal medal) {
		this.medal = medal;
	}

	public Integer getPlace() {
		return place;
	}

	public void setPlace(Integer place) {
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
