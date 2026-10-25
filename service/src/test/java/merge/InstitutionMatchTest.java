package merge;

import domain.Institution;
import org.junit.jupiter.api.Test;
import repo.InstitutionRepository;
import utils.InstitutionKey;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Matching an imported school to the archive. Each case is a spelling found in
 * the ONI/ONM files and the school it belongs to.
 */
class InstitutionMatchTest {

	private static Institution school(int id, String name, String city, String region) {
		Institution institution = new Institution(region, city, name);
		institution.setId(id);
		return institution;
	}

	private static final List<Institution> ARCHIVE = List.of(
			school(1, "Scoala Gimnaziala \"Mihai Eminescu\"", "Braila", "Braila"),
			school(2, "Colegiul National \"Mihai Eminescu\"", "Satu Mare", "Satu Mare"),
			school(3, "Scoala Gimnaziala Nr. 11 \"Stefan Octavian Iosif\"", "Brasov", "Brasov"),
			school(4, "Colegiul National \"Alexandru Ioan Cuza\"", "Focsani", "Vrancea"),
			school(5, "Scoala Gimnaziala Nr. 1", "Vatra Dornei", "Suceava"),
			school(6, "Scoala Gimnaziala Nr. 1", "Bogdanesti", "Suceava"),
			school(7, "Colegiul National \"Spiru Haret\"", "Galati", "Galati"),
			school(8, "Scoala Gimnaziala \"Fanus Neagu\"", "Braila", "Braila"),
			school(9, "Colegiul National \"Costache Negruzzi\"", "Iasi", "Iasi"),
			school(10, "Scoala Gimnaziala Nr. 97", "Bucuresti", "Bucuresti"),
			school(11, "Colegiul National \"Emil Racovita\"", "Cluj-Napoca", "Cluj"),
			school(12, "Scoala Gimnaziala \"Mihai Eminescu\"", "Nasaud", "Bistrita-Nasaud"),
			school(13, "Scoala Gimnaziala Nr. 7", "Botosani", "Botosani"),
			school(14, "Liceul Teoretic International De Informatica", "Bucuresti", "Bucuresti"),
			school(15, "Scoala Gimnaziala \"I. G. Duca\"", "Bucuresti", "Bucuresti"),
			school(16, "Liceul International De Informatica Spectrum", "Cluj-Napoca", "Cluj"));

	/** The archive in memory: added schools get new ids and join the corpus. */
	private static class Archive implements InstitutionRepository {
		final List<Institution> all = new ArrayList<>(ARCHIVE);
		int next = 1000;

		public Institution add(Institution institution) {
			institution.setId(next++);
			all.add(institution);
			return institution;
		}

		public void delete(Integer id) { }

		public void update(Institution institution, Integer id) { }

		public Institution findById(Integer id) {
			return all.stream().filter(x -> x.getId().equals(id)).findFirst().orElse(null);
		}

		public List<Institution> findAll() {
			return new ArrayList<>(all);
		}

		public List<Institution> getByName(String name) {
			return all.stream().filter(x -> x.getName().equals(name)).toList();
		}

		public void replace(Institution original, Institution replacement) { }
	}

	/** The archive id an incoming school is matched to without asking, or null. */
	private static Integer matched(String name, String city, String region) {
		InstitutionMergeService service = new InstitutionMergeService(new Archive());
		Institution incoming = new Institution(region, city, name);
		service.beginMerge(List.of(incoming));
		Institution got = service.getMap().get(incoming);
		return got == null || got.getId() >= 1000 ? null : got.getId();
	}

	@Test
	void abbreviationsAndOldKindsMatch() {
		assertEquals(1, matched("Sc. Gim. M Eminescu", "Braila", "Braila"));
		assertEquals(2, matched("Colegiul National M. Eminescu", "Satu Mare", "Satu Mare"));
		assertEquals(3, matched("Sc. Gen. Nr. 11 \"St. O. Iosif\"", "Brasov", "Brasov"));
		assertEquals(4, matched("Colegiul National \"Al. I. Cuza\"", null, "Vrancea"));
		assertEquals(9, matched("Colegiu National \"C. Negruzzi\"", "Iasi", "Iasi"));
		assertEquals(10, matched("Scoala Cu Clasele I-Viii Nr. 97", "Bucuresti", "Bucuresti"));
		assertEquals(10, matched("Scoala 97", null, "Bucuresti"));
	}

