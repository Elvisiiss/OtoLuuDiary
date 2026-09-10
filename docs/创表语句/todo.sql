-- 待做清单表
CREATE TABLE IF NOT EXISTS `todo` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    `user_id` VARCHAR(64) NOT NULL COMMENT '所属用户',
    `content` VARCHAR(200) NOT NULL COMMENT '待做内容',
    `importance` TINYINT DEFAULT 0 COMMENT '重要度 0-2',
    `repeat_type` VARCHAR(20) DEFAULT NULL COMMENT '循环类型：daily/weekday/weekly/monthly',
    `due_date` VARCHAR(10) DEFAULT NULL COMMENT '截止日期 yyyy-MM-dd',
    `done` TINYINT(1) DEFAULT 0 COMMENT '是否完成 0否1是',
    `created_at` BIGINT NOT NULL COMMENT '创建时间戳(ms)',
    `updated_at` BIGINT NOT NULL COMMENT '更新时间戳(ms)',
    PRIMARY KEY (`id`),
    INDEX `idx_todo_user` (`user_id`),
    INDEX `idx_todo_done` (`user_id`, `done`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='待做清单';
