package com.vivatechrnd.sms.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MarksDto {
    private String sessionName;
    private String examName;
    private String classId;
    private String sectionId;
    private Integer examFullMarks;
    private String examSubject;
    private String studentMarksData;
    private Integer submittedById;
}
