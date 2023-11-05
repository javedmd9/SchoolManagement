package com.vivatechrnd.sms.Dto;

import com.vivatechrnd.sms.Entities.Student;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AttendanceReport {
    private Set<StudentDto> studentDtoList;
    private List<Date> attendanceDate;
    private List<AttendanceDto> attendanceDtos;
    private HashMap<Student, String> attendanceMap;
    private Integer attendanceYear;
    private Integer attendanceMonth;
    private List<Object[]> attendanceObject;
}
