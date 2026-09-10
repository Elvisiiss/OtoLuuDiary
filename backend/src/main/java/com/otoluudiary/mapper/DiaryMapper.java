package com.otoluudiary.mapper;

import com.otoluudiary.model.Diary;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 日记数据访问层（MyBatis Mapper）
 */
@Mapper
public interface DiaryMapper {

    /** 查询指定用户的全部日记（按创建时间倒序） */
    List<Diary> findAll(@Param("userId") String userId);

    /** 按 ID 查询单条，找不到返回 null */
    Diary findById(@Param("id") String id);

    /** 新增一条日记 */
    int insert(Diary diary);

    /** 按 ID 更新一条日记，返回受影响行数（0 表示 ID 不存在） */
    int update(Diary diary);

    /** 按 ID 删除，返回受影响行数（0 表示 ID 不存在） */
    int deleteById(@Param("id") String id);

    /** 关键词搜索（标题或正文包含关键词），限定用户 */
    List<Diary> searchByKeyword(@Param("userId") String userId, @Param("keyword") String keyword);

    /** 按标签筛选，限定用户 */
    List<Diary> filterByTag(@Param("userId") String userId, @Param("tag") String tag);

    /** 获取指定用户的所有已使用的标签（去重、排序） */
    List<String> findAllTags(@Param("userId") String userId);

    /** 统计日记总数（首次启动判断是否需要迁移旧数据用） */
    long count();
}
