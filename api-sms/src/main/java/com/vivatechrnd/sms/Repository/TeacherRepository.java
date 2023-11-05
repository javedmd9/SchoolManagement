package com.vivatechrnd.sms.Repository;


import com.vivatechrnd.sms.Entities.Roles;
import com.vivatechrnd.sms.Entities.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TeacherRepository extends JpaRepository<Teacher, Integer> {
  Teacher findTopByOrderByIdDesc();

  Teacher findByTeacherCode(Integer teacherCode);

  Teacher findByClassIdAndSectionId(String classId, String sectionId);

  List<Teacher> findByClassId(String classId);

  List<Teacher> findByRolesIn(List<Roles> roles);

}
