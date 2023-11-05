package com.vivatechrnd.sms.Controller;

import com.vivatechrnd.sms.Dto.AttendanceDto;
import com.vivatechrnd.sms.Dto.AttendanceReport;
import com.vivatechrnd.sms.Dto.StudentDto;
import com.vivatechrnd.sms.Entities.Attendance;
import com.vivatechrnd.sms.Entities.Student;
import com.vivatechrnd.sms.Entities.Teacher;
import com.vivatechrnd.sms.Repository.AttendanceRepository;
import com.vivatechrnd.sms.Repository.StudentRepository;
import com.vivatechrnd.sms.Repository.TeacherRepository;
import com.vivatechrnd.sms.Services.StudentService;
import com.vivatechrnd.sms.utility.Response;
import com.vivatechrnd.sms.utility.UtilityService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;
import javax.persistence.criteria.*;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@CrossOrigin(origins = "*", allowedHeaders = "*")
@RestController
@RequestMapping(path = "/attendance")
public class AttendanceController {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private EntityManager entityManager;

    @Autowired
    private StudentService service;

    @Autowired
    private UtilityService utilityService;

    @RequestMapping(value = "/create", method = RequestMethod.POST)
    public Response createNewAttendance(@RequestBody List<AttendanceDto> dto){
        Response response = new Response();
        Teacher teacher = teacherRepository.findById(dto.get(0).getTeacherId()).get();
        Student student1 = studentRepository.findByAdmissionNo(dto.get(0).getAdmissionNo());
        dto.get(0).setStudent(student1);
        dto.get(0).setTeacher(teacher);
        List<Attendance> isDatePresent = getFilteredAttendance(dto.get(0));
        if (isDatePresent.size() > 0){
            response.setResult("Failed");
            response.setMessage("Attendance already taken for this class");
            return response;
        }
        String classId = dto.get(0).getClassId();
        String sectionId = dto.get(0).getSectionId();
        for (AttendanceDto s: dto){
            Attendance attendance = new Attendance();
            if (s.getHolidayName() != null){
                attendance.setStatus(s.getHolidayName());
            } else {
                attendance.setStatus(s.getStatus());
            }
            Student student = studentRepository.findByAdmissionNo(s.getAdmissionNo());
            attendance.setAttendanceDate(s.getAttendanceDate());
            attendance.setStudent(student);
            attendance.setTeacher(teacher);
            attendance.setClassId(classId);
            attendance.setSectionId(sectionId);
            attendanceRepository.save(attendance);
        }
        response.setResult("Success");
        return response;
    }

    @RequestMapping(value = "/view", method = RequestMethod.POST)
    public AttendanceReport getAllAttendance(@RequestBody AttendanceDto attendanceDto){
        List<AttendanceDto> attendanceDtos = new ArrayList<>();
        if (attendanceDto.getTeacherId() != null){
            Teacher teacher = teacherRepository.findById(attendanceDto.getTeacherId()).get();
            attendanceDto.setTeacher(teacher);
            attendanceDto.setClassId(teacher.getClassId());
            attendanceDto.setSectionId(teacher.getSectionId());
        }

        if (attendanceDto.getAttendanceDate() != null){
            List<Date> dateList = startAndEndDAte(attendanceDto.getAttendanceDate());
            Date startDate = dateList.get(0);
            Date endDate = dateList.get(dateList.size()-1);
            attendanceDto.setStartDate(startDate);
            attendanceDto.setEndDate(endDate);
            attendanceDto.setAttendanceDate(null);
        }
        List<Attendance> attendances = getFilteredAttendance(attendanceDto);
        AttendanceReport attendanceReport = new AttendanceReport();
        Set<StudentDto> studentDtoSet = new HashSet<>();
        attendances.forEach(ele -> studentDtoSet.add(utilityService.convertStudentEntityToDto(ele.getStudent())));

        if (attendances.size() > 0){
            Date getCurrentDate = attendances.get(0).getAttendanceDate();
            Integer getYear = getYear(getCurrentDate);
            Integer getMonth = getMonth(getCurrentDate);
            attendanceReport.setAttendanceYear(getYear);
            attendanceReport.setAttendanceMonth(getMonth);
            attendanceReport.setAttendanceDtos(attendanceDtos);
            List<Date> dates = startAndEndDAte(getCurrentDate);
            attendanceReport.setAttendanceDate(dates);
            String sql = createSql(dates);
            List<Object[]> attendanceSummary = setCustomQuery(sql, attendances.get(0).getTeacher().getId(), studentDtoSet);

            attendanceReport.setAttendanceObject(attendanceSummary);
        }
        return attendanceReport;
    }

