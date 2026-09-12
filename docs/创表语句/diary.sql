-- ============================================
-- 日记表（diary）
-- 存储用户创建的日记条目
-- ============================================

CREATE TABLE IF NOT EXISTS diary (
    id              VARCHAR(36)  NOT NULL COMMENT '日记唯一ID（UUID）',
    user_id         VARCHAR(36)  DEFAULT NULL COMMENT '所属用户ID',
    title           VARCHAR(200) NOT NULL COMMENT '日记标题',
    content         MEDIUMTEXT            COMMENT '日记正文（HTML富文本）',
    tags            JSON                  COMMENT '标签列表，JSON 数组，如 ["生活","旅游"]',
    weather         VARCHAR(50)           COMMENT '天气，如 晴、小雨',
    mood            VARCHAR(50)           COMMENT '心情，如 开心、平静',
    importance      TINYINT      DEFAULT 0 COMMENT '重要度 0-5（0=未设置，1=最低，5=最高）',
    location        VARCHAR(200)          COMMENT '位置信息，如 北京市朝阳区',
    background_image VARCHAR(500)         COMMENT '卡片背景图片URL',
    diary_date      BIGINT                COMMENT '日记日期（当天0点毫秒时间戳，由用户选择或按4:00规则默认）',
    created_at      BIGINT                COMMENT '创建时间（毫秒时间戳）',
    updated_at      BIGINT                COMMENT '最后修改时间（毫秒时间戳）',
    is_deleted      TINYINT(1)   NOT NULL DEFAULT 0 COMMENT '是否已删除 0=否 1=是',
    deleted_at      BIGINT       DEFAULT NULL COMMENT '删除时间（毫秒时间戳）',
    PRIMARY KEY (id),
    INDEX idx_user_id (user_id),
    INDEX idx_importance (importance),
    INDEX idx_is_deleted (is_deleted)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COMMENT = '日记表';

-- 兼容已有库：添加新字段（已存在会报错，由 continue-on-error 忽略）
ALTER TABLE diary ADD COLUMN importance TINYINT DEFAULT 0 COMMENT '重要度 0-5' AFTER mood;
ALTER TABLE diary ADD COLUMN location VARCHAR(200) COMMENT '位置信息' AFTER importance;
ALTER TABLE diary ADD COLUMN background_image VARCHAR(500) COMMENT '卡片背景图片URL' AFTER location;
ALTER TABLE diary ADD COLUMN diary_date BIGINT COMMENT '日记日期（当天0点毫秒时间戳）' AFTER background_image;

-- 兼容已有库：添加假删除字段
ALTER TABLE diary ADD COLUMN is_deleted TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否已删除 0=否 1=是';
ALTER TABLE diary ADD COLUMN deleted_at BIGINT DEFAULT NULL COMMENT '删除时间（毫秒时间戳）';
ALTER TABLE diary ADD INDEX idx_is_deleted (is_deleted);
