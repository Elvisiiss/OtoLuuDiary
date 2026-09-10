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

    /** 所属用户ID */
    private String userId;

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

    /** 重要度 0-5（0=未设置，1=最低，5=最高） */
    private Integer importance;

    /** 位置信息，如 "北京市朝阳区" */
    private String location;

    /** 卡片背景图片URL */
    private String backgroundImage;

    /** 日记日期（当天0点毫秒时间戳，由用户选择或按4:00规则默认） */
    private Long diaryDate;

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
    public static Diary createNew(String userId, String title, String content,
                                   List<String> tags, String weather, String mood,
                                   Integer importance, String location, String backgroundImage,
                                   Long diaryDate) {
        Diary diary = new Diary();
        diary.setId(UUID.randomUUID().toString());
        diary.setUserId(userId);
        diary.setTitle(title);
        diary.setContent(content);
        diary.setTags(tags != null ? tags : List.of());
        diary.setWeather(weather);
        diary.setMood(mood);
        diary.setImportance(importance != null ? importance : 0);
        diary.setLocation(location);
        diary.setBackgroundImage(backgroundImage);
        diary.setDiaryDate(diaryDate);
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

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
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

    public Integer getImportance() {
        return importance;
    }

    public void setImportance(Integer importance) {
        this.importance = importance;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getBackgroundImage() {
        return backgroundImage;
    }

    public void setBackgroundImage(String backgroundImage) {
        this.backgroundImage = backgroundImage;
    }

    public Long getDiaryDate() {
        return diaryDate;
    }

    public void setDiaryDate(Long diaryDate) {
        this.diaryDate = diaryDate;
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