	@Test
	void aTownWrittenIntoTheNameIsIgnored() {
		assertEquals(11, matched("Colegiul National Emil Racovita Cluj-Napoca Cluj-Napoca", "Cluj-Napoca", "Cluj"));
		assertEquals(12, matched("Scoala Gimnaziala Mihai Eminescu Nasaud", null, "Bistrita-Nasaud"));
	}

	@Test
	void differentTownsAreDifferentSchools() {
		assertNull(matched("Scoala Gimnaziala Nr. 1", "Suceava", "Suceava"));
		assertNull(matched("Colegiul National \"Spiru Haret\"", "Tecuci", "Galati"));
		assertEquals(6, matched("Scoala Gimnaziala Nr.1", "Bogdanesti", "Suceava"));
	}

	@Test
	void aMissingTownIsOnlyBridgedByADistinctiveName() {
		assertEquals(8, matched("Scoala Gimnaziala \"F. Neagu\"", null, "Braila"));       // one in the archive
		assertNull(matched("Scoala Gimnaziala Nr. 1", null, "Suceava"));                    // which one?
		assertNull(matched("Scoala Gimnaziala \"Mihai Eminescu\"", null, "Braila"));        // a name every county has
	}

	@Test
	void aMissingNumberOrNameInTheSameTown() {
		assertEquals(13, matched("Scoala Gimnaziala Nr. 7 \"Octav Bancila\"", "Botosani", "Botosani"));
		assertEquals(15, matched("Sc. 146 I. G. Duca", "Bucuresti", "Bucuresti"));
		assertEquals(15, matched("Scoala Gimnaziala Nr. 146 \"I. G. Duca\"", "Bucuresti", "Bucuresti"));
		assertNull(matched("Scoala Gimnaziala Nr. 7 \"Octav Bancila\"", null, "Botosani"));   // town unknown
		assertNull(matched("Scoala Gimnaziala Nr. 8", "Botosani", "Botosani"));                // another number
	}

	@Test
	void internationalHighSchoolOfInformatics() {
		assertEquals(14, matched("Liceul International De Informatica", "Bucuresti", "Bucuresti"));
		assertEquals(14, matched("Liceul Internațional de Informatică", "București", "Bucuresti"));
		assertNull(matched("Liceul International De Informatica", "Cluj-Napoca", "Cluj"));      // Spectrum is another school
	}

	@Test
	void sameSchoolRules() {
		assertTrue(InstitutionKey.sameSchool("sg 7", "sg 7 octav bancila"));
		assertTrue(InstitutionKey.sameSchool("sg 146 ion gheorghe duca", "sg ion gheorghe duca"));
		assertFalse(InstitutionKey.sameSchool("sg 7", "sg 8"));
		assertFalse(InstitutionKey.sameSchool("sg 7 octav bancila", "sg 7 mihai eminescu"));
		assertFalse(InstitutionKey.sameSchool("sg 7", "lt 7"));
		assertFalse(InstitutionKey.sameSchool("sg", "sg mihai eminescu"));
	}

	@Test
	void keysDescribeTheSchool() {
		InstitutionKey key = new InstitutionKey(ARCHIVE);
		assertEquals("sg 11 stefan octavian iosif", key.of("Sc. Gen. Nr. 11 \"St. O. Iosif\"", "Brasov", "Brasov"));
		assertEquals("cn alexandru ioan cuza", key.of("C.N. \"Al.I. Cuza\"", "Focsani", "Vrancea"));
		assertEquals(key.of("Scoala Gimnaziala Gimnaziala Nr. 1", null, "Teleorman"), key.of("Scoala Cu Clase I-Viiii Nr. 1", null, "Teleorman"));
		assertEquals("targumures", InstitutionKey.town("Tg. Mures"));
		assertEquals("bucuresti", InstitutionKey.town("Sector 3"));
	}
}
