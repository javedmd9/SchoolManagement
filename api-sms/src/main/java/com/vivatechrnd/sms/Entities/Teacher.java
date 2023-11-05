package com.vivatechrnd.sms.Entities;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class Teacher {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;
    private Integer teacherCode;
    private String teacherName;
    private String fatherName;
    private String subjectAppointed;
    private String tAddress;
    private Date dob;
    private String post;
    private String nAppointment;
    private Date dateOfJoining;
    private String status;
    private String teacherPhoto;
    private String classId;
    private String sectionId;
    private String phoneNo;
    private String email;

    @OneToMany(mappedBy = "teacher", cascade = CascadeType.ALL, orphanRemoval = true, fetch=FetchType.LAZY)
    private List<Certificates> certificates = new ArrayList<>();

    @ManyToOne(cascade = {CascadeType.PERSIST, CascadeType.MERGE, CascadeType.REFRESH, CascadeType.DETACH})
    @JoinColumn(name = "roles_id")
    private Roles roles;

    @OneToMany(mappedBy = "teacher", cascade = {CascadeType.PERSIST, CascadeType.MERGE, CascadeType.REFRESH, CascadeType.DETACH}, orphanRemoval = true)
    private List<AssignSubjectsTeacher> assignSubjectsTeachers = new ArrayList<>();


    @OneToMany(mappedBy = "teacher", cascade = {CascadeType.PERSIST, CascadeType.MERGE, CascadeType.REFRESH, CascadeType.DETACH}, orphanRemoval = true)
    private List<Attendance> attendances = new ArrayList<>();

}
