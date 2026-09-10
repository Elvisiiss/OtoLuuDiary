package com.otoluudiary.mapper;

import com.otoluudiary.model.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * 用户数据访问层
 */
@Mapper
public interface UserMapper {

    /** 新增用户 */
    int insert(User user);

    /** 按手机号查找用户 */
    User findByPhone(@Param("phone") String phone);

    /** 按 ID 查找用户 */
    User findById(@Param("id") String id);
}
