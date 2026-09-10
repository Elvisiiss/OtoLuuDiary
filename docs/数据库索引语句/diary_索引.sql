-- ============================================
-- 日记表索引
-- ============================================

-- 主键索引：id（建表时自动创建）
-- ALTER TABLE diary ADD PRIMARY KEY (id);

-- 普通索引：按用户查询（建表时已包含）
-- ALTER TABLE diary ADD INDEX idx_user_id (user_id);

-- 普通索引：按重要度筛选（建表时已包含）
-- ALTER TABLE diary ADD INDEX idx_importance (importance);

-- 说明：
-- idx_user_id：所有列表/搜索/标签筛选都带 WHERE user_id = ?，是核心索引
-- idx_importance：按重要度过滤时使用
-- 排序使用 COALESCE(diary_date, created_at) DESC，数据量不大时无需额外索引
