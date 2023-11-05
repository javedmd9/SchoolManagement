package com.vivatechrnd.sms.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OtherMarksDto {
    private Integer id;

    private String sessionName;
    private List<Integer> examId;
    private Integer submittedById;
    private String classId;
    private String sectionId;
    private String subjectCode;
    private String studentName;
    private String admissionNo;
    private Double ptMarks;
    private Integer subEnrich;
    private Integer notebook;
    private String examType;
    private StudentDto studentDto;
    private SubjectsDto subjectsDto;
    private ExaminationDto examinationDto;
}
