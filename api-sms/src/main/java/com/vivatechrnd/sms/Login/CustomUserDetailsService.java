package com.vivatechrnd.sms.Login;

import com.vivatechrnd.sms.Entities.Roles;
import com.vivatechrnd.sms.Entities.Users;
import com.vivatechrnd.sms.Repository.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collection;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UsersRepository usersRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Users users = usersRepository.findByUserName(username);
        return new User(users.getUserName(), users.getPassword(), new ArrayList<>());
    }

    public Roles findRolesByUsername(String username) {
        Users byUserName = usersRepository.findByUserName(username);
        Roles roles = byUserName.getRoles();
        return roles;
    }

}
