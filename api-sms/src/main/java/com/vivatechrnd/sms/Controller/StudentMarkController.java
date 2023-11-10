package com.vivatechrnd.sms.Controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vivatechrnd.sms.Dto.*;
import com.vivatechrnd.sms.Entities.*;
import com.vivatechrnd.sms.PaginationDto.StudentMarksDtoPagination;
import com.vivatechrnd.sms.Repository.*;
import com.vivatechrnd.sms.utility.Response;
import com.vivatechrnd.sms.utility.UtilityService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;
import javax.persistence.criteria.*;
import javax.transaction.Transactional;
import java.io.IOException;
import java.util.*;
import java.util.stream.IntStream;

@CrossOrigin(origins = "*", allowedHeaders = "*")
@RestController
@RequestMapping(value="/student-marks")
public class StudentMarkController {

    @Autowired
    private StudentMarkRepository studentMarkRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private ExaminationRepository examinationRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UtilityService utilityService;

    @Autowired
    private EntityManager entityManager;

    @Autowired
    private ModelMapper modelMapper;

    @RequestMapping(value = "/create-marks", method = RequestMethod.POST)
    public Response addStudentMarks(@RequestPart String dto){
        Response response = new Response();
        try {
            MarksDto marksDto = objectMapper.readValue(dto, MarksDto.class);
            StudentMarkDto[] sMarks = utilityService.getJsonToDto(marksDto.getStudentMarksData(), StudentMarkDto[].class);

            Teacher teacher = teacherRepository.findById(marksDto.getSubmittedById()).get();
            for (StudentMarkDto markDto: sMarks){
                StudentMarks marks = studentMarkRepository.findById(markDto.getId()).get();
                marks.setTeacher(teacher);
                marks.setFullMarks(marksDto.getExamFullMarks());
                marks.setObtainedMarks(markDto.getObtainedMarks());
                marks.setAttendanceStatus(markDto.getAttendanceStatus());
                marks.setClassId(marksDto.getClassId());
                marks.setSectionId(marksDto.getSectionId());
                marks.setSessionName(marksDto.getSessionName());
                studentMarkRepository.save(marks);
            }
            response.setResult("SUCCESS");
            response.setMessage("Student marks record saved successfully.");
        } catch (IOException e) {
            e.printStackTrace();
        }
        return response;
    }

    @RequestMapping(value = "/student-exam-mark", method = RequestMethod.POST)
    public ReportCardDto getIndividualMarks(@RequestBody StudentMarkDto dto) {
        StudentMarkDto markDto = new StudentMarkDto();
        int pageNumber = 0;
        PageRequest pageRequest = new PageRequest(pageNumber, 15);
        markDto.setAdmissionNo(dto.getStudent().getAdmissionNo());
        SchoolSessionDto currentSession = utilityService.getCurrentSession();
        markDto.setSessionName(currentSession.getSessionName());
        Page<StudentMarks> filteredMarks = getFilteredMarks(markDto, pageRequest);
        if (filteredMarks.getContent().size() > 0){
            ReportCardDto reportCardDto = new ReportCardDto();
            List<Examination> examinationList = examinationRepository.findBySessionNameAndClassId(currentSession.getSessionName(), dto.getStudent().getClassId());
            List<ExaminationDto> examDtoList = new ArrayList<>();
            examinationList.forEach(ele -> examDtoList.add(utilityService.convertExaminationEntityToDto(ele)));
            String sql = createSql(examDtoList);
            List<Object[]> examSummary = setCustomQuery(sql, dto.getStudent().getId());
            reportCardDto.setExaminationDtoList(examDtoList);
            reportCardDto.setReportObject(examSummary);
            return reportCardDto;
        }
        return null;
    }

