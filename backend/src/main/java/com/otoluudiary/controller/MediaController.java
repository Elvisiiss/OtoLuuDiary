package com.otoluudiary.controller;

import com.otoluudiary.model.DiaryMedia;
import com.otoluudiary.service.MediaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

/**
 * 媒体文件上传接口
 * 前缀：/api/media
 */
@RestController
@RequestMapping("/media")
@CrossOrigin
public class MediaController {

    private final MediaService mediaService;

    @Autowired
    public MediaController(MediaService mediaService) {
        this.mediaService = mediaService;
    }

    /**
     * POST /api/media/upload?diaryId=xxx
     * 上传图片或视频，返回文件记录
     */
    @PostMapping("/upload")
    public ApiResponse<DiaryMedia> upload(@RequestParam String diaryId,
                                          @RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ApiResponse.fail("请选择要上传的文件");
        }
        // 校验文件类型
        String contentType = file.getContentType();
        if (contentType == null || (!contentType.startsWith("image/") && !contentType.startsWith("video/"))) {
            return ApiResponse.fail("仅支持上传图片和视频文件");
        }
        // 限制大小：图片 10MB，视频 100MB
        long maxSize = contentType.startsWith("video/") ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
        if (file.getSize() > maxSize) {
            String limit = contentType.startsWith("video/") ? "100MB" : "10MB";
            return ApiResponse.fail("文件大小不能超过 " + limit);
        }

        try {
            DiaryMedia media = mediaService.upload(diaryId, file);
            return ApiResponse.ok("上传成功", media);
        } catch (IOException e) {
            return ApiResponse.fail("文件上传失败：" + e.getMessage());
        }
    }

    /**
     * GET /api/media/diary/{diaryId}
     * 查询某篇日记的全部媒体
     */
    @GetMapping("/diary/{diaryId}")
    public ApiResponse<List<DiaryMedia>> listByDiary(@PathVariable String diaryId) {
        return ApiResponse.ok(mediaService.findByDiaryId(diaryId));
    }

    /**
     * DELETE /api/media/{id}
     * 删除单个媒体文件
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable String id) {
        boolean ok = mediaService.delete(id);
        return ok ? ApiResponse.ok("删除成功") : ApiResponse.fail("文件不存在");
    }
}
