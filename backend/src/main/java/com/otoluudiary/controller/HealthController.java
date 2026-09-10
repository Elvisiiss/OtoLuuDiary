package com.otoluudiary.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * 健康检查接口
 * 用于验证数据库和 Redis 连接状态
 */
@RestController
public class HealthController {

    @Autowired
    private StringRedisTemplate redisTemplate;

    /** GET /api/health - 检查后端及各组件连接状态 */
    @GetMapping("/health")
    public ApiResponse<Map<String, Object>> health() {
        Map<String, Object> status = new HashMap<>();
        status.put("backend", "running");
        status.put("time", LocalDateTime.now().toString());

        // 测试 Redis 连接
        try {
            String pong = redisTemplate.getConnectionFactory().getConnection().ping();
            status.put("redis", "connected (" + pong + ")");
        } catch (Exception e) {
            status.put("redis", "disconnected: " + e.getMessage());
        }

        return ApiResponse.ok(status);
    }
}
