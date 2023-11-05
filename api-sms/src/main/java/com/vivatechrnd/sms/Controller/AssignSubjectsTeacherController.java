package com.vivatechrnd.sms.Controller;

import com.vivatechrnd.sms.Dto.AssignSubjectsTeacherDto;
import com.vivatechrnd.sms.Entities.AssignSubjectsTeacher;
import com.vivatechrnd.sms.Entities.Attendance;
import com.vivatechrnd.sms.Entities.Subjects;
import com.vivatechrnd.sms.Entities.Teacher;
import com.vivatechrnd.sms.PaginationDto.AssignSubjectTeacherDtoPagination;
import com.vivatechrnd.sms.Repository.AssignSubjectsTeacherRepository;
import com.vivatechrnd.sms.Repository.SubjectRepository;
import com.vivatechrnd.sms.Repository.TeacherRepository;
import com.vivatechrnd.sms.utility.Response;
import com.vivatechrnd.sms.utility.UtilityService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;
import javax.persistence.criteria.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

@CrossOrigin(origins = "*", allowedHeaders = "*")
@RestController
@RequestMapping(path = "/assign-subject")
public class AssignSubjectsTeacherController {

    @Autowired
    private AssignSubjectsTeacherRepository assignSubjectsTeacherRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private EntityManager entityManager;

    @Autowired
    private UtilityService utilityService;

    @RequestMapping(value = "/create", method = RequestMethod.POST)
    public Response assignSubjectResponse(@RequestBody AssignSubjectsTeacherDto dto){
        Response response = new Response();
        AssignSubjectsTeacher assignSubject = modelMapper.map(dto, AssignSubjectsTeacher.class);
        Teacher teacher = teacherRepository.findById(dto.getTeacherId()).get();
        Subjects subjects = subjectRepository.findById(dto.getSubjectId()).get();
        AssignSubjectsTeacher hasAnyData = assignSubjectsTeacherRepository.findByClassIdAndSectionIdAndSubjects(dto.getClassId(), dto.getSectionId(), subjects);
        if (hasAnyData != null){
            response.setResult("Failed");
            response.setMessage("Subject already assigned to Teacher " + teacher.getTeacherName());
            return response;
        }
        if (teacher != null && subjects != null){
            assignSubject.setSubjects(subjects);
            assignSubject.setTeacher(teacher);
            assignSubject.setSessionName(utilityService.getCurrentSession().getSessionName());
            assignSubjectsTeacherRepository.save(assignSubject);
            response.setResult("SUCCESS");
            response.setMessage("Assigned subject and teacher to this class.");
        } else {
            response.setResult("Failed");
            response.setMessage("Sorry! Something went wrong");
        }
        return response;
    }

    @RequestMapping(value = "/view", method = RequestMethod.POST)
    public AssignSubjectTeacherDtoPagination getAllAssignSubjects(@RequestBody Integer pageNum){
        AssignSubjectTeacherDtoPagination response = new AssignSubjectTeacherDtoPagination();
        int pageNumber = (pageNum != null && pageNum != 0)? pageNum : 0;
        PageRequest pageRequest = new PageRequest(pageNumber, 10);
        Page<AssignSubjectsTeacher> subjects = assignSubjectsTeacherRepository.findAll(pageRequest);
        List<AssignSubjectsTeacherDto> subjectsDtoList = new ArrayList<>();
        subjects.forEach(ele -> subjectsDtoList.add(utilityService.convertAssignSubjectEntityToDto(ele)));
        response = modelMapper.map(subjects, AssignSubjectTeacherDtoPagination.class);
        response.setContent(subjectsDtoList);
        return response;
    }

