package com.otoluudiary.model;

import java.util.List;
import java.util.UUID;

/**
 * 日记数据模型
 * 对应一条日记记录的所有字段
 */
public class Diary {

    /** 日记唯一ID（UUID格式，系统自动生成） */
    private String id;

    /** 日记标题 */
    private String title;

    /** 日记正文（纯文本） */
    private String content;

    /** 标签列表，如 ["工作", "旅游"]，没有则为空列表 */
    private List<String> tags;

    /** 天气（可选），如 "晴"、"小雨" */
    private String weather;

    /** 心情（可选），如 "开心"、"平静" */
    private String mood;

    /** 创建时间（毫秒时间戳，系统自动生成） */
    private Long createdAt;

    /** 最后修改时间（毫秒时间戳，系统自动更新） */
    private Long updatedAt;

    // ========== 构造方法 ==========

    public Diary() {
        // 空构造：Jackson 反序列化需要
    }

    /**
     * 新建日记时使用的构造方法（自动生成 ID 和创建时间）
     */
    public static Diary createNew(String title, String content,
                                   List<String> tags, String weather, String mood) {
        Diary diary = new Diary();
        diary.setId(UUID.randomUUID().toString());
        diary.setTitle(title);
        diary.setContent(content);
        diary.setTags(tags != null ? tags : List.of());
        diary.setWeather(weather);
        diary.setMood(mood);
        long now = System.currentTimeMillis();
        diary.setCreatedAt(now);
        diary.setUpdatedAt(now);
        return diary;
    }

    // ========== Getter / Setter ==========

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    public String getWeather() {
        return weather;
    }

    public void setWeather(String weather) {
        this.weather = weather;
    }

    public String getMood() {
        return mood;
    }

    public void setMood(String mood) {
        this.mood = mood;
    }

    public Long getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Long createdAt) {
        this.createdAt = createdAt;
    }

    public Long getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Long updatedAt) {
        this.updatedAt = updatedAt;
    }

    @Override
    public String toString() {
        return "Diary{id='" + id + "', title='" + title + "', createdAt=" + createdAt + "}";
    }
}
