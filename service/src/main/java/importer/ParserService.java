package importer;

import domain.*;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import utils.StringProcessor;

import java.io.*;
import java.util.ArrayList;
import java.util.List;

public class ParserService {
	final static int
			POS = 0,
			PERS_NAME = 1,
			INST_NAME = 2,
			CITY_NAME = 3,
			REGION_NAME = 4,
			SCORE = 5,
			PRIZE = 6,
			MEDAL = 7;

	public static List<Result> parseONI(String filePath, Contest contest) throws Exception {
		FileInputStream file = new FileInputStream(filePath);
		Workbook workbook = new XSSFWorkbook(file);
		List<Result> results = new ArrayList<>();
		for (int i = 5; i <= 12; ++i) {
			float curScore = 10000;
			int curPos = 0, nextPos = 1;
			Sheet sheet = workbook.getSheetAt(i - 5);
			for (Row row : sheet) {
				Person person = new Person();
				person.setName(StringProcessor.normaliseChild(row.getCell(PERS_NAME).getStringCellValue()));
				person.setSchoolYear(contest.getYear() - i);
				Institution institution = new Institution();
				institution.setRegion(StringProcessor.normaliseRegion(row.getCell(REGION_NAME).getStringCellValue()));
				if (row.getCell(CITY_NAME) != null)
					institution.setCity(StringProcessor.normaliseDash(row.getCell(CITY_NAME).getStringCellValue()));
				institution.setName(StringProcessor.normaliseInstitution(row.getCell(INST_NAME).getStringCellValue()));
				institution.tryFix();
				Result result = new Result();
				result.setYear(i);
				Prize prize = row.getCell(PRIZE) == null ? null : Prize.fromString(StringProcessor.normalisePrize(row.getCell(PRIZE).getStringCellValue()));
				result.setPrize(prize);
				Medal medal = row.getCell(MEDAL) == null ? null : Medal.fromString(StringProcessor.normalise(row.getCell(MEDAL).getStringCellValue()));
				if (row.getCell(SCORE) != null && row.getCell(SCORE).getCellType().equals(CellType.NUMERIC)) {
					float score = (float) row.getCell(SCORE).getNumericCellValue();
					if (score < curScore) {
						curScore = score;
						curPos = nextPos;
						++nextPos;
					} else {
						assert (score == curScore);
						++nextPos;
					}
					result.setPlace(curPos);
					result.setScore(score);
				} else
					result.setPlace((int) row.getCell(POS).getNumericCellValue());
				result.setMedal(medal);
				result.setPerson(person);
				result.setInstitution(institution);
				results.add(result);
			}
		}
		return results;
	}

	public static List<Result> parseLOT(String filePath, Contest contest) throws Exception {
		FileInputStream file = new FileInputStream(filePath);
		Workbook workbook = new XSSFWorkbook(file);
		List<Result> results = new ArrayList<>();
		for (int i = 1; i <= 2; ++i) {
			float curScore = 10000;
			int curPos = 0, nextPos = 1;
			Sheet sheet = workbook.getSheetAt(i - 1);
			for (Row row : sheet) {
				Person person = new Person();
				person.setName(StringProcessor.normaliseChild(row.getCell(PERS_NAME).getStringCellValue()));
				person.setSchoolYear(1337);
				Institution institution = new Institution();
				Result result = new Result();
				result.setYear(i);
				Prize prize = row.getCell(PRIZE) == null ? null : Prize.fromString(StringProcessor.normalisePrize(row.getCell(PRIZE).getStringCellValue()));
				result.setPrize(prize);
				if (row.getCell(SCORE) != null && row.getCell(SCORE).getCellType().equals(CellType.NUMERIC)) {
					float score = (float) row.getCell(SCORE).getNumericCellValue();
					if (score < curScore) {
						curScore = score;
						curPos = nextPos;
						++nextPos;
					} else {
						assert (score == curScore);
						++nextPos;
					}
					result.setPlace(curPos);
					result.setScore(score);
				} else
					result.setPlace((int) row.getCell(POS).getNumericCellValue());
				result.setPerson(person);
				result.setInstitution(institution);
				System.out.println(result);
				results.add(result);
			}
		}
		return results;
	}
}
