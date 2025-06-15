package spring;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.annotation.CachingConfigurerSupport;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

@Configuration
public class CacheConfig extends CachingConfigurerSupport {

	@Bean
	@Override
	public CaffeineCacheManager cacheManager() {
		CaffeineCacheManager cacheManager = new CaffeineCacheManager();
		cacheManager.setCaffeine(caffeineCacheBuilder());
		return cacheManager;
	}

	Caffeine<Object, Object> caffeineCacheBuilder() {
		return Caffeine.newBuilder()
				.initialCapacity(100)
				.maximumSize(2000)
				.expireAfterWrite(120, TimeUnit.HOURS)
				.recordStats();
	}
}