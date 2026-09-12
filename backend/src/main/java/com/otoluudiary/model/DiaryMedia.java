package com.otoluudiary.model;

import java.util.UUID;

/**
 * 日记媒体文件模型
 * 对应 diary_media 表
 */
public class DiaryMedia {

    private String id;
    private String diaryId;
    private String fileName;
    private String filePath;
    private String fileType;
    private Long fileSize;
    private Long createdAt;
    private Boolean isDeleted;
    private Long deletedAt;

    public DiaryMedia() {
    }

    public static DiaryMedia createNew(String diaryId, String fileName,
                                        String filePath, String fileType, Long fileSize) {
        DiaryMedia media = new DiaryMedia();
        media.setId(UUID.randomUUID().toString());
        media.setDiaryId(diaryId);
        media.setFileName(fileName);
        media.setFilePath(filePath);
        media.setFileType(fileType);
        media.setFileSize(fileSize);
        media.setCreatedAt(System.currentTimeMillis());
        return media;
    }

    // ========== Getter / Setter ==========

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getDiaryId() {
        return diaryId;
    }

    public void setDiaryId(String diaryId) {
        this.diaryId = diaryId;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public Long getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Long createdAt) {
        this.createdAt = createdAt;
    }

    public Boolean getIsDeleted() {
        return isDeleted;
    }

    public void setIsDeleted(Boolean isDeleted) {
        this.isDeleted = isDeleted;
    }

    public Long getDeletedAt() {
        return deletedAt;
    }

    public void setDeletedAt(Long deletedAt) {
        this.deletedAt = deletedAt;
    }
}
