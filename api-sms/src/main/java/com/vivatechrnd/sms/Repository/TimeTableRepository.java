package com.vivatechrnd.sms.Repository;

import com.vivatechrnd.sms.Entities.AssignSubjectsTeacher;
import com.vivatechrnd.sms.Entities.TimeTable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TimeTableRepository extends JpaRepository<TimeTable, Integer> {

    TimeTable findByClassIdAndSectionIdAndPeriod(String classId, String sectionId, Integer periodNo);

    TimeTable findByClassIdAndSectionIdAndPeriodAndDayName(String classId, String sectionId, Integer periodNo, String dayName);
}
