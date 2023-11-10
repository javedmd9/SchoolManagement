package com.vivatechrnd.sms.Services;

import com.vivatechrnd.sms.Dto.ExaminationDto;
import com.vivatechrnd.sms.Entities.Examination;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;
import javax.persistence.criteria.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

@Service
public class ExaminationService {

    @Autowired
    private EntityManager entityManager;

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