    @Transactional
    @RequestMapping(value = "/student-grade", method = RequestMethod.POST)
    public List<StudentGradeDto> getStudentGrades(@RequestBody StudentMarkDto dto){
        List<StudentGradeDto> dtoList = new ArrayList<>();
        dto.setSessionName(utilityService.getCurrentSession().getSessionName());
        List<Examination> examinations = examinationRepository.findBySessionNameAndClassId(dto.getSessionName(), dto.getClassId());
        for (Examination e: examinations){
            StudentMarkDto markDto = new StudentMarkDto();
            markDto.setAdmissionNo(dto.getAdmissionNo());
            markDto.setExamName(e.getExamName());
            markDto.setSessionName(dto.getSessionName());
            int pageNumber = 0;
            PageRequest pageRequest = new PageRequest(pageNumber, 15);
            Page<StudentMarks> filteredMarks = getFilteredMarks(markDto, pageRequest);
            int fullMarks = filteredMarks.getContent().stream().mapToInt(StudentMarks::getFullMarks).sum();
            int obtainedMarks = filteredMarks.getContent().stream().mapToInt(StudentMarks::getObtainedMarks).sum();
            double percentage = ((double) obtainedMarks / (double) fullMarks)*100;
            StudentGradeDto gradeDto = new StudentGradeDto();
            gradeDto.setStudentDto(utilityService.convertStudentEntityToDto(filteredMarks.getContent().get(0).getStudent()));
            gradeDto.setPercentage(utilityService.roundOfTwoDecimalPlaces(percentage));
            gradeDto.setExamName(e.getExamName());
            dtoList.add(gradeDto);
        }
        return dtoList;
    }


    public List<Object[]> setCustomQuery(String sql, Integer studentId){
        String query = "SELECT c.subject_name,"+ sql + " FROM school.student_marks as sc, school.class_subjects as c, school.student as s, school.other_marks as o, school.examination e\n" +
                "where sc.subjects_id=c.id and sc.examination_id = e.id and sc.student_id=s.id\n" +
                "and sc.student_id="+ studentId +"  group by sc.subjects_id order by sc.subjects_id";
        List<Object[]> objectlist = entityManager.createNativeQuery(query).getResultList();
        return objectlist;
    }

    public String createSql(List<ExaminationDto> examId){
        Set<ExaminationDto> uniqueExamId = new HashSet<>();
        String sql = "";
        examId.forEach(ele -> uniqueExamId.add(ele));

        List<ExaminationDto> uniqueExamList = new ArrayList<>();
        uniqueExamList.addAll(uniqueExamId);
        Collections.sort(uniqueExamList, Comparator.comparing(ExaminationDto::getId));
        for (int i = 0; i < uniqueExamList.size()-1; i++) {
            sql += "MAX(CASE when sc.examination_id="+ uniqueExamList.get(i).getId() +" then (case when (o.exam_type='Major' and o.examination_id="+ uniqueExamList.get(i).getId() +" and sc.subjects_id=o.subjects_id and o.student_id=sc.student_id) then sc.obtained_marks+o.pt_marks+o.sub_enrich+o.notebook else sc.obtained_marks end) end) as '"+ uniqueExamList.get(i).getExamName() +"',";
        }
        int examLength = uniqueExamList.size() - 1;
        sql += "MAX(CASE when sc.examination_id="+ uniqueExamList.get(examLength).getId() +" then (case when (o.exam_type='Major' and o.examination_id="+ uniqueExamList.get(examLength).getId() +" and sc.subjects_id=o.subjects_id and o.student_id=sc.student_id) then sc.obtained_marks+o.pt_marks+o.sub_enrich+o.notebook else sc.obtained_marks end) end) as '"+ uniqueExamList.get(examLength).getExamName() +"'";
        return sql;
    }

    @RequestMapping(value = "/view", method = RequestMethod.POST)
    public StudentMarksDtoPagination getStudentMarksList(@RequestBody StudentMarkDto marksDto){
        StudentMarksDtoPagination response = new StudentMarksDtoPagination();
        int pageNumber = (marksDto.getPageNum() != null && marksDto.getPageNum() != 0)? marksDto.getPageNum() : 0;
        PageRequest pageRequest = new PageRequest(pageNumber, 15);
        if (!StringUtils.isEmpty(marksDto.getExamSubject())){
            Subjects subjects = subjectRepository.findBySubjectCode(marksDto.getExamSubject());
            marksDto.setSubjectId(subjects.getId());
        }
        Page<StudentMarks> filteredMarks = getFilteredMarks(marksDto, pageRequest);
        StudentMarksDtoPagination studentMarksDtoPagination = new StudentMarksDtoPagination();
        if (filteredMarks.getContent().size() > 0){
            studentMarksDtoPagination = convertStudentMarkToStudentMarkDtoPagination(filteredMarks);
        }
        return studentMarksDtoPagination;
    }

