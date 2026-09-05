package com.otoluudiary.controller;

import com.otoluudiary.service.DiaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 标签 API
 */
@RestController
@RequestMapping("/tags")
@CrossOrigin
public class TagController {

    private final DiaryService diaryService;

    @Autowired
    public TagController(DiaryService diaryService) {
        this.diaryService = diaryService;
    }

    /** GET /api/tags - 获取全部已使用的标签（去重后返回） */
    @GetMapping
    public ApiResponse<List<String>> getAllTags() {
        return ApiResponse.ok(diaryService.findAllTags());
    }
}
