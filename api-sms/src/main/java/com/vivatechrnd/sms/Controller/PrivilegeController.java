package com.vivatechrnd.sms.Controller;

import com.vivatechrnd.sms.Entities.Privilege;
import com.vivatechrnd.sms.Repository.PrivilegeRepository;
import com.vivatechrnd.sms.utility.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", allowedHeaders = "*")
@RestController
@RequestMapping(value = "/privilege")
public class PrivilegeController {

    @Autowired
    private PrivilegeRepository privilegeRepository;

    @RequestMapping(value = "/view", method = RequestMethod.GET)
    public List<Privilege> viewAllPrivilege(){
        List<Privilege> privileges = privilegeRepository.findAll();
        return privileges;
    }

    @RequestMapping(value = "/create", method = RequestMethod.POST)
    public Response createPrivilege(@RequestBody Privilege privilege){
        Response response = new Response();
        privilegeRepository.save(privilege);
        response.setResult("SUCCESS");
        response.setMessage("Privilege created successfully");
        return response;
    }
}
