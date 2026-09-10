-- ============================================
-- 日记媒体表索引
-- ============================================

-- 主键索引：id（建表时自动创建）
-- ALTER TABLE diary_media ADD PRIMARY KEY (id);

-- 普通索引：按日记ID查询（建表时已包含）
-- ALTER TABLE diary_media ADD INDEX idx_diary_id (diary_id);

-- 说明：
-- idx_diary_id：查询某篇日记的所有媒体文件，是核心索引
