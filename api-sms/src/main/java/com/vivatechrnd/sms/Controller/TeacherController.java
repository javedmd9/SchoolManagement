package com.vivatechrnd.sms.Controller;


import com.vivatechrnd.sms.Dto.FormDataWithUploadFile;
import com.vivatechrnd.sms.Dto.TeacherDto;
import com.vivatechrnd.sms.Services.TeacherService;
import com.vivatechrnd.sms.utility.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@CrossOrigin(origins = "*", allowedHeaders = "*")
@RestController
@RequestMapping(value = "/teacher")
public class TeacherController {

  @Autowired
  private TeacherService service;


  @RequestMapping(value = "/view", method = RequestMethod.GET)
  public List<TeacherDto> getAllTeachers(){
    return service.viewAllTeachers();
  }

  @RequestMapping(value = "/find-teacher", method = RequestMethod.POST)
  public TeacherDto findTeacher(@RequestBody TeacherDto teacherDto){
    return service.findTeacher(teacherDto);
  }

  @RequestMapping(value = "/generate-new-teacher-code", method = RequestMethod.GET)
  public Integer getTeacherCode(){
    return service.getTeacherCode();
  }

  @RequestMapping(value = "/add", method = RequestMethod.POST)
  public Response addTeacher(@RequestPart String teacher, @RequestPart(required = false) MultipartFile file){
    FormDataWithUploadFile formData = new FormDataWithUploadFile();
    formData.setIvrprompt(teacher);
    formData.setUploadfile(file);
    Response response = service.saveOrUpdateTeacher(formData);
    return response;
  }

  @RequestMapping(value = "/find-by-code", method = RequestMethod.POST)
  public TeacherDto findByTeacherCode(@RequestBody Integer teacherCode){
    TeacherDto teacherDto = new TeacherDto();
    teacherDto.setTeacherCode(teacherCode);
    return service.findTeacherByCode(teacherDto);

  }

  @RequestMapping(value = "/update", method = RequestMethod.POST)
  public Response updateTeacher(@RequestBody TeacherDto teacherDto){
    Response response = service.updateTeachersData(teacherDto);
    return response;
  }

  @RequestMapping(value = "/update-photo", method = RequestMethod.POST)
  public Response updateTeacherPhoto(@RequestPart String teacher, @RequestPart MultipartFile file){
    FormDataWithUploadFile formData = new FormDataWithUploadFile();
    formData.setIvrprompt(teacher);
    formData.setUploadfile(file);
    Response response = service.updatePhoto(formData);
    return response;
  }

  @RequestMapping(value = "/delete", method = RequestMethod.POST)
  public @ResponseBody Response deleteTeacher(@RequestBody TeacherDto teacherId){
    Response response = service.deleteTeacher(teacherId.getId());
    return response;
  }
  @RequestMapping(value = "/find-teacher-by-class-section", method = RequestMethod.POST)
  public TeacherDto findTeacherByClassAndSection(@RequestBody TeacherDto teacherDto){
    return service.findTeacherByClassAndSection(teacherDto);
  }
  @RequestMapping(value = "/find-teacher-by-roles", method = RequestMethod.GET)
  public List<TeacherDto> findTeacherByRoles(){
    return service.findTeacherByRoles();
  }
}
