package com.vivatechrnd.sms.utility;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vivatechrnd.sms.Dto.*;
import com.vivatechrnd.sms.Entities.*;
import com.vivatechrnd.sms.Repository.SchoolSessionRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.sql.Date;
import java.text.DecimalFormat;

@Service
public class UtilityService {

    @Autowired
    private ModelMapper modelMapper;

    public static String makeDtoToJson(Object object) throws JsonProcessingException {
        ObjectMapper mapper = new ObjectMapper();
        String jsonInString = mapper.writeValueAsString(object);
        return jsonInString;
    }

    public static <T> T getJsonToDto(String content, Class<T> valueType) throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        return mapper.readValue(content, valueType);
    }

    public TeacherDto convertTeacherEntityToDto(Teacher teacher){
        return modelMapper.map(teacher, TeacherDto.class);
    }

    public Teacher convertTeacherDtoToEntity(TeacherDto dto){
        return modelMapper.map(dto,Teacher.class);
    }

    public Student convertStudentDtoToEntity(StudentDto studentDto){
        return modelMapper.map(studentDto, Student.class);
    }

    public StudentDto convertStudentEntityToDto(Student student){
        return modelMapper.map(student, StudentDto.class);
    }

    public SubjectsDto convertSubjectEntityToDto(Subjects subjects){
        return modelMapper.map(subjects, SubjectsDto.class);
    }

    public ExaminationDto convertExaminationEntityToDto(Examination examination){
        return modelMapper.map(examination, ExaminationDto.class);
    }

    public AssignSubjectsTeacherDto convertAssignSubjectEntityToDto(AssignSubjectsTeacher assignSubject){
        AssignSubjectsTeacherDto mappedSubject = new AssignSubjectsTeacherDto();
        mappedSubject.setId(assignSubject.getId());
        mappedSubject.setClassId(assignSubject.getClassId());
        mappedSubject.setSectionId(assignSubject.getSectionId());
        TeacherDto teacherDto = convertTeacherEntityToDto(assignSubject.getTeacher());
        SubjectsDto subjectsDto = convertSubjectEntityToDto(assignSubject.getSubjects());
        mappedSubject.setTeacherDto(teacherDto);
        mappedSubject.setSubjectsDto(subjectsDto);
        return mappedSubject;
    }

    @Autowired
    private SchoolSessionRepository schoolSessionRepository;
    public SchoolSessionDto getCurrentSession(){
        SchoolSession session = schoolSessionRepository.findTopByOrderByIdDesc();
        return modelMapper.map(session, SchoolSessionDto.class);
    }

    public Double roundOfTwoDecimalPlaces(Double doubleValue){
        double d = doubleValue;
        DecimalFormat df = new DecimalFormat("#.##");
        return Double.valueOf(df.format(d));
    }

    public static Date convertStringToDate(String date) {
        return Date.valueOf(date);
    }

//    public static <T> T convertDtoToEntity(Object object, Class<T> valueType) throws IOException {
//        return modelMapper.map(object, valueType);
//    }
}
