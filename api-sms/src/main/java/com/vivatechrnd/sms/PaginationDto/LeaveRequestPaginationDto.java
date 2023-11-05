package com.vivatechrnd.sms.PaginationDto;

import com.vivatechrnd.sms.Dto.LeaveRequestDto;
import com.vivatechrnd.sms.utility.PaginationResponse;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

@Data
@EqualsAndHashCode(callSuper = false)
public class LeaveRequestPaginationDto extends PaginationResponse {
    List<LeaveRequestDto> content;
}
