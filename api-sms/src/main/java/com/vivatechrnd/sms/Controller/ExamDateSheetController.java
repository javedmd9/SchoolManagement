package com.vivatechrnd.sms.Controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vivatechrnd.sms.Dto.ExamDateSheetDto;
import com.vivatechrnd.sms.Dto.ExaminationDto;
import com.vivatechrnd.sms.Dto.SubjectsDto;
import com.vivatechrnd.sms.Entities.*;
import com.vivatechrnd.sms.Repository.*;
import com.vivatechrnd.sms.Services.ExaminationService;
import com.vivatechrnd.sms.utility.Response;
import com.vivatechrnd.sms.utility.UtilityService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import javax.persistence.EntityManager;
import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", allowedHeaders = "*")
@RestController
@RequestMapping(value="/exam-date-sheet")
public class ExamDateSheetController {

    @Autowired
    private ExamDateSheetRepository examDateSheetRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private ExaminationRepository examinationRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private UtilityService utilityService;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private StudentMarkRepository studentMarkRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private AssignSubjectsTeacherRepository assignSubjectsTeacherRepository;

    @Autowired
    private EntityManager entityManager;

    @Autowired
    private ExaminationService examinationService;

    @Transactional(rollbackFor = {IOException.class, RuntimeException.class})
    @RequestMapping(value = "/create", method = RequestMethod.POST)
    public Response createDateSheet(@RequestPart String dto){
        Response response = new Response();
        try {
            ExamDateSheetDto examDateSheetDto = objectMapper.readValue(dto, ExamDateSheetDto.class);
            Examination examination = examinationRepository.findById(examDateSheetDto.getExamId()).get();
            SubjectsDto[] subjectsDto = UtilityService.getJsonToDto(examDateSheetDto.getCourseExamData(), SubjectsDto[].class);
            for (SubjectsDto subject: subjectsDto){
                ExamDateSheet dateSheet = new ExamDateSheet();
                Subjects subjectCode = subjectRepository.findBySubjectCode(subject.getSubjectCode());
                ExamDateSheet examDateSheet = examDateSheetRepository.findBySubjectsAndExamination(subjectCode, examination);
                if (examDateSheet != null) throw new RuntimeException("Date sheet already created");
                dateSheet.setSubjects(subjectCode);
                dateSheet.setExamination(examination);
                dateSheet.setExamDate(subject.getSubjectExamDate());
                examDateSheetRepository.save(dateSheet);
                addAllStudentToExamEntity(examination, subjectCode);
            }
            response.setResult("Success");
            response.setMessage("Created date sheet successfully");
        } catch (IOException e) {
            e.printStackTrace();
        }
        return response;
    }

    public void addAllStudentToExamEntity(Examination examination, Subjects subjects){
        List<Student> studentList = studentRepository.findByClassId(examination.getClassId());
        for (Student s: studentList){
            StudentMarks marks = new StudentMarks();
            AssignSubjectsTeacher subjectsTeacher = assignSubjectsTeacherRepository.findByClassIdAndSectionIdAndSubjects(s.getClassId(), s.getSectionId(), subjects);
            marks.setClassId(s.getClassId());
            marks.setSectionId(s.getSectionId());
            marks.setSessionName(examination.getSessionName());
            marks.setExamination(examination);
            marks.setSubjects(subjects);
            marks.setTeacher(subjectsTeacher.getTeacher());
            marks.setStudent(s);
            studentMarkRepository.save(marks);
        }
    }

    @RequestMapping(value = "/view", method = RequestMethod.POST)
    public List<ExamDateSheet> getAllSchedule(@RequestBody ExaminationDto dto) {
        List<ExamDateSheet> examDateSheets = examDateSheetRepository.findAll();
        List<Examination> examinations = examinationService.filteredExaminationList(dto);
        return examDateSheets.stream()
                .filter(examDateSheet -> examinations.contains(examDateSheet.getExamination()))
                .collect(Collectors.toList());
    }

    @RequestMapping(value = "/delete", method = RequestMethod.POST)
    public Response deleteExamAndStudentMarkList(@RequestBody ExamDateSheet examDateSheet){
        Response response = new Response();
        ExamDateSheet dateSheet = examDateSheetRepository.findById(examDateSheet.getId()).get();
        if (dateSheet != null){
            examDateSheetRepository.deleteById(dateSheet.getId());
            studentMarkRepository.deleteStudentRecord(dateSheet.getExamination().getClassId(), dateSheet.getSubjects().getId());
            response.setResult("Success");
            response.setMessage("Successfully delete subject from Date sheet");
        }
        return response;
    }
}
