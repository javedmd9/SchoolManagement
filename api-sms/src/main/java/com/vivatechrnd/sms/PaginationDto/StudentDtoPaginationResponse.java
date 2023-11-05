package com.vivatechrnd.sms.PaginationDto;

import com.vivatechrnd.sms.Dto.StudentDto;
import com.vivatechrnd.sms.utility.PaginationResponse;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

@Data
@EqualsAndHashCode(callSuper = false)
public class StudentDtoPaginationResponse extends PaginationResponse {
    private List<StudentDto> content;
}
