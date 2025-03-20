package domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.validation.constraints.NotNull;

import java.util.Objects;

@Entity
public class Person extends Identifiable<Integer> {
	@NotNull
	@Column
	private String name;
	@NotNull
	@Column
	private int schoolYear;

	public Person() {
	}

	public Person(String name, int schoolYear) {
		this.name = name;
		this.schoolYear = schoolYear;
	}


	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}


	public int getSchoolYear() {
		return schoolYear;
	}

	public void setSchoolYear(int schoolYear) {
		this.schoolYear = schoolYear;
	}

	@Override
	public boolean equals(Object o) {
		if (this == o) return true;
		if (o == null || getClass() != o.getClass()) return false;
		Person person = (Person) o;
		return schoolYear == person.schoolYear && Objects.equals(name, person.name);
	}

	@Override
	public int hashCode() {
		return Objects.hash(name, schoolYear);
	}

	@Override
	public String toString() {
		return "Person{" +
				"id='" + getId() + '\'' +
				"name='" + name + '\'' +
				", schoolYear=" + schoolYear +
				'}';
	}

	@Override
	public Identifiable<Integer> copy() {
		return new Person(name, schoolYear);
	}
}
