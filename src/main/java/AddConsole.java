import domain.Contest;
import importer.AddService;
import importer.merge.InstitutionMergeService;
import importer.merge.PersonMergeService;
import repo.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

public class AddConsole {

	public static void main(String[] args) throws Exception {
		ContestRepository contestRepository = new ContestHibernateRepository();
		InstitutionRepository institutionRepository = new InstitutionHibernateRepository();
		PersonRepository personRepository = new PersonHibernateRepository();
		ResultRepository resultRepository = new ResultHibernateRepository();
		InstitutionMergeService institutionMergeService = new InstitutionMergeService(institutionRepository);
		PersonMergeService personMergeService = new PersonMergeService(personRepository);
		AddService addService = new AddService(contestRepository, resultRepository, institutionMergeService, personMergeService);
		for (int year : List.of(2024)) {
			Contest contest = new Contest(year, "ONI", null);
			addService.addDataFromFile("C:\\Users\\Liviu\\Desktop\\" + year + ".xlsx", contest);
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
				institutionMergeService.handleSuggestions(replies);
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
				personMergeService.handleSuggestions(replies);
			}

		}
	}
}