    public List<Object[]> setCustomQuery(String sql, Integer instructorId, Set<StudentDto> studentDtoSet){

        List<Integer> studentIdList = new ArrayList<>();
        studentDtoSet.forEach(ele -> studentIdList.add(ele.getId()));
        String result = "";
        for (int i = 0; i < studentIdList.size() - 1; i++) {
            result = result + studentIdList.get(i).toString() + ",";
        }
        result += studentIdList.get(studentIdList.size()-1);
        String query = "SELECT s.admission_no, s.student_name,"+ sql + " FROM school.attendance as a, school.student as s  " +
                "where a.student_id=s.id and a.teacher_id="+ instructorId +" and a.student_id in(" + result + ") group by student_id order by student_id";
        List<Object[]> objectlist = entityManager.createNativeQuery(query).getResultList();

        return objectlist;
    }

    public String createSql(List<Date> dates){
        String sql = "";
        for (int i = 0; i < dates.size()-1; i++) {
            sql += "max(case when (attendance_date = '"+ convertDateToString(dates.get(i)) + " 05:30:00.000000') then substring(a.status,1,3) else NULL end) as '"+ getDay(dates.get(i)) +"',";
        }
        int dateLength = dates.size()-1;
        sql += "max(case when (attendance_date = '"+ convertDateToString(dates.get(dateLength)) + " 05:30:00.000000') then substring(a.status,1,3) else NULL end) as '"+ getDay(dates.get(dateLength)) +"'";
        return sql;
    }

    public AttendanceDto convertAttendanceEntityToDto(Attendance attendance){
        return modelMapper.map(attendance, AttendanceDto.class);
    }

    public List<Date> startAndEndDAte(Date getCurrentDate){
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(getCurrentDate);
        calendar.add(Calendar.MONTH, 0);
        calendar.set(Calendar.DATE, calendar.getActualMinimum(Calendar.DAY_OF_MONTH));
        Date monthFirstDay = calendar.getTime();
        calendar.set(Calendar.DATE, calendar.getActualMaximum(Calendar.DAY_OF_MONTH));
        Date monthLastDay = calendar.getTime();

        return createDateList(monthFirstDay, monthLastDay);
    }

    private Integer getMonth(Date getCurrentDate) {
        Calendar c = Calendar.getInstance();
        c.setTime(getCurrentDate);
        int monthOfDate = c.get(Calendar.MONTH) +1;
        return monthOfDate;
    }

    private Integer getYear(Date getCurrentDate) {
        Calendar c = Calendar.getInstance();
        c.setTime(getCurrentDate);
        int yearOfMonth = c.get(Calendar.YEAR);
        return yearOfMonth;
    }

    private List<Date> createDateList(Date startDate, Date endDate){
        List<Date> ret = new ArrayList<Date>();
        Date tmp = startDate;
        while(tmp.before(endDate) || tmp.equals(endDate)) {
            ret.add(tmp);
            tmp = addDays(tmp, 1);
        }
        return ret;
    }

    public static Date addDays(Date date, int days)
    {
        Calendar cal = Calendar.getInstance();
        cal.setTime(date);
        cal.add(Calendar.DATE, days); //minus number would decrement the days
        return cal.getTime();
    }

    public String convertDateToString(Date cDate){
        SimpleDateFormat df = new SimpleDateFormat("yyyy-MM-dd");
        String parsedDate = df.format(cDate);
        return parsedDate;
    }

