package com.vivatechrnd.sms.Login;

import com.vivatechrnd.sms.Dto.UserDto;
import com.vivatechrnd.sms.Entities.*;
import com.vivatechrnd.sms.Repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

@CrossOrigin(origins = "*", allowedHeaders = "*")
@RestController
@RequestMapping("/admin")
public class LoginController {

    @Autowired
    private JwtUtil jwtUtil;

    @Value("${token.expiry}")
    private Integer expiryTime;
    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private CustomUserDetailsService service;

    @Autowired
    private PrivilegeRoleRepository privilegeRoleRepository;

    @Autowired
    private PrivilegeRepository privilegeRepository;

    @RequestMapping(value = "/authentication", method = RequestMethod.POST)
    public AuthRequestDto generateToken(@RequestBody AuthRequestDto authRequestDto) throws Exception {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(authRequestDto.getUsername(), authRequestDto.getPassword())
            );
        } catch (Exception ex){
            throw new Exception("Invalid username or password");
        }
        Calendar cal = Calendar.getInstance();
        cal.setTime(new Date());
//        System.out.println("Expiry Time: "+ expiryTime);
        cal.add(Calendar.MINUTE, expiryTime);
        String token = jwtUtil.generateToken(authRequestDto.getUsername(), expiryTime);
        Roles role = service.findRolesByUsername(authRequestDto.getUsername());
        List<PrivilegeRoles> rolePrivilegeList = privilegeRoleRepository.findByRoleId(role.getId());
        List<Privilege> privilegeList = new ArrayList<>();
        for (PrivilegeRoles p: rolePrivilegeList){
            Privilege privilege = privilegeRepository.findById(p.getPrivilegeId()).get();
            privilegeList.add(privilege);
        }
        authRequestDto.setTokenExpiry(cal.getTime());
        authRequestDto.setToken(token);
        authRequestDto.setRoles(role);
        authRequestDto.setPrivilegeList(privilegeList);
        return authRequestDto;

    }

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private StudentRepository studentRepository;

    @RequestMapping(value = "/find-by-username", method = RequestMethod.POST)
    public UserDto findByUsername(@RequestBody String username){
        UserDto user = new UserDto();
        Users users = usersRepository.findByUserName(username);
        if (users.getRoles().getName().equals("TEACHER") || users.getRoles().getName().equals("ASSISTANT TEACHER")){
            Teacher teacher = teacherRepository.findById(users.getUserId()).get();
            user.setUserId(teacher.getId());
            user.setUserType(users.getRoles().getName());
            user.setTeacherCode(teacher.getTeacherCode());
            user.setName(teacher.getTeacherName());
        }
        if (users.getRoles().getName().equals("STUDENT")){
            Student student = studentRepository.findById(users.getUserId()).get();
            user.setUserId(student.getId());
            user.setUserType(users.getRoles().getName());
            user.setName(student.getStudentName());
        }
        if (users.getRoles().getName().equals("ADMIN") || users.getRoles().getName().equals("SUPER ADMIN")){
            Teacher teacher = teacherRepository.findById(users.getUserId()).get();
            user.setUserId(teacher.getId());
            user.setUserType(users.getRoles().getName());
            user.setTeacherCode(teacher.getTeacherCode());
            user.setName(teacher.getTeacherName());
        }
        return user;
    }
}
