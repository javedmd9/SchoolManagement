package com.vivatechrnd.sms.Repository;

import com.vivatechrnd.sms.Entities.ExamDateSheet;
import com.vivatechrnd.sms.Entities.Examination;
import com.vivatechrnd.sms.Entities.Subjects;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExamDateSheetRepository extends JpaRepository<ExamDateSheet, Integer> {
    List<ExamDateSheet> findByExamination(Examination examination);

    ExamDateSheet findBySubjectsAndExamination(Subjects subjects, Examination examination);
}
