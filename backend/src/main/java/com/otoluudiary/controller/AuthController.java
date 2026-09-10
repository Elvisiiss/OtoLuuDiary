package com.otoluudiary.controller;

import com.otoluudiary.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 认证 API
 *
 * 接口清单：
 *   POST /auth/login    登录（密码验证，返回 Token）
 *   POST /auth/logout   登出（删除 Token）
 *   GET  /auth/check    检查 Token 是否有效
 */
@RestController
@RequestMapping("/auth")
@CrossOrigin
public class AuthController {

    @Autowired
    private AuthService authService;

    /** POST /api/auth/login - 登录 */
    @PostMapping("/login")
    public ApiResponse<Map<String, String>> login(@RequestBody Map<String, String> body) {
        String password = body.get("password");
        if (password == null || password.isEmpty()) {
            return ApiResponse.fail("请输入密码");
        }

        String token = authService.login(password);
        if (token == null) {
            return ApiResponse.fail("密码错误");
        }

        Map<String, String> data = new HashMap<>();
        data.put("token", token);
        return ApiResponse.ok("登录成功", data);
    }

    /** POST /api/auth/logout - 登出 */
    @PostMapping("/logout")
    public ApiResponse<Void> logout(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        String token = extractToken(authHeader);
        if (token != null) {
            authService.logout(token);
        }
        return ApiResponse.ok("已登出");
    }

    /** GET /api/auth/check - 检查登录状态 */
    @GetMapping("/check")
    public ApiResponse<Map<String, Object>> check(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        String token = extractToken(authHeader);
        boolean valid = authService.validateToken(token);

        Map<String, Object> data = new HashMap<>();
        data.put("loggedIn", valid);
        return valid ? ApiResponse.ok(data) : ApiResponse.fail("未登录或 Token 已过期", data);
    }

    /**
     * 从 Authorization 头提取 Token
     * 格式：Bearer <token>
     */
    private String extractToken(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }
}
