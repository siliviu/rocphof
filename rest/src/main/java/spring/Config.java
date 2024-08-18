package spring;

import console.AddConsole;
import console.QueryConsole;
import importer.AddService;
import importer.merge.InstitutionMergeService;
import importer.merge.PersonMergeService;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import query.QueryService;
import repo.*;

@Configuration
public class Config {
//	@Bean
//	QueryService queryService() {
//		QueryService queryService = new QueryService();
//		QueryConsole console = new QueryConsole(queryService);
////		AddConsole console = new AddConsole(institutionMergeService(), personMergeService(), addService());
//		new Thread(console::run).start();
//		return queryService;
//	}
}
