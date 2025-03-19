package com.vivatechrnd.sms.Controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vivatechrnd.sms.Dto.AssignSubjectsTeacherDto;
import com.vivatechrnd.sms.Dto.StudentDto;
import com.vivatechrnd.sms.Dto.TimeTableDto;
import com.vivatechrnd.sms.Dto.TimeTableReport;
import com.vivatechrnd.sms.Entities.AssignSubjectsTeacher;
import com.vivatechrnd.sms.Entities.Subjects;
import com.vivatechrnd.sms.Entities.Teacher;
import com.vivatechrnd.sms.Entities.TimeTable;
import com.vivatechrnd.sms.Repository.AssignSubjectsTeacherRepository;
import com.vivatechrnd.sms.Repository.SubjectRepository;
import com.vivatechrnd.sms.Repository.TeacherRepository;
import com.vivatechrnd.sms.Repository.TimeTableRepository;
import com.vivatechrnd.sms.utility.Response;
import lombok.SneakyThrows;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.persistence.EntityManager;
import java.util.*;

@CrossOrigin(origins = "*", allowedHeaders = "*")
@RestController
@RequestMapping(path = "/time-table")
public class TimeTableController {

    @Autowired
    private TimeTableRepository timeTableRepository;

    @Autowired
    private AssignSubjectsTeacherRepository assignSubjectsTeacherRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private EntityManager entityManager;

    @SneakyThrows
    @RequestMapping(value = "/create", method = RequestMethod.POST)
    public Response createTimeTable(@RequestBody String dto){
        Response response = new Response();
        TimeTableDto[] dtoList = objectMapper.readValue(dto, TimeTableDto[].class);
        AssignSubjectsTeacher assignSubjectsTeacher = assignSubjectsTeacherRepository.findById(dtoList[0].getAssignId()).get();
        TimeTable timeTableExists = timeTableRepository.findByClassIdAndSectionIdAndPeriod(assignSubjectsTeacher.getClassId(), assignSubjectsTeacher.getSectionId(), dtoList[0].getMonday());
        if (timeTableExists != null){
            response.setResult("Failed");
            response.setMessage("Periods already allotted");
            return response;
        }
        for (TimeTableDto t: dtoList){
            for (int i = 1; i <= 6; i++) {
                TimeTable timeTable = new TimeTable();
                if (i==1){
                    timeTable.setDayName("Monday");
                    timeTable.setPeriod(t.getMonday());
                }
                if (i==2){
                    timeTable.setDayName("Tuesday");
                    timeTable.setPeriod(t.getTuesday());
                }
                if (i==3){
                    timeTable.setDayName("Wednesday");
                    timeTable.setPeriod(t.getWednesday());
                }
                if (i==4){
                    timeTable.setDayName("Thursday");
                    timeTable.setPeriod(t.getThursday());
                }
                if (i==5){
                    timeTable.setDayName("Friday");
                    timeTable.setPeriod(t.getFriday());
                }
                if (i==6){
                    timeTable.setDayName("Saturday");
                    timeTable.setPeriod(t.getSaturday());
                }
                AssignSubjectsTeacher assignSubjectsTeacher1 = assignSubjectsTeacherRepository.findById(t.getAssignId()).get();
                timeTable.setClassId(assignSubjectsTeacher1.getClassId());
                timeTable.setSectionId(assignSubjectsTeacher1.getSectionId());
                timeTable.setSessionName(assignSubjectsTeacher1.getSessionName());
                timeTable.setSubjects(assignSubjectsTeacher1.getSubjects());
                timeTable.setTeacher(assignSubjectsTeacher1.getTeacher());
                timeTableRepository.save(timeTable);
            }

        }
        response.setResult("Success");
        response.setMessage("Assigned period successfully.");
        return response;
    }

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    @RequestMapping(value = "/create-optional-period", method = RequestMethod.POST)
    public Response createTimeTable(@RequestBody AssignSubjectsTeacherDto dto){
        Response response = new Response();
        TimeTable existingPeriod = timeTableRepository.findByClassIdAndSectionIdAndPeriodAndDayName(dto.getClassId(), dto.getSectionId(), dto.getPeriodNo(), dto.getDayName());
        if (existingPeriod != null){
            response.setResult("Failed");
            response.setMessage("Period already occupied");
            return response;
        }
        TimeTable timeTable = new TimeTable();
        Teacher teacher = teacherRepository.findById(dto.getTeacherId()).get();
        Subjects subjects = subjectRepository.findById(dto.getSubjectId()).get();
        timeTable.setTeacher(teacher);
        timeTable.setSubjects(subjects);
        timeTable.setPeriod(dto.getPeriodNo());
        timeTable.setDayName(dto.getDayName());
        timeTable.setClassId(dto.getClassId());
        timeTable.setSessionName(dto.getSessionName());
        timeTable.setSectionId(dto.getSectionId());
        timeTableRepository.save(timeTable);
        response.setResult("Success");
        response.setMessage("Assigned period successfully.");
        return response;
    }

