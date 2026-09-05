package com.otoluudiary.controller;

import com.otoluudiary.model.Diary;
import com.otoluudiary.service.DiaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 日记 REST API 接口层
 *
 * 全部接口前缀：/api （由 application.properties 中 context-path 配置）
 *
 * 接口清单：
 *   GET    /diaries                  全部日记列表
 *   GET    /diaries/{id}             单条日记详情
 *   POST   /diaries                  新增日记
 *   PUT    /diaries/{id}             修改日记
 *   DELETE /diaries/{id}             删除日记
 *   GET    /diaries/search?keyword=  关键词搜索
 *   GET    /diaries/tag?tag=         按标签筛选
 *   GET    /tags                     全部标签列表
 */
@RestController
@RequestMapping("/diaries")
@CrossOrigin
public class DiaryController {

    private final DiaryService diaryService;

    @Autowired
    public DiaryController(DiaryService diaryService) {
        this.diaryService = diaryService;
    }

    // ========== 查询 ==========

    /** GET /api/diaries - 全部日记列表 */
    @GetMapping
    public ApiResponse<List<Diary>> listAll() {
        return ApiResponse.ok(diaryService.findAll());
    }

    /** GET /api/diaries/{id} - 单条日记详情 */
    @GetMapping("/{id}")
    public ApiResponse<Diary> getById(@PathVariable String id) {
        Diary diary = diaryService.findById(id);
        if (diary == null) {
            return ApiResponse.fail("找不到ID为 " + id + " 的日记");
        }
        return ApiResponse.ok(diary);
    }

    // ========== 新增 ==========

    /** POST /api/diaries - 新增日记 */
    @PostMapping
    public ApiResponse<Diary> create(@RequestBody DiaryCreateRequest req) {
        if (!req.isValid()) {
            return ApiResponse.fail(req.validationMessage());
        }
        Diary created = diaryService.create(req);
        return ApiResponse.ok("日记创建成功", created);
    }

    // ========== 修改 ==========

    /** PUT /api/diaries/{id} - 修改日记 */
    @PutMapping("/{id}")
    public ApiResponse<Diary> update(@PathVariable String id,
                                     @RequestBody DiaryUpdateRequest req) {
        Diary updated = diaryService.update(id, req);
        if (updated == null) {
            return ApiResponse.fail("找不到ID为 " + id + " 的日记，修改失败");
        }
        return ApiResponse.ok("日记修改成功", updated);
    }

    // ========== 删除 ==========

    /** DELETE /api/diaries/{id} - 删除日记 */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable String id) {
        boolean ok = diaryService.deleteById(id);
        if (!ok) {
            return ApiResponse.fail("找不到ID为 " + id + " 的日记，删除失败");
        }
        return ApiResponse.ok("日记删除成功");
    }

    // ========== 搜索 / 筛选 ==========

    /** GET /api/diaries/search?keyword=xxx - 关键词搜索 */
    @GetMapping("/search")
    public ApiResponse<List<Diary>> search(@RequestParam(required = false) String keyword) {
        return ApiResponse.ok(diaryService.searchByKeyword(keyword));
    }

    /** GET /api/diaries/tag?tag=xxx - 按标签筛选 */
    @GetMapping("/tag")
    public ApiResponse<List<Diary>> filterByTag(@RequestParam(required = false) String tag) {
        return ApiResponse.ok(diaryService.filterByTag(tag));
    }
}
