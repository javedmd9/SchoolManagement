package com.vivatechrnd.sms.Dto;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.vivatechrnd.sms.Entities.Student;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StudentDocumentDto extends DocumentDto {
    private Long id;
    private String admissionNo;
    @JsonSerialize
    @JsonDeserialize
    private String documentData;
    private Student student;
    private List<DocumentDto> documents;

}
