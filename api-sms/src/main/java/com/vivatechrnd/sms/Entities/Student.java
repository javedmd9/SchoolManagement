package com.vivatechrnd.sms.Entities;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import lombok.Data;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Data
@Entity
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
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
    @Column(columnDefinition = "text")
    private String updatedData;
    private String studentPhoto;
    private String status;

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<StudentDocuments> documents = new ArrayList<>();
}
