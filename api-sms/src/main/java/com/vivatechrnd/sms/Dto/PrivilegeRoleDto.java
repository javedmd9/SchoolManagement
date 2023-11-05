package com.vivatechrnd.sms.Dto;

import com.vivatechrnd.sms.Entities.Privilege;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PrivilegeRoleDto {
    private Integer id;
    private Integer roleId;
    private String roleName;
    private Integer privilegeId;
    private String privilegeName;

}
