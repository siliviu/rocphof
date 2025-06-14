package spring;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.ComponentScan;


@SpringBootApplication
@ComponentScan(basePackages = {"repo", "spring", "importer", "query", "utils", "merge"})
@EntityScan(basePackages = {"domain"})
@EnableCaching
//@EnableJpaRepositories(basePackages={"repo"})
public class BootMain {
	public static void main(String[] args) {
		SpringApplication.run(BootMain.class, args);
	}
}