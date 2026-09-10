package com.otoluudiary.model;

import java.util.UUID;

/**
 * 用户数据模型
 */
public class User {

    private String id;
    private String phone;
    private String password;
    private String nickname;
    private Long createdAt;

    public User() {}

    /** 注册新用户时使用 */
    public static User createNew(String phone, String password, String nickname) {
        User user = new User();
        user.setId(UUID.randomUUID().toString());
        user.setPhone(phone);
        user.setPassword(password);
        user.setNickname(nickname != null ? nickname : "");
        user.setCreatedAt(System.currentTimeMillis());
        return user;
    }

    // ========== Getter / Setter ==========

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getNickname() { return nickname; }
    public void setNickname(String nickname) { this.nickname = nickname; }

    public Long getCreatedAt() { return createdAt; }
    public void setCreatedAt(Long createdAt) { this.createdAt = createdAt; }
}
