package console;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import query.QueryService;
import utils.StringProcessor;

import java.util.Scanner;

@SpringBootApplication
@ComponentScan(basePackages = {"repo", "console", "importer", "query", "utils", "merge"})
@EntityScan(basePackages = {"domain"})
public class QueryConsole implements CommandLineRunner {
	@Autowired
	private final QueryService queryService;

	public QueryConsole(QueryService queryService) {
		this.queryService = queryService;
	}

	public static void main(String[] args) {
		SpringApplication.run(QueryConsole.class, args);
	}

	@Override
	public void run(String... args) {
		Scanner in = new Scanner(System.in);
		System.out.println("SPY");
		while (true) {
			String input = in.nextLine().trim();
			if (input.equals("S")) {
				System.out.println("Search for: ");
				String name = StringProcessor.normaliseChild(in.nextLine());
				for (var people : queryService.getPeopleByName(name))
					System.out.println(people);
			}
			if (input.equals("P")) {
				System.out.println("Enter id: ");
				int id = in.nextInt();
				for (var v : queryService.getResultsByPerson(id))
					System.out.println(v.getContest().getYear() + " " + v.getYear() + " " + v.getInstitution().getRegion() + " " + v.getInstitution().getName() + " " + v.getPlace() + " " + v.getPrize() + " " + v.getMedal());
			}
			if (input.equals("Y")) {
				System.out.println("Enter contest id: ");
				int id = in.nextInt();
				System.out.println("Enter year: ");
				int y = in.nextInt();
				for (var v : queryService.getResultsByContest(id, y))
					System.out.println(v.getPlace() + " " + v.getPerson().getName() + " " + v.getInstitution().getRegion() + " " + v.getInstitution().getName() + " " + v.getPlace() + " " + v.getPrize() + " " + v.getMedal());

			}
			if (input.equals("RP")) {
				System.out.println("Enter original id: ");
				int id1 = in.nextInt();
				System.out.println("Enter replacement id: ");
				int id2 = in.nextInt();
				queryService.replaceName(id1, id2);
			}
			if (input.equals("RI")) {
				System.out.println("Enter original id: ");
				int id1 = in.nextInt();
				System.out.println("Enter replacement id: ");
				int id2 = in.nextInt();
				queryService.replaceInstitution(id1, id2);
			}
		}
	}
}
