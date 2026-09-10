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

    public Long getDiaryDate() {
        return diaryDate;
    }

    public void setDiaryDate(Long diaryDate) {
        this.diaryDate = diaryDate;
    }
}
