package com.vivatechrnd.sms.Repository;

import com.vivatechrnd.sms.Entities.Users;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsersRepository extends JpaRepository<Users, Integer> {
    Users findByUserName(String username);

    Users findByUserId(Integer id);
}
