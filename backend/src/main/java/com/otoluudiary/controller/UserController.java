package com.otoluudiary.controller;

import com.otoluudiary.mapper.UserMapper;
import com.otoluudiary.model.User;
import com.otoluudiary.service.AuthService;
import com.otoluudiary.util.BCryptUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * 用户 API
 *
 * 接口清单：
 *   POST /user/register   注册（手机号 + 密码）
 *   POST /user/info       获取当前用户信息（需 Token）
 */
@RestController
@RequestMapping("/user")
@CrossOrigin
public class UserController {

    private static final Pattern PHONE_PATTERN = Pattern.compile("^1[3-9]\\d{9}$");

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private AuthService authService;

    /** POST /api/user/register - 注册 */
    @PostMapping("/register")
    public ApiResponse<Map<String, String>> register(@RequestBody Map<String, String> body) {
        String phone = body.get("phone");
        String password = body.get("password");
        String nickname = body.get("nickname");

        // 参数校验
        if (phone == null || phone.trim().isEmpty()) {
            return ApiResponse.fail("请输入手机号");
        }
        if (!PHONE_PATTERN.matcher(phone.trim()).matches()) {
            return ApiResponse.fail("手机号格式不正确");
        }
        if (password == null || password.length() < 6) {
            return ApiResponse.fail("密码不能少于6位");
        }

        // 检查手机号是否已注册
        User existing = userMapper.findByPhone(phone.trim());
        if (existing != null) {
            return ApiResponse.fail("该手机号已注册");
        }

        // 创建用户（密码 BCrypt 加密）
        User user = User.createNew(
                phone.trim(),
                BCryptUtil.hash(password),
                nickname != null ? nickname.trim() : ""
        );
        userMapper.insert(user);

        // 注册成功后自动登录，生成 Token
        String token = authService.login(user.getId(), user.getPhone(), user.getNickname());

        Map<String, String> data = new HashMap<>();
        data.put("token", token);
        data.put("userId", user.getId());
        data.put("phone", user.getPhone());
        data.put("nickname", user.getNickname());
        return ApiResponse.ok("注册成功", data);
    }

    /** GET /api/user/info - 获取当前用户信息（需 Token） */
    @GetMapping("/info")
    public ApiResponse<Map<String, String>> info(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        String token = extractToken(authHeader);
        if (token == null || !authService.validateToken(token)) {
            return ApiResponse.fail("未登录");
        }

        String userId = authService.getUserId(token);
        User user = userMapper.findById(userId);
        if (user == null) {
            return ApiResponse.fail("用户不存在");
        }

        Map<String, String> data = new HashMap<>();
        data.put("userId", user.getId());
        data.put("phone", user.getPhone());
        data.put("nickname", user.getNickname());
        return ApiResponse.ok(data);
    }

    private String extractToken(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }
}