    @RequestMapping(value = "/delete", method = RequestMethod.POST)
    public Response deleteAssignedSubject(@RequestBody AssignSubjectsTeacherDto dto){
        Response response = new Response();
        AssignSubjectsTeacher assignSubject = assignSubjectsTeacherRepository.findById(dto.getId()).get();
        if (assignSubject != null){
            assignSubjectsTeacherRepository.deleteById(dto.getId());
            response.setResult("SUCCESS");
            response.setMessage("Record deleted.");
        } else {
            response.setResult("Failed");
            response.setMessage("Record not found");
        }
        return response;
    }

    @RequestMapping(value = "/find-distinct-classes", method = RequestMethod.GET)
    public List<String> getDistinctClasses(){
        List<Object[]> distinctClasses = assignSubjectsTeacherRepository.findDistinctClasses();
        List<String> classes = new ArrayList<>();
        for (Object o: distinctClasses) {
            String obj = o.toString();
            classes.add(obj);
        }
        return classes;
    }

    @RequestMapping(value = "/find-distinct-class-and-section", method = RequestMethod.GET)
    public List<AssignSubjectsTeacherDto> getDistinctClassAndSection(){
        List<Object[]> distinctClasses = assignSubjectsTeacherRepository.findDistinctClassAndSection();
        List<AssignSubjectsTeacherDto> classes = new ArrayList<>();
        for (int i = 0; i < distinctClasses.size(); i++) {
            Object[] obj = distinctClasses.get(i);
            AssignSubjectsTeacherDto dto = new AssignSubjectsTeacherDto();
            dto.setClassId((String) obj[0]);
            dto.setSectionId((String) obj[1]);
            classes.add(dto);
        }
        return classes;
    }

    @RequestMapping(value = "/find-distinct-subjects-by-class", method = RequestMethod.POST)
    public List<AssignSubjectsTeacherDto> getAllSubjectsByClass(@RequestBody String classId){
        List<Object[]> distinctSubjects = assignSubjectsTeacherRepository.findDistinctSubject(classId);
        List<AssignSubjectsTeacherDto> dtoList = new ArrayList<>();
        for (int i = 0; i < distinctSubjects.size(); i++) {
            Object[] obj = distinctSubjects.get(i);
            AssignSubjectsTeacherDto dto = new AssignSubjectsTeacherDto();
            dto.setSubjectId((Integer) obj[0]);
            dto.setSubjectCode((String) obj[1]);
            dto.setSubjectName((String) obj[2]);
            dtoList.add(dto);
        }
        return dtoList;
    }

    @RequestMapping(value = "/custom-assign-subject-teacher-search", method = RequestMethod.POST)
    public List<AssignSubjectsTeacherDto> getAllData(@RequestBody AssignSubjectsTeacherDto dto){
        List<AssignSubjectsTeacher> filteredList = getFilteredList(dto);
        List<AssignSubjectsTeacherDto> dtoList = new ArrayList<>();
        filteredList.forEach(ele -> dtoList.add(utilityService.convertAssignSubjectEntityToDto(ele)));
        return dtoList;
    }

    public List<AssignSubjectsTeacher> getFilteredList(AssignSubjectsTeacherDto dto){
        CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
        CriteriaQuery<AssignSubjectsTeacher> query = criteriaBuilder.createQuery(AssignSubjectsTeacher.class);
        Root<AssignSubjectsTeacher> root = query.from(AssignSubjectsTeacher.class);
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
        if (dto.getTeacherId() != null){
            Teacher teacher = teacherRepository.findById(dto.getTeacherId()).get();
            Join<Attendance, Teacher> instructor = root.join("teacher");
            ParameterExpression<Integer> p = criteriaBuilder.parameter(Integer.class, "teacherId");
            predicateList.add(criteriaBuilder.equal(instructor.get("id"), p));
            parameterMap.put("teacherId", teacher.getId());
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
        TypedQuery<AssignSubjectsTeacher> tq = entityManager.createQuery(query);

        for (String key : parameterMap.keySet()) {
            tq.setParameter(key, parameterMap.get(key));
        }

        List<AssignSubjectsTeacher> resultList = tq.getResultList();

        return resultList;
    }

}
