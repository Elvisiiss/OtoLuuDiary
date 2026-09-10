package com.otoluudiary.service;

import com.otoluudiary.controller.DiaryCreateRequest;
import com.otoluudiary.controller.DiaryUpdateRequest;
import com.otoluudiary.mapper.DiaryMapper;
import com.otoluudiary.model.Diary;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

/**
 * 日记业务逻辑层
 */
@Service
public class DiaryService {

    private final DiaryMapper diaryMapper;
    private final MediaService mediaService;

    @Autowired
    public DiaryService(DiaryMapper diaryMapper, MediaService mediaService) {
        this.diaryMapper = diaryMapper;
        this.mediaService = mediaService;
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
        Long diaryDate = req.getDiaryDate();
        // 前端未传 diaryDate 时，后端按4:00规则兜底（使用服务器本地时区）
        if (diaryDate == null) {
            diaryDate = computeDefaultDiaryDate();
        }
        Diary diary = Diary.createNew(
                userId,
                req.getTitle(),
                req.getContent(),
                req.getTags(),
                req.getWeather(),
                req.getMood(),
                req.getImportance(),
                req.getLocation(),
                req.getBackgroundImage(),
                diaryDate
        );
        diaryMapper.insert(diary);
        return diary;
    }

    /**
     * 计算默认日记日期：凌晨4:00前算昨天，4:00及以后算今天
     * 返回当天0点的毫秒时间戳
     */
    private long computeDefaultDiaryDate() {
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        LocalDate target = (now.getHour() < 4)
                ? now.toLocalDate().minusDays(1)
                : now.toLocalDate();
        return target.atStartOfDay(ZoneId.systemDefault()).toInstant().toEpochMilli();
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
        if (req.getImportance() != null) existing.setImportance(req.getImportance());
        if (req.getLocation() != null) existing.setLocation(req.getLocation());
        if (req.getBackgroundImage() != null) existing.setBackgroundImage(req.getBackgroundImage());
        if (req.getDiaryDate() != null) existing.setDiaryDate(req.getDiaryDate());
        existing.setUpdatedAt(System.currentTimeMillis());
        diaryMapper.update(existing);
        return existing;
    }

    /** 删除日记（同时删除关联的媒体文件）；ID 不存在返回 false */
    public boolean deleteById(String id) {
        mediaService.deleteByDiaryId(id);
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
