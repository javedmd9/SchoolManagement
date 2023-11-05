package com.vivatechrnd.sms.Repository;

import com.vivatechrnd.sms.Entities.AssignSubjectsTeacher;
import com.vivatechrnd.sms.Entities.Subjects;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface AssignSubjectsTeacherRepository extends JpaRepository<AssignSubjectsTeacher, Integer> {

    AssignSubjectsTeacher findByClassIdAndSectionIdAndSubjects(String classId, String sectionId, Subjects subjects);

    @Query(value = "select distinct class_id from assign_subjects_teacher", nativeQuery = true)
    List<Object[]> findDistinctClasses();

    @Query(value = "SELECT distinct a.subjects_id, c.subject_code, c.subject_name FROM assign_subjects_teacher a, class_subjects c where a.subjects_id=c.id and class_id=?1", nativeQuery = true)
    List<Object[]> findDistinctSubject(String classId);

    @Query(value = "SELECT distinct class_id, section_id FROM assign_subjects_teacher", nativeQuery = true)
    List<Object[]> findDistinctClassAndSection();

    List<AssignSubjectsTeacher> findByClassId(String classId);
}
