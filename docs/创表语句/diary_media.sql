-- ============================================
-- 日记媒体表（diary_media）
-- 存储日记关联的图片/视频等媒体文件
-- ============================================

CREATE TABLE IF NOT EXISTS diary_media (
    id              VARCHAR(36)  NOT NULL COMMENT '媒体文件ID（UUID）',
    diary_id        VARCHAR(36)  NOT NULL COMMENT '所属日记ID',
    file_name       VARCHAR(200) NOT NULL COMMENT '原始文件名',
    file_path       VARCHAR(500) NOT NULL COMMENT '服务器存储路径（相对路径）',
    file_type       VARCHAR(50)  NOT NULL COMMENT 'MIME类型，如 image/jpeg、video/mp4',
    file_size       BIGINT       DEFAULT 0 COMMENT '文件大小（字节）',
    created_at      BIGINT                COMMENT '上传时间（毫秒时间戳）',
    is_deleted      TINYINT(1)   NOT NULL DEFAULT 0 COMMENT '是否已删除 0=否 1=是',
    deleted_at      BIGINT       DEFAULT NULL COMMENT '删除时间（毫秒时间戳）',
    PRIMARY KEY (id),
    INDEX idx_diary_id (diary_id),
    INDEX idx_is_deleted (is_deleted)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COMMENT = '日记媒体文件表';
