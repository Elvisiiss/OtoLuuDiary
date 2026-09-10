package com.otoluudiary.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.otoluudiary.controller.ApiResponse;
import com.otoluudiary.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * 认证拦截器
 * 拦截需要登录的接口，验证 Token 有效性
 *
 * 放行规则（不需要 Token）：
 *   - /auth/login  （登录接口本身）
 *   - /auth/check  （检查状态接口）
 *   - /health      （健康检查接口）
 */
@Component
public class AuthInterceptor implements HandlerInterceptor {

    @Autowired
    private AuthService authService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String uri = request.getRequestURI();

        // 放行不需要认证的接口
        if (isPublicUri(uri)) {
            return true;
        }

        // 提取 Token：优先从 Authorization 头获取，其次从请求参数获取
        String token = extractToken(request);

        if (token != null && authService.validateToken(token)) {
            // Token 有效，刷新过期时间（滑动过期）
            authService.refreshToken(token);
            return true;
        }

        // Token 无效或缺失，返回 401
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json;charset=UTF-8");
        ApiResponse<Void> body = ApiResponse.fail("未登录或 Token 已过期，请重新登录");
        response.getWriter().write(objectMapper.writeValueAsString(body));
        return false;
    }

    /** 判断是否为公开接口（不需要 Token） */
    private boolean isPublicUri(String uri) {
        // 去掉 context-path 前缀 /api 后的部分
        String path = uri.replaceFirst("/api", "");
        return path.equals("/auth/login")
                || path.equals("/auth/check")
                || path.equals("/health");
    }

    /** 从请求中提取 Token */
    private String extractToken(HttpServletRequest request) {
        // 1. 先从 Authorization 头提取（格式：Bearer <token>）
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        // 2. 再从请求参数提取（兼容 GET 请求或特殊场景）
        return request.getParameter("token");
    }
}
