package com.vivatechrnd.sms.Dto;

import com.vivatechrnd.sms.Entities.Teacher;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CertificateDto {
    private Integer id;
    private String topic;
    private Date trainingDate;
    private Integer noOfHours;
    private String nameOfOrganization;
    private String organizationAddress;
    private String certificateNo;
    private String certificatePath;
    private String trainingType;
    private Integer teacherId;
    private Teacher teacher;
    private String trainingDateInString;
    private Integer pageNumber;
    private Date startDate;
    private Date endDate;
}
