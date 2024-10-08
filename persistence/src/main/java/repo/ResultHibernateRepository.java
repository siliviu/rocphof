package repo;

import domain.Contest;
import domain.Person;
import domain.RankingResult;
import domain.Result;
import org.hibernate.Session;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;
import repo.utils.HibernateUtils;

import java.util.List;


@Repository
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
	public Result findById(Integer integer) {
		try (Session session = HibernateUtils.getSessionFactory().openSession()) {
			return session.createQuery("from Result where id=?1", Result.class).setParameter(1, integer).uniqueResult();
		}
	}

	@Override
	public List<Result> findAll() {
		try (Session session = HibernateUtils.getSessionFactory().openSession()) {
			return session.createQuery("from Result ", Result.class).getResultList();
		}
	}

	@Override
	public List<Result> getResultsByContest(Integer contestId, int year) {
		try (Session session = HibernateUtils.getSessionFactory().openSession()) {
			return session.createQuery("from Result where contest.id=?1 and year=?2 order by case when place is null then 1000 END, place", Result.class)
//			return session.createQuery("from Result where contest.id=?1 and year=?2 order by person.name ", Result.class)
					.setParameter(1, contestId)
					.setParameter(2, year)
					.getResultList();
		}
	}

	@Override
	public List<Result> getResultsByPerson(Integer personId) {
		try (Session session = HibernateUtils.getSessionFactory().openSession()) {
			return session.createQuery("from Result r where r.person.id=?1 order by r.contest.year desc", Result.class)
					.setParameter(1, personId)
					.getResultList();
		}
	}

	@Override
	public List<Result> getResultsByInstitution(Integer id) {
		try (Session session = HibernateUtils.getSessionFactory().openSession()) {
			return session.createQuery("from Result r where r.institution.id=?1 order by r.contest.year desc, r.year desc, case when place is null then 1000 END, place", Result.class)
					.setParameter(1, id)
					.getResultList();
		}
	}

	@Override
	public List<Result> getResultsByRegion(String name) {
		try (Session session = HibernateUtils.getSessionFactory().openSession()) {
			return session.createQuery("from Result r where r.institution.region=?1 order by r.contest.year desc, r.year desc, case when place is null then 1000 END, place ", Result.class)
					.setParameter(1, name)
					.getResultList();
		}
	}

	@Override
	public Result getResultByContestAndPerson(Integer contestId, Integer personId) {
		try (Session session = HibernateUtils.getSessionFactory().openSession()) {
			return session.createQuery("from Result where contest.id=?1 and person.id=?2", Result.class)
					.setParameter(1, contestId)
					.setParameter(2, personId)
					.uniqueResult();
		}
	}


	@Override
	public void mergeQualified(Integer qualifiedId, Integer originalId) {
		Contest originalContest;
		try (Session session = HibernateUtils.getSessionFactory().openSession()) {
			originalContest = session.createQuery("from Contest where id=?1", Contest.class).setParameter(1, originalId).uniqueResult();
		}
		for (int i = 5; i <= 12; ++i) {
			for (Result qualifiedResult : getResultsByContest(qualifiedId, i)) {
				Person person = qualifiedResult.getPerson();
				Result originalResult = getResultByContestAndPerson(originalId, person.getId());
				if (originalResult == null) {
					qualifiedResult.setPlace(null);
					qualifiedResult.setContest(originalContest);
					update(qualifiedResult, qualifiedResult.getId());
				} else
					delete(qualifiedResult.getId());
			}
		}
	}

	@Override
	public List<RankingResult> getRanking(String region, Integer year) {
		try (Session session = HibernateUtils.getSessionFactory().openSession()) {
			var query = session.createQuery("SELECT person as person," +
					"       SUM(CASE WHEN medal = 'GOLD' THEN 1 ELSE 0 END)   as gold," +
					"       SUM(CASE WHEN medal = 'SILVER' THEN 1 ELSE 0 END) as silver," +
					"       SUM(CASE WHEN medal = 'BRONZE' THEN 1 ELSE 0 END) as bronze," +
					"       SUM(CASE WHEN medal IN ('GOLD', 'SILVER', 'BRONZE') THEN 1 ELSE 0 END) as medals," +
					"       COUNT(*) as participations " +
					"FROM Result " +
					"WHERE contest.name='ONI' " +
					(region != null || year != null ? "AND " : " ") +
					(region != null ? "institution.region =?1" : " ") +
					(year != null ? "person.schoolYear =?1" : " ") +
					" " +
					"GROUP BY person.id " +
					"ORDER BY gold desc, silver desc, bronze desc, participations desc LIMIT 250", RankingResult.class);
			if (region != null)
				query.setParameter(1, region);
			if (year != null)
				query.setParameter(1, year);
			return query.getResultList();
		}
	}

	@Override
	public Long getParticipants(Integer contestId, Integer year) {
		try (Session session = HibernateUtils.getSessionFactory().openSession()) {
			return (Long) session.createQuery("select count(*) from Result where contest.id=?1 and year=?2")
					.setParameter(1, contestId)
					.setParameter(2, year)
					.uniqueResult();
		}
	}
}
