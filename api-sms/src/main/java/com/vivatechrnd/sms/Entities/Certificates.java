package com.vivatechrnd.sms.Entities;



import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@EqualsAndHashCode(callSuper=false)
public class Certificates {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;
    private String topic;
    private Date trainingDate;
    private Integer noOfHours;
    private String nameOfOrganization;
    private String organizationAddress;
    private String certificateNo;
    private String certificatePath;
    private String trainingType;

    @JsonIgnore
    @ManyToOne(cascade = {CascadeType.PERSIST, CascadeType.MERGE, CascadeType.REFRESH, CascadeType.DETACH})
    @JoinColumn(name = "teacher_id")
    private Teacher teacher;

}
