package console;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Controller;
import query.QueryService;
import utils.StringProcessor;

import java.util.Scanner;

@Controller
public class QueryConsole {

	@Autowired
	private final QueryService queryService;

	public QueryConsole(QueryService queryService) {
		this.queryService = queryService;
		new Thread(this::run).start();
	}

	public void run() {
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
		}
	}
}
