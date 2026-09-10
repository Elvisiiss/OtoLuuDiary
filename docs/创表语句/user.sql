-- ============================================
-- 用户表（user）
-- 存储注册用户的基本信息
-- ============================================

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
