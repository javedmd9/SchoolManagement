package com.vivatechrnd.sms.Repository;

import com.vivatechrnd.sms.Entities.StudentDocuments;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentDocumentsRepository extends JpaRepository<StudentDocuments, Integer> {
    public StudentDocuments findByAdmissionNo(String admissionNo);
}
