package com.vivatechrnd.sms.Repository;

import com.vivatechrnd.sms.Entities.Certificates;
import com.vivatechrnd.sms.Entities.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CertificateRepository extends JpaRepository<Certificates, Integer> {

//    @Query(value = "delete from certificates c where c.id=:id", nativeQuery = true)
//    void deleteCertificate(@Param("id") int id);
    @Query("delete from Certificates c where c.id =?1")
    void deleteCertificate(Integer cId);

    List<Certificates> findByTeacher(Teacher teacher);
}
