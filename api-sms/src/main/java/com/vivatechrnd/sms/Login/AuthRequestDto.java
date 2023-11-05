package com.vivatechrnd.sms.Login;

import com.vivatechrnd.sms.Entities.Privilege;
import com.vivatechrnd.sms.Entities.Roles;
import com.vivatechrnd.sms.Entities.Teacher;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthRequestDto {
    private String username;
    private String password;
    private String token;
    private Date tokenExpiry;
    private String errorMessage;
    private Roles roles;
    private Teacher userId;
    private List<Privilege> privilegeList;
}