    @RequestMapping(value = "/view", method = RequestMethod.POST)
    public TimeTableReport viewClassTimeTable(@RequestBody AssignSubjectsTeacherDto dto){
        List<Object[]> classTimeTableReport = setCustomQuery(dto.getClassId(), dto.getSectionId());
        TimeTableReport report = new TimeTableReport();
        report.setTimeTableObject(classTimeTableReport);
        return report;
    }

    @RequestMapping(value = "/view-teacher-time-table", method = RequestMethod.POST)
    public TimeTableReport viewTeacherTimeTable(@RequestBody AssignSubjectsTeacherDto dto){
        List<Object[]> classTimeTableReport = setCustomQueryForTeacherTimeTable(dto.getTeacherId());
        TimeTableReport report = new TimeTableReport();
        report.setTimeTableObject(classTimeTableReport);
        return report;
    }

    public List<Object[]> setCustomQuery(String classId, String sectionId){

        String query = "SELECT tt.day_name,\n" +
                "Max(case when tt.period=1 then concat(s.subject_code, ' ', t.teacher_name) else null end) as '1',\n" +
                "Max(case when tt.period=2 then concat(s.subject_code, ' ', t.teacher_name) else null end) as '2',\n" +
                "Max(case when tt.period=3 then concat(s.subject_code, ' ', t.teacher_name) else null end) as '3',\n" +
                "Max(case when tt.period=4 then concat(s.subject_code, ' ', t.teacher_name) else null end) as '4',\n" +
                "Max(case when tt.period=5 then concat(s.subject_code, ' ', t.teacher_name) else null end) as '5',\n" +
                "Max(case when tt.period=6 then concat(s.subject_code, ' ', t.teacher_name) else null end) as '6',\n" +
                "Max(case when tt.period=7 then concat(s.subject_code, ' ', t.teacher_name) else null end) as '7',\n" +
                "Max(case when tt.period=8 then concat(s.subject_code, ' ', t.teacher_name) else null end) as '8'\n" +
                "FROM time_table as tt, class_subjects as s, teacher as t\n" +
                "where tt.subjects_id=s.id and tt.teacher_id=t.id\n" +
                "and tt.class_id="+classId+" and tt.section_id='"+sectionId+"' group by tt.day_name order by tt.section_id";
        List<Object[]> objectlist = entityManager.createNativeQuery(query).getResultList();

        return objectlist;
    }

    public List<Object[]> setCustomQueryForTeacherTimeTable(Integer teacherId){

        String query = "SELECT tt.day_name,\n" +
                "Max(case when tt.period=1 then concat(s.subject_code, ' ', tt.class_id, tt.section_id) else 'F' end) as '1',\n" +
                "Max(case when tt.period=2 then concat(s.subject_code, ' ', tt.class_id, tt.section_id) else 'F' end) as '2',\n" +
                "Max(case when tt.period=3 then concat(s.subject_code, ' ', tt.class_id, tt.section_id) else 'F' end) as '3',\n" +
                "Max(case when tt.period=4 then concat(s.subject_code, ' ', tt.class_id, tt.section_id) else 'F' end) as '4',\n" +
                "Max(case when tt.period=5 then concat(s.subject_code, ' ', tt.class_id, tt.section_id) else 'F' end) as '5',\n" +
                "Max(case when tt.period=6 then concat(s.subject_code, ' ', tt.class_id, tt.section_id) else 'F' end) as '6',\n" +
                "Max(case when tt.period=7 then concat(s.subject_code, ' ', tt.class_id, tt.section_id) else 'F' end) as '7',\n" +
                "Max(case when tt.period=8 then concat(s.subject_code, ' ', tt.class_id, tt.section_id) else 'F' end) as '8'\n" +
                "FROM school.time_table as tt, school.class_subjects as s, school.teacher as t\n" +
                "where tt.subjects_id=s.id and tt.teacher_id=t.id\n" +
                "and tt.teacher_id="+teacherId+" group by tt.day_name order by tt.section_id";
        List<Object[]> objectList = entityManager.createNativeQuery(query).getResultList();

        return objectList;
    }

}
