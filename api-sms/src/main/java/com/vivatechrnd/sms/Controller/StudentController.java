package com.vivatechrnd.sms.Controller;

import com.vivatechrnd.sms.Dto.FormDataWithUploadFile;
import com.vivatechrnd.sms.Dto.StudentDocumentDto;
import com.vivatechrnd.sms.Dto.StudentDto;
import com.vivatechrnd.sms.Entities.Student;
import com.vivatechrnd.sms.PaginationDto.StudentDtoPaginationResponse;
import com.vivatechrnd.sms.Services.StudentService;
import com.vivatechrnd.sms.utility.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@CrossOrigin(origins = "*", allowedHeaders = "*")
@RestController
@RequestMapping(value="/student")
public class StudentController {

    @Autowired
    private StudentService studentService;

    @RequestMapping(value="/add", method = RequestMethod.POST)
    public Response createStudent(@RequestPart String student, @RequestPart MultipartFile file){
        FormDataWithUploadFile formData = new FormDataWithUploadFile();
        formData.setIvrprompt(student);
        formData.setUploadfile(file);
        Response response = studentService.createStudent(formData);
        return response;
    }
    @RequestMapping(value = "/bulk-upload", method = RequestMethod.POST)
    public Response bulkUploadStudent(@RequestBody StudentDto dto){
        Response response = studentService.studentBulkUpload(dto);
        return response;
    }
    @RequestMapping(value="/view", method = RequestMethod.POST)
    public StudentDtoPaginationResponse filterStudent(@RequestBody StudentDto studentDto){
        int pageNumber = (studentDto.getPageNumber() != null && studentDto.getPageNumber() != 0)? studentDto.getPageNumber() : 0;
        PageRequest pageRequest = new PageRequest(pageNumber, 25);
        Page<Student> students = studentService.getFilteredStudentList(studentDto, pageRequest);
        StudentDtoPaginationResponse dto = studentService.studentDtoPaginationResponse(students);
        return dto;
    }

    @RequestMapping(value = "/find-by-id", method = RequestMethod.POST)
    public StudentDto findById(@RequestBody Integer id){
        return studentService.findStudentById(id);
    }

    @RequestMapping(value = "/update", method = RequestMethod.POST)
    public Response updateStudent(@RequestBody StudentDto studentDto){
        Response response = studentService.pendingUpdate(studentDto);
        return response;
    }

    @RequestMapping(value = "/update-approve", method = RequestMethod.POST)
    public Response updateApproveStudent(@RequestBody StudentDto studentDto){
        Response response = studentService.updateStudent(studentDto);
        return response;
    }

    @RequestMapping(value = "/update-reject", method = RequestMethod.POST)
    public Response updateRejectStudent(@RequestBody StudentDto studentDto){
        Response response = studentService.rejectUpdate(studentDto);
        return response;
    }

    @RequestMapping(value="/delete", method = RequestMethod.POST)
    public Response deleteStudent(@RequestBody StudentDto studentDto){
        Response response = studentService.deleteStudent(studentDto.getId());
        return response;
    }

    @RequestMapping(value = "/update-photo", method = RequestMethod.POST)
    public Response updateStudentPhoto(@RequestPart String student, @RequestPart MultipartFile file){
        FormDataWithUploadFile formData = new FormDataWithUploadFile();
        formData.setIvrprompt(student);
        formData.setUploadfile(file);
        Response response = studentService.updatePhoto(formData);
        return response;
    }
    @RequestMapping(value = "/upload-documents", method = RequestMethod.POST)
    public Response uploadDocuments(@RequestPart String dto, @RequestPart List<MultipartFile> files){
        return studentService.saveDocuments(dto, files);
    }

    @RequestMapping(value = "/view-documents", method = RequestMethod.POST)
    public StudentDocumentDto getAllDocuments(@RequestBody String admissionNo){
        return studentService.viewSubmittedDocuments(admissionNo);
    }

    @RequestMapping(value = "/delete-document", method = RequestMethod.POST)
    public StudentDocumentDto deleteDocument(@RequestParam String admissionNo, @RequestParam String documentNo){
        return studentService.deleteDocument(admissionNo, documentNo);
    }
}