    @RequestMapping(value = "/bulk-download", method = RequestMethod.POST)
    public List<StudentMarkDto> getStudentMarksListBulkData(@RequestBody StudentMarkDto marksDto){
        StudentMarksDtoPagination response = new StudentMarksDtoPagination();
        int pageNumber = (marksDto.getPageNum() != null && marksDto.getPageNum() != 0)? marksDto.getPageNum() : 0;
        PageRequest pageRequest = new PageRequest(pageNumber, 15);
        if (!StringUtils.isEmpty(marksDto.getExamSubject())){
            Subjects subjects = subjectRepository.findBySubjectCode(marksDto.getExamSubject());
            marksDto.setSubjectId(subjects.getId());
        }
        Page<StudentMarks> filteredMarks = getFilteredMarks(marksDto, pageRequest);
        List<StudentMarks> studentMarks = new ArrayList<>();
        studentMarks.addAll(filteredMarks.getContent());
        for (int i = 1; i < filteredMarks.getTotalPages(); i++) {
            PageRequest pageRequest2 = new PageRequest(i, 15);
            studentMarks.addAll(getFilteredMarks(marksDto, pageRequest2).getContent());
        }
        List<StudentMarkDto> dtoList = new ArrayList<>();
        studentMarks.forEach(ele -> dtoList.add(convertStudentMarksEntityToDto(ele)));
        return dtoList;
    }

    private StudentMarksDtoPagination convertStudentMarkToStudentMarkDtoPagination(Page<StudentMarks> filteredMarks) {
        StudentMarksDtoPagination response = new StudentMarksDtoPagination();
        List<StudentMarkDto> studentMarkDtoList = new ArrayList<>();
        filteredMarks.forEach(ele -> studentMarkDtoList.add(convertStudentMarksEntityToDto(ele)));
        response.setFirst(filteredMarks.isFirst());
        response.setLast(filteredMarks.isLast());
        response.setTotalPages(filteredMarks.getTotalPages());
        response.setTotalElements((int) filteredMarks.getTotalElements());
        response.setSize(filteredMarks.getSize());
        response.setNumber(filteredMarks.getNumber());
        response.setNumberOfElements(filteredMarks.getNumberOfElements());
        response.setContent(studentMarkDtoList);
        return response;
    }

    public StudentMarkDto convertStudentMarksEntityToDto(StudentMarks marks){
        StudentMarkDto dto = new StudentMarkDto();
        dto.setId(marks.getId());
        dto.setClassId(marks.getClassId());
        dto.setSectionId(marks.getSectionId());
        dto.setSessionName(marks.getSessionName());
        dto.setExamFullMarks(marks.getFullMarks());
        dto.setObtainedMarks(marks.getObtainedMarks());
        dto.setAttendanceStatus(marks.getAttendanceStatus());
        dto.setExamination(utilityService.convertExaminationEntityToDto(marks.getExamination()));
        dto.setStudent(utilityService.convertStudentEntityToDto(marks.getStudent()));
        dto.setTeacher(utilityService.convertTeacherEntityToDto(marks.getTeacher()));
        dto.setSubjects(utilityService.convertSubjectEntityToDto(marks.getSubjects()));
        return dto;
    }

    @RequestMapping(value = "/find-student-by-name", method = RequestMethod.POST)
    public List<StudentDto> findByStudentName(@RequestBody String sName){
        List<Student> students = studentRepository.findTop10ByStudentNameContaining(sName);
        List<StudentDto> dtoList = new ArrayList<>();
        students.forEach(ele -> dtoList.add(utilityService.convertStudentEntityToDto(ele)));
        return dtoList;
    }

