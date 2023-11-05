package com.vivatechrnd.sms.Repository;

import com.vivatechrnd.sms.Entities.Subjects;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubjectRepository extends JpaRepository<Subjects,Integer> {
    Subjects findBySubjectCode(String subjectCode);
}
