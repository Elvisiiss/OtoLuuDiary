package com.otoluudiary.mapper;

import com.otoluudiary.model.CalendarPlan;
import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface CalendarPlanMapper {
    List<CalendarPlan> findByUserAndMonth(@Param("userId") String userId, @Param("startDate") String startDate, @Param("endDate") String endDate);
    int insert(CalendarPlan plan);
    int deleteById(@Param("id") Long id);
}
