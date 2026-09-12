package com.otoluudiary.model;

public class Todo {
    private Long id;
    private String userId;
    private String title;
    private String content;
    private String description;
    private Integer importance;
    private String repeatType;
    private String repeatConfig;
    private String repeatEndType;
    private String repeatEndValue;
    private Integer repeatCount;
    private String dueDate;
    private Boolean done;
    private Long createdAt;
    private Long updatedAt;
    private Boolean isDeleted;
    private Long deletedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Integer getImportance() { return importance; }
    public void setImportance(Integer importance) { this.importance = importance; }
    public String getRepeatType() { return repeatType; }
    public void setRepeatType(String repeatType) { this.repeatType = repeatType; }
    public String getRepeatConfig() { return repeatConfig; }
    public void setRepeatConfig(String repeatConfig) { this.repeatConfig = repeatConfig; }
    public String getRepeatEndType() { return repeatEndType; }
    public void setRepeatEndType(String repeatEndType) { this.repeatEndType = repeatEndType; }
    public String getRepeatEndValue() { return repeatEndValue; }
    public void setRepeatEndValue(String repeatEndValue) { this.repeatEndValue = repeatEndValue; }
    public Integer getRepeatCount() { return repeatCount; }
    public void setRepeatCount(Integer repeatCount) { this.repeatCount = repeatCount; }
    public String getDueDate() { return dueDate; }
    public void setDueDate(String dueDate) { this.dueDate = dueDate; }
    public Boolean getDone() { return done; }
    public void setDone(Boolean done) { this.done = done; }
    public Long getCreatedAt() { return createdAt; }
    public void setCreatedAt(Long createdAt) { this.createdAt = createdAt; }
    public Long getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Long updatedAt) { this.updatedAt = updatedAt; }
    public Boolean getIsDeleted() { return isDeleted; }
    public void setIsDeleted(Boolean isDeleted) { this.isDeleted = isDeleted; }
    public Long getDeletedAt() { return deletedAt; }
    public void setDeletedAt(Long deletedAt) { this.deletedAt = deletedAt; }
}
