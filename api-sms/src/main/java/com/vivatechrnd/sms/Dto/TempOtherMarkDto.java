package com.vivatechrnd.sms.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TempOtherMarkDto {
    private Integer examinationId;
    private String subjectCode;
    private String studentData;
}
