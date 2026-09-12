package com.otoluudiary.mapper;

import com.otoluudiary.model.Todo;
import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface TodoMapper {
    List<Todo> findByUserId(@Param("userId") String userId);
    List<Todo> findByUserIdToday(@Param("userId") String userId, @Param("today") String today);
    List<Todo> findByUserIdWeek(@Param("userId") String userId, @Param("today") String today, @Param("weekEnd") String weekEnd);
    List<Todo> findByUserIdImportant(@Param("userId") String userId);
    List<Todo> findByUserIdUpcoming(@Param("userId") String userId, @Param("today") String today, @Param("weekEnd") String weekEnd);
    List<Todo> findByUserIdOverdue(@Param("userId") String userId, @Param("today") String today);
    Todo findById(@Param("id") Long id);
    int insert(Todo todo);
    int update(Todo todo);
    int updateDone(@Param("id") Long id, @Param("done") Boolean done, @Param("updatedAt") Long updatedAt);
    int deleteById(@Param("id") Long id, @Param("deletedAt") Long deletedAt);
}
