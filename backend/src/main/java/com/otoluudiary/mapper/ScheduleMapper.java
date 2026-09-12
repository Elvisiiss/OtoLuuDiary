package com.otoluudiary.mapper;

import com.otoluudiary.model.Schedule;
import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface ScheduleMapper {
    List<Schedule> findByUserId(@Param("userId") String userId);
    int insert(Schedule schedule);
    int deleteById(@Param("id") Long id, @Param("deletedAt") Long deletedAt);
}
