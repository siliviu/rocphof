package repo;

import domain.Person;
import domain.Result;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.hibernate.Session;
import org.springframework.stereotype.Repository;
import repo.utils.HibernateUtils;

import java.util.List;

@Repository
public class PersonHibernateRepository implements PersonRepository {
	protected static final Logger logger = LogManager.getLogger(PersonHibernateRepository.class.getName());

	@Override
	public Person save(Person elem) {
		HibernateUtils.getSessionFactory().inTransaction(session -> {
			session.persist(elem);
		});
		try (Session session = HibernateUtils.getSessionFactory().openSession()) {
			return session.createQuery("from Person where id=(select max(id) from Person)", Person.class).uniqueResult();
		}
	}

	@Override
	public void delete(Integer integer) {
		HibernateUtils.getSessionFactory().inTransaction(session -> {
			var entity = session.createQuery("from Person where id=?1", Person.class).setParameter(1, integer).uniqueResult();
			if (entity != null)
				session.remove(entity);
		});
	}

	@Override
	public void update(Person elem, Integer integer) {
		HibernateUtils.getSessionFactory().inTransaction(session -> {
			elem.setId(integer);
			session.merge(elem);
		});
	}

	@Override
	public Person findById(Integer integer) {
		try (Session session = HibernateUtils.getSessionFactory().openSession()) {
			return session.createQuery("from Person where id=?1", Person.class).setParameter(1, integer).uniqueResult();
		}
	}

	@Override
	public List<Person> findAll() {
		try (Session session = HibernateUtils.getSessionFactory().openSession()) {
			return session.createQuery("from Person ", Person.class).getResultList();
		}
	}

	@Override
	public List<Person> getByName(String name) {
		try (Session session = HibernateUtils.getSessionFactory().openSession()) {
			return session.createQuery("from Person where name=?1", Person.class).setParameter(1, name).getResultList();
		}

	}

	@Override
	public Result getMostRecentResult(Person person) {
		try (Session session = HibernateUtils.getSessionFactory().openSession()) {
			List<Result> results = session.createQuery("from Result r where r.person.id=?1 order by r.year desc", Result.class).setParameter(1, person.getId()).getResultList();
			return results.isEmpty() ? null : results.getFirst();
		}
	}

	@Override
	public void replace(Person original, Person replacement) {
		HibernateUtils.getSessionFactory().inTransaction(session -> {
			List<Result> results = session.createQuery("from Result r where r.person.id=?1", Result.class)
					.setParameter(1, original.getId())
					.getResultList();
			for (Result result : results) {
				result.setPerson(replacement);
				session.merge(result);
			}
			var entity = session.createQuery("from Person where id=?1", Person.class).setParameter(1, original.getId()).uniqueResult();
			if (entity != null)
				session.remove(entity);
		});
	}

}
