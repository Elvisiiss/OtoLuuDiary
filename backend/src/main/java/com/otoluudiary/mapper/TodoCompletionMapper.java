package com.otoluudiary.mapper;

import com.otoluudiary.model.TodoCompletion;
import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface TodoCompletionMapper {
    List<TodoCompletion> findByTodoId(@Param("todoId") Long todoId);
    int insert(TodoCompletion completion);
    int deleteById(@Param("id") Long id);
}
