package com.otoluudiary.service;

import com.otoluudiary.controller.DiaryCreateRequest;
import com.otoluudiary.controller.DiaryUpdateRequest;
import com.otoluudiary.mapper.DiaryMapper;
import com.otoluudiary.model.Diary;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 日记业务逻辑层
 */
@Service
public class DiaryService {

    private final DiaryMapper diaryMapper;

    @Autowired
    public DiaryService(DiaryMapper diaryMapper) {
        this.diaryMapper = diaryMapper;
    }

    /** 查询指定用户的全部日记（按时间倒序） */
    public List<Diary> findAll(String userId) {
        return diaryMapper.findAll(userId);
    }

    /** 按 ID 查询单条 */
    public Diary findById(String id) {
        return diaryMapper.findById(id);
    }

    /** 新增日记 */
    public Diary create(String userId, DiaryCreateRequest req) {
        Diary diary = Diary.createNew(
                userId,
                req.getTitle(),
                req.getContent(),
                req.getTags(),
                req.getWeather(),
                req.getMood()
        );
        diaryMapper.insert(diary);
        return diary;
    }

    /**
     * 修改日记
     * 规则：请求体里不为 null 的字段才会覆盖原值
     */
    public Diary update(String id, DiaryUpdateRequest req) {
        Diary existing = diaryMapper.findById(id);
        if (existing == null) {
            return null;
        }
        if (req.getTitle() != null) existing.setTitle(req.getTitle());
        if (req.getContent() != null) existing.setContent(req.getContent());
        if (req.getTags() != null) existing.setTags(req.getTags());
        if (req.getWeather() != null) existing.setWeather(req.getWeather());
        if (req.getMood() != null) existing.setMood(req.getMood());
        existing.setUpdatedAt(System.currentTimeMillis());
        diaryMapper.update(existing);
        return existing;
    }

    /** 删除日记；ID 不存在返回 false */
    public boolean deleteById(String id) {
        return diaryMapper.deleteById(id) > 0;
    }

    /** 关键词搜索（限定用户） */
    public List<Diary> searchByKeyword(String userId, String keyword) {
        return diaryMapper.searchByKeyword(userId, keyword);
    }

    /** 按标签筛选（限定用户） */
    public List<Diary> filterByTag(String userId, String tag) {
        return diaryMapper.filterByTag(userId, tag);
    }

    /** 获取指定用户的全部标签 */
    public List<String> findAllTags(String userId) {
        return diaryMapper.findAllTags(userId);
    }
}
