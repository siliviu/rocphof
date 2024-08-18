package domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.validation.constraints.NotNull;

import java.util.Objects;

@Entity
public class Contest extends Identifiable<Integer> {
	@Column
	@NotNull
	private int year;
	@Column
	@NotNull
	private String name;
	@Column
	private String desc;

	public Contest() {
	}

	public Contest(int year, String name, String desc) {
		this.year = year;
		this.name = name;
		this.desc = desc;
	}

	public int getYear() {
		return year;
	}

	public void setYear(int year) {
		this.year = year;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getDesc() {
		return desc;
	}

	public void setDesc(String desc) {
		this.desc = desc;
	}

	@Override
	public boolean equals(Object o) {
		if (this == o) return true;
		if (o == null || getClass() != o.getClass()) return false;
		Contest contest = (Contest) o;
		return year == contest.year && Objects.equals(name, contest.name) && Objects.equals(desc, contest.desc);
	}

	@Override
	public int hashCode() {
		return Objects.hash(year, name, desc);
	}

	@Override
	public String toString() {
		return "Contest{" +
				"year=" + year +
				", name='" + name + '\'' +
				", desc='" + desc + '\'' +
				'}';
	}
}
