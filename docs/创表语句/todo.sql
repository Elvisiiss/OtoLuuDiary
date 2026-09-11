-- 待做清单表
CREATE TABLE IF NOT EXISTS `todo` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    `user_id` VARCHAR(64) NOT NULL COMMENT '所属用户',
    `title` VARCHAR(100) NOT NULL COMMENT '标题',
    `content` TEXT NOT NULL COMMENT '内容（兼容旧表，与title保持一致）',
    `description` TEXT DEFAULT NULL COMMENT '描述',
    `importance` TINYINT DEFAULT 0 COMMENT '重要度 0-5',
    `repeat_type` VARCHAR(20) DEFAULT NULL COMMENT '循环类型：daily/weekday/weekly/monthly/custom',
    `repeat_config` VARCHAR(500) DEFAULT NULL COMMENT 'JSON循环配置，如{"weekdays":[3,4]}',
    `repeat_end_type` VARCHAR(20) DEFAULT NULL COMMENT '循环结束方式：never/count/date',
    `repeat_end_value` VARCHAR(20) DEFAULT NULL COMMENT '循环结束值：次数或日期yyyy-MM-dd',
    `repeat_count` INT DEFAULT 1 COMMENT '当前循环次数（每次完成+1）',
    `due_date` VARCHAR(10) DEFAULT NULL COMMENT '截止日期 yyyy-MM-dd',
    `done` TINYINT(1) DEFAULT 0 COMMENT '是否完成 0否1是',
    `created_at` BIGINT NOT NULL COMMENT '创建时间戳(ms)',
    `updated_at` BIGINT NOT NULL COMMENT '更新时间戳(ms)',
    PRIMARY KEY (`id`),
    INDEX `idx_todo_user` (`user_id`),
    INDEX `idx_todo_done` (`user_id`, `done`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='待做清单';

-- 待做完成记录表
CREATE TABLE IF NOT EXISTS `todo_completion` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    `todo_id` BIGINT NOT NULL COMMENT '关联待做',
    `note` TEXT DEFAULT NULL COMMENT '完成时的描述',
    `created_at` BIGINT NOT NULL COMMENT '完成时间戳(ms)',
    PRIMARY KEY (`id`),
    INDEX `idx_completion_todo` (`todo_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='待做完成记录';

-- 待做媒体文件表
CREATE TABLE IF NOT EXISTS `todo_media` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    `todo_id` BIGINT NOT NULL COMMENT '关联待做',
    `file_name` VARCHAR(200) NOT NULL COMMENT '文件名',
    `file_path` VARCHAR(500) NOT NULL COMMENT '文件路径',
    `file_type` VARCHAR(20) NOT NULL COMMENT 'image/video',
    `file_size` BIGINT DEFAULT 0 COMMENT '文件大小(bytes)',
    `created_at` BIGINT NOT NULL COMMENT '创建时间戳(ms)',
    PRIMARY KEY (`id`),
    INDEX `idx_media_todo` (`todo_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='待做媒体文件';
