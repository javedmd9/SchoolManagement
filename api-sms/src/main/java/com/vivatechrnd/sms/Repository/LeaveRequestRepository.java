package com.vivatechrnd.sms.Repository;

import com.vivatechrnd.sms.Entities.LeaveRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Integer> {
    Page<LeaveRequest> findBySubmittedBy(Integer code, Pageable pageable);
}
