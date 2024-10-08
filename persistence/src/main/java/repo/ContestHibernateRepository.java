package repo;

import domain.Contest;
import org.hibernate.Session;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;
import repo.utils.HibernateUtils;

import java.util.List;

@Repository
public class ContestHibernateRepository implements ContestRepository {
	@Override
	public Contest add(Contest elem) {
		HibernateUtils.getSessionFactory().inTransaction(session -> {
			session.persist(elem);
		});
		try (Session session = HibernateUtils.getSessionFactory().openSession()) {
			return session.createQuery("from Contest where id=(select max(id) from Contest)", Contest.class).uniqueResult();
		}
	}

	@Override
	public void delete(Integer integer) {
		HibernateUtils.getSessionFactory().inTransaction(session -> {
			var entity = session.createQuery("from Contest where id=?1", Contest.class).setParameter(1, integer).uniqueResult();
			if (entity != null)
				session.remove(entity);
		});
	}

	@Override
	public void update(Contest elem, Integer integer) {
		HibernateUtils.getSessionFactory().inTransaction(session -> {
			elem.setId(integer);
			session.merge(elem);
		});
	}

	@Override
	public Contest findById(Integer integer) {
		try (Session session = HibernateUtils.getSessionFactory().openSession()) {
			return session.createQuery("from Contest where id=?1", Contest.class).setParameter(1, integer).uniqueResult();
		}
	}

	@Override
	public List<Contest> findAll() {
		try (Session session = HibernateUtils.getSessionFactory().openSession()) {
			return session.createQuery("from Contest order by year desc", Contest.class).getResultList();
		}
	}

	@Override
	public Contest findNext(Contest contest) {
		try (Session session = HibernateUtils.getSessionFactory().openSession()) {
			List<Contest> contests = session.createQuery("from Contest where year > ?1 order by year", Contest.class)
					.setParameter(1, contest.getYear())
					.getResultList();
			if (contests.isEmpty())
				return null;
			return contests.get(0);
		}
	}

	@Override
	public Contest findPrevious(Contest contest) {
		try (Session session = HibernateUtils.getSessionFactory().openSession()) {
			List<Contest> contests = session.createQuery("from Contest where year < ?1 order by year desc", Contest.class)
					.setParameter(1, contest.getYear())
					.getResultList();
			if (contests.isEmpty())
				return null;
			return contests.get(0);
		}
	}
}
