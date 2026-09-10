package com.otoluudiary.controller;

import com.otoluudiary.model.CalendarPlan;
import com.otoluudiary.service.CalendarPlanService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/plans")
public class CalendarPlanController {

    @Autowired
    private CalendarPlanService planService;

    private String getCurrentUserId(HttpServletRequest request) {
        return (String) request.getAttribute("currentUserId");
    }

    @GetMapping
    public ApiResponse<List<CalendarPlan>> list(HttpServletRequest request,
                                                  @RequestParam int year, @RequestParam int month) {
        String userId = getCurrentUserId(request);
        if (userId == null) return ApiResponse.fail("用户未登录");
        return ApiResponse.ok(planService.listByMonth(userId, year, month));
    }

    @PostMapping
    public ApiResponse<CalendarPlan> create(HttpServletRequest request, @RequestBody Map<String, String> body) {
        String userId = getCurrentUserId(request);
        if (userId == null) return ApiResponse.fail("用户未登录");
        String planDate = body.get("planDate");
        String content = body.get("content");
        if (planDate == null || planDate.isBlank()) return ApiResponse.fail("日期不能为空");
        if (content == null || content.isBlank()) return ApiResponse.fail("内容不能为空");
        return ApiResponse.ok(planService.create(userId, planDate, content));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        boolean ok = planService.delete(id);
        return ok ? ApiResponse.ok(null) : ApiResponse.fail("删除失败");
    }
}
