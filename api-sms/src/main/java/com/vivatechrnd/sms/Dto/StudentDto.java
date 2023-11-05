package com.vivatechrnd.sms.Dto;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.Column;
import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StudentDto {
    private Integer Id;
    private String admissionNo;
    private String studentName;
    private String fatherName;
    private String motherName;
    private String classId;
    private String sectionId;
    private Date dob;
    private Date admissionDate;
    private String addressType;
    private String urbanAddress;
    private String villageAddress;
    private String postOffice;
    private String policeStation;
    private String districtName;
    private String gender;
    private String religion;
    private String castType;
    private String fatherPhoneNumber;
    private String motherPhoneNumber;
    private String aadhaarNo;
    @JsonSerialize
    @JsonDeserialize
    private String updatedData;
    private String studentPhoto;
    private Integer pageNumber;
    private String status;
    private String currentSession;
    private String rejectReason;
    private String email;
}
