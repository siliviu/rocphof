package domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
@ToString(callSuper = true)
public class Institution extends Identifiable<Integer> {

	@NotNull
	@Column
	private String region;
	@Column
	private String city;
	@Column
	private String name;

	public void tryFix() {
		if (name != null && name.trim().endsWith(region))
			name = name.substring(0, name.indexOf(region)).trim();
		if (city != null && !city.isEmpty())
            if (name != null && name.trim().endsWith(city))
				name = name.substring(0, name.indexOf(city)).trim();
    }

	@Override
	public Identifiable<Integer> copy() {
		return new Institution(region, city, name);
	}
}
