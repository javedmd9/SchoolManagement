package com.vivatechrnd.sms.Controller;

import com.vivatechrnd.sms.Dto.SchoolSessionDto;
import com.vivatechrnd.sms.Entities.SchoolSession;
import com.vivatechrnd.sms.Repository.SchoolSessionRepository;
import com.vivatechrnd.sms.utility.Response;
import com.vivatechrnd.sms.utility.UtilityService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@CrossOrigin(origins = "*", allowedHeaders = "*")
@RestController
@RequestMapping(value="/session")
public class SchoolSessionController {

    @Autowired
    private SchoolSessionRepository schoolSessionRepository;

    @Autowired
    private ModelMapper modelMapper;

    @RequestMapping(value = "/create", method = RequestMethod.POST)
    public Response createSession(@RequestBody SchoolSession session){
        Response response = new Response();
        SchoolSession schoolSession = modelMapper.map(session, SchoolSession.class);
        schoolSessionRepository.save(schoolSession);
        response.setResult("SUCCESS");
        response.setMessage("Session created successfully");
        return response;
    }

    @RequestMapping(value = "/delete", method = RequestMethod.POST)
    public Response deleteSession(@RequestBody SchoolSessionDto schoolSession){
        Response response = new Response();
        SchoolSession session = schoolSessionRepository.findById(schoolSession.getId()).get();
        if (session != null){
            schoolSessionRepository.deleteById(schoolSession.getId());
            response.setResult("Success");
            response.setMessage("Deleted session successfully");
        }
        return response;
    }
    @RequestMapping(value = "/view", method = RequestMethod.GET)
    public List<SchoolSessionDto> getAllSession(){
        List<SchoolSession> sessions = schoolSessionRepository.findAll();
        List<SchoolSessionDto> sessionDto = new ArrayList<>();
        sessions.forEach(ele -> sessionDto.add(modelMapper.map(ele, SchoolSessionDto.class)));
        return sessionDto;
    }

    @Autowired
    private UtilityService utilityService;

    @RequestMapping(value = "/current-session", method = RequestMethod.GET)
    public SchoolSessionDto getCurrentSession(){
        return utilityService.getCurrentSession();
    }
}
