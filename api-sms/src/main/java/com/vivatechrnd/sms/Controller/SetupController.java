package com.vivatechrnd.sms.Controller;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.collect.Lists;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.*;

import com.vivatechrnd.sms.Entities.Privilege;
import com.vivatechrnd.sms.Entities.Roles;
import com.vivatechrnd.sms.Entities.Teacher;
import com.vivatechrnd.sms.Entities.Users;
import com.vivatechrnd.sms.Repository.PrivilegeRepository;
import com.vivatechrnd.sms.Repository.RolesRepository;
import com.vivatechrnd.sms.Repository.TeacherRepository;
import com.vivatechrnd.sms.Repository.UsersRepository;
import com.vivatechrnd.sms.utility.UtilityService;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.IOUtils;
import org.springframework.core.io.ClassPathResource;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/setup")
public class SetupController {

    private final RolesRepository rolesRepository;
    private final TeacherRepository teacherRepository;
    private final UsersRepository usersRepository;
    private final PrivilegeRepository privilegeRepository;

    public SetupController(RolesRepository rolesRepository,
                           TeacherRepository teacherRepository,
                           UsersRepository usersRepository,
                           PrivilegeRepository privilegeRepository) {
        this.rolesRepository = rolesRepository;
        this.teacherRepository = teacherRepository;
        this.usersRepository = usersRepository;
        this.privilegeRepository = privilegeRepository;
    }

    @GetMapping("/roles")
    public boolean createRoles(){
        List<String> roleString = Arrays.asList("SUPER ADMIN", "ADMIN", "TEACHER", "ASSISTANT TEACHER", "STUDENT");
        for (String role : roleString) {
            Roles roles = new Roles();
            roles.setName(role);
            rolesRepository.save(roles);
        }
        return true;
    }

    @GetMapping("/super-admin")
    public boolean createSuperAdmin(){
        Teacher teacher = new Teacher();
        teacher.setTeacherCode(101);
        teacher.setTeacherName("Akhouri Manoj Kumar");
        teacher.setFatherName("Ram Lal");
        teacher.setSubjectAppointed("Clerk");
        teacher.setTAddress("Panda Toli, Jagdishpur");
        teacher.setDob(UtilityService.convertStringToDate("1988-01-01"));
        teacher.setPost("TGT");
        teacher.setNAppointment("Permanent");
        teacher.setDateOfJoining(UtilityService.convertStringToDate("2015-04-01"));
        teacher.setStatus("Active");
        teacher.setTeacherPhoto("891521.jpg");
        teacher.setClassId(null);
        teacher.setSectionId(null);
        teacher.setPhoneNo("8820168769");
        teacher.setEmail("manoj@gmail.com");
        teacher.setCertificates(Lists.newArrayList());
        Roles superAdmin = rolesRepository.findByName("SUPER ADMIN");
        teacher.setRoles(superAdmin);
        teacher.setAssignSubjectsTeachers(Lists.newArrayList());
        teacher.setAttendances(Lists.newArrayList());
        Teacher savedTeacher = teacherRepository.save(teacher);
        Users users = new Users();
        users.setUserName("admin");
        users.setPassword("admin");
        users.setEmail("admin@gmail.com");
        users.setUserId(savedTeacher.getId());
        users.setRoles(superAdmin);
        usersRepository.save(users);

        return true;
    }

    @RequestMapping(value = "/create-new-permissions", method = RequestMethod.GET)
    public boolean createNewPermissions() {
        loadPrivilegesFromJson("setup-files/DefaultPermission.json");
        return true;
    }

    public static String readStringFromFile(String resourceRelativePath) throws IOException {
        InputStream stream = new ClassPathResource(resourceRelativePath).getInputStream();
        byte[] encoded = IOUtils.toByteArray(stream);
        return new String(encoded, StandardCharsets.UTF_8);
    }

    private void loadPrivilegesFromJson(String privilegeJsonFile) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            String jsonString = null;
            jsonString = readStringFromFile(privilegeJsonFile);
            String[] privilegeString = mapper.readValue(jsonString, String[].class);
            for (String per : privilegeString) {
                Privilege privilege = new Privilege();
                privilege.setName(per);
                privilegeRepository.save(privilege);
            }

        } catch (Exception e) {
            log.error("exception ", e);
        }
    }
}
