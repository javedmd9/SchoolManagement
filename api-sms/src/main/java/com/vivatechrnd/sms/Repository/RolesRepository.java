package com.vivatechrnd.sms.Repository;

import com.vivatechrnd.sms.Entities.Roles;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RolesRepository extends JpaRepository<Roles, Integer> {
    Roles findByName(String roleName);

    List<Roles> findByNameContaining(String roleName);
}
