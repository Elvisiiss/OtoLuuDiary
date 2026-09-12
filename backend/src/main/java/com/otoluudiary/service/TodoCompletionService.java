package com.otoluudiary.service;

import com.otoluudiary.mapper.TodoCompletionMapper;
import com.otoluudiary.model.TodoCompletion;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TodoCompletionService {

    @Autowired
    private TodoCompletionMapper completionMapper;

    public List<TodoCompletion> listByTodoId(Long todoId) {
        return completionMapper.findByTodoId(todoId);
    }

    public TodoCompletion create(Long todoId, String note) {
        TodoCompletion c = new TodoCompletion();
        c.setTodoId(todoId);
        c.setNote(note);
        c.setCreatedAt(System.currentTimeMillis());
        completionMapper.insert(c);
        return c;
    }

    public boolean delete(Long id) {
        return completionMapper.deleteById(id, System.currentTimeMillis()) > 0;
    }
}
