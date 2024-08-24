package repo;

import domain.Institution;
import domain.Result;
import org.hibernate.Session;
import org.springframework.stereotype.Repository;
import repo.utils.HibernateUtils;

import java.util.List;

@Repository
public class InstitutionHibernateRepository implements InstitutionRepository {
	@Override
	public Institution save(Institution elem) {
		HibernateUtils.getSessionFactory().inTransaction(session -> {
			session.persist(elem);
		});
		try (Session session = HibernateUtils.getSessionFactory().openSession()) {
			return session.createQuery("from Institution where id=(select max(id) from Institution)", Institution.class).uniqueResult();
		}
	}

	@Override
	public void delete(Integer integer) {
		HibernateUtils.getSessionFactory().inTransaction(session -> {
			var entity = session.createQuery("from Institution where id=?1", Institution.class).setParameter(1, integer).uniqueResult();
			if (entity != null)
				session.remove(entity);
		});
	}

	@Override
	public void update(Institution elem, Integer integer) {
		HibernateUtils.getSessionFactory().inTransaction(session -> {
			elem.setId(integer);
			session.merge(elem);
		});
	}

	@Override
	public Institution findById(Integer integer) {
		try (Session session = HibernateUtils.getSessionFactory().openSession()) {
			return session.createQuery("from Institution where id=?1", Institution.class).setParameter(1, integer).uniqueResult();
		}
	}

	@Override
	public List<Institution> findAll() {
		try (Session session = HibernateUtils.getSessionFactory().openSession()) {
			return session.createQuery("from Institution ", Institution.class).getResultList();
		}
	}

	@Override
	public List<Institution> getByName(String institution) {
		try (Session session = HibernateUtils.getSessionFactory().openSession()) {
			return session.createQuery("from Institution where name=?1", Institution.class).setParameter(1, institution).getResultList();
		}
	}

	@Override
	public void replace(Institution original, Institution replacement) {
		if ((replacement.getCity() == null || replacement.getCity().isEmpty()) && original.getCity() != null)
			replacement.setCity(original.getCity());
		HibernateUtils.getSessionFactory().inTransaction(session -> {
			List<Result> results = session.createQuery("from Result r where r.institution.id=?1", Result.class)
					.setParameter(1, original.getId())
					.getResultList();
			for (Result result : results) {
				result.setInstitution(replacement);
				session.merge(result);
			}
			var entity = session.createQuery("from Institution where id=?1", Institution.class).setParameter(1, original.getId()).uniqueResult();
			session.remove(entity);
		});
	}
}
