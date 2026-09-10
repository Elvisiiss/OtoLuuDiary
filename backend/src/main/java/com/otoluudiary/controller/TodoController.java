package com.otoluudiary.controller;

import com.otoluudiary.model.Todo;
import com.otoluudiary.model.TodoCompletion;
import com.otoluudiary.model.TodoMedia;
import com.otoluudiary.service.TodoService;
import com.otoluudiary.service.TodoCompletionService;
import com.otoluudiary.service.TodoMediaService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/todos")
public class TodoController {

    @Autowired private TodoService todoService;
    @Autowired private TodoCompletionService completionService;
    @Autowired private TodoMediaService mediaService;

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
        String title = (String) body.get("title");
        if (title == null || title.isBlank()) return ApiResponse.fail("标题不能为空");
        String description = (String) body.get("description");
        Integer importance = body.get("importance") != null ? ((Number) body.get("importance")).intValue() : 0;
        String repeatType = (String) body.get("repeatType");
        String repeatConfig = (String) body.get("repeatConfig");
        String repeatEndType = (String) body.get("repeatEndType");
        String repeatEndValue = (String) body.get("repeatEndValue");
        String dueDate = (String) body.get("dueDate");
        return ApiResponse.ok(todoService.create(userId, title, description, importance,
                repeatType, repeatConfig, repeatEndType, repeatEndValue, dueDate));
    }

    @PutMapping("/{id}")
    public ApiResponse<Void> update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        String title = (String) body.get("title");
        if (title == null || title.isBlank()) return ApiResponse.fail("标题不能为空");
        String description = (String) body.get("description");
        Integer importance = body.get("importance") != null ? ((Number) body.get("importance")).intValue() : 0;
        String repeatType = (String) body.get("repeatType");
        String repeatConfig = (String) body.get("repeatConfig");
        String repeatEndType = (String) body.get("repeatEndType");
        String repeatEndValue = (String) body.get("repeatEndValue");
        String dueDate = (String) body.get("dueDate");
        boolean ok = todoService.update(id, title, description, importance,
                repeatType, repeatConfig, repeatEndType, repeatEndValue, dueDate);
        return ok ? ApiResponse.ok(null) : ApiResponse.fail("更新失败");
    }

    @PutMapping("/{id}/done")
    public ApiResponse<Void> setDone(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Object doneObj = body.get("done");
        if (doneObj == null) return ApiResponse.fail("参数缺失");
        boolean done = (Boolean) doneObj;
        boolean ok = todoService.setDone(id, done);
        return ok ? ApiResponse.ok(null) : ApiResponse.fail("操作失败");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        boolean ok = todoService.delete(id);
        return ok ? ApiResponse.ok(null) : ApiResponse.fail("删除失败");
    }

    // ========== 完成记录 ==========

    @GetMapping("/{id}/completions")
    public ApiResponse<List<TodoCompletion>> listCompletions(@PathVariable Long id) {
        return ApiResponse.ok(completionService.listByTodoId(id));
    }

    @PostMapping("/{id}/completions")
    public ApiResponse<TodoCompletion> addCompletion(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String note = body.get("note");
        return ApiResponse.ok(completionService.create(id, note));
    }

    @DeleteMapping("/completions/{completionId}")
    public ApiResponse<Void> deleteCompletion(@PathVariable Long completionId) {
        return completionService.delete(completionId) ? ApiResponse.ok(null) : ApiResponse.fail("删除失败");
    }

    // ========== 媒体文件 ==========

    @GetMapping("/{id}/media")
    public ApiResponse<List<TodoMedia>> listMedia(@PathVariable Long id) {
        return ApiResponse.ok(mediaService.listByTodoId(id));
    }

    @PostMapping("/{id}/media")
    public ApiResponse<TodoMedia> uploadMedia(@PathVariable Long id,
                                               @RequestParam("file") MultipartFile file) {
        try {
            return ApiResponse.ok(mediaService.upload(id, file));
        } catch (IOException e) {
            return ApiResponse.fail("上传失败: " + e.getMessage());
        }
    }

    @DeleteMapping("/media/{mediaId}")
    public ApiResponse<Void> deleteMedia(@PathVariable Long mediaId) {
        return mediaService.delete(mediaId) ? ApiResponse.ok(null) : ApiResponse.fail("删除失败");
    }
}
