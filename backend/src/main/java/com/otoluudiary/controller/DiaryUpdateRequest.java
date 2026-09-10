package com.otoluudiary.controller;

import java.util.List;

/**
 * 修改日记的请求体
 * 所有字段可选，只有不为 null 的字段才会被更新
 */
public class DiaryUpdateRequest {

    private String title;
    private String content;
    private List<String> tags;
    private String weather;
    private String mood;

    /** 重要度 0-5（可选） */
    private Integer importance;

    /** 位置信息（可选） */
    private String location;

    /** 卡片背景图片URL（可选） */
    private String backgroundImage;

    /** 日记日期（可选，毫秒时间戳） */
    private Long diaryDate;

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
}
