package com.vivatechrnd.sms.Services;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vivatechrnd.sms.Dto.FormDataWithUploadFile;
import com.vivatechrnd.sms.Dto.TeacherDto;
import com.vivatechrnd.sms.Entities.Certificates;
import com.vivatechrnd.sms.Entities.Roles;
import com.vivatechrnd.sms.Entities.Teacher;
import com.vivatechrnd.sms.Entities.Users;
import com.vivatechrnd.sms.Repository.CertificateRepository;
import com.vivatechrnd.sms.Repository.RolesRepository;
import com.vivatechrnd.sms.Repository.TeacherRepository;
import com.vivatechrnd.sms.Repository.UsersRepository;
import com.vivatechrnd.sms.Enums.FIleType;
import com.vivatechrnd.sms.utility.Response;
import com.vivatechrnd.sms.utility.UtilityService;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.lang3.RandomStringUtils;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class TeacherService {

  @Autowired
  private ModelMapper modelMapper;

  @Autowired
  private ObjectMapper objectMapper;

  @Autowired
  private UtilityService utilityService;

  @Autowired
  private TeacherRepository teacherRepository;

  @Autowired
  private FileService fileService;

  public Response createTeacher(TeacherDto teacherDto){
    Response response = new Response();
    try {
//      teacherDto.setTeacherPhotoExtension("jpg");
//      String scannedPhotoPath = fileService.storeImage(teacherDto.getTeacherCode().toString(), teacherDto.getTeacherPhoto(), teacherDto.getTeacherPhotoExtension());

      teacherDto.setTeacherPhoto(teacherDto.getTeacherPhoto());
      Teacher teacherData = utilityService.convertTeacherDtoToEntity(teacherDto);
      teacherRepository.save(teacherData);
      response.setResult("SUCCESS");
      return response;
    } catch (Exception e) {
      e.printStackTrace();
      response.setResult("FAILED");
      response.setError("FAIL");
    }
    return response;
  }

  @Autowired
  private CertificateRepository certificateRepository;

  public Response deleteTeacher(Integer teacherId){
    Response response = new Response();
    Teacher teacher = teacherRepository.findById(teacherId).get();
    Response deleteResponse = fileService.deleteFile(teacher.getTeacherPhoto(), FIleType.IMAGE);
    List<Certificates> certificates = certificateRepository.findByTeacher(teacher);
    if (certificates.size() > 0){
      for (int i = 0; i < certificates.size(); i++) {
        Response deleteFile = fileService.deleteFile(certificates.get(i).getCertificatePath(), FIleType.CERTIFICATE);
        certificateRepository.deleteById(certificates.get(i).getId());
        System.out.println(deleteFile.getResult());
      }
    }

//    if (deleteResponse.getResult() != "SUCCESS"){
//      response.setResult("FAILED");
//      return response;
//    }
    try{
      teacherRepository.deleteById(teacherId);
      response.setResult("SUCCESS");
      if (response.getResult().equals("SUCCESS")){
        deleteUser(teacher);
      }
    } catch (Exception e){
      e.printStackTrace();
      response.setResult("FAIL");
      response.setErrorcode(3);
      response.setError(e.getMessage());
    }
    return response;
  }

  public Response saveOrUpdateTeacher(FormDataWithUploadFile teacher){
    Response response = new Response();
    TeacherDto teacherDto = new TeacherDto();
    try {
      teacherDto = objectMapper.readValue(teacher.getIvrprompt(), TeacherDto.class);
      String referenceNo = teacherDto.getTeacherPhoto() == null? RandomStringUtils.randomNumeric(6): teacherDto.getTeacherPhoto();

      if (teacher.getUploadfile() != null) {
        Response uploadResponse = fileService.uploadImage3(teacher.getUploadfile(), referenceNo);
        if (uploadResponse.getResult() != "SUCCESS"){
          response.setResult("FAILED");
          response.setError(uploadResponse.getError());
          return response;
        }
        teacherDto.setTeacherPhoto(uploadResponse.getMessage());
      }
      Teacher teacherData = utilityService.convertTeacherDtoToEntity(teacherDto);
      Roles roles = rolesRepository.findById(teacherDto.getStaffRole()).get();
      teacherData.setRoles(roles);
      teacherRepository.save(teacherData);
      response.setResult("SUCCESS");
      if (response.getResult().equals("SUCCESS")){
        teacherDto.setRoleName(roles.getName());
        createUserId(teacherDto);
      }
    } catch (IOException e) {
      e.printStackTrace();
    }

    return response;
  }

  public Response updatePhoto(FormDataWithUploadFile teacher){
    Response response = new Response();
    TeacherDto teacherDto = new TeacherDto();
    try {
      teacherDto = objectMapper.readValue(teacher.getIvrprompt(), TeacherDto.class);
      Teacher getTeacher = teacherRepository.findById(teacherDto.getId()).get();
      if (getTeacher != null){
        String referenceNo = getTeacher.getTeacherPhoto() == null ? RandomStringUtils.randomNumeric(6): getTeacher.getTeacherPhoto();
        Response uploadResponse = fileService.uploadImage3(teacher.getUploadfile(), referenceNo);
        if (uploadResponse.getResult() != "SUCCESS"){
          response.setResult("FAILED");
          response.setError(uploadResponse.getError());
          return response;
        }

        getTeacher.setTeacherPhoto(uploadResponse.getMessage());
        teacherRepository.save(getTeacher);
        response.setResult("SUCCESS");
      }
    } catch (IOException e) {
      e.printStackTrace();
    }
    return response;
  }



  public List<TeacherDto> viewAllTeachers(){
    List<Teacher> teachers = teacherRepository.findAll();
    List<TeacherDto> teacherDtoList = new ArrayList<>();
    for (Teacher teacher:teachers){
      TeacherDto dto = utilityService.convertTeacherEntityToDto(teacher);
      String imageName = FilenameUtils.getName(teacher.getTeacherPhoto());
      dto.setTeacherPhoto(imageName);
      if (teacher.getRoles() != null){
        dto.setStaffRole(teacher.getRoles().getId());
      }
      teacherDtoList.add(dto);
    }
    return teacherDtoList;
  }
  public Integer getTeacherCode(){
    Teacher lastRecord = teacherRepository.findTopByOrderByIdDesc();
    if (lastRecord != null && lastRecord.getTeacherCode() != null){
      return lastRecord.getTeacherCode() + 1;
    } else {
      return 100;
    }
  }

  public TeacherDto findTeacher(TeacherDto teacherDto) {
    Optional<Teacher> byId = teacherRepository.findById(teacherDto.getId());
    if (byId.isPresent()){
      return utilityService.convertTeacherEntityToDto(byId.get());
    }
    return null;
  }
  public TeacherDto findTeacherByCode(TeacherDto teacherDto) {
    Teacher byTeacherCode = teacherRepository.findByTeacherCode(teacherDto.getTeacherCode());
    if (byTeacherCode != null){
      return utilityService.convertTeacherEntityToDto(byTeacherCode);
    }
    return null;
  }

  public Response updateTeachersData(TeacherDto teacherDto) {
    Response response = new Response();
    Teacher teacher = teacherRepository.findById(teacherDto.getId()).get();
    if (teacher != null){
      teacher.setTeacherName(teacherDto.getTeacherName());
      teacher.setTeacherCode(teacherDto.getTeacherCode());
      teacher.setDob(teacherDto.getDob());
      teacher.setDateOfJoining(teacherDto.getDateOfJoining());
      teacher.setFatherName(teacherDto.getFatherName());
      teacher.setNAppointment(teacherDto.getNAppointment());
      teacher.setPost(teacherDto.getPost());
      teacher.setSubjectAppointed(teacherDto.getSubjectAppointed());
      teacher.setTAddress(teacherDto.getTAddress());
      teacher.setStatus(teacherDto.getStatus());
      teacher.setClassId(teacherDto.getClassId());
      teacher.setSectionId(teacherDto.getSectionId());
      teacher.setPhoneNo(teacherDto.getPhoneNo());
      teacher.setEmail(teacherDto.getEmail());
      Roles roles = rolesRepository.findById(teacherDto.getStaffRole()).get();
      teacher.setRoles(roles);
      teacherRepository.save(teacher);
      response.setResult("SUCCESS");
      if (response.getResult().equals("SUCCESS")){
        createUserId(teacherDto);
      }
    } else {
      response.setResult("FAIL");
      response.setMessage("Record not found.");
    }
    return response;
  }

  public TeacherDto findTeacherByClassAndSection(TeacherDto teacherDto){
    Teacher teacher = teacherRepository.findByClassIdAndSectionId(teacherDto.getClassId(), teacherDto.getSectionId());
    if (teacher == null) return new TeacherDto();
    return utilityService.convertTeacherEntityToDto(teacher);
  }

  @Autowired
  private UsersRepository usersRepository;

  @Autowired
  private RolesRepository rolesRepository;

  @Autowired
  private PasswordEncoder bcryptEncoder;

  public Response createUserId(TeacherDto teacherDto){
    Response response = new Response();
    Users userDto = new Users();
    Users users = usersRepository.findByUserId(teacherDto.getId());
    if (users != null){
      Roles roles = rolesRepository.findById(teacherDto.getStaffRole()).get();
      users.setRoles(roles);
      usersRepository.save(users);
      response.setResult("SUCCESS");
      return response;
    }

    String userName = teacherDto.getTeacherName().split(" ")[0] + teacherDto.getTeacherCode().toString();
    userDto.setUserName(userName);
    userDto.setEmail(teacherDto.getEmail());
    userDto.setPassword(bcryptEncoder.encode("123456"));
    Roles roles = rolesRepository.findByName(teacherDto.getRoleName());
    userDto.setRoles(roles);
    Teacher teacher = teacherRepository.findByTeacherCode(teacherDto.getTeacherCode());
    userDto.setUserId(teacher.getId());
    usersRepository.save(userDto);
    return response;
  }

  private void deleteUser(Teacher teacher) {
    Users users = usersRepository.findByUserId(teacher.getId());
    if (users != null){
      usersRepository.deleteById(users.getId());
    }
  }

  public List<TeacherDto> findTeacherByRoles() {
    List<Roles> roles = new ArrayList<>();
    List<TeacherDto> teacherDtoList = new ArrayList<>();
    roles = rolesRepository.findByNameContaining("TEACHER");
    List<Teacher> teachers = teacherRepository.findByRolesIn(roles);
    teachers.forEach(ele -> teacherDtoList.add(utilityService.convertTeacherEntityToDto(ele)));
    return teacherDtoList;
  }
}
