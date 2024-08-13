import domain.Contest;
import domain.Person;
import repo.PersonHibernateRepository;
import repo.PersonRepository;
import repo.ResultHibernateRepository;
import repo.ResultRepository;
import utils.StringProcessor;

import java.util.Scanner;

public class QueryConsole {
	public static void main(String[] args) throws Exception {
		ResultRepository resultRepository = new ResultHibernateRepository();
		PersonRepository personRepository = new PersonHibernateRepository();
		QueryService queryService = new QueryService(resultRepository, personRepository);
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
				Person p = new Person();
				p.setId(id);
				for (var v : queryService.getResultsByPerson(p))
					System.out.println(v.getContest().getYear() + " " + v.getYear() + " " + v.getInstitution().getRegion() + " " + v.getInstitution().getName() + " " + v.getPlace() + " " + v.getPrize() + " " + v.getMedal());
			}
			if (input.equals("Y")) {
				System.out.println("Enter contest id: ");
				int id = in.nextInt();
				Contest c = new Contest();
				c.setId(id);
				System.out.println("Enter year: ");
				int y = in.nextInt();
				for (var v : queryService.getResultsByContest(c, y))
					System.out.println(v.getPlace() + " " + v.getPerson().getName() + " " + v.getInstitution().getRegion() + " " + v.getInstitution().getName() + " " + v.getPlace() + " " + v.getPrize() + " " + v.getMedal());

			}
		}
	}
}
