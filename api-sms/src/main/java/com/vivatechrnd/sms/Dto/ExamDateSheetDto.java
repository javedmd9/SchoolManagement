package com.vivatechrnd.sms.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ExamDateSheetDto {
    private Integer id;
    private Integer examId;
    private Integer subjectId;
    private String courseExamData;
}
