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
 *   POST /auth/login    登录（手机号+密码，返回 Token）
 *   POST /auth/logout   登出（删除 Token）
 *   GET  /auth/check    检查 Token 是否有效
 */
@RestController
@RequestMapping("/auth")
@CrossOrigin
public class AuthController {

    @Autowired
    private AuthService authService;

    /** POST /api/auth/login - 登录（手机号+密码） */
    @PostMapping("/login")
    public ApiResponse<Map<String, String>> login(@RequestBody Map<String, String> body) {
        String phone = body.get("phone");
        String password = body.get("password");

        if (phone == null || phone.trim().isEmpty()) {
            return ApiResponse.fail("请输入手机号");
        }
        if (password == null || password.isEmpty()) {
            return ApiResponse.fail("请输入密码");
        }

        String token = authService.loginByPhone(phone.trim(), password);
        if (token == null) {
            return ApiResponse.fail("手机号或密码错误");
        }

        // 获取用户信息
        String userId = authService.getUserId(token);
        String nickname = authService.getNickname(token);

        Map<String, String> data = new HashMap<>();
        data.put("token", token);
        data.put("userId", userId);
        data.put("nickname", nickname != null ? nickname : "");
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
        if (valid) {
            data.put("userId", authService.getUserId(token));
            data.put("nickname", authService.getNickname(token));
        }
        return valid ? ApiResponse.ok(data) : ApiResponse.fail("未登录或 Token 已过期", data);
    }

    private String extractToken(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }
}
