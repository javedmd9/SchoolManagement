package com.vivatechrnd.sms.PaginationDto;

import com.vivatechrnd.sms.Dto.CertificateDto;
import com.vivatechrnd.sms.utility.PaginationResponse;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

@Data
@EqualsAndHashCode(callSuper=false)
public class CertificatePaginationDto extends PaginationResponse {
    private List<CertificateDto> content;
}
