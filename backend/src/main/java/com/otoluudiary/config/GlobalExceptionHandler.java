package com.otoluudiary.config;

import com.otoluudiary.controller.ApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * 全局异常处理
 * Controller 不再逐个 try-catch：数据库等异常统一在这里捕获，返回前端约定的 {success:false,...} 结构
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(Exception.class)
    public ApiResponse<Void> handleException(Exception e) {
        log.error("接口处理失败", e);
        return ApiResponse.fail("服务器处理失败：" + e.getMessage());
    }
}
