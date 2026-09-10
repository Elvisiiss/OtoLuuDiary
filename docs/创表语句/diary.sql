-- ============================================
-- 日记表（diary）
-- 存储用户创建的日记条目
-- ============================================

CREATE TABLE IF NOT EXISTS diary (
    id          VARCHAR(36)  NOT NULL COMMENT '日记唯一ID（UUID）',
    user_id     VARCHAR(36)  DEFAULT NULL COMMENT '所属用户ID',
    title       VARCHAR(200) NOT NULL COMMENT '日记标题',
    content     MEDIUMTEXT            COMMENT '日记正文',
    tags        JSON                  COMMENT '标签列表，JSON 数组，如 ["生活","旅游"]',
    weather     VARCHAR(50)           COMMENT '天气，如 晴、小雨',
    mood        VARCHAR(50)           COMMENT '心情，如 开心、平静',
    diary_date  BIGINT                COMMENT '日记日期（当天0点毫秒时间戳，由用户选择或按4:00规则默认）',
    created_at  BIGINT                COMMENT '创建时间（毫秒时间戳）',
    updated_at  BIGINT                COMMENT '最后修改时间（毫秒时间戳）',
    PRIMARY KEY (id),
    INDEX idx_user_id (user_id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COMMENT = '日记表';
