package com.otoluudiary.service;

import com.otoluudiary.mapper.DiaryMediaMapper;
import com.otoluudiary.model.DiaryMedia;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

/**
 * 媒体文件业务逻辑层
 */
@Service
public class MediaService {

    private final DiaryMediaMapper diaryMediaMapper;

    @Value("${otoluudiary.upload.dir:uploads}")
    private String uploadDir;

    @Autowired
    public MediaService(DiaryMediaMapper diaryMediaMapper) {
        this.diaryMediaMapper = diaryMediaMapper;
    }

    /**
     * 上传文件并保存记录
     */
    public DiaryMedia upload(String diaryId, MultipartFile file) throws IOException {
        // 确保上传目录存在
        Path dirPath = Paths.get(uploadDir);
        if (!Files.exists(dirPath)) {
            Files.createDirectories(dirPath);
        }

        // 生成唯一文件名，保留原始扩展名
        String originalName = file.getOriginalFilename();
        String ext = "";
        if (originalName != null && originalName.contains(".")) {
            ext = originalName.substring(originalName.lastIndexOf("."));
        }
        String storedName = UUID.randomUUID().toString() + ext;

        // 保存文件
        Path filePath = dirPath.resolve(storedName);
        file.transferTo(filePath.toFile());

        // 记录到数据库
        DiaryMedia media = DiaryMedia.createNew(
                diaryId,
                originalName != null ? originalName : storedName,
                storedName,
                file.getContentType() != null ? file.getContentType() : "application/octet-stream",
                file.getSize()
        );
        diaryMediaMapper.insert(media);
        return media;
    }

    /** 查询某篇日记的全部媒体 */
    public List<DiaryMedia> findByDiaryId(String diaryId) {
        return diaryMediaMapper.findByDiaryId(diaryId);
    }

    /** 删除单个媒体文件（含磁盘文件） */
    public boolean delete(String id) {
        DiaryMedia media = diaryMediaMapper.findById(id);
        if (media == null) return false;

        // 删除磁盘文件
        try {
            Path filePath = Paths.get(uploadDir, media.getFilePath());
            Files.deleteIfExists(filePath);
        } catch (IOException ignored) {
            // 文件删除失败不影响数据库清理
        }

        return diaryMediaMapper.deleteById(id) > 0;
    }

    /** 删除某篇日记的全部媒体 */
    public void deleteByDiaryId(String diaryId) {
        List<DiaryMedia> list = diaryMediaMapper.findByDiaryId(diaryId);
        for (DiaryMedia m : list) {
            try {
                Path filePath = Paths.get(uploadDir, m.getFilePath());
                Files.deleteIfExists(filePath);
            } catch (IOException ignored) {
            }
        }
        diaryMediaMapper.deleteByDiaryId(diaryId);
    }
}
