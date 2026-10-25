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

	/**
	 * Drops a trailing county or town that the source wrote into the school's
	 * name ("Colegiul National Iasi", county Iasi). When the county is the end of
	 * a longer town ("Piatra-Neamt", "Tg-Mures", "Rm. Valcea" in counties Neamt,
	 * Mures and Valcea) the whole town goes; cutting only the county used to leave
	 * "Piatra-", "Tg-" and "Rm." as the end of the name.
	 */
	public void tryFix() {
		/* Repeated, since sources also write the town twice ("Colegiul National
		   Iasi Iasi"), which the previous first-occurrence cut also removed. */
		String before;
		do {
			before = name;
			name = stripTrailing(name, region);
			name = stripTrailing(name, city);
		} while (name != null && !name.equals(before));
	}

	private static String stripTrailing(String name, String suffix) {
		if (name == null || suffix == null || suffix.isEmpty())
			return name;
		String trimmed = name.trim();
		if (!trimmed.endsWith(suffix) || trimmed.length() == suffix.length())
			return name;
		String rest = trimmed.substring(0, trimmed.length() - suffix.length());
		if (rest.endsWith("\""))
			return rest.trim();          // closing quote glued to the town: Ghica"Alexandria
		boolean spaced = rest.endsWith(" ");
		rest = rest.trim();
		if (rest.endsWith("-") || rest.endsWith(".")) {
			/* The suffix ends a longer town (Piatra-Neamt, Tg-Mures, Rm. Valcea):
			   drop the town's first half too, rather than leave "Piatra-". */
			int cut = rest.lastIndexOf(' ');
			String head = cut < 0 ? "" : rest.substring(0, cut).trim();
			return head.isEmpty() ? name : head;
		}
		return spaced ? rest : name;     // not spaced: part of a word, kept
	}

	@Override
	public Identifiable<Integer> copy() {
		return new Institution(region, city, name);
	}
}
