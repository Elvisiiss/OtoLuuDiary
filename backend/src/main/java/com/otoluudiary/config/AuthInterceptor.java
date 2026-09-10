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
 * 验证 Token 有效性，并将 userId 存入 request attribute
 *
 * 放行规则（不需要 Token）：
 *   - /auth/login
 *   - /auth/check
 *   - /user/register
 *   - /health
 */
@Component
public class AuthInterceptor implements HandlerInterceptor {

    public static final String ATTR_USER_ID = "currentUserId";

    @Autowired
    private AuthService authService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String uri = request.getRequestURI();

        if (isPublicUri(uri)) {
            return true;
        }

        String token = extractToken(request);

        if (token != null && authService.validateToken(token)) {
            authService.refreshToken(token);
            // 将 userId 存入 request，Controller 可通过 request.getAttribute 获取
            String userId = authService.getUserId(token);
            request.setAttribute(ATTR_USER_ID, userId);
            return true;
        }

        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json;charset=UTF-8");
        ApiResponse<Void> body = ApiResponse.fail("未登录或 Token 已过期，请重新登录");
        response.getWriter().write(objectMapper.writeValueAsString(body));
        return false;
    }

    private boolean isPublicUri(String uri) {
        String path = uri.replaceFirst("/api", "");
        return path.equals("/auth/login")
                || path.equals("/auth/check")
                || path.equals("/user/register")
                || path.equals("/health");
    }

    private String extractToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return request.getParameter("token");
    }
}
