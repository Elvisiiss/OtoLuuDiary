package com.otoluudiary.model;

public class TodoCompletion {
    private Long id;
    private Long todoId;
    private String note;
    private Long createdAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getTodoId() { return todoId; }
    public void setTodoId(Long todoId) { this.todoId = todoId; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public Long getCreatedAt() { return createdAt; }
    public void setCreatedAt(Long createdAt) { this.createdAt = createdAt; }
}
