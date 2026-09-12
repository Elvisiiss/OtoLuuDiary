package com.otoluudiary.service;

import com.otoluudiary.mapper.TodoMediaMapper;
import com.otoluudiary.model.TodoMedia;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Service
public class TodoMediaService {

    @Autowired
    private TodoMediaMapper todoMediaMapper;

    @Value("${otoluudiary.upload.dir:uploads}")
    private String uploadDir;

    public List<TodoMedia> listByTodoId(Long todoId) {
        return todoMediaMapper.findByTodoId(todoId);
    }

    public TodoMedia upload(Long todoId, MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) throw new IOException("文件为空");

        String originalName = file.getOriginalFilename();
        String ext = "";
        if (originalName != null && originalName.contains(".")) {
            ext = originalName.substring(originalName.lastIndexOf('.'));
        }
        String newName = UUID.randomUUID().toString().replace("-", "") + ext;

        String type = file.getContentType();
        String fileType = "image";
        if (type != null && type.startsWith("video/")) fileType = "video";

        // 保存文件
        String dirPath = uploadDir + File.separator + "todo";
        File dir = new File(dirPath);
        if (!dir.exists()) dir.mkdirs();
        File dest = new File(dir, newName);
        file.transferTo(dest);

        // 记录数据库
        TodoMedia media = new TodoMedia();
        media.setTodoId(todoId);
        media.setFileName(originalName);
        media.setFilePath("todo/" + newName);
        media.setFileType(fileType);
        media.setFileSize(file.getSize());
        media.setCreatedAt(System.currentTimeMillis());
        todoMediaMapper.insert(media);
        return media;
    }

    public boolean delete(Long id) {
        return todoMediaMapper.deleteById(id, System.currentTimeMillis()) > 0;
    }
}
