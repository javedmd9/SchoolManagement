package com.vivatechrnd.sms.Services;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vivatechrnd.sms.Dto.CertificateDto;
import com.vivatechrnd.sms.Entities.Certificates;
import com.vivatechrnd.sms.Entities.Teacher;
import com.vivatechrnd.sms.PaginationDto.CertificatePaginationDto;
import com.vivatechrnd.sms.Repository.CertificateRepository;
import com.vivatechrnd.sms.Repository.TeacherRepository;

import com.vivatechrnd.sms.Enums.FIleType;
import com.vivatechrnd.sms.utility.Response;
import org.apache.commons.lang3.RandomStringUtils;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.data.domain.Pageable;

import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;
import javax.persistence.criteria.*;
import java.io.IOException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class CertificateService {

    @Autowired
    private CertificateRepository certificateRepository;

    @Autowired
    private ModelMapper modelMapper;

    public List<CertificateDto> getAllCertificate(){
        List<Certificates> certificates = certificateRepository.findAll();
        List<CertificateDto> certificateDtoList = new ArrayList<>();
        for (Certificates cert: certificates){
            CertificateDto dto = new CertificateDto();
            certificateDtoList.add(convertCertificateEntityToCertificateDto(cert));
        }
        return certificateDtoList;
    }

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private FileService fileService;

    @Autowired
    private ObjectMapper objectMapper;

    public Response updateCertificate(CertificateDto certificateDto){
        Response response = new Response();
        Teacher teacher = teacherRepository.findById(certificateDto.getTeacherId()).get();
        if (teacher == null){
            response.setResult("FAILED");
            return response;
        }
        Certificates certificate = certificateRepository.findById(certificateDto.getId()).get();
        if (certificate == null){
            response.setResult("FAILED");
            return response;
        }
        certificateDto.setCertificatePath(certificate.getCertificatePath());
        certificate = convertCertificateDtoToCertificateEntity(certificateDto);
        certificate.setTeacher(teacher);
        certificateRepository.save(certificate);
        response.setResult("SUCCESS");
        return response;
    }

    public Response saveCertificate(String certificateData, MultipartFile multipartFile){
        Response response = new Response();
        CertificateDto certificateDto = new CertificateDto();
        try {
            certificateDto = objectMapper.readValue(certificateData, CertificateDto.class);
        } catch (IOException e) {
            e.printStackTrace();
        }
        String referenceNo = certificateDto.getCertificatePath() == null? RandomStringUtils.randomNumeric(6): certificateDto.getCertificatePath();
        Response uploadResponse = fileService.uploadFile(multipartFile, referenceNo, FIleType.CERTIFICATE);
        if (uploadResponse.getResult() != "SUCCESS"){
            response.setResult("FAILED");
            response.setError(uploadResponse.getError());
            return response;
        }
        certificateDto.setCertificatePath(uploadResponse.getMessage());
        Teacher teacher = teacherRepository.findById(certificateDto.getTeacherId()).get();
        Certificates certificates = convertCertificateDtoToCertificateEntity(certificateDto);
        certificates.setTeacher(teacher);
        certificateRepository.save(certificates);
        response.setResult("SUCCESS");
        return response;
    }

    public Response deleteCertificate(Integer certificateDto){
        Response response = new Response();
        Certificates certificates = certificateRepository.findById(certificateDto).get();
        Response deleteResponse = fileService.deleteFile(certificates.getCertificatePath(), FIleType.CERTIFICATE);
        if (deleteResponse.getResult() != "SUCCESS"){
            response.setResult("FAILED");
            return response;
        }
        try{
            certificateRepository.deleteById(certificateDto);
            response.setResult("SUCCESS");
        } catch (Exception e){
            e.printStackTrace();
            response.setResult("FAIL");
            response.setErrorcode(3);
            response.setError(e.getMessage());
        }

        return response;
    }

    public CertificateDto readPdfFile(MultipartFile file){
        String resultText = fileService.readFile(file);
        CertificateDto dto = new CertificateDto();
        String[] splitted = resultText.split("\\r?\\n");
        Pattern pattern = Pattern.compile("\\d{2}/\\d{2}/\\d{4}");
        Matcher matcher = pattern.matcher(splitted[5]);

        if (matcher.find()){
            String matcher1 = matcher.group();
            String replace = matcher1.replace("/", "-");
//            dto.setTrainingDate(convertStringToDate(matcher.group(), "dd/MM/yyyy"));
            dto.setTrainingDateInString(replace);
            dto.setTrainingDate(convertStringToDate(replace, "dd-MM-yyyy"));
        }
//        String m = matcher.group();

        dto.setTopic(splitted[3]);
        dto.setOrganizationAddress(splitted[4]);
        dto.setCertificateNo(splitted[5]);
        return dto;
    }

    @Autowired
    private EntityManager entityManager;

    public Page<Certificates> getFilteredCertificate(CertificateDto certificateDto, Pageable pageable){
        CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
        CriteriaQuery<Certificates> query = criteriaBuilder.createQuery(Certificates.class);
        Root<Certificates> root = query.from(Certificates.class);
        query.select(root);
        HashMap<String, Object> parameterMap = new HashMap<>();
        List<Predicate> predicateList = new ArrayList<Predicate>();
        if (!StringUtils.isEmpty(certificateDto.getTrainingType())) {
            ParameterExpression<String> p = criteriaBuilder.parameter(String.class, "trainingType");
            predicateList.add(criteriaBuilder.like(criteriaBuilder.lower(root.<String>get("trainingType")), p));
            String profileNamePattern = "%" + certificateDto.getTrainingType().toLowerCase() + "%";
            parameterMap.put("trainingType", profileNamePattern);
        }
        if (!StringUtils.isEmpty(certificateDto.getNameOfOrganization())) {
            ParameterExpression<String> p = criteriaBuilder.parameter(String.class, "nameOfOrganization");
            predicateList.add(criteriaBuilder.like(criteriaBuilder.lower(root.<String>get("nameOfOrganization")), p));
            String profileNamePattern = "%" + certificateDto.getNameOfOrganization().toLowerCase() + "%";
            parameterMap.put("nameOfOrganization", profileNamePattern);
        }
        if (!StringUtils.isEmpty(certificateDto.getTopic())) {
            ParameterExpression<String> p = criteriaBuilder.parameter(String.class, "topic");
            predicateList.add(criteriaBuilder.like(criteriaBuilder.lower(root.<String>get("topic")), p));
            String profileNamePattern = "%" + certificateDto.getTopic().toLowerCase() + "%";
            parameterMap.put("topic", profileNamePattern);
        }
        if (certificateDto.getTeacherId() != null) {
            Join<Certificates, Teacher> teacher = root.join("teacher");
            ParameterExpression<Integer> c = criteriaBuilder.parameter(Integer.class, "teacherId");
            predicateList.add(criteriaBuilder.equal(teacher.get("id"), c));
            parameterMap.put("teacherId", certificateDto.getTeacherId());
        }
        if (certificateDto.getStartDate() != null) {
            ParameterExpression<Date> p = criteriaBuilder.parameter(Date.class, "startDate");
            predicateList.add(criteriaBuilder.greaterThanOrEqualTo(root.<Date>get("trainingDate"), p));
            parameterMap.put("startDate", certificateDto.getStartDate());
        }
        if (certificateDto.getEndDate() != null) {
            ParameterExpression<Date> p = criteriaBuilder.parameter(Date.class, "endDate");
            predicateList.add(criteriaBuilder.lessThanOrEqualTo(root.<Date>get("trainingDate"), p));
            parameterMap.put("endDate", certificateDto.getEndDate());
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
        TypedQuery<Certificates> tq = entityManager.createQuery(query);

        for (String key : parameterMap.keySet()) {
            tq.setParameter(key, parameterMap.get(key));
        }
        List<Certificates> resultList = tq.getResultList();
        int total = resultList.size();
        tq.setFirstResult((int) pageable.getOffset());
        tq.setMaxResults(pageable.getPageSize());
        resultList = tq.getResultList();
        Page<Certificates> pagedCertificates = new PageImpl<Certificates>(resultList, pageable, total);
        return pagedCertificates;
    }

    public CertificatePaginationDto certificateDtoPaginationResponse(Page<Certificates> certificates){
        CertificatePaginationDto response = new CertificatePaginationDto();
        List<CertificateDto> dtos = certificates.getContent().stream().map(user -> convertCertificateEntityToCertificateDto(user)).collect(Collectors.toList());
        response.setFirst(certificates.isFirst());
        response.setLast(certificates.isLast());
        response.setTotalPages(certificates.getTotalPages());
        response.setTotalElements((int) certificates.getTotalElements());
        response.setSize(certificates.getSize());
        response.setNumber(certificates.getNumber());
        response.setNumberOfElements(certificates.getNumberOfElements());
        response.setContent(dtos);
        return response;
    }

    public String getLocalTime(Date transferDate) {

        SimpleDateFormat sdf = new SimpleDateFormat("dd-MM-yyyy");
        String formatted = sdf.format(transferDate);
        return formatted;
    }

    public Date convertStringToDate(String dateStr, String format){
        Date parsedDate = new Date();
        Date addADay = new Date();
        Integer increaseDay = 1;

        SimpleDateFormat dateFormat = new SimpleDateFormat(format);
        try {
            parsedDate = dateFormat.parse(dateStr);
//            LocalDateTime plusDays = LocalDateTime.from(parsedDate.toInstant()).plusDays(1);
            addADay = new Date(parsedDate.getTime() + (1000 * 60 * 60 * 24 * increaseDay));
        } catch (ParseException e) {
            e.printStackTrace();
        }
//        String localTime = getLocalTime(parsedDate);
        return addADay;
    }

    public Date convertStringToDate2(String dateStr){
        LocalDate localDate = LocalDate.parse(
                dateStr,
                DateTimeFormatter.ofPattern("dd/MM/yyyy", Locale.US)
        );

        Date stringToDate = setLocalTime(localDate.toString());
        return stringToDate;
    }
    public Date setLocalTime(String transferDate){
        SimpleDateFormat sdf = new SimpleDateFormat("dd-MM-yyyy");
        Date localDate = new Date();
        try {
            localDate = sdf.parse(transferDate);
        } catch (ParseException exception) {
            exception.printStackTrace();
        }
        return localDate;
    }

    private CertificateDto convertCertificateEntityToCertificateDto(Certificates cert) {
        CertificateDto certificateDto = modelMapper.map(cert, CertificateDto.class);
        return certificateDto;
    }
    private Certificates convertCertificateDtoToCertificateEntity(CertificateDto dto){
        return modelMapper.map(dto, Certificates.class);
    }
}
