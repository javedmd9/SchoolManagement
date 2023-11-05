package com.vivatechrnd.sms.Dto;

import com.vivatechrnd.sms.Entities.Examination;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReportCardDto {
    private List<ExaminationDto> examinationDtoList;
    private List<Object[]> reportObject;
}
