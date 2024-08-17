package repo;

import domain.Contest;
import domain.Person;
import domain.Result;
import org.hibernate.Session;
import utils.HibernateUtils;

import java.util.List;

public class ResultHibernateRepository implements ResultRepository {
	@Override
	public Result add(Result elem) {
		HibernateUtils.getSessionFactory().inTransaction(session -> {
			session.persist(elem);
		});
		try (Session session = HibernateUtils.getSessionFactory().openSession()) {
			return session.createQuery("from Result where id=(select max(id) from Result)", Result.class).uniqueResult();
		}
	}

	@Override
	public void delete(Integer integer) {
		HibernateUtils.getSessionFactory().inTransaction(session -> {
			var entity = session.createQuery("from Result where id=?1", Result.class).setParameter(1, integer).uniqueResult();
			if (entity != null)
				session.remove(entity);
		});
	}

	@Override
	public void update(Result elem, Integer integer) {
		HibernateUtils.getSessionFactory().inTransaction(session -> {
			elem.setId(integer);
			session.merge(elem);
		});
	}

	@Override
	public Result getById(Integer integer) {
		try (Session session = HibernateUtils.getSessionFactory().openSession()) {
			return session.createQuery("from Result where id=?1", Result.class).setParameter(1, integer).uniqueResult();
		}
	}

	@Override
	public List<Result> getAll() {
		try (Session session = HibernateUtils.getSessionFactory().openSession()) {
			return session.createQuery("from Result ", Result.class).getResultList();
		}
	}

	@Override
	public List<Result> getResultsByContest(Contest contest, int year) {
		try (Session session = HibernateUtils.getSessionFactory().openSession()) {
			return session.createQuery("from Result where contest.id=?1 and year=?2 order by place", Result.class)
					.setParameter(1, contest.getId())
					.setParameter(2, year)
					.getResultList();
		}
	}

	@Override
	public List<Result> getResultsByPerson(Person person) {
		try (Session session = HibernateUtils.getSessionFactory().openSession()) {
			return session.createQuery("from Result r where r.person.id=?1 order by r.contest.year desc", Result.class)
					.setParameter(1, person.getId())
					.getResultList();
		}	}
}
