package com.otoluudiary.service;

import com.otoluudiary.mapper.CalendarPlanMapper;
import com.otoluudiary.model.CalendarPlan;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CalendarPlanService {

    @Autowired
    private CalendarPlanMapper planMapper;

    public List<CalendarPlan> listByMonth(String userId, int year, int month) {
        String startDate = String.format("%04d-%02d-01", year, month);
        String endDate = String.format("%04d-%02d-31", year, month);
        return planMapper.findByUserAndMonth(userId, startDate, endDate);
    }

    public CalendarPlan create(String userId, String planDate, String content) {
        CalendarPlan plan = new CalendarPlan();
        plan.setUserId(userId);
        plan.setPlanDate(planDate);
        plan.setContent(content);
        plan.setCreatedAt(System.currentTimeMillis());
        planMapper.insert(plan);
        return plan;
    }

    public boolean delete(Long id) {
        return planMapper.deleteById(id, System.currentTimeMillis()) > 0;
    }
}
