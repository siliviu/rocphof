package importer.merge;

import domain.Identifiable;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import repo.MergeRepository;
import utils.Tuple;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

public abstract class MergeService<T extends Identifiable<ID>, ID extends Serializable> {
	protected static final Logger logger = LogManager.getLogger(MergeService.class.getName());
	protected final HashMap<T, T> cache = new HashMap<>();

	protected List<Tuple<T, List<T>>> suggestions = new ArrayList<>();

	protected MergeRepository<T, ID> repository;

	public MergeService(MergeRepository<T, ID> repository) {
		this.repository = repository;
	}

	protected abstract List<T> tryAutoReplace(T object);

	protected abstract void addMoreSuggestions(T objects, List<T> currentSuggestions);

	protected abstract boolean tryAutoHandleSuggestion(Tuple<T, List<T>> suggestion);

	public void beginMerge(List<T> objects) {
		for (T object : objects) {
			List<T> currentSuggestions = tryAutoReplace(object);
			if (currentSuggestions != null) {
				addMoreSuggestions(object, currentSuggestions);
				cache.put(object, repository.save(object));
				if (!currentSuggestions.isEmpty())
					suggestions.add(new Tuple<>(object, currentSuggestions));
			}
		}
		autoHandleSuggestions();
	}

	public void autoHandleSuggestions() {
		List<Tuple<T, List<T>>> newSuggestions = new ArrayList<>();
		for (var suggestion : suggestions) {
			if (!tryAutoHandleSuggestion(suggestion))
				newSuggestions.add(suggestion);
		}
		suggestions = newSuggestions;
	}

	public List<Tuple<T, List<T>>> getSuggestions() {
		return suggestions;
	}

	public void handleSuggestions(List<Integer> replies) throws Exception {
		int length = suggestions.size();
		if (replies.size() != length)
			throw new RuntimeException("Bad reply");
		for (int i = 0; i < length; ++i) {
			if (replies.get(i) == 0)
				continue;
			boolean flip = replies.get(i) < 0;
			int choice = (flip ? -replies.get(i) : replies.get(i)) - 1;
			if (choice >= suggestions.get(i).second().size())
				throw new RuntimeException("Bad choice");
			T object = flip ? suggestions.get(i).second().get(choice) : suggestions.get(i).first();
			T suggestedObject = !flip ? suggestions.get(i).second().get(choice) : suggestions.get(i).first();
			replace(object, suggestedObject);
		}
		suggestions.clear();
	}

	protected void replace(T object, T replacement) {
		tryMergeObjects(object, replacement);
		logger.info("Replaced {} with {}", object, replacement);
		cache.entrySet().stream().toList().stream()
				.filter(x -> x.getKey().equals(object))
				.forEach(x -> cache.put(x.getKey(), replacement));

		suggestions.stream().
				filter(v -> v.second().remove(object))
				.forEach(v -> v.second().add(replacement));
		repository.replace(object, replacement);
		cache.put(object, replacement);

	}

	protected abstract void tryMergeObjects(T object, T replacement);

	public HashMap<T, T> getMap() {
		return cache;
	}

}
