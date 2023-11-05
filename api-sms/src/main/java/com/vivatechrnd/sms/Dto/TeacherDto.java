package com.vivatechrnd.sms.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TeacherDto {
  private Integer id;
  private Integer teacherCode;
  private String teacherName;
  private String fatherName;
  private String subjectAppointed;
  private String tAddress;
  private Date dob;
  private String post;
  private String nAppointment;
  private Date dateOfJoining;
  private String status;
  private String teacherPhoto;
  private String teacherPhotoExtension;
  private MultipartFile teacherImage;
  private String classId;
  private String sectionId;
  private String email;
  private String phoneNo;
  private Integer staffRole;
  private String roleName;

}
