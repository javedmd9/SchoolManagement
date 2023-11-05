package com.vivatechrnd.sms.Controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vivatechrnd.sms.Dto.OtherMarksDto;
import com.vivatechrnd.sms.Dto.TempOtherMarkDto;
import com.vivatechrnd.sms.Entities.*;
import com.vivatechrnd.sms.Repository.*;
import com.vivatechrnd.sms.utility.Response;
import com.vivatechrnd.sms.utility.UtilityService;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.persistence.EntityManager;
import java.util.*;

@CrossOrigin(origins = "*", allowedHeaders = "*")
@RestController
@RequestMapping(value = "/other-marks")
@Slf4j
public class OtherMarksController {

    @Autowired
    private ExaminationRepository examinationRepository;

    @Autowired
    private StudentMarkRepository studentMarkRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private OtherMarkRepository otherMarkRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @SneakyThrows
    @RequestMapping(value = "/create", method = RequestMethod.POST)
    public Response assignOtherMarksPt1(@RequestBody TempOtherMarkDto dto){
        Response response = new Response();
        Examination examination = examinationRepository.findById(dto.getExaminationId()).get();
        Subjects subjects = subjectRepository.findBySubjectCode(dto.getSubjectCode());
        OtherMarksDto[] sMarks = utilityService.getJsonToDto(dto.getStudentData(), OtherMarksDto[].class);
        Student checkStudent = studentRepository.findByAdmissionNo(sMarks[0].getAdmissionNo());
        OtherMarks checkExistingStudentMark = otherMarkRepository.findByExaminationAndStudentAndSubjects(examination, checkStudent, subjects);
        if (checkExistingStudentMark != null){
            response.setResult("Failed");
            response.setMessage("Marks already added for current exam");
            return response;
        }
        for (OtherMarksDto o: sMarks){
            OtherMarks marks = new OtherMarks();
            Student student = studentRepository.findByAdmissionNo(o.getAdmissionNo());
            marks.setPtMarks(o.getPtMarks());
            marks.setSubEnrich(o.getSubEnrich());
            marks.setExamType(examination.getExamType());
            marks.setNotebook(o.getNotebook());
            marks.setExamination(examination);
            marks.setStudent(student);
            marks.setSubjects(subjects);
            otherMarkRepository.save(marks);
        }

        response.setResult("Success");
        response.setMessage("Marks saved successfully");
        return response;

    }

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private EntityManager entityManager;

    @Autowired
    private UtilityService utilityService;

    @RequestMapping(value = "/view-marks-by-exam-list", method = RequestMethod.POST)
    public List<OtherMarksDto> viewMarksByExamListForPTMarksSubmit(@RequestBody OtherMarksDto dto){
        Teacher teacher = teacherRepository.findById(dto.getSubmittedById()).get();
        Subjects subjects = subjectRepository.findBySubjectCode(dto.getSubjectCode());
        List<Examination> examinationList = examinationRepository.findByIdIn(dto.getExamId());
        if (dto.getClassId().equals("9") || dto.getClassId().equals("10")){
            List<OtherMarksDto> dtoList = viewMarksOfSeniorClassByExamListForPTMarksSubmit(dto);
            return dtoList;
        }
        List<StudentMarks> studentMarksList = studentMarkRepository.findByClassIdAndSectionIdAndTeacherAndSubjectsAndExaminationIn(dto.getClassId().toString(), dto.getSectionId(), teacher, subjects, examinationList);
        Set<Student> studentId = new HashSet<>();
        studentMarksList.forEach(ele -> studentId.add(ele.getStudent()));
        String sql = createSql(studentMarksList);
        List<OtherMarksDto> dtoList = new ArrayList<>();
        for (Student i: studentId){
            List<Object[]> objects = setCustomQuery(sql, i.getId(), subjects.getId());
            for (int j = 0; j < objects.size(); j++) {
                Object[] obj = objects.get(j);
                OtherMarksDto otherMarksDto = new OtherMarksDto();
                otherMarksDto.setSubjectsDto(utilityService.convertSubjectEntityToDto(subjects));
                double totalMark = ((Integer) obj[1] + (Integer) obj[2])*2;
                double averageMark = totalMark / 10;
                otherMarksDto.setPtMarks((double) Math.round(averageMark));
                otherMarksDto.setStudentDto(utilityService.convertStudentEntityToDto(i));
                dtoList.add(otherMarksDto);
            }

        }

        return dtoList;
    }

