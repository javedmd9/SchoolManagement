package com.vivatechrnd.sms.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.HashMap;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LeaveRequestDto {
    private Integer id;
    private String letterSubject;
    private String letterBody;
    private String submittedBy;
    private Integer approvedBy;
    private String approvedByName;
    private Date applicationDate;
    private Integer pageNo;
    private StudentDto studentDto;
    private TeacherDto teacherDto;
    private Date startDate;
    private Date endDate;
    private HashMap<String, Integer> submittedById;
    private HashMap<String, String> submittedByPersonName;
    private String status;
    private String roleName;
    private Integer roleId;
}
