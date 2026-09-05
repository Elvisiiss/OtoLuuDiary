package com.otoluudiary.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.otoluudiary.mapper.DiaryMapper;
import com.otoluudiary.model.Diary;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

/**
 * 旧数据迁移（一次性）
 *
 * 首次连上 MySQL、diary 表为空时，把旧版 TXT 文件（data/diaries.txt，每行一条 JSON）
 * 里的历史日记自动导入数据库。
 * 数据库已有数据，或找不到 TXT 文件时自动跳过，所以每次启动执行都是安全的。
 */
@Component
public class LegacyDataMigrationRunner implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(LegacyDataMigrationRunner.class);

    private final DiaryMapper diaryMapper;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${otoluudiary.data.file:../data/diaries.txt}")
    private String dataFilePathConfig;

    public LegacyDataMigrationRunner(DiaryMapper diaryMapper) {
        this.diaryMapper = diaryMapper;
    }

    @Override
    public void run(String... args) {
        try {
            if (diaryMapper.count() > 0) {
                log.info("数据库中已有日记数据，跳过 TXT 旧数据迁移");
                return;
            }

            Path dataFile = resolveDataFilePath();
            if (dataFile == null || !Files.exists(dataFile)) {
                log.info("未找到旧数据文件（{}），跳过迁移", dataFilePathConfig);
                return;
            }

            int imported = 0;
            List<String> lines = Files.readAllLines(dataFile, StandardCharsets.UTF_8);
            for (String line : lines) {
                if (line == null || line.trim().isEmpty()) {
                    continue;
                }
                try {
                    Diary diary = objectMapper.readValue(line, new TypeReference<Diary>() {});
                    if (diary != null && diary.getId() != null) {
                        diaryMapper.insert(diary);
                        imported++;
                    }
                } catch (Exception e) {
                    log.warn("跳过无法识别的旧数据行：{}", line, e);
                }
            }
            log.info("旧数据迁移完成：从 {} 共导入 {} 条日记到 MySQL", dataFile.toAbsolutePath(), imported);
        } catch (Exception e) {
            // 迁移失败不阻止应用启动
            log.warn("旧数据迁移过程中出现异常（不影响正常使用）：{}", e.getMessage(), e);
        }
    }

    /**
     * 解析旧数据文件路径（逻辑与旧版 DiaryRepository 保持一致）：
     * 配置支持绝对路径；相对路径优先相对运行目录，运行目录是 backend 时再找上一级项目根目录。
     */
    private Path resolveDataFilePath() {
        Path configured = Paths.get(dataFilePathConfig);
        if (configured.isAbsolute()) {
            return configured;
        }
        Path userDir = Paths.get(System.getProperty("user.dir"));
        Path resolved = userDir.resolve(configured).normalize();
        if (!Files.exists(resolved.getParent())) {
            Path projectRoot = userDir.getFileName().toString().equalsIgnoreCase("backend")
                    ? userDir.getParent() : userDir;
            resolved = projectRoot.resolve("data").resolve("diaries.txt");
        }
        return resolved;
    }
}
