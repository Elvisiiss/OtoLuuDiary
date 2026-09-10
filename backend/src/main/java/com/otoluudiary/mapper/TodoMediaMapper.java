package com.otoluudiary.mapper;

import com.otoluudiary.model.TodoMedia;
import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface TodoMediaMapper {
    List<TodoMedia> findByTodoId(@Param("todoId") Long todoId);
    int insert(TodoMedia media);
    int deleteById(@Param("id") Long id);
    int deleteByTodoId(@Param("todoId") Long todoId);
}
