package com.vivatechrnd.sms.Services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vivatechrnd.sms.Dto.DocumentDto;
import com.vivatechrnd.sms.Dto.FormDataWithUploadFile;
import com.vivatechrnd.sms.Dto.StudentDocumentDto;
import com.vivatechrnd.sms.Dto.StudentDto;
import com.vivatechrnd.sms.EmailService.EmailSenderService;
import com.vivatechrnd.sms.Entities.Student;
import com.vivatechrnd.sms.Entities.StudentDocuments;
import com.vivatechrnd.sms.PaginationDto.StudentDtoPaginationResponse;
import com.vivatechrnd.sms.Repository.StudentDocumentsRepository;
import com.vivatechrnd.sms.Repository.StudentRepository;
import com.vivatechrnd.sms.Enums.FIleType;
import com.vivatechrnd.sms.utility.Response;
import com.vivatechrnd.sms.utility.UtilityService;
import org.apache.commons.lang3.RandomStringUtils;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;
import javax.persistence.criteria.*;
import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class StudentService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private FileService fileService;

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private EntityManager entityManager;

    public Response createStudent(FormDataWithUploadFile formData) {
        Response response = new Response();
        StudentDto studentDto = new StudentDto();
        try {
            studentDto = objectMapper.readValue(formData.getIvrprompt(), StudentDto.class);
            String referenceNo = studentDto.getStudentPhoto() == null ? RandomStringUtils.randomNumeric(6) : studentDto.getStudentPhoto();
            Response uploadResponse = fileService.uploadImage3(formData.getUploadfile(), referenceNo);
            if (uploadResponse.getResult() != "SUCCESS"){
                response.setResult("FAILED");
                response.setError(uploadResponse.getError());
                return response;
            }
            studentDto.setStudentPhoto(uploadResponse.getMessage());
            Student student = utilityService.convertStudentDtoToEntity(studentDto);
            student.setStatus("ACTIVE");
            studentRepository.save(student);
            response.setResult("SUCCESS");
            response.setMessage("Student data saved");
        } catch (IOException e){
            e.printStackTrace();
        }
        return response;
    }

    public Response studentBulkUpload(StudentDto studentDto) {
        Response response = new Response();
        try {
            Student student = utilityService.convertStudentDtoToEntity(studentDto);
            student.setStatus("ACTIVE");
            studentRepository.save(student);
            response.setResult("SUCCESS");
            response.setMessage("Student data saved");
        } catch (Exception e){
            e.printStackTrace();
        }
        return response;
    }

    public Page<Student> getFilteredStudentList(StudentDto studentDto, Pageable pageable) {
        CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
        CriteriaQuery<Student> query = criteriaBuilder.createQuery(Student.class);
        Root<Student> root = query.from(Student.class);
        query.select(root);
        HashMap<String, Object> parameterMap = new HashMap<>();
        List<Predicate> predicateList = new ArrayList<Predicate>();
        if (!StringUtils.isEmpty(studentDto.getStudentName())) {
            ParameterExpression<String> p = criteriaBuilder.parameter(String.class, "studentName");
            predicateList.add(criteriaBuilder.like(criteriaBuilder.lower(root.<String>get("studentName")), p));
            String profileNamePattern = "%" + studentDto.getStudentName().toLowerCase() + "%";
            parameterMap.put("studentName", profileNamePattern);
        }
        if (!StringUtils.isEmpty(studentDto.getClassId())) {
            ParameterExpression<String> p = criteriaBuilder.parameter(String.class, "classId");
            predicateList.add((criteriaBuilder.equal(root.<String>get("classId"),p)));
            parameterMap.put("classId", studentDto.getClassId());
        }
        if (!StringUtils.isEmpty(studentDto.getSectionId())) {
            ParameterExpression<String> p = criteriaBuilder.parameter(String.class, "sectionId");
            predicateList.add((criteriaBuilder.equal(root.<String>get("sectionId"),p)));
            parameterMap.put("sectionId", studentDto.getSectionId());
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
        TypedQuery<Student> tq = entityManager.createQuery(query);

        for (String key : parameterMap.keySet()) {
            tq.setParameter(key, parameterMap.get(key));
        }
        List<Student> resultList = tq.getResultList();
        int total = resultList.size();
        tq.setFirstResult((int) pageable.getOffset());
        tq.setMaxResults(pageable.getPageSize());
        resultList = tq.getResultList();
        Page<Student> pagedStudents = new PageImpl<Student>(resultList, pageable, total);
        return pagedStudents;
    }

    public StudentDtoPaginationResponse studentDtoPaginationResponse(Page<Student> students) {
        StudentDtoPaginationResponse response = new StudentDtoPaginationResponse();
        List<StudentDto> dtos = students.getContent().stream().map(user -> utilityService.convertStudentEntityToDto(user)).collect(Collectors.toList());
        response.setFirst(students.isFirst());
        response.setLast(students.isLast());
        response.setTotalPages(students.getTotalPages());
        response.setTotalElements((int) students.getTotalElements());
        response.setSize(students.getSize());
        response.setNumber(students.getNumber());
        response.setNumberOfElements(students.getNumberOfElements());
        response.setContent(dtos);
        return response;
    }

    public Response deleteStudent(Integer id) {
        Response response = new Response();
        Student student = studentRepository.findById(id).get();
        List<StudentDocuments> documents = student.getDocuments();
        String documentData = documents.get(0).getDocumentData();
        if (documentData != null){
            try {
                List<DocumentDto> documentDtos = Arrays.asList(utilityService.getJsonToDto(documentData, DocumentDto[].class));
                for (int i = 0; i < documentDtos.size(); i++) {
                    fileService.deleteFile(documentDtos.get(i).getEstudentdocument(), FIleType.DOCUMENT);
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        Response deleteStudent = fileService.deleteFile(student.getStudentPhoto(), FIleType.IMAGE);
        if (deleteStudent.getResult() != "SUCCESS"){
            response.setResult("FAILED");
            return response;
        }
        try {
            studentRepository.deleteById(id);
            response.setResult("SUCCESS");
            response.setMessage(student.getStudentName()+ " data deleted from system.");
        } catch (Exception e) {
            e.printStackTrace();
            response.setResult("FAIL");
            response.setErrorcode(3);
            response.setError(e.getMessage());
        }
        return response;
    }

    @Autowired
    private UtilityService utilityService;

    public Response pendingUpdate(StudentDto studentDto){
        Response response = new Response();
        Student student = studentRepository.findById(studentDto.getId()).get();
        if (student != null){
            if (studentDto.getAddressType().equalsIgnoreCase("URBAN")){
                studentDto.setVillageAddress("");
                studentDto.setPostOffice("");
                studentDto.setPoliceStation("");
                studentDto.setUrbanAddress(studentDto.getUrbanAddress());
            } else{
                studentDto.setUrbanAddress("");
                studentDto.setVillageAddress(studentDto.getVillageAddress());
                studentDto.setPostOffice(studentDto.getPostOffice());
                studentDto.setPoliceStation(studentDto.getPoliceStation());
            }
            student.setStatus("PENDING");
            try {
                String dtoToJson = utilityService.makeDtoToJson(studentDto);
                student.setUpdatedData(dtoToJson);
                studentRepository.save(student);
            } catch (JsonProcessingException e) {
                e.printStackTrace();
            }
            response.setResult("SUCCESS");
            response.setMessage("Wait until your record approved.");
        } else {
            response.setResult("SUCCESS");
        }
        return response;
    }

    @Autowired
    private EmailSenderService emailService;

    public Response rejectUpdate(StudentDto studentDto){
        Response response = new Response();
        StudentDto jsonToDto = new StudentDto();
        Student student = studentRepository.findById(studentDto.getId()).get();
        if (student != null && student.getStatus().equalsIgnoreCase("PENDING")) {
            student.setUpdatedData("");
            student.setStatus("ACTIVE");
            studentRepository.save(student);
        }
        emailService.simpleMailSender(studentDto.getEmail(),"Rejected the update request", studentDto.getRejectReason());
        response.setResult("SUCCESS");
        response.setMessage("Rejected Update Request");
        return response;
    }

    public Response updateStudent(StudentDto studentDto) {
        Response response = new Response();
        StudentDto jsonToDto = new StudentDto();
        Student student = studentRepository.findById(studentDto.getId()).get();
        if (student != null && student.getStatus().equals("PENDING")) {
            try {
                jsonToDto = utilityService.getJsonToDto(student.getUpdatedData(), StudentDto.class);
            } catch (IOException e) {
                e.printStackTrace();
            }
            student.setAdmissionNo(jsonToDto.getAdmissionNo());
            student.setStudentName(jsonToDto.getStudentName());
            student.setFatherName(jsonToDto.getFatherName());
            student.setMotherName(jsonToDto.getMotherName());
            student.setClassId(jsonToDto.getClassId());
            student.setSectionId(jsonToDto.getSectionId());
            student.setDob(jsonToDto.getDob());
            student.setAdmissionDate(jsonToDto.getAdmissionDate());
            student.setAddressType(jsonToDto.getAddressType());
            if (jsonToDto.getAddressType().equalsIgnoreCase("URBAN")){
                student.setVillageAddress("");
                student.setPostOffice("");
                student.setPoliceStation("");
                student.setUrbanAddress(jsonToDto.getUrbanAddress());
            } else{
                student.setUrbanAddress("");
                student.setVillageAddress(jsonToDto.getVillageAddress());
                student.setPostOffice(jsonToDto.getPostOffice());
                student.setPoliceStation(jsonToDto.getPoliceStation());
            }
            student.setDistrictName(jsonToDto.getDistrictName());
            student.setGender(jsonToDto.getGender());
            student.setReligion(jsonToDto.getReligion());
            student.setCastType(jsonToDto.getCastType());
            student.setFatherPhoneNumber(jsonToDto.getFatherPhoneNumber());
            student.setMotherPhoneNumber(jsonToDto.getMotherPhoneNumber());
            student.setAadhaarNo(jsonToDto.getAadhaarNo());
            student.setUpdatedData("");
            student.setStatus("ACTIVE");
            studentRepository.save(student);
            response.setResult("SUCCESS");
            response.setMessage("Record Updated and Approved.");
        } else {
            response.setResult("FAILED");
        }
        return response;
    }

    public Response updatePhoto(FormDataWithUploadFile formData) {
        Response response = new Response();
        StudentDto studentDto = new StudentDto();
        try {
            studentDto = objectMapper.readValue(formData.getIvrprompt(), StudentDto.class);
            Student student = studentRepository.findById(studentDto.getId()).get();
            if (student != null) {
                String referenceNo = student.getStudentPhoto() == null ? RandomStringUtils.randomNumeric(6): student.getStudentPhoto();
                Response uploadResponse = fileService.uploadImage3(formData.getUploadfile(), referenceNo);
                if (uploadResponse.getResult() != "SUCCESS"){
                    response.setResult("FAILED");
                    response.setError(uploadResponse.getError());
                    return response;
                }
                student.setStudentPhoto(uploadResponse.getMessage());
                studentRepository.save(student);
                response.setResult("SUCCESS");
                response.setMessage("Photo updated successfully");
            } else {
                response.setResult("FAILED");
                response.setMessage("Student record not found");
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        return response;
    }
    @Autowired
    private StudentDocumentsRepository studentDocumentsRepository;
    public Response saveDocuments(String documentData, List<MultipartFile> multipartFiles){
        Response response = new Response();

        System.out.println(documentData);
        try {
            StudentDocumentDto studentDocumentDto = objectMapper.readValue(documentData, StudentDocumentDto.class);
            Student student = studentRepository.findByAdmissionNo(studentDocumentDto.getAdmissionNo());
            System.out.println(studentDocumentDto);
            List<DocumentDto> dtos = new ArrayList<>();
            studentDocumentDto.setDocuments(Arrays.asList(objectMapper.readValue(studentDocumentDto.getDocumentData(), DocumentDto[].class)));
            StudentDocuments studentDocuments = studentDocumentsRepository.findByAdmissionNo(student.getAdmissionNo());
            List<DocumentDto> dtoList = new ArrayList<DocumentDto>();
            List<DocumentDto> tempList = new ArrayList<DocumentDto>();
            List<DocumentDto> tempList2 = new ArrayList<DocumentDto>();
            if (studentDocuments != null) {
                tempList.addAll(Arrays.asList(objectMapper.readValue(studentDocuments.getDocumentData(), DocumentDto[].class)));
            }
            for (int i = 0; i < studentDocumentDto.getDocuments().size(); i++) {
                DocumentDto dto1 = new DocumentDto();
                Response res = new Response();
                dto1.setEdocumentname(studentDocumentDto.getDocuments().get(i).getEdocumentname());
                dto1.setEstudentdocument(null);
                String referenceNo = dto1.getEstudentdocument() == null ?
                        RandomStringUtils.randomNumeric(6): dto1.getEstudentdocument();
                res = fileService.uploadFile(multipartFiles.get(i), referenceNo, FIleType.DOCUMENT);
                dto1.setEstudentdocument(res.getMessage());
                tempList2.add(dto1);
            }
            dtoList = Stream.concat(tempList.stream(),tempList2.stream()).distinct().collect(Collectors.toList());
            studentDocumentDto.setDocuments(dtoList);
            String documentsJSON = utilityService.makeDtoToJson(studentDocumentDto.getDocuments());
            studentDocumentDto.setDocumentData(documentsJSON);
            System.out.println(dtoList);
            System.out.println("New Student Document Dto: " + studentDocumentDto);

            if (studentDocuments != null){
                studentDocuments.setAdmissionNo(student.getAdmissionNo());
                studentDocuments.setDocumentData(studentDocumentDto.getDocumentData());
                studentDocuments.setStudent(student);
                studentDocumentsRepository.save(studentDocuments);
            } else {
                StudentDocuments documents = new StudentDocuments();
                documents.setAdmissionNo(student.getAdmissionNo());
                documents.setDocumentData(studentDocumentDto.getDocumentData());
                documents.setStudent(student);
                studentDocumentsRepository.save(documents);
            }

        } catch (IOException e) {
            e.printStackTrace();
        }
        response.setResult("SUCCESS");
        return response;
    }

    public StudentDocumentDto viewSubmittedDocuments(String admissionNo){
        StudentDocuments documents = studentDocumentsRepository.findByAdmissionNo(admissionNo);
        StudentDocumentDto studentDocuments = new StudentDocumentDto();
        if(documents != null){
            studentDocuments.setAdmissionNo(documents.getAdmissionNo());
            studentDocuments.setDocumentData(documents.getDocumentData());
        }
        return studentDocuments;
    }

    public StudentDocumentDto deleteDocument(String admissionNo, String documentNo){
        List<DocumentDto> tempList = new ArrayList<DocumentDto>();
        StudentDocumentDto studentDocuments = new StudentDocumentDto();
        StudentDocuments documents = studentDocumentsRepository.findByAdmissionNo(admissionNo);
        if (documents != null) {
            try {
                tempList.addAll(Arrays.asList(objectMapper.readValue(documents.getDocumentData(), DocumentDto[].class)));
                fileService.deleteFile(documentNo, FIleType.DOCUMENT);
                List<DocumentDto> newDocList = tempList.stream().filter(e -> !e.getEstudentdocument().equals(documentNo)).collect(Collectors.toList());
                studentDocuments.setAdmissionNo(documents.getAdmissionNo());
                studentDocuments.setDocumentData(utilityService.makeDtoToJson(newDocList));
                documents.setDocumentData(studentDocuments.getDocumentData());
                studentDocumentsRepository.save(documents);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        return studentDocuments;
    }

    public StudentDto findStudentById(Integer id) {
        StudentDto studentDto = new StudentDto();
        Student student = studentRepository.findById(id).get();
        if (student != null){
            studentDto = utilityService.convertStudentEntityToDto(student);
        }
        return studentDto;
    }
}
