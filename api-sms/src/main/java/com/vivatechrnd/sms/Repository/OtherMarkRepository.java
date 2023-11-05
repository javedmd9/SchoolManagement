package com.vivatechrnd.sms.Repository;

import com.vivatechrnd.sms.Entities.Examination;
import com.vivatechrnd.sms.Entities.OtherMarks;
import com.vivatechrnd.sms.Entities.Student;
import com.vivatechrnd.sms.Entities.Subjects;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OtherMarkRepository extends JpaRepository<OtherMarks, Integer> {
    OtherMarks findByExaminationAndStudentAndSubjects(Examination examination, Student student, Subjects subjects);
}
