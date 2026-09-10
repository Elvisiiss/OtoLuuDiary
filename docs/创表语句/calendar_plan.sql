-- 计划月历表
CREATE TABLE IF NOT EXISTS `calendar_plan` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    `user_id` VARCHAR(64) NOT NULL COMMENT '所属用户',
    `plan_date` VARCHAR(10) NOT NULL COMMENT '计划日期 yyyy-MM-dd',
    `content` VARCHAR(200) NOT NULL COMMENT '计划内容',
    `created_at` BIGINT NOT NULL COMMENT '创建时间戳(ms)',
    PRIMARY KEY (`id`),
    INDEX `idx_plan_user_date` (`user_id`, `plan_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='计划月历';
