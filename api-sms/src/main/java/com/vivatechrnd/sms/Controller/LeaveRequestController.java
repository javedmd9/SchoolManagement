package com.vivatechrnd.sms.Controller;

import com.vivatechrnd.sms.Dto.LeaveRequestDto;
import com.vivatechrnd.sms.Dto.StudentDto;
import com.vivatechrnd.sms.Entities.*;
import com.vivatechrnd.sms.PaginationDto.LeaveRequestPaginationDto;
import com.vivatechrnd.sms.PaginationDto.StudentDtoPaginationResponse;
import com.vivatechrnd.sms.Repository.LeaveRequestRepository;
import com.vivatechrnd.sms.Repository.RolesRepository;
import com.vivatechrnd.sms.Repository.StudentRepository;
import com.vivatechrnd.sms.Repository.TeacherRepository;
import com.vivatechrnd.sms.utility.Response;
import com.vivatechrnd.sms.utility.UtilityService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.util.Optionals;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;
import javax.persistence.criteria.*;
import java.util.*;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", allowedHeaders = "*")
@RestController
@RequestMapping(value="/leave-request")
public class LeaveRequestController {

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private RolesRepository rolesRepository;

    @Autowired
    private UtilityService utilityService;

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private EntityManager entityManager;

    @RequestMapping(value = "/create-student-leave", method = RequestMethod.POST)
    public Response createLeaveRequest(@RequestBody LeaveRequestDto dto){
        Response response = new Response();
        Student student = studentRepository.findByAdmissionNo(dto.getSubmittedBy());
        Optional<Teacher> teacher = Optional.empty();
        if (student == null){
            teacher = teacherRepository.findById(Integer.parseInt(dto.getSubmittedBy()));
        }
        Roles roles = rolesRepository.findByName(dto.getRoleName());
        LeaveRequest request = new LeaveRequest();
        request.setLetterSubject(dto.getLetterSubject());
        request.setLetterBody(dto.getLetterBody());
        if (student != null){
            request.setSubmittedBy(student.getId());
        }
        teacher.ifPresent(data -> request.setSubmittedBy(data.getId()));
        request.setApplicationDate(new Date());
        request.setStatus("PENDING");
        request.setRoles(roles);
        leaveRequestRepository.save(request);
        response.setResult("Success");
        response.setMessage("Leave request submitted successfully");
        return response;
    }

    @RequestMapping(value = "/approve-student-leave", method = RequestMethod.POST)
    public Response approveLeaveRequest(@RequestBody LeaveRequestDto dto){
        Response response = new Response();
        Optional<LeaveRequest> leaveRequest = leaveRequestRepository.findById(dto.getId());
        leaveRequest.ifPresent(value -> {
            value.setStatus("APPROVED");
            value.setApprovedBy(dto.getApprovedBy());
            leaveRequestRepository.save(value);
            response.setResult("SUCCESS");
            response.setMessage("Approved successfully");
        });
        return response;
    }

    @RequestMapping(value = "/reject-student-leave", method = RequestMethod.POST)
    public Response rejectLeaveRequest(@RequestBody LeaveRequestDto dto){
        Response response = new Response();
        Optional<LeaveRequest> leaveRequest = leaveRequestRepository.findById(dto.getId());
        leaveRequest.ifPresent(value -> {
            value.setStatus("REJECTED");
            value.setApprovedBy(dto.getApprovedBy());
            leaveRequestRepository.save(value);
            response.setResult("SUCCESS");
            response.setMessage("Rejected successfully");
        });
        return response;
    }

    @RequestMapping(value = "/view-request", method = RequestMethod.POST)
    public LeaveRequestPaginationDto viewAllLeaveRequest(@RequestBody LeaveRequestDto dto){
        int pageNumber = (dto.getPageNo() != null && dto.getPageNo() != 0)? dto.getPageNo() : 0;
        PageRequest pageRequest = new PageRequest(pageNumber, 5);
        Page<LeaveRequest> allLeaveRequest = leaveRequestRepository.findAll(pageRequest);
        LeaveRequestPaginationDto leaveRequestPaginationDto = leaveRequestDtoPaginationResponse(allLeaveRequest);
        return leaveRequestPaginationDto;
    }

    @RequestMapping(value = "/view-request-by-student", method = RequestMethod.POST)
    public LeaveRequestPaginationDto viewAllLeaveRequestOfStudent(@RequestBody LeaveRequestDto dto){
        int pageNumber = (dto.getPageNo() != null && dto.getPageNo() != 0)? dto.getPageNo() : 0;
        PageRequest pageRequest = new PageRequest(pageNumber, 5);
        Page<LeaveRequest> leaveRequest = leaveRequestRepository.findBySubmittedBy(Integer.parseInt(dto.getSubmittedBy()), pageRequest);
        LeaveRequestPaginationDto leaveRequestPaginationDto = leaveRequestDtoPaginationResponse(leaveRequest);
        return leaveRequestPaginationDto;
    }

    public LeaveRequestPaginationDto leaveRequestDtoPaginationResponse(Page<LeaveRequest> leaveRequest) {
        LeaveRequestPaginationDto response = new LeaveRequestPaginationDto();
        List<LeaveRequestDto> dtoList = new ArrayList<>();
        leaveRequest.getContent().forEach(ele -> dtoList.add(convertLeaveRequestEntityToDto(ele)));
        response.setFirst(leaveRequest.isFirst());
        response.setLast(leaveRequest.isLast());
        response.setTotalPages(leaveRequest.getTotalPages());
        response.setTotalElements((int) leaveRequest.getTotalElements());
        response.setSize(leaveRequest.getSize());
        response.setNumber(leaveRequest.getNumber());
        response.setNumberOfElements(leaveRequest.getNumberOfElements());
        response.setContent(dtoList);
        return response;
    }

