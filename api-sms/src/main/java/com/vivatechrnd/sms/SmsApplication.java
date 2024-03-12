package com.vivatechrnd.sms;


import com.vivatechrnd.sms.Services.FileService;
import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.web.servlet.WebMvcAutoConfiguration;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.PropertySource;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import springfox.documentation.swagger2.annotations.EnableSwagger2;

import java.util.Properties;

@CrossOrigin(origins = "*", allowedHeaders = "*")
@SpringBootApplication(exclude = { SecurityAutoConfiguration.class })
@EnableSwagger2
@PropertySource("classpath:application.properties")
public class SmsApplication extends SpringBootServletInitializer {


	private static final Logger logger = LoggerFactory.getLogger(SmsApplication.class);

	public static void main(String[] args) {

		logger.info("Starting sms application.");

		new SpringApplicationBuilder(SmsApplication.class)
				.sources(SmsApplication.class)
				.properties(getProperties())
				.run(args);

	}

	@Override
	protected SpringApplicationBuilder configure(SpringApplicationBuilder springApplicationBuilder) {

		return springApplicationBuilder
				.sources(SmsApplication.class)
				.properties(getProperties());

	}
	static Properties getProperties() {

		Properties props = new Properties();

		props.put("spring.config.location", "file:////home/core/sms/");

		return props;

	}

	public WebMvcAutoConfiguration corsConfigure(){
		return new WebMvcAutoConfiguration(){
			public void addOrigin(CorsRegistry corsRegistry){
				corsRegistry.addMapping("/*").allowedHeaders("*").allowedOrigins("*")
						.allowCredentials(true);
			}
		};
	}

	@Bean
	public ModelMapper modelMapper() {
		return new ModelMapper();
	}


	@Bean
	public FileService fileService() {
		return new FileService();
	}


}
