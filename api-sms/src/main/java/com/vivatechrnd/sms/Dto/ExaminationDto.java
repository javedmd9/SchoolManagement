package com.vivatechrnd.sms.Dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ExaminationDto {
    private Integer id;
    private String sessionName;
    private String examName;
    private String classId;
    private Date examStartDate;
    private Date examEndDate;
    private List<SubjectsDto> subjectsDtoList;
    private String examType;
}
