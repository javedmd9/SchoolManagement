package com.vivatechrnd.sms.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AssignSubjectsTeacherDto {
    private Integer id;
    private Integer teacherId;
    private Integer subjectId;
    private String subjectName;
    private String subjectCode;
    private String classId;
    private String sectionId;
    private TeacherDto teacherDto;
    private SubjectsDto subjectsDto;
    private String sessionName;
    private int pageNumber;
    private String dayName;
    private Integer periodNo;
}
