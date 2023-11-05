package com.vivatechrnd.sms.Controller;

import com.vivatechrnd.sms.Entities.Roles;
import com.vivatechrnd.sms.Repository.RolesRepository;
import com.vivatechrnd.sms.utility.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", allowedHeaders = "*")
@RestController
@RequestMapping(value = "/roles")
public class RolesController {

    @Autowired
    private RolesRepository rolesRepository;

    @RequestMapping(value = "/view", method = RequestMethod.GET)
    public List<Roles> viewAllRoles(){
        List<Roles> roles = rolesRepository.findAll();
        return roles;
    }

    @RequestMapping(value = "/create", method = RequestMethod.POST)
    public Response createRoles(@RequestBody Roles roles){
        Response response = new Response();
        rolesRepository.save(roles);
        response.setResult("SUCCESS");
        response.setMessage("Roles created successfully");
        return response;
    }
}
