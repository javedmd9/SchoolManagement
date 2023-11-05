package com.vivatechrnd.sms.Repository;

import com.vivatechrnd.sms.Entities.Student;
import com.vivatechrnd.sms.Entities.StudentDocuments;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudentRepository extends JpaRepository<Student, Integer> {
    Student findByAdmissionNo(String admissionNo);

    List<Student> findByClassId(String classId);

    List<Student> findTop10ByStudentNameContaining(String studentName);
}
