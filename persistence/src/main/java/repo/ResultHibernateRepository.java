package repo;

import domain.Contest;
import domain.ColumnTally;
import domain.Constants;
import domain.Medal;
import domain.Person;
import domain.RankingByColumn;
import domain.RankingResult;
import domain.RankingInstitution;
import domain.RankingRegion;
import domain.Result;
import org.hibernate.Session;
import org.springframework.stereotype.Repository;
import repo.utils.HibernateUtils;

import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static domain.Constants.NATIONAL_CONTESTS;
import static domain.Constants.MAX_GRADE;
import static domain.Constants.MIN_GRADE;
import static domain.Constants.SCOPE_DEFAULT;
import static domain.Constants.SCOPE_INTERNATIONAL;
import static domain.Constants.SUBJECT_ALL;
import static domain.Constants.SUBJECT_DEFAULT;


@Repository
public class ResultHibernateRepository implements ResultRepository {
	@Override
	public Result add(Result elem) {
		HibernateUtils.getSessionFactory().inTransaction(session -> session.persist(elem));
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
	public List<Result> getResultsByContestName(String name) {
		try (Session session = HibernateUtils.getSessionFactory().openSession()) {
			return session.createQuery("from Result r where r.contest.name=?1 order by r.contest.year desc, case when place is null then 1000 END, place", Result.class)
					.setParameter(1, name)
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


	private boolean hasResult(Integer contestId, Integer personId) {
		try (Session session = HibernateUtils.getSessionFactory().openSession()) {
			return session.createQuery("select count(*) from Result where contest.id=?1 and person.id=?2", Long.class)
					.setParameter(1, contestId)
					.setParameter(2, personId)
					.uniqueResult() > 0;
		}
	}

	@Override
	public void mergeQualified(Integer qualifiedId, Integer originalId) {
		Contest originalContest;
		try (Session session = HibernateUtils.getSessionFactory().openSession()) {
			originalContest = session.createQuery("from Contest where id=?1", Contest.class).setParameter(1, originalId).uniqueResult();
		}
		for (int i = MIN_GRADE; i <= MAX_GRADE; ++i) {
			for (Result qualifiedResult : getResultsByContest(qualifiedId, i)) {
				Person person = qualifiedResult.getPerson();
				/* Exists rather than a unique lookup: a person listed twice in the
				   results would otherwise abort the merge halfway through. */
				if (!hasResult(originalId, person.getId())) {
					qualifiedResult.setPlace(null);
					qualifiedResult.setContest(originalContest);
					update(qualifiedResult, qualifiedResult.getId());
				} else
					delete(qualifiedResult.getId());
			}
		}
	}

	/**
	 * Medal aggregate shared by every ranking, so the three rankings cannot drift
	 * apart in how they count medals.
	 */
	private static String medalAggregate(String alias) {
		return "       SUM(CASE WHEN " + alias + ".medal = 'GOLD' THEN 1 ELSE 0 END)   as gold, " +
				"       SUM(CASE WHEN " + alias + ".medal = 'SILVER' THEN 1 ELSE 0 END) as silver, " +
				"       SUM(CASE WHEN " + alias + ".medal = 'BRONZE' THEN 1 ELSE 0 END) as bronze, " +
				"       SUM(CASE WHEN " + alias + ".medal IN ('GOLD', 'SILVER', 'BRONZE') THEN 1 ELSE 0 END) as medals, " +
				"       COUNT(*) as participations ";
	}

	/**
	 * Contests a ranking covers. The ONI scope is the national olympiads (ONI,
	 * ONM); INTERNATIONAL is everything else, which is LOT plus the international
	 * contests. The subject predicate then keeps only one subject's olympiad.
	 */
	private static String scopePredicate(String alias, String scope) {
		return SCOPE_INTERNATIONAL.equals(scope)
				? alias + ".contest.name NOT IN (:nationalNames) "
				: alias + ".contest.name IN (:nationalNames) ";
	}

	/**
	 * Rankings are scoped to one subject, or to every subject with SUBJECT_ALL.
	 * Editions imported before the subject column existed have no value stored,
	 * so they count as the default subject rather than being dropped.
	 */
	private static String subjectPredicate(String alias) {
		/* SUBJECT_ALL matches every contest; any other value one subject. */
		return "(:subject = '" + SUBJECT_ALL + "' " +
				"     OR " + subjectOf(alias) + " = :subject) ";
	}

	/** A contest's subject, with editions stored before the column existed read as the default. */
	private static String subjectOf(String alias) {
		return "COALESCE(" + alias + ".contest.subject, '" + SUBJECT_DEFAULT + "')";
	}

	private static String subjectAndScope(String alias, String scope) {
		return scopePredicate(alias, scope) + "AND " + subjectPredicate(alias);
	}

	/**
	 * The national olympiad that attributes result {@code of} (which records no
	 * institution): the one of the same subject. With a single subject this is
	 * that subject's olympiad; with every subject counted, it keeps a person who
	 * sat both ONI and ONM in one year from having an IOI result counted twice,
	 * once per olympiad.
	 */
	private static String nationalOfSubject(String alias, String of) {
		return alias + ".contest.name IN (:nationalNames) AND " +
				subjectOf(alias) + " = " + subjectOf(of) + " ";
	}

	private static String resolveSubject(String subject) {
		return subject == null || subject.isBlank() ? SUBJECT_DEFAULT : subject;
	}

	private static String resolveScope(String scope) {
		return SCOPE_INTERNATIONAL.equals(scope) ? SCOPE_INTERNATIONAL : SCOPE_DEFAULT;
	}

	@Override
	public List<RankingResult> getRanking(String region, String institution, Integer year, String subject, String scope) {
		try (Session session = HibernateUtils.getSessionFactory().openSession()) {
			String resolvedScope = resolveScope(scope);
			Integer institutionId = institution == null || institution.isBlank()
					? null : Integer.valueOf(institution);
			/* Only ONI records an institution on the result itself, so for the
			   international scope the filters match on where the person competed at
			   ONI in that same year, not on wherever they ended up. */
			boolean byPlace = region != null || institutionId != null;
			boolean attributed = SCOPE_INTERNATIONAL.equals(resolvedScope);

			var query = session.createQuery("SELECT r.person as person, " +
					medalAggregate("r") +
					"FROM Result r " +
					"WHERE " + subjectAndScope("r", resolvedScope) +
					(year != null ? "AND r.person.schoolYear = :schoolYear " : "") +
					(byPlace && !attributed
							? (region != null ? "AND r.institution.region = :region " : "") +
							  (institutionId != null ? "AND r.institution.id = :institutionId " : "")
							: "") +
					(byPlace && attributed
							? "AND EXISTS (SELECT 1 FROM Result o " +
							  "             WHERE o.person.id = r.person.id " +
							  "               AND " + nationalOfSubject("o", "r") +
							  "               AND o.contest.year = r.contest.year " +
							  "               AND o.institution IS NOT NULL " +
							  (region != null ? "AND o.institution.region = :region " : "") +
							  (institutionId != null ? "AND o.institution.id = :institutionId " : "") +
							  ") "
							: "") +
					"GROUP BY r.person.id " +
					"ORDER BY gold desc, silver desc, bronze desc, participations desc LIMIT 250", RankingResult.class);
			query.setParameterList("nationalNames", NATIONAL_CONTESTS);
			query.setParameter("subject", resolveSubject(subject));
			if (region != null)
				query.setParameter("region", region);
			if (institutionId != null)
				query.setParameter("institutionId", institutionId);
			if (year != null)
				query.setParameter("schoolYear", year);
			return query.getResultList();
		}
	}

	/**
	 * International results carry no institution, so each one is attributed to
	 * where the person competed at ONI <em>in the same year</em>. A competitor who
	 * changes school or county mid-career therefore credits each result to the
	 * school they actually attended at the time, rather than crediting their whole
	 * career to wherever they ended up.
	 *
	 * Results with no ONI appearance that year cannot be attributed and are left
	 * out; in the current archive that is 38 of 927.
	 */
	private static String attributedFrom(String scope) {
		if (!SCOPE_INTERNATIONAL.equals(scope))
			return "FROM Result r WHERE " + subjectAndScope("r", scope) +
					"AND r.institution IS NOT NULL ";
		return "FROM Result r, Result a " +
				"WHERE " + subjectAndScope("r", scope) +
				"AND a.person.id = r.person.id " +
				"AND a.institution IS NOT NULL " +
				"AND " + nationalOfSubject("a", "r") +
				"AND a.contest.year = r.contest.year ";
	}

	/** Alias holding the institution to group a ranking by, per scope. */
	private static String attributionAlias(String scope) {
		return SCOPE_INTERNATIONAL.equals(scope) ? "a" : "r";
	}

	@Override
	public List<RankingInstitution> getInstitutionRanking(Integer startYear, Integer endYear, String subject, String scope) {
		try (Session session = HibernateUtils.getSessionFactory().openSession()) {
			String resolvedScope = resolveScope(scope);
			String alias = attributionAlias(resolvedScope);
			/* Restricted to contests that record an institution, since counting every
			   contest mixed in results whose institution is null and inflated the
			   participation totals. */
			var query = session.createQuery("SELECT " + alias + ".institution as institution, " +
					medalAggregate("r") +
					attributedFrom(resolvedScope) +
					(startYear != null ? "AND r.contest.year >= :startYear " : "") +
					(endYear != null ? "AND r.contest.year <= :endYear " : "") +
					"GROUP BY " + alias + ".institution.id " +
					"ORDER BY gold desc, silver desc, bronze desc, participations desc", RankingInstitution.class);
			query.setParameterList("nationalNames", NATIONAL_CONTESTS);
			query.setParameter("subject", resolveSubject(subject));
			if (startYear != null)
				query.setParameter("startYear", startYear);
			if (endYear != null)
				query.setParameter("endYear", endYear);
			return query.getResultList();
		}
	}

	@Override
	public List<RankingRegion> getRegionRanking(Integer startYear, Integer endYear, String subject, String scope) {
		try (Session session = HibernateUtils.getSessionFactory().openSession()) {
			String resolvedScope = resolveScope(scope);
			String alias = attributionAlias(resolvedScope);
			/* Grouping straight on institution.region used to fold every result
			   without an institution into a null region row. */
			var query = session.createQuery("SELECT " + alias + ".institution.region as region, " +
					medalAggregate("r") +
					attributedFrom(resolvedScope) +
					"AND " + alias + ".institution.region IS NOT NULL " +
					(startYear != null ? "AND r.contest.year >= :startYear " : "") +
					(endYear != null ? "AND r.contest.year <= :endYear " : "") +
					"GROUP BY " + alias + ".institution.region " +
					"ORDER BY gold desc, silver desc, bronze desc, participations desc", RankingRegion.class);
			query.setParameterList("nationalNames", NATIONAL_CONTESTS);
			query.setParameter("subject", resolveSubject(subject));
			if (startYear != null)
				query.setParameter("startYear", startYear);
			if (endYear != null)
				query.setParameter("endYear", endYear);
			return query.getResultList();
		}
	}

	/**
	 * International ranking broken down per contest column. Aggregated in Java
	 * rather than SQL because the columns are a fixed display list that splits LOT
	 * by level, which does not map onto a plain GROUP BY.
	 *
	 * International results carry no institution of their own, so the region and
	 * institution filters match on where the person competed at ONI.
	 */
	@Override
	public List<RankingByColumn> getInternationalRanking(Integer startYear, Integer endYear, String subject, String region, String institution, Integer year) {
		try (Session session = HibernateUtils.getSessionFactory().openSession()) {
			Integer institutionId = institution == null || institution.isBlank()
					? null : Integer.valueOf(institution);
			boolean byPlace = region != null || institutionId != null;

			var query = session.createQuery("FROM Result r " +
					"WHERE " + subjectAndScope("r", SCOPE_INTERNATIONAL) +
					(startYear != null ? "AND r.contest.year >= :startYear " : "") +
					(endYear != null ? "AND r.contest.year <= :endYear " : "") +
					(year != null ? "AND r.person.schoolYear = :schoolYear " : "") +
					/* Attributed to where the person competed at ONI that same year,
					   since the international results record no institution. */
					(byPlace ? "AND EXISTS (SELECT 1 FROM Result o " +
							"             WHERE o.person.id = r.person.id " +
							"               AND " + nationalOfSubject("o", "r") +
							"               AND o.contest.year = r.contest.year " +
							"               AND o.institution IS NOT NULL " +
							(region != null ? "AND o.institution.region = :region " : "") +
							(institutionId != null ? "AND o.institution.id = :institutionId " : "") +
							") " : "") +
					"ORDER BY r.contest.year", Result.class);
			query.setParameterList("nationalNames", NATIONAL_CONTESTS);
			query.setParameter("subject", resolveSubject(subject));
			if (startYear != null)
				query.setParameter("startYear", startYear);
			if (endYear != null)
				query.setParameter("endYear", endYear);
			if (year != null)
				query.setParameter("schoolYear", year);
			if (region != null)
				query.setParameter("region", region);
			if (institutionId != null)
				query.setParameter("institutionId", institutionId);

			Map<Integer, RankingByColumn> byPerson = new LinkedHashMap<>();
			for (Result result : query.getResultList()) {
				String key = Constants.columnKeyOf(result.getContest().getName(), result.getYear());
				if (key == null)
					continue;
				byPerson.computeIfAbsent(result.getPerson().getId(), id -> new RankingByColumn(result.getPerson()))
						.add(key, result.getMedal());
			}

			return byPerson.values().stream()
					.sorted(rankingOrder())
					.limit(250)
					.toList();
		}
	}

	/**
	 * Ranked by the medal-awarding columns in display order: all of IOI's medals
	 * outrank any of CEOI's, and so on down the list. The overall tally is only a
	 * display total, so it does not drive the order.
	 *
	 * Falls through to each column's attendance, since most competitors hold no
	 * medal at all and would otherwise be tied with each other en masse.
	 */
	private static Comparator<RankingByColumn> rankingOrder() {
		Comparator<RankingByColumn> order = null;
		for (String column : Constants.INTERNATIONAL_COLUMNS) {
			if (!Constants.awardsMedals(column))
				continue;
			for (var medal : List.of(Medal.GOLD, Medal.SILVER, Medal.BRONZE)) {
				Comparator<RankingByColumn> next = Comparator
						.comparingLong((RankingByColumn entry) -> countIn(entry, column, medal))
						.reversed();
				order = order == null ? next : order.thenComparing(next);
			}
		}
		/* Attendance only breaks ties once every medal count is level, and in the
		   same column order, so the table's positions stay consistent with it. */
		for (String column : Constants.INTERNATIONAL_COLUMNS) {
			Comparator<RankingByColumn> next = Comparator
					.comparingLong((RankingByColumn entry) -> participationsIn(entry, column))
					.reversed();
			order = order.thenComparing(next);
		}
		return order.thenComparing(entry -> entry.getPerson().getName());
	}

	private static long participationsIn(RankingByColumn entry, String column) {
		ColumnTally tally = entry.getColumns().get(column);
		return tally == null ? 0 : tally.getParticipations();
	}

	private static long countIn(RankingByColumn entry, String column, Medal medal) {
		ColumnTally tally = entry.getColumns().get(column);
		if (tally == null)
			return 0;
		return switch (medal) {
			case GOLD -> tally.getGold();
			case SILVER -> tally.getSilver();
			case BRONZE -> tally.getBronze();
		};
	}

	@SuppressWarnings("deprecation")
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
