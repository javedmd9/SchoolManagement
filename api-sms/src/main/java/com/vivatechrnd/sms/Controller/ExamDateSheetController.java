package com.vivatechrnd.sms.Controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vivatechrnd.sms.Dto.ExamDateSheetDto;
import com.vivatechrnd.sms.Dto.SubjectsDto;
import com.vivatechrnd.sms.Entities.*;
import com.vivatechrnd.sms.Repository.*;
import com.vivatechrnd.sms.utility.Response;
import com.vivatechrnd.sms.utility.UtilityService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

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

    @RequestMapping(value = "/create", method = RequestMethod.POST)
    public Response createDateSheet(@RequestPart String dto){
        Response response = new Response();
        try {
            ExamDateSheetDto examDateSheetDto = objectMapper.readValue(dto, ExamDateSheetDto.class);
            Examination examination = examinationRepository.findById(examDateSheetDto.getExamId()).get();
            SubjectsDto[] subjectsDto = utilityService.getJsonToDto(examDateSheetDto.getCourseExamData(), SubjectsDto[].class);
            for (SubjectsDto subject: subjectsDto){
                ExamDateSheet dateSheet = new ExamDateSheet();
                Subjects subjectCode = subjectRepository.findBySubjectCode(subject.getSubjectCode());
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

    @RequestMapping(value = "/view", method = RequestMethod.GET)
    public List<ExamDateSheet> getAllSchedule(){
        List<ExamDateSheet> examDateSheets = examDateSheetRepository.findAll();
        return examDateSheets;
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
