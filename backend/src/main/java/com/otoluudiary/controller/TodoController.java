package com.otoluudiary.controller;

import com.otoluudiary.model.Todo;
import com.otoluudiary.service.TodoService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/todos")
public class TodoController {

    @Autowired
    private TodoService todoService;

    private String getCurrentUserId(HttpServletRequest request) {
        return (String) request.getAttribute("currentUserId");
    }

    @GetMapping
    public ApiResponse<List<Todo>> list(HttpServletRequest request,
                                         @RequestParam(required = false) String filter) {
        String userId = getCurrentUserId(request);
        if (userId == null) return ApiResponse.fail("用户未登录");
        return ApiResponse.ok(todoService.list(userId, filter));
    }

    @GetMapping("/{id}")
    public ApiResponse<Todo> getById(@PathVariable Long id) {
        Todo todo = todoService.getById(id);
        if (todo == null) return ApiResponse.fail("待做事项不存在");
        return ApiResponse.ok(todo);
    }

    @PostMapping
    public ApiResponse<Todo> create(HttpServletRequest request, @RequestBody Map<String, Object> body) {
        String userId = getCurrentUserId(request);
        if (userId == null) return ApiResponse.fail("用户未登录");
        String content = (String) body.get("content");
        if (content == null || content.isBlank()) return ApiResponse.fail("内容不能为空");
        Integer importance = body.get("importance") != null ? ((Number) body.get("importance")).intValue() : 0;
        String repeatType = (String) body.get("repeatType");
        String dueDate = (String) body.get("dueDate");
        return ApiResponse.ok(todoService.create(userId, content, importance, repeatType, dueDate));
    }

    @PutMapping("/{id}")
    public ApiResponse<Void> update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        String content = (String) body.get("content");
        if (content == null || content.isBlank()) return ApiResponse.fail("内容不能为空");
        Integer importance = body.get("importance") != null ? ((Number) body.get("importance")).intValue() : 0;
        String repeatType = (String) body.get("repeatType");
        String dueDate = (String) body.get("dueDate");
        boolean ok = todoService.update(id, content, importance, repeatType, dueDate);
        return ok ? ApiResponse.ok(null) : ApiResponse.fail("更新失败");
    }

    @PutMapping("/{id}/done")
    public ApiResponse<Void> setDone(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        Boolean done = body.get("done");
        if (done == null) return ApiResponse.fail("参数缺失");
        boolean ok = todoService.setDone(id, done);
        return ok ? ApiResponse.ok(null) : ApiResponse.fail("操作失败");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        boolean ok = todoService.delete(id);
        return ok ? ApiResponse.ok(null) : ApiResponse.fail("删除失败");
    }
}
