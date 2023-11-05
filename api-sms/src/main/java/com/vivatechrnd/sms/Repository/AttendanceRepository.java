package com.vivatechrnd.sms.Repository;

import com.vivatechrnd.sms.Entities.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AttendanceRepository extends JpaRepository<Attendance, Integer> {
}