    public List<OtherMarksDto> viewMarksOfSeniorClassByExamListForPTMarksSubmit(OtherMarksDto dto){
        Teacher teacher = teacherRepository.findById(dto.getSubmittedById()).get();
        Subjects subjects = subjectRepository.findBySubjectCode(dto.getSubjectCode());
        List<Examination> examinationList = examinationRepository.findByIdIn(dto.getExamId());
        List<StudentMarks> studentMarksList = studentMarkRepository.findByClassIdAndSectionIdAndTeacherAndSubjectsAndExaminationIn(dto.getClassId().toString(), dto.getSectionId(), teacher, subjects, examinationList);
        Set<Student> studentId = new HashSet<>();
        studentMarksList.forEach(ele -> studentId.add(ele.getStudent()));
        String sql = createSql(studentMarksList);
        List<OtherMarksDto> dtoList = new ArrayList<>();
        for (Student i: studentId){
            List<Object[]> objects = setCustomQuery(sql, i.getId(), subjects.getId());
            for (int j = 0; j < objects.size(); j++) {
                Object[] obj = objects.get(j);
                OtherMarksDto otherMarksDto = new OtherMarksDto();
                otherMarksDto.setSubjectsDto(utilityService.convertSubjectEntityToDto(subjects));
                Integer subject1 = (Integer) obj[1];
                Integer subject2 = (Integer) obj[2];
                Integer subject3 = (Integer) obj[3];
                if (subject1 == null && subject2 == null && subject3 == null){
                    log.info("All 3 PT marks are not available of subject: {}", subjects);
                    return null;
                }
                double totalMark = ((Integer) obj[1] + (Integer) obj[2])*2;
                double averageMark = totalMark / 10;
                otherMarksDto.setPtMarks((double) Math.round(averageMark));
                otherMarksDto.setStudentDto(utilityService.convertStudentEntityToDto(i));
                dtoList.add(otherMarksDto);
            }

        }

        return dtoList;
    }

    @RequestMapping(value = "/view", method = RequestMethod.GET)
    public List<OtherMarksDto> getAllOtherMarks(){
        List<OtherMarks> otherMarks = otherMarkRepository.findAll();
        List<OtherMarksDto> dtoList = new ArrayList<>();
        otherMarks.forEach(ele -> dtoList.add(convertOtherMarkEntityToDto(ele)));
        return dtoList;
    }

    public OtherMarksDto convertOtherMarkEntityToDto(OtherMarks otherMarks){
        OtherMarksDto dto = new OtherMarksDto();
        dto.setId(otherMarks.getId());
        dto.setSubjectsDto(utilityService.convertSubjectEntityToDto(otherMarks.getSubjects()));
        dto.setStudentDto(utilityService.convertStudentEntityToDto(otherMarks.getStudent()));
        dto.setPtMarks(otherMarks.getPtMarks());
        dto.setSubEnrich(otherMarks.getSubEnrich());
        dto.setNotebook(otherMarks.getNotebook());
        dto.setExaminationDto(utilityService.convertExaminationEntityToDto(otherMarks.getExamination()));
        return dto;
    }

    public List<Object[]> setCustomQuery(String sql, Integer studentId, Integer subjectId){
        String query = "SELECT c.subject_code,"+ sql + " FROM school.student_marks as sc, school.class_subjects as c where sc.subjects_id=c.id and sc.subjects_id="+ subjectId +" and student_id="+ studentId +" group by subjects_id";
        List<Object[]> objectlist = entityManager.createNativeQuery(query).getResultList();
        return objectlist;
    }

    public String createSql(List<StudentMarks> studentMarks){
        Set<Examination> uniqueExamId = new HashSet<>();
        String sql = "";
        studentMarks.forEach(ele -> uniqueExamId.add(ele.getExamination()));
        List<Examination> uniqueExamList = new ArrayList<>();
        uniqueExamList.addAll(uniqueExamId);
        for (int i = 0; i < uniqueExamList.size()-1; i++) {
            sql += "MAX(CASE when examination_id=" + uniqueExamList.get(i).getId() + " then obtained_marks else null end) as '" + uniqueExamList.get(i).getExamName() +"',";
        }
        int examLength = uniqueExamList.size() - 1;
        sql += "MAX(CASE when examination_id=" + uniqueExamList.get(examLength).getId() + " then obtained_marks else null end) as '" + uniqueExamList.get(examLength).getExamName() +"'";
        return sql;
    }

    private String generateGrade(StudentMarks HY1, int pt1, int subEnrich, int notebookSubmit, Integer fullMarks) {
        int obtainedTotalMarks = HY1.getObtainedMarks() + pt1 + subEnrich + notebookSubmit;
        int percentage = (obtainedTotalMarks/fullMarks) * 100;
        if (percentage > 60){
            return "A";
        } else if(percentage > 45 && percentage < 60){
            return "B";
        } else if(percentage > 30 && percentage < 45){
            return "C";
        } else {
            return "Fail";
        }
    }
}
