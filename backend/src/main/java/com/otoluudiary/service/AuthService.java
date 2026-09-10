package com.otoluudiary.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

/**
 * 认证服务
 * 使用 Redis 存储登录 Token，实现会话管理
 */
@Service
public class AuthService {

    private static final String TOKEN_PREFIX = "auth:token:";
    private static final String USER_TOKEN_PREFIX = "auth:user:";

    @Autowired
    private StringRedisTemplate redisTemplate;

    /** Token 有效期（小时），从配置文件读取，默认 72 小时（3天） */
    @Value("${otoluudiary.auth.token-expire-hours:72}")
    private long tokenExpireHours;

    /** 管理员密码，从配置文件读取 */
    @Value("${otoluudiary.auth.password:123456}")
    private String adminPassword;

    /**
     * 登录验证并生成 Token
     * @param password 密码
     * @return Token 字符串，密码错误返回 null
     */
    public String login(String password) {
        if (!adminPassword.equals(password)) {
            return null;
        }

        // 生成随机 Token
        String token = UUID.randomUUID().toString().replace("-", "");

        // 先清除该用户旧的 Token（同一时间只允许一个有效会话）
        String oldToken = redisTemplate.opsForValue().get(USER_TOKEN_PREFIX + "admin");
        if (oldToken != null) {
            redisTemplate.delete(TOKEN_PREFIX + oldToken);
        }

        // 存储 Token -> 用户名，设置过期时间
        redisTemplate.opsForValue().set(TOKEN_PREFIX + token, "admin", tokenExpireHours, TimeUnit.HOURS);
        // 存储 用户 -> 当前Token（用于踢掉旧会话）
        redisTemplate.opsForValue().set(USER_TOKEN_PREFIX + "admin", token, tokenExpireHours, TimeUnit.HOURS);

        return token;
    }

    /**
     * 验证 Token 是否有效
     * @param token Token 字符串
     * @return 有效返回 true
     */
    public boolean validateToken(String token) {
        if (token == null || token.isEmpty()) {
            return false;
        }
        String user = redisTemplate.opsForValue().get(TOKEN_PREFIX + token);
        return user != null;
    }

    /**
     * 登出，删除 Token
     * @param token Token 字符串
     */
    public void logout(String token) {
        if (token != null && !token.isEmpty()) {
            redisTemplate.delete(TOKEN_PREFIX + token);
            redisTemplate.delete(USER_TOKEN_PREFIX + "admin");
        }
    }

    /**
     * 刷新 Token 有效期（每次有效请求后调用，实现"滑动过期"）
     * @param token Token 字符串
     */
    public void refreshToken(String token) {
        if (token != null && !token.isEmpty()) {
            redisTemplate.expire(TOKEN_PREFIX + token, tokenExpireHours, TimeUnit.HOURS);
            redisTemplate.expire(USER_TOKEN_PREFIX + "admin", tokenExpireHours, TimeUnit.HOURS);
        }
    }
}
