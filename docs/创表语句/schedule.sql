-- 日程表（课程表样式）
CREATE TABLE IF NOT EXISTS `schedule` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    `user_id` VARCHAR(64) NOT NULL COMMENT '所属用户',
    `name` VARCHAR(50) NOT NULL COMMENT '课程/事项名称',
    `day_of_week` TINYINT NOT NULL COMMENT '星期几 1=周一 7=周日',
    `time_slot` TINYINT NOT NULL COMMENT '时间段 1-10',
    `location` VARCHAR(50) DEFAULT NULL COMMENT '地点',
    `created_at` BIGINT NOT NULL COMMENT '创建时间戳(ms)',
    PRIMARY KEY (`id`),
    INDEX `idx_schedule_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='日程表';
