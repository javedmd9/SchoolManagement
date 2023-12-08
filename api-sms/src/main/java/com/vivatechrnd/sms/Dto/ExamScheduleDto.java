package com.vivatechrnd.sms.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ExamScheduleDto {
    private List<String> examName;
    private List<Object[]> examObject;
}
