package com.otoluudiary.mapper;

import com.otoluudiary.model.DiaryMedia;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface DiaryMediaMapper {

    void insert(DiaryMedia media);

    List<DiaryMedia> findByDiaryId(@Param("diaryId") String diaryId);

    int deleteById(@Param("id") String id, @Param("deletedAt") Long deletedAt);

    int deleteByDiaryId(@Param("diaryId") String diaryId, @Param("deletedAt") Long deletedAt);

    DiaryMedia findById(@Param("id") String id);
}
