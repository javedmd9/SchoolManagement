package com.vivatechrnd.sms.Dto;


import com.vivatechrnd.sms.Entities.Student;
import com.vivatechrnd.sms.Entities.Teacher;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AttendanceDto {
    private Integer id;
    private Date attendanceDate;
    private String status;
    private String admissionNo;
    private Integer teacherId;
    private String classId;
    private String sectionId;
    private Date startDate;
    private Date endDate;
    private Teacher teacher;
    private Student student;
    private String holidayName;

}
