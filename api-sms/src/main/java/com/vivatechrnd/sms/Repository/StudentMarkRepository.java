package com.vivatechrnd.sms.Repository;

import com.vivatechrnd.sms.Dto.StudentMarkDto;
import com.vivatechrnd.sms.Entities.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import javax.transaction.Transactional;
import java.util.List;

public interface StudentMarkRepository extends JpaRepository<StudentMarks, Integer> {
    StudentMarks findBySessionNameAndExaminationAndStudentAndSubjects(String sessionName, Examination examination, Student getStudent, Subjects subjects);

    @Modifying
    @Transactional
    @Query(value = "delete from school.student_marks where class_id=?1 and subjects_id=?2", nativeQuery = true)
    void deleteStudentRecord(String classId, Integer subjectId);

    List<StudentMarks> findByClassIdAndSectionIdAndTeacherAndSubjectsAndExaminationIn(String classId, String sectionId, Teacher teacher, Subjects subjects, List<Examination> examinations);
    List<StudentMarks> findBySubjectsAndExaminationIn(Subjects subjects, List<Examination> examinations);
}
