package com.otoluudiary.service;

import com.otoluudiary.mapper.TodoMapper;
import com.otoluudiary.model.Todo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class TodoService {

    @Autowired
    private TodoMapper todoMapper;

    public List<Todo> list(String userId, String filter) {
        if ("today".equals(filter)) {
            return todoMapper.findByUserIdToday(userId, LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE));
        } else if ("week".equals(filter)) {
            LocalDate today = LocalDate.now();
            LocalDate weekEnd = today.plusDays(7 - today.getDayOfWeek().getValue());
            return todoMapper.findByUserIdWeek(userId, today.format(DateTimeFormatter.ISO_LOCAL_DATE), weekEnd.format(DateTimeFormatter.ISO_LOCAL_DATE));
        } else if ("important".equals(filter)) {
            return todoMapper.findByUserIdImportant(userId);
        }
        return todoMapper.findByUserId(userId);
    }

    public Todo getById(Long id) {
        return todoMapper.findById(id);
    }

    public Todo create(String userId, String title, String description, Integer importance,
                        String repeatType, String repeatConfig, String repeatEndType, String repeatEndValue, String dueDate) {
        long now = System.currentTimeMillis();
        Todo todo = new Todo();
        todo.setUserId(userId);
        todo.setTitle(title);
        todo.setDescription(description);
        todo.setImportance(importance != null ? importance : 0);
        todo.setRepeatType(repeatType);
        todo.setRepeatConfig(repeatConfig);
        todo.setRepeatEndType(repeatEndType);
        todo.setRepeatEndValue(repeatEndValue);
        todo.setDueDate(dueDate);
        todo.setDone(false);
        todo.setCreatedAt(now);
        todo.setUpdatedAt(now);
        todoMapper.insert(todo);
        return todo;
    }

    public boolean update(Long id, String title, String description, Integer importance,
                           String repeatType, String repeatConfig, String repeatEndType, String repeatEndValue, String dueDate) {
        Todo existing = todoMapper.findById(id);
        if (existing == null) return false;
        existing.setTitle(title);
        existing.setDescription(description);
        existing.setImportance(importance != null ? importance : 0);
        existing.setRepeatType(repeatType);
        existing.setRepeatConfig(repeatConfig);
        existing.setRepeatEndType(repeatEndType);
        existing.setRepeatEndValue(repeatEndValue);
        existing.setDueDate(dueDate);
        existing.setUpdatedAt(System.currentTimeMillis());
        return todoMapper.update(existing) > 0;
    }

    public boolean setDone(Long id, boolean done) {
        return todoMapper.updateDone(id, done, System.currentTimeMillis()) > 0;
    }

    public boolean delete(Long id) {
        return todoMapper.deleteById(id) > 0;
    }
}
