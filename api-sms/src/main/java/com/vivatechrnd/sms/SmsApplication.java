package com.vivatechrnd.sms;


import com.vivatechrnd.sms.Services.FileService;
import org.modelmapper.ModelMapper;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.web.servlet.WebMvcAutoConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import springfox.documentation.swagger2.annotations.EnableSwagger2;

@CrossOrigin(origins = "*", allowedHeaders = "*")
@SpringBootApplication(exclude = { SecurityAutoConfiguration.class })
@EnableSwagger2
public class SmsApplication {


	public static void main(String[] args) {
		SpringApplication.run(SmsApplication.class, args);
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
