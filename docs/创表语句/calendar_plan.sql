-- 计划月历表
CREATE TABLE IF NOT EXISTS `calendar_plan` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    `user_id` VARCHAR(64) NOT NULL COMMENT '所属用户',
    `plan_date` VARCHAR(10) NOT NULL COMMENT '计划日期 yyyy-MM-dd',
    `content` VARCHAR(200) NOT NULL COMMENT '计划内容',
    `created_at` BIGINT NOT NULL COMMENT '创建时间戳(ms)',
    `is_deleted` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否已删除 0=否 1=是',
    `deleted_at` BIGINT DEFAULT NULL COMMENT '删除时间（毫秒时间戳）',
    PRIMARY KEY (`id`),
    INDEX `idx_plan_user_date` (`user_id`, `plan_date`),
    INDEX `idx_is_deleted` (`is_deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='计划月历';
