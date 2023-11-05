package com.vivatechrnd.sms.Controller;

import com.vivatechrnd.sms.Dto.SubjectsDto;
import com.vivatechrnd.sms.Entities.Subjects;
import com.vivatechrnd.sms.Repository.SubjectRepository;
import com.vivatechrnd.sms.utility.Response;
import com.vivatechrnd.sms.utility.UtilityService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@CrossOrigin(origins = "*", allowedHeaders = "*")
@RestController
@RequestMapping(value="/subjects")
public class SubjectsController {

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private UtilityService utilityService;

    @RequestMapping(value = "/create", method = RequestMethod.POST)
    public Response createSubject(@RequestBody SubjectsDto dto){
        Response response = new Response();
        Subjects mappedSubject = modelMapper.map(dto, Subjects.class);
        Subjects subjectCode = subjectRepository.findBySubjectCode(dto.getSubjectCode().trim());
        if (subjectCode != null){
            response.setResult("Failed");
            response.setMessage("Subject code already defined for another subject.");
            return response;
        }
        mappedSubject.setSubjectCode(dto.getSubjectCode().toUpperCase(Locale.ROOT).trim());
        subjectRepository.save(mappedSubject);
        response.setResult("SUCCESS");
        response.setMessage("Subject created");
        return response;
    }

    @RequestMapping(value = "/view", method = RequestMethod.GET)
    public List<SubjectsDto> getAllSubjects(){
        List<Subjects> subjects = subjectRepository.findAll();
        List<SubjectsDto> subjectsDtoList = new ArrayList<>();
        subjects.forEach(ele -> subjectsDtoList.add(utilityService.convertSubjectEntityToDto(ele)));
        return subjectsDtoList;
    }

    @RequestMapping(value = "/delete", method = RequestMethod.POST)
    public Response deleteSubject(@RequestBody SubjectsDto dto){
        Response response = new Response();
        Subjects subject = subjectRepository.findById(dto.getId()).get();
        if (subject != null){
            subjectRepository.deleteById(dto.getId());
        }
        response.setResult("SUCCESS");
        response.setMessage("Subject Deleted");
        return response;
    }
}
