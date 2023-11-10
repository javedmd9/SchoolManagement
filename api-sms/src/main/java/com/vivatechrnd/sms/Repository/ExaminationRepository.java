package com.vivatechrnd.sms.Repository;

import com.vivatechrnd.sms.Entities.Examination;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ExaminationRepository extends JpaRepository<Examination, Integer> {
    List<Examination> findBySessionName(String sessionName);

    @Query(value = "select distinct session_name from examination", nativeQuery = true)
    List<Object[]> findDistinctBySessionName();

    List<Examination> findBySessionNameAndExamName(String sessionName, String examName);

    List<Examination> findByIdIn(List<Integer> examId);

    List<Examination> findBySessionNameAndClassId(String sessionName, String classId);

    Examination findBySessionNameAndExamNameAndClassId(String sessionName, String examName, String classId);
}
