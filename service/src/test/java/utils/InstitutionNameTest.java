package utils;

import domain.Institution;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

/**
 * School names as ParserService builds them: normaliseInstitution, then
 * Institution.tryFix with the row's county and town. Each case is a source
 * string seen in the ONM/ONI files.
 */
class InstitutionNameTest {

	private static String parsed(String school, String town, String county) {
		Institution institution = new Institution();
		institution.setRegion(StringProcessor.normaliseRegion(county));
		if (town != null)
			institution.setCity(StringProcessor.normaliseDash(town));
		institution.setName(StringProcessor.normaliseInstitution(school));
		institution.tryFix();
		return institution.getName();
	}

	@Test
	void countyAtTheEndOfALongerTownTakesTheWholeTown() {
		assertEquals("Scoala Gimnaziala Nr. 3", parsed("ȘCOALA GIMNAZIALĂ NR.3 PIATRA-NEAMȚ", null, "NT"));
		assertEquals("Scoala Gimnaziala Nr. 2", parsed("Şcoala Gimnazială Nr.2 Piatra- Neamţ", null, "NT"));
		assertEquals("Colegiul National Unirea", parsed("COLEGIUL NAȚIONAL UNIREA TÂRGU-MUREȘ", null, "MS"));
		assertEquals("Scoala Gimnaziala Nr. 4", parsed("ȘCOALA GIMNAZIALĂ NR. 4 RM. VÂLCEA", null, "VL"));
	}

	@Test
	void countyAndTownAreStillDropped() {
		assertEquals("Colegiul National", parsed("COLEGIUL NAȚIONAL IAȘI IAȘI", null, "IS"));
		assertEquals("Colegiul National", parsed("Colegiul Naţional Iaşi", "Iaşi", "IS"));
		assertEquals("Scoala Gimnaziala Nr. 11", parsed("ŞCOALA GIMNAZIALĂ NR.11 BUZĂU", null, "BZ"));
		/* The source's stray closing quote is kept, as before; only the town goes. */
		assertEquals("Liceul Teoretic Alexandru Ghica\"", parsed("Liceul Teoretic Alexandru Ghica\" Alexandria", "Alexandria", "TR"));
	}

	@Test
	void initialCBeforeANameIsNotColegiulNational() {
		assertEquals("Colegiul \"C. Negruzzi\"", parsed("Colegiul „C. Negruzzi”", "Iaşi", "IS"));
		assertEquals("Colegiul National \"C. Negri\"", parsed("Colegiul National \"C. Negri\"", "Galaţi", "GL"));
		assertEquals("Colegiul National B. P. Hasdeu", parsed("C.N. B.P. Hasdeu", "Buzau", "BZ"));
		assertEquals("Colegiul National \"Unirea\"", parsed("CN \"Unirea\"", "Turnu Măgurele", "TR"));
		assertEquals("Cnim", parsed("CNIM", "Giurgiu", "GR"));
	}

	@Test
	void romanNumeralsStayUpperCase() {
		assertEquals("Scoala Gimnaziala \"Take Ionescu\"", parsed("Şcoala cu cls. I-VIII \"Take Ionescu\"", "Râmnicu Vâlcea", "VL"));
		assertEquals("Scoala Gimnaziala Nr. 13", parsed("Școala cu cklasele I-VIII nr. 13", "Iași", "IS"));
		assertEquals("Scoala Gimnaziala Nr. 11", parsed("Şcoala Generală Nr. 11", "Buzău", "BZ"));
		assertEquals("Scoala Gimnaziala Lucian Blaga", parsed("Sc cu cls I VIII Lucian Blaga", "Satu Mare", "SM"));
		assertEquals("Liceul Teoretic \"Ion Vidu\"", parsed("LICEUL TEORETIC „ION VIDU”", "Timișoara", "TM"));
		assertEquals("Colegiul National \"Carol I\"", parsed("COLEGIUL NAȚIONAL „CAROL I”", "Craiova", "DJ"));
		assertEquals("Scoala Gimnaziala Nr. 2 Cu Clasele V-VIII", parsed("Scoala Gimnaziala Nr. 2 cu clasele V-VIII", null, "IF"));
	}

	@Test
	void abbreviationsExpandInAnyCase() {
		assertEquals("Colegiul National \"Gheorghe Vranceanu\"", parsed("COLEGIUL NAŢIONAL „GH. VRÂNCEANU”", null, "BC"));
		assertEquals("Colegiul National \"Alexandru Papiu Ilarian\"", parsed("COLEGIUL NAȚIONAL ”AL. PAPIU ILARIAN” TG-MUREȘ", null, "MS"));
		assertEquals("Scoala Gimnaziala \"Sfantul Andrei\"", parsed("Scoala Gimnaziala \"Sf.Andrei\"", "Sector 6", "B"));
		assertEquals("Scoala Gimnaziala Nr. 56", parsed("Scoala Gimnaziala nr 56", "Sector 2", "B"));
		assertEquals("Scoala Gimnaziala Nr. 1 Mogosoaia", parsed("Școala Gimnazială Nr1 Mogoșoaia", null, "IF"));
	}
}