    public LocalDate convertStringToDate(String date){
        String input = date;
        Locale l = Locale.US ;
        DateTimeFormatter f = DateTimeFormatter.ofPattern( "yyyy-MM-dd" , l );
        LocalDate ld = LocalDate.parse( input , f );
        return ld;
    }
    private Integer getDay(Date getCurrentDate) {
        Calendar c = Calendar.getInstance();
        c.setTime(getCurrentDate);
        int dayOfDate = c.get(Calendar.DAY_OF_MONTH);
        return dayOfDate;
    }

    public List<Attendance> getFilteredAttendance(AttendanceDto attendanceDto){
        CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
        CriteriaQuery<Attendance> query = criteriaBuilder.createQuery(Attendance.class);
        Root<Attendance> root = query.from(Attendance.class);
        query.select(root);
        HashMap<String, Object> parameterMap = new HashMap<>();
        List<Predicate> predicateList = new ArrayList<Predicate>();
        if (!StringUtils.isEmpty(attendanceDto.getClassId())) {
            ParameterExpression<String> p = criteriaBuilder.parameter(String.class, "classId");
            predicateList.add((criteriaBuilder.equal(root.<String>get("classId"),p)));
            parameterMap.put("classId", attendanceDto.getClassId());
        }
        if (!StringUtils.isEmpty(attendanceDto.getSectionId())) {
            ParameterExpression<String> p = criteriaBuilder.parameter(String.class, "sectionId");
            predicateList.add((criteriaBuilder.equal(root.<String>get("sectionId"),p)));
            parameterMap.put("sectionId", attendanceDto.getSectionId());
        }
        if (attendanceDto.getAttendanceDate() != null){
            ParameterExpression<Date> p = criteriaBuilder.parameter(Date.class, "attendanceDate");
            predicateList.add(criteriaBuilder.equal(root.get("attendanceDate"), p));
            parameterMap.put("attendanceDate", attendanceDto.getAttendanceDate());
        }

        if (attendanceDto.getStartDate() != null){
            ParameterExpression<Date> p = criteriaBuilder.parameter(Date.class, "startDate");
            predicateList.add(criteriaBuilder.greaterThanOrEqualTo(root.get("attendanceDate"), p));
            parameterMap.put("startDate", attendanceDto.getStartDate());
        }

        if (attendanceDto.getEndDate() != null){
            ParameterExpression<Date> p = criteriaBuilder.parameter(Date.class, "endDate");
            predicateList.add(criteriaBuilder.lessThanOrEqualTo(root.get("attendanceDate"), p));
            parameterMap.put("endDate", attendanceDto.getEndDate());
        }
        if (attendanceDto.getTeacher() != null){
            Join<Attendance, Teacher> instructor = root.join("teacher");
            ParameterExpression<Integer> p = criteriaBuilder.parameter(Integer.class, "teacherId");
            predicateList.add(criteriaBuilder.equal(instructor.get("id"), p));
            parameterMap.put("teacherId", attendanceDto.getTeacher().getId());
        }
        if (attendanceDto.getStudent() != null){
            Join<Attendance, Student> student = root.join("student");
            ParameterExpression<Integer> p = criteriaBuilder.parameter(Integer.class, "studentId");
            predicateList.add(criteriaBuilder.equal(student.get("Id"), p));
            parameterMap.put("studentId", attendanceDto.getStudent().getId());
        }

        if (predicateList.size() == 0) {
            query.select(root);
        } else {
            if (predicateList.size() == 1) {
                query.where(predicateList.get(0));
            } else {
                query.where(criteriaBuilder.and(predicateList.toArray(new Predicate[0])));
            }
        }
        TypedQuery<Attendance> tq = entityManager.createQuery(query);

        for (String key : parameterMap.keySet()) {
            tq.setParameter(key, parameterMap.get(key));
        }

        List<Attendance> resultList = tq.getResultList();

        return resultList;
    }
}
