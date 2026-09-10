-- ============================================
-- OtoLuuDiary 建表脚本
-- 每次启动自动执行（IF NOT EXISTS，已存在则跳过，安全）
-- ============================================

-- 用户表
CREATE TABLE IF NOT EXISTS `user` (
    id          VARCHAR(36)  NOT NULL COMMENT '用户ID（UUID）',
    phone       VARCHAR(20)  NOT NULL COMMENT '手机号',
    password    VARCHAR(100) NOT NULL COMMENT '密码（BCrypt加密）',
    nickname    VARCHAR(50)  DEFAULT '' COMMENT '昵称',
    created_at  BIGINT       COMMENT '注册时间（毫秒时间戳）',
    PRIMARY KEY (id),
    UNIQUE KEY uk_phone (phone)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COMMENT = '用户表';

-- 日记表
CREATE TABLE IF NOT EXISTS diary (
    id          VARCHAR(36)  NOT NULL COMMENT '日记唯一ID（UUID）',
    user_id     VARCHAR(36)  DEFAULT NULL COMMENT '所属用户ID',
    title       VARCHAR(200) NOT NULL COMMENT '日记标题',
    content     MEDIUMTEXT            COMMENT '日记正文',
    tags        JSON                  COMMENT '标签列表，JSON 数组，如 ["生活","旅游"]',
    weather     VARCHAR(50)           COMMENT '天气，如 晴、小雨',
    mood        VARCHAR(50)           COMMENT '心情，如 开心、平静',
    created_at  BIGINT                COMMENT '创建时间（毫秒时间戳）',
    updated_at  BIGINT                COMMENT '最后修改时间（毫秒时间戳）',
    PRIMARY KEY (id),
    INDEX idx_user_id (user_id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COMMENT = '日记表';