    public Page<StudentMarks> getFilteredMarks(StudentMarkDto dto, Pageable pageable){
        CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
        CriteriaQuery<StudentMarks> query = criteriaBuilder.createQuery(StudentMarks.class);
        Root<StudentMarks> root = query.from(StudentMarks.class);
        query.select(root);
        HashMap<String, Object> parameterMap = new HashMap<>();
        List<Predicate> predicateList = new ArrayList<Predicate>();
        if (!StringUtils.isEmpty(dto.getClassId())) {
            ParameterExpression<String> p = criteriaBuilder.parameter(String.class, "classId");
            predicateList.add((criteriaBuilder.equal(root.<String>get("classId"),p)));
            parameterMap.put("classId", dto.getClassId());
        }
        if (!StringUtils.isEmpty(dto.getSectionId())) {
            ParameterExpression<String> p = criteriaBuilder.parameter(String.class, "sectionId");
            predicateList.add((criteriaBuilder.equal(root.<String>get("sectionId"),p)));
            parameterMap.put("sectionId", dto.getSectionId());
        }
        if (!StringUtils.isEmpty(dto.getSessionName())) {
            ParameterExpression<String> p = criteriaBuilder.parameter(String.class, "sessionName");
            predicateList.add((criteriaBuilder.equal(root.<String>get("sessionName"),p)));
            parameterMap.put("sessionName", dto.getSessionName());
        }
        if (dto.getSubmittedById() != null){
            Teacher teacher = teacherRepository.findById(dto.getSubmittedById()).get();
            Join<StudentMarks, Teacher> instructor = root.join("teacher");
            ParameterExpression<Integer> p = criteriaBuilder.parameter(Integer.class, "teacherId");
            predicateList.add(criteriaBuilder.equal(instructor.get("id"), p));
            parameterMap.put("teacherId", teacher.getId());
        }
        if (!StringUtils.isEmpty(dto.getAdmissionNo())){
            Student student = studentRepository.findByAdmissionNo(dto.getAdmissionNo());
            Join<StudentMarks, Student> studentJoin = root.join("student");
            ParameterExpression<Integer> p = criteriaBuilder.parameter(Integer.class, "studentId");
            predicateList.add(criteriaBuilder.equal(studentJoin.get("Id"), p));
            parameterMap.put("studentId", student.getId());
        }
        if (!StringUtils.isEmpty(dto.getStudentName())) {
            Join<StudentMarks, Student> studentJoin = root.join("student");
            ParameterExpression<String> p = criteriaBuilder.parameter(String.class, "studentName");
            predicateList.add(criteriaBuilder.like(criteriaBuilder.lower(studentJoin.get("studentName")), p));
            String profileNamePattern = "%" + dto.getStudentName().toLowerCase() + "%";
            parameterMap.put("studentName", profileNamePattern);
        }
        if (!StringUtils.isEmpty(dto.getExamName())){
            List<Examination> examination = examinationRepository.findBySessionNameAndExamName(dto.getSessionName(), dto.getExamName());
            Join<StudentMarks, Examination> examinationJoin = root.join("examination");
            ParameterExpression<Integer> p = criteriaBuilder.parameter(Integer.class, "examinationId");
            predicateList.add(criteriaBuilder.equal(examinationJoin.get("id"), p));
            parameterMap.put("examinationId", examination.get(0).getId());
        }

        if (!StringUtils.isEmpty(dto.getSubjectId())){
            Subjects subjects = subjectRepository.findById(dto.getSubjectId()).get();
            Join<StudentMarks, Subjects> subjectsJoin = root.join("subjects");
            ParameterExpression<Integer> p = criteriaBuilder.parameter(Integer.class, "subjectId");
            predicateList.add(criteriaBuilder.equal(subjectsJoin.get("id"), p));
            parameterMap.put("subjectId", subjects.getId());
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
        TypedQuery<StudentMarks> tq = entityManager.createQuery(query);

        for (String key : parameterMap.keySet()) {
            tq.setParameter(key, parameterMap.get(key));
        }

        List<StudentMarks> resultList = tq.getResultList();
        int total = resultList.size();
        tq.setFirstResult((int) pageable.getOffset());
        tq.setMaxResults(pageable.getPageSize());
        resultList = tq.getResultList();
        Page<StudentMarks> pagedMarks = new PageImpl<StudentMarks>(resultList, pageable, total);

        return pagedMarks;
    }
}
