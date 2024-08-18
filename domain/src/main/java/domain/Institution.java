package domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.validation.constraints.NotNull;

import java.util.Objects;

@Entity
public class Institution extends Identifiable<Integer> {

	@NotNull
	@Column
	private String region;
	@Column
	private String city;
	@NotNull
	@Column
	private String name;

	public Institution() {
	}

	public Institution(String region, String city, String name) {
		this.region = region;
		this.city = city;
		this.name = name;
	}

	public String getRegion() {
		return region;
	}

	public void setRegion(String location) {
		this.region = location;
	}

	public String getCity() {
		return city;
	}

	public void setCity(String city) {
		this.city = city;
	}


	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	@Override
	public boolean equals(Object o) {
		if (this == o) return true;
		if (o == null || getClass() != o.getClass()) return false;
		Institution that = (Institution) o;
		return Objects.equals(region, that.region) && Objects.equals(name, that.name);
	}

	@Override
	public int hashCode() {
		return Objects.hash(region, name);
	}

	@Override
	public String toString() {
		return "Institution{" +
				"id='" + getId() + '\'' +
				"region='" + region + '\'' +
				", city='" + city + '\'' +
				", name='" + name + '\'' +
				'}';
	}

	public void tryFix() {
		if (name.trim().endsWith(region))
			name = name.substring(0, name.indexOf(region)).trim();
		if (city != null && !city.isEmpty())
			if (name.trim().endsWith(city))
				name = name.substring(0, name.indexOf(city)).trim();
	}

}
