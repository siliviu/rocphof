package console;

import domain.Contest;
import domain.Person;
import importer.AddService;
import importer.merge.InstitutionMergeService;
import importer.merge.PersonMergeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

@Controller
public class AddConsole {
	private final InstitutionMergeService institutionMergeService;

	private final PersonMergeService personMergeService;
	private final AddService addService;

	public AddConsole(InstitutionMergeService institutionMergeService, PersonMergeService personMergeService, AddService addService) {
		this.institutionMergeService = institutionMergeService;
		this.personMergeService = personMergeService;
		this.addService = addService;
//		new Thread(this::run).start();
	}

	public void run() {
		for (int year : List.of(2016)) {
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

		}
	}
}


