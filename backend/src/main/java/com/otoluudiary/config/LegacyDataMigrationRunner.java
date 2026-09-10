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
 * 首次连上 MySQL、diary 表为空时，把旧版 TXT 文件里的历史日记自动导入数据库。
 * 旧数据没有 user_id，会设为 null（属于"无主数据"）。
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
                        // 旧数据没有 user_id，设为 null
                        if (diary.getUserId() == null) {
                            diary.setUserId(null);
                        }
                        diaryMapper.insert(diary);
                        imported++;
                    }
                } catch (Exception e) {
                    log.warn("跳过无法识别的旧数据行：{}", line, e);
                }
            }
            log.info("旧数据迁移完成：从 {} 共导入 {} 条日记到 MySQL", dataFile.toAbsolutePath(), imported);
        } catch (Exception e) {
            log.warn("旧数据迁移过程中出现异常（不影响正常使用）：{}", e.getMessage(), e);
        }
    }

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
