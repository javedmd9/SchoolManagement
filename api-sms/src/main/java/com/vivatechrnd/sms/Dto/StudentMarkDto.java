package com.vivatechrnd.sms.Dto;

import com.vivatechrnd.sms.Entities.Examination;
import com.vivatechrnd.sms.Entities.Student;
import com.vivatechrnd.sms.Entities.Subjects;
import com.vivatechrnd.sms.Entities.Teacher;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StudentMarkDto {
    private Integer id;
    private Integer obtainedMarks;
    private String admissionNo;
    private String studentName;
    private Integer subjectId;
    private Integer examId;
    private Integer submittedById;
    private String attendanceStatus;
    private String classId;
    private String sectionId;
    private String sessionName;
    private String examName;
    private Integer examFullMarks;
    private String examSubject;
    private String studentMarksData;
    private StudentDto student;
    private SubjectsDto subjects;
    private ExaminationDto examination;
    private TeacherDto teacher;
    private Integer pageNum;
}
