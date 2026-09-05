package com.otoluudiary.mapper;

import com.otoluudiary.model.Diary;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 日记数据访问层（MyBatis Mapper）
 *
 * 接口方法不需要写实现，MyBatis 会根据 resources/mapper/DiaryMapper.xml 里的 SQL 自动生成实现。
 * 每个方法对应 XML 中一条 id 相同的 SQL 语句。
 */
@Mapper
public interface DiaryMapper {

    /** 查询全部日记（按创建时间倒序） */
    List<Diary> findAll();

    /** 按 ID 查询单条，找不到返回 null */
    Diary findById(@Param("id") String id);

    /** 新增一条日记 */
    int insert(Diary diary);

    /** 按 ID 更新一条日记，返回受影响行数（0 表示 ID 不存在） */
    int update(Diary diary);

    /** 按 ID 删除，返回受影响行数（0 表示 ID 不存在） */
    int deleteById(@Param("id") String id);

    /** 关键词搜索（标题或正文包含关键词）；keyword 为空时返回全部 */
    List<Diary> searchByKeyword(@Param("keyword") String keyword);

    /** 按标签筛选；tag 为空时返回全部 */
    List<Diary> filterByTag(@Param("tag") String tag);

    /** 获取所有已使用的标签（去重、排序） */
    List<String> findAllTags();

    /** 统计日记总数（首次启动判断是否需要迁移旧数据用） */
    long count();
}
