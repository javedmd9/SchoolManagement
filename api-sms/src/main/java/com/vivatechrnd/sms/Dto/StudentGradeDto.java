package com.vivatechrnd.sms.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StudentGradeDto {
    private StudentDto studentDto;
    private Double percentage;
    private String grade;
    private String examName;
}
