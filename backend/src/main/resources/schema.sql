-- ============================================
-- OtoLuuDiary 建表脚本
-- 每次启动自动执行（IF NOT EXISTS，已存在则跳过，安全）
-- ============================================

CREATE TABLE IF NOT EXISTS diary (
    id          VARCHAR(36)  NOT NULL COMMENT '日记唯一ID（UUID）',
    title       VARCHAR(200) NOT NULL COMMENT '日记标题',
    content     MEDIUMTEXT            COMMENT '日记正文',
    tags        JSON                  COMMENT '标签列表，JSON 数组，如 ["生活","旅游"]',
    weather     VARCHAR(50)           COMMENT '天气，如 晴、小雨',
    mood        VARCHAR(50)           COMMENT '心情，如 开心、平静',
    created_at  BIGINT                COMMENT '创建时间（毫秒时间戳）',
    updated_at  BIGINT                COMMENT '最后修改时间（毫秒时间戳）',
    PRIMARY KEY (id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COMMENT = '日记表';
