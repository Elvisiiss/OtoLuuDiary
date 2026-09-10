package com.otoluudiary.controller;

import com.otoluudiary.model.Schedule;
import com.otoluudiary.service.ScheduleService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/schedules")
public class ScheduleController {

    @Autowired
    private ScheduleService scheduleService;

    private String getCurrentUserId(HttpServletRequest request) {
        return (String) request.getAttribute("currentUserId");
    }

    @GetMapping
    public ApiResponse<List<Schedule>> list(HttpServletRequest request) {
        String userId = getCurrentUserId(request);
        if (userId == null) return ApiResponse.fail("用户未登录");
        return ApiResponse.ok(scheduleService.list(userId));
    }

    @PostMapping
    public ApiResponse<Schedule> create(HttpServletRequest request, @RequestBody Map<String, Object> body) {
        String userId = getCurrentUserId(request);
        if (userId == null) return ApiResponse.fail("用户未登录");
        String name = (String) body.get("name");
        if (name == null || name.isBlank()) return ApiResponse.fail("名称不能为空");
        Integer dayOfWeek = body.get("dayOfWeek") != null ? ((Number) body.get("dayOfWeek")).intValue() : null;
        Integer timeSlot = body.get("timeSlot") != null ? ((Number) body.get("timeSlot")).intValue() : null;
        if (dayOfWeek == null || timeSlot == null) return ApiResponse.fail("星期和时间段必填");
        String location = (String) body.get("location");
        return ApiResponse.ok(scheduleService.create(userId, name, dayOfWeek, timeSlot, location));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        boolean ok = scheduleService.delete(id);
        return ok ? ApiResponse.ok(null) : ApiResponse.fail("删除失败");
    }
}
