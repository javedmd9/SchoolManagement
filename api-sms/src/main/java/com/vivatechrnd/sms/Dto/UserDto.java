package com.vivatechrnd.sms.Dto;

import com.vivatechrnd.sms.Entities.Roles;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserDto {
    private Integer userId;
    private String name;
    private String userType;
    private Integer teacherCode;
    private String code;
    private String email;
    private Roles roles;
}
