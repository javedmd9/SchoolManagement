package com.vivatechrnd.sms.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SubjectsDto {
    private Integer id;
    private String subjectName;
    private String subjectCode;
    private Date subjectExamDate;
}
