package com.otoluudiary.controller;

/**
 * 统一 API 响应结构
 * 所有接口都返回这个格式，方便前端统一处理
 *
 * 格式示例：
 * {
 *   "success": true,
 *   "message": "操作成功",
 *   "data": { ... }
 * }
 */
public class ApiResponse<T> {

    /** 是否成功 */
    private boolean success;

    /** 提示消息 */
    private String message;

    /** 业务数据 */
    private T data;

    // ========== 构造方法 ==========

    public ApiResponse() {}

    public ApiResponse(boolean success, String message, T data) {
        this.success = success;
        this.message = message;
        this.data = data;
    }

    // ========== 便捷工厂方法 ==========

    /** 成功，带数据 */
    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(true, "操作成功", data);
    }

    /** 成功，带数据和自定义消息 */
    public static <T> ApiResponse<T> ok(String message, T data) {
        return new ApiResponse<>(true, message, data);
    }

    /** 成功，无数据 */
    public static <T> ApiResponse<T> ok(String message) {
        return new ApiResponse<>(true, message, null);
    }

    /** 失败，带错误消息 */
    public static <T> ApiResponse<T> fail(String message) {
        return new ApiResponse<>(false, message, null);
    }

    /** 失败，带错误消息和错误数据 */
    public static <T> ApiResponse<T> fail(String message, T data) {
        return new ApiResponse<>(false, message, data);
    }

    // ========== Getter / Setter ==========

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }
}
