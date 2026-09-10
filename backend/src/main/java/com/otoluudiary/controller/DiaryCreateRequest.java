package com.otoluudiary.controller;

import java.util.List;

/**
 * 新增日记的请求体
 * 前端提交这些字段，ID 和时间戳由后端生成
 */
public class DiaryCreateRequest {

    /** 标题（必填） */
    private String title;

    /** 正文（必填） */
    private String content;

    /** 标签（可选，如 ["工作","旅游"]） */
    private List<String> tags;

    /** 天气（可选） */
    private String weather;

    /** 心情（可选） */
    private String mood;

    /** 日记日期（可选，毫秒时间戳，不传则后端按4:00规则默认） */
    private Long diaryDate;

    // ========== 校验：必填字段 ==========
    public boolean isValid() {
        return title != null && !title.trim().isEmpty()
            && content != null && !content.trim().isEmpty();
    }

    public String validationMessage() {
        if (title == null || title.trim().isEmpty()) return "标题不能为空";
        if (content == null || content.trim().isEmpty()) return "正文不能为空";
        return "参数合法";
    }

    // ========== Getter / Setter ==========

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

    public Long getDiaryDate() {
        return diaryDate;
    }

    public void setDiaryDate(Long diaryDate) {
        this.diaryDate = diaryDate;
    }
}
