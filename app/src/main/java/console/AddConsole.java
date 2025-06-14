package console;

import domain.Contest;
import importer.AddService;
import merge.InstitutionMergeService;
import merge.PersonMergeService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;

import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

@SpringBootApplication
@ComponentScan(basePackages = {"repo", "console", "importer", "query", "utils", "merge"})
@EntityScan(basePackages = {"domain"})
public class AddConsole implements CommandLineRunner {

	private final InstitutionMergeService institutionMergeService;

	private final PersonMergeService personMergeService;
	private final AddService addService;

	public AddConsole(InstitutionMergeService institutionMergeService, PersonMergeService personMergeService, AddService addService) {
		this.institutionMergeService = institutionMergeService;
		this.personMergeService = personMergeService;
		this.addService = addService;
	}
	public static void main(String[] args) {
		SpringApplication.run(AddConsole.class, args);
	}

	@Override
	public void run(String... args) {
		Scanner in = new Scanner(System.in);
		System.out.println("ADD");
		while (true) {
			System.out.println("Enter contest year: ");
			int year = in.nextInt();
			System.out.println("Enter contest name (ONI, LOT): ");
			String name = in.nextLine();
			System.out.println("Enter mergeId (0 to disable merge): ");
			int mergeId = in.nextInt();
			add(year, name, mergeId);
		}
	}

	private void add(int year, String name, int mergeId) {
		Contest contest = new Contest(year, name, null);
		addService.addDataFromFile("C:\\Users\\Liviu\\Documents\\p\\rocphof\\results-data\\" + (name.equals("LOT") ? "lot" : "") + year + ".xlsx", contest);
		Scanner in = new Scanner(System.in);
		{
			List<Integer> replies = new ArrayList<>();
			for (var suggestion : institutionMergeService.getSuggestions()) {
				System.out.println("Suggestions for: " + suggestion.first());
				int i = 1;
				for (var object : suggestion.second())
					System.out.println(i++ + ": " + object);
				int reply = in.nextInt();
				replies.add(reply);
			}
			try {
				institutionMergeService.handleSuggestions(replies);
			} catch (Exception e) {
				throw new RuntimeException(e);
			}
		}
		{
			List<Integer> replies = new ArrayList<>();
			for (var suggestion : personMergeService.getSuggestions()) {
				System.out.println("Suggestions for: " + suggestion.first() + " | " + personMergeService.getRecentResult(suggestion.first()));
				int i = 1;
				for (var object : suggestion.second())
					System.out.println(i++ + ": " + object + " | " + personMergeService.getRecentResult(object));
				int reply = in.nextInt();
				replies.add(reply);
			}
			try {
				personMergeService.handleSuggestions(replies);
			} catch (Exception e) {
				throw new RuntimeException(e);
			}
		}
		if (mergeId != 0)
			addService.mergeQualified(contest.getId(), mergeId);
	}
}


