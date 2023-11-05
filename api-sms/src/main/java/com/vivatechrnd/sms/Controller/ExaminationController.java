package com.vivatechrnd.sms.Controller;

import com.vivatechrnd.sms.Dto.ExaminationDto;
import com.vivatechrnd.sms.Dto.SubjectsDto;
import com.vivatechrnd.sms.Entities.AssignSubjectsTeacher;
import com.vivatechrnd.sms.Entities.Examination;
import com.vivatechrnd.sms.Entities.Teacher;
import com.vivatechrnd.sms.Repository.*;
import com.vivatechrnd.sms.utility.Response;
import com.vivatechrnd.sms.utility.UtilityService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;
import javax.persistence.criteria.*;
import java.util.*;

@CrossOrigin(origins = "*", allowedHeaders = "*")
@RestController
@RequestMapping(value="/examination")
public class ExaminationController {

    @Autowired
    private ExaminationRepository examinationRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private EntityManager entityManager;

    @Autowired
    private UtilityService utilityService;

    @Autowired
    private AssignSubjectsTeacherRepository assignSubjectsTeacherRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @RequestMapping(value = "/create", method = RequestMethod.POST)
    public Response createExamination(@RequestBody ExaminationDto dto){
        Response response = new Response();
        Examination examination = modelMapper.map(dto, Examination.class);
        List<AssignSubjectsTeacher> classWithSection = assignSubjectsTeacherRepository.findByClassId(dto.getClassId());
        Set<String> sections = new HashSet<>();
        classWithSection.forEach(ele -> sections.add(ele.getSectionId()));
        List<Teacher> teacherList = teacherRepository.findByClassId(examination.getClassId());
        Set<String> teacherSection = new HashSet<>();
        teacherList.forEach(ele -> teacherSection.add(ele.getSectionId()));
        if (teacherSection.size() != sections.size()){
            response.setResult("Failed");
            response.setMessage("Please assign all teachers to section");
            return response;
        }
        examinationRepository.save(examination);
        response.setResult("SUCCESS");
        response.setMessage("Successfully created exam for this class");
        return response;
    }

    @RequestMapping(value = "/delete", method = RequestMethod.POST)
    public Response deleteExamination(@RequestBody ExaminationDto dto){
        Response response = new Response();
        Examination examination = examinationRepository.findById(dto.getId()).get();
        try{
            if (examination != null){
                examinationRepository.deleteById(examination.getId());
                response.setResult("SUCCESS");
                response.setMessage("Successfully deleted exam for this class");
            }
        } catch (Exception ex){
            response.setResult("Failed");
            response.setMessage(ex.getMessage());
        }
        return response;
    }

    @RequestMapping(value = "/view", method = RequestMethod.POST)
    public List<ExaminationDto> getAllExamination(@RequestBody String sessionName){
        List<ExaminationDto> examinationDtoList = new ArrayList<>();
        List<Examination> examinationList = examinationRepository.findBySessionName(sessionName);
        examinationList.forEach(ele -> examinationDtoList.add(utilityService.convertExaminationEntityToDto(ele)));
        return examinationDtoList;
    }

    @RequestMapping(value = "/find-exam-and-subject", method = RequestMethod.POST)
    public ExaminationDto getSubjectAndExamData(@RequestBody ExaminationDto examDto){
        List<Examination> examinations = filteredExaminationList(examDto);
        List<SubjectsDto> subjectsDtoList = new ArrayList<>();
        List<Object[]> distinctSubjects = assignSubjectsTeacherRepository.findDistinctSubject(examDto.getClassId());
        for (int i = 0; i < distinctSubjects.size(); i++) {
            Object[] obj = distinctSubjects.get(i);
            SubjectsDto dto = new SubjectsDto();
            dto.setId((Integer) obj[0]);
            dto.setSubjectCode((String) obj[1]);
            dto.setSubjectName((String) obj[2]);
            subjectsDtoList.add(dto);
        }
        ExaminationDto examinationDto = new ExaminationDto();
        examinationDto.setId(examinations.get(0).getId());
        examinationDto.setExamStartDate(examinations.get(0).getExamStartDate());
        examinationDto.setExamEndDate(examinations.get(0).getExamEndDate());
        examinationDto.setSubjectsDtoList(subjectsDtoList);
        return examinationDto;
    }

    @RequestMapping(value = "/find-all-session", method = RequestMethod.GET)
    public List<String> getAllSession(){
        List<Object[]> sessionName = examinationRepository.findDistinctBySessionName();
        List<String> sessions = new ArrayList<>();
        for (Object o: sessionName){
            String obj = o.toString();
            sessions.add(obj);
        }
        return sessions;
    }

    @RequestMapping(value = "/get-all-examinations-by-class", method = RequestMethod.POST)
    public List<ExaminationDto> findAllExaminationsByClass(@RequestParam String classId){
        String sessionName = utilityService.getCurrentSession().getSessionName();
        ExaminationDto dto = new ExaminationDto();
        dto.setSessionName(sessionName);
        dto.setClassId(classId);
        List<Examination> examinations = filteredExaminationList(dto);
        List<ExaminationDto> dtoList = new ArrayList<>();
        examinations.forEach(ele -> dtoList.add(utilityService.convertExaminationEntityToDto(ele)));
        return dtoList;
    }

    @RequestMapping(value = "/filtered-exam", method = RequestMethod.POST)
    public List<ExaminationDto> filteredExamination(@RequestBody ExaminationDto dto){
        List<Examination> examinations = filteredExaminationList(dto);
        List<ExaminationDto> dtoList = new ArrayList<>();
        examinations.forEach(ele -> dtoList.add(utilityService.convertExaminationEntityToDto(ele)));
        return dtoList;
    }


    public List<Examination> filteredExaminationList(ExaminationDto dto){
        CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
        CriteriaQuery<Examination> query = criteriaBuilder.createQuery(Examination.class);
        Root<Examination> root = query.from(Examination.class);
        query.select(root);
        HashMap<String, Object> parameterMap = new HashMap<>();
        List<Predicate> predicateList = new ArrayList<Predicate>();
        if (!StringUtils.isEmpty(dto.getClassId())) {
            ParameterExpression<String> p = criteriaBuilder.parameter(String.class, "classId");
            predicateList.add((criteriaBuilder.equal(root.<String>get("classId"),p)));
            parameterMap.put("classId", dto.getClassId());
        }
        if (!StringUtils.isEmpty(dto.getExamName())) {
            ParameterExpression<String> p = criteriaBuilder.parameter(String.class, "examName");
            predicateList.add((criteriaBuilder.equal(root.<String>get("examName"),p)));
            parameterMap.put("examName", dto.getExamName());
        }
        if (!StringUtils.isEmpty(dto.getSessionName())) {
            ParameterExpression<String> p = criteriaBuilder.parameter(String.class, "sessionName");
            predicateList.add((criteriaBuilder.equal(root.<String>get("sessionName"),p)));
            parameterMap.put("sessionName", dto.getSessionName());
        }
        if (!StringUtils.isEmpty(dto.getExamType())) {
            ParameterExpression<String> p = criteriaBuilder.parameter(String.class, "examType");
            predicateList.add((criteriaBuilder.equal(root.<String>get("examType"),p)));
            parameterMap.put("examType", dto.getExamType());
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
        TypedQuery<Examination> tq = entityManager.createQuery(query);

        for (String key : parameterMap.keySet()) {
            tq.setParameter(key, parameterMap.get(key));
        }

        List<Examination> resultList = tq.getResultList();

        return resultList;
    }

}
