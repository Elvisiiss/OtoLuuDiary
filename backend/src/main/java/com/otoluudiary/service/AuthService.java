package com.otoluudiary.service;

import com.otoluudiary.mapper.UserMapper;
import com.otoluudiary.model.User;
import com.otoluudiary.util.BCryptUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

/**
 * 认证服务
 * 使用 Redis 存储登录 Token，实现会话管理
 * Token 中存储 userId:phone:nickname 格式
 */
@Service
public class AuthService {

    private static final String TOKEN_PREFIX = "auth:token:";
    private static final String USER_TOKEN_PREFIX = "auth:user:";

    @Autowired
    private StringRedisTemplate redisTemplate;

    @Autowired
    private UserMapper userMapper;

    /** Token 有效期（小时），从配置文件读取，默认 72 小时（3天） */
    @Value("${otoluudiary.auth.token-expire-hours:72}")
    private long tokenExpireHours;

    /**
     * 手机号+密码登录
     * @return Token 字符串，失败返回 null
     */
    public String loginByPhone(String phone, String password) {
        User user = userMapper.findByPhone(phone);
        if (user == null) {
            return null;
        }
        if (!BCryptUtil.matches(password, user.getPassword())) {
            return null;
        }
        return login(user.getId(), user.getPhone(), user.getNickname());
    }

    /**
     * 生成 Token 并存储（注册成功后也可调用）
     * @param userId 用户ID
     * @param phone 手机号
     * @param nickname 昵称
     * @return Token
     */
    public String login(String userId, String phone, String nickname) {
        String token = UUID.randomUUID().toString().replace("-", "");

        // 踢掉该用户旧会话
        String oldToken = redisTemplate.opsForValue().get(USER_TOKEN_PREFIX + userId);
        if (oldToken != null) {
            redisTemplate.delete(TOKEN_PREFIX + oldToken);
        }

        // Token 存储: "userId:phone:nickname"
        String value = userId + ":" + phone + ":" + (nickname != null ? nickname : "");
        redisTemplate.opsForValue().set(TOKEN_PREFIX + token, value, tokenExpireHours, TimeUnit.HOURS);
        redisTemplate.opsForValue().set(USER_TOKEN_PREFIX + userId, token, tokenExpireHours, TimeUnit.HOURS);

        return token;
    }

    /**
     * 验证 Token 是否有效
     */
    public boolean validateToken(String token) {
        if (token == null || token.isEmpty()) {
            return false;
        }
        String value = redisTemplate.opsForValue().get(TOKEN_PREFIX + token);
        return value != null;
    }

    /**
     * 从 Token 中获取 userId
     */
    public String getUserId(String token) {
        String value = redisTemplate.opsForValue().get(TOKEN_PREFIX + token);
        if (value == null) return null;
        return value.split(":")[0];
    }

    /**
     * 从 Token 中获取 nickname
     */
    public String getNickname(String token) {
        String value = redisTemplate.opsForValue().get(TOKEN_PREFIX + token);
        if (value == null) return null;
        String[] parts = value.split(":");
        return parts.length > 2 ? parts[2] : "";
    }

    /**
     * 登出
     */
    public void logout(String token) {
        if (token != null && !token.isEmpty()) {
            String value = redisTemplate.opsForValue().get(TOKEN_PREFIX + token);
            redisTemplate.delete(TOKEN_PREFIX + token);
            if (value != null) {
                String userId = value.split(":")[0];
                redisTemplate.delete(USER_TOKEN_PREFIX + userId);
            }
        }
    }

    /**
     * 刷新 Token 有效期（滑动过期）
     */
    public void refreshToken(String token) {
        if (token != null && !token.isEmpty()) {
            redisTemplate.expire(TOKEN_PREFIX + token, tokenExpireHours, TimeUnit.HOURS);
            String value = redisTemplate.opsForValue().get(TOKEN_PREFIX + token);
            if (value != null) {
                String userId = value.split(":")[0];
                redisTemplate.expire(USER_TOKEN_PREFIX + userId, tokenExpireHours, TimeUnit.HOURS);
            }
        }
    }
}