    public Page<LeaveRequest> getFilteredLeaveRequest(LeaveRequestDto dto, Pageable pageable){
        CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
        CriteriaQuery<LeaveRequest> query = criteriaBuilder.createQuery(LeaveRequest.class);
        Root<LeaveRequest> root = query.from(LeaveRequest.class);
        query.select(root);
        HashMap<String, Object> parameterMap = new HashMap<>();
        List<Predicate> predicateList = new ArrayList<Predicate>();

        Teacher teacher = teacherRepository.findByTeacherCode(Integer.parseInt(dto.getSubmittedBy()));
        Student student = studentRepository.findByAdmissionNo(dto.getSubmittedBy());

        if (!StringUtils.isEmpty(dto.getId())) {
            ParameterExpression<Integer> p = criteriaBuilder.parameter(Integer.class, "id");
            predicateList.add((criteriaBuilder.equal(root.<Integer>get("id"),p)));
            parameterMap.put("id", dto.getId());
        }
        if (dto.getSubmittedBy() != null){
            ParameterExpression<Integer> p = criteriaBuilder.parameter(Integer.class, "submittedBy");
            predicateList.add((criteriaBuilder.equal(root.<Integer>get("submittedBy"),p)));
            parameterMap.put("submittedBy", dto.getId());
        }
        if (teacher != null){
            Join<LeaveRequest, Teacher> instructor = root.join("submittedBy");
            ParameterExpression<Integer> p = criteriaBuilder.parameter(Integer.class, "teacherId");
            predicateList.add(criteriaBuilder.equal(instructor.get("id"), p));
            parameterMap.put("teacherId", teacher.getId());
        }
        if (student != null){
            Join<LeaveRequest, Student> studentJoin = root.join("submittedBy");
            ParameterExpression<Integer> p = criteriaBuilder.parameter(Integer.class, "studentId");
            predicateList.add(criteriaBuilder.equal(studentJoin.get("id"), p));
            parameterMap.put("studentId", student.getId());
        }
        if (dto.getStartDate() != null){
            ParameterExpression<Date> p = criteriaBuilder.parameter(Date.class, "startDate");
            predicateList.add(criteriaBuilder.greaterThanOrEqualTo(root.get("applicationDate"), p));
            parameterMap.put("startDate", dto.getStartDate());
        }
        if (dto.getEndDate() != null){
            ParameterExpression<Date> p = criteriaBuilder.parameter(Date.class, "endDate");
            predicateList.add(criteriaBuilder.lessThanOrEqualTo(root.get("applicationDate"), p));
            parameterMap.put("endDate", dto.getEndDate());
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
        TypedQuery<LeaveRequest> tq = entityManager.createQuery(query);

        for (String key : parameterMap.keySet()) {
            tq.setParameter(key, parameterMap.get(key));
        }
        List<LeaveRequest> resultList = tq.getResultList();
        int total = resultList.size();
        tq.setFirstResult((int) pageable.getOffset());
        tq.setMaxResults(pageable.getPageSize());
        resultList = tq.getResultList();
        Page<LeaveRequest> pagedLeaveRequest = new PageImpl<LeaveRequest>(resultList, pageable, total);
        return pagedLeaveRequest;
    }
    public LeaveRequestDto convertLeaveRequestEntityToDto(LeaveRequest leaveRequest){
        LeaveRequestDto mappedRequest = new LeaveRequestDto();
        Optional<Student> student = studentRepository.findById(leaveRequest.getSubmittedBy());
        Optional<Teacher> teacher = teacherRepository.findById(leaveRequest.getSubmittedBy());
        Optional<Teacher> approvedBy = Optional.empty();
        if (leaveRequest.getApprovedBy() != null){
            approvedBy = teacherRepository.findById(leaveRequest.getApprovedBy());
        }
        HashMap<String, Integer> hashMapId = new HashMap<>();
        HashMap<String, String> hashMapName = new HashMap<>();
        if (student.isPresent()){
            hashMapId.put("id", student.get().getId());
            hashMapName.put("name", student.get().getStudentName());
        } else {
            hashMapId.put("id", teacher.get().getId());
            hashMapName.put("name", teacher.get().getTeacherName());
        }
        mappedRequest.setId(leaveRequest.getId());
        mappedRequest.setSubmittedById(hashMapId);
        mappedRequest.setSubmittedByPersonName(hashMapName);
        mappedRequest.setLetterSubject(leaveRequest.getLetterSubject());
        mappedRequest.setLetterBody(leaveRequest.getLetterBody());
        mappedRequest.setApplicationDate(leaveRequest.getApplicationDate());
        mappedRequest.setRoleId(leaveRequest.getRoles().getId());
        mappedRequest.setRoleName(leaveRequest.getRoles().getName());
        approvedBy.ifPresent(value -> {
            mappedRequest.setApprovedBy(value.getId());
            mappedRequest.setApprovedByName(value.getTeacherName());
        });
        mappedRequest.setStatus(leaveRequest.getStatus());
        return mappedRequest;
    }
}
