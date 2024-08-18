package repo.old;

import domain.Contest;
import org.hibernate.Session;
import org.springframework.stereotype.Repository;
import repo.old.ContestRepository;
import repo.utils.HibernateUtils;

import java.util.List;

@Repository
public class ContestHibernateRepository implements ContestRepository {
	@Override
	public Contest save(Contest elem) {
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
			return session.createQuery("from Contest ", Contest.class).getResultList();
		}
	}
}