package com.vivatechrnd.sms.Repository;

import com.vivatechrnd.sms.Entities.SchoolSession;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SchoolSessionRepository extends JpaRepository<SchoolSession, Integer> {
    SchoolSession findTopByOrderByIdDesc();
}
