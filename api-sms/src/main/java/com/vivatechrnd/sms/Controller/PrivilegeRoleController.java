package com.vivatechrnd.sms.Controller;

import com.vivatechrnd.sms.Dto.NewPrivilegeDto;
import com.vivatechrnd.sms.Dto.PrivilegeDto;
import com.vivatechrnd.sms.Entities.Privilege;
import com.vivatechrnd.sms.Entities.PrivilegeRoles;
import com.vivatechrnd.sms.Entities.Roles;
import com.vivatechrnd.sms.Repository.PrivilegeRepository;
import com.vivatechrnd.sms.Repository.PrivilegeRoleRepository;
import com.vivatechrnd.sms.Repository.RolesRepository;
import com.vivatechrnd.sms.utility.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@CrossOrigin(origins = "*", allowedHeaders = "*")
@RestController
@RequestMapping(value = "/privilege")
public class PrivilegeRoleController {

    @Autowired
    private PrivilegeRoleRepository privilegeRoleRepository;

    @Autowired
    private RolesRepository rolesRepository;

    @Autowired
    private PrivilegeRepository privilegeRepository;

    @RequestMapping(value = "/add-privilege-role", method = RequestMethod.POST)
    public Response addPrivilegeRole(@RequestBody PrivilegeRoles privilegeRoles){
        Response response = new Response();

        privilegeRoleRepository.save(privilegeRoles);
        response.setResult("SUCCESS");
        response.setMessage("Privilege Roles added successfully");
        return response;
    }

    @RequestMapping(value = "/create-new-privilege", method = RequestMethod.POST)
    public Response createPrivilege(@RequestBody PrivilegeDto privilegeId){
        Response response = new Response();
        findOldPrivileges(privilegeId.getRoleId());
        for (Integer i: privilegeId.getPrivilegeId()){
            PrivilegeRoles dto = new PrivilegeRoles();
            dto.setRoleId(privilegeId.getRoleId());
            dto.setPrivilegeId(i);
            addPrivilegeRole(dto);
        }
        response.setResult("SUCCESS");
        response.setMessage("Privilege created successfully");
        return response;
    }
    private void findOldPrivileges(Integer roleId){
        privilegeRoleRepository.deleteByRoleId(roleId);
    }

    @RequestMapping(value = "/view-privilege-role", method = RequestMethod.POST)
    public NewPrivilegeDto viewPrivilegeRoles(@RequestBody NewPrivilegeDto roleId){
        List<PrivilegeRoles> privilegeRoles = new ArrayList<>();
        List<NewPrivilegeDto> dtoList = new ArrayList<>();
        if (roleId.getRoleId() != null) {
            privilegeRoles = privilegeRoleRepository.findByRoleId(roleId.getRoleId());
        }
        Roles role = rolesRepository.findById(roleId.getRoleId()).get();
        NewPrivilegeDto privilegesDto = getPrivilegesDto(role, getPrivileges(privilegeRoles));
//        System.out.println("Send the data");
        return privilegesDto;
    }



    public NewPrivilegeDto getPrivilegesDto(Roles roles, List<Privilege> privileges){
        NewPrivilegeDto dto = new NewPrivilegeDto();
        dto.setRoleId(roles.getId());
        dto.setRoleName(roles.getName());
        dto.setPrivilegeList(privileges);
        return dto;
    }


    public List<Privilege> getPrivileges(List<PrivilegeRoles> privilegeRoles){
        List<Privilege> privilegeList = new ArrayList<Privilege>();
        for (PrivilegeRoles p: privilegeRoles){
            Privilege privilege = privilegeRepository.findById(p.getPrivilegeId()).get();
            privilegeList.add(privilege);
        }

        return privilegeList;
    }
}
