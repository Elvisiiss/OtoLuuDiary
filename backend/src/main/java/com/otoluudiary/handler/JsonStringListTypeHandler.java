package com.otoluudiary.handler;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.ibatis.type.BaseTypeHandler;
import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.MappedTypes;

import java.sql.CallableStatement;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

/**
 * MyBatis 类型处理器：把 Java 的 List&lt;String&gt;（标签列表）和数据库的 JSON 字符串互相转换。
 *
 * 写入时：["生活","旅游"]  ->  '["生活","旅游"]'（存进 MySQL 的 JSON 列）
 * 读取时：'["生活","旅游"]' ->  ["生活","旅游"]
 *
 * 在 Mapper XML 中通过 typeHandler=... 指定给 tags 列使用。
 */
@MappedTypes(List.class)
public class JsonStringListTypeHandler extends BaseTypeHandler<List<String>> {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    /** 写入数据库：List -> JSON 字符串 */
    @Override
    public void setNonNullParameter(PreparedStatement ps, int i,
                                    List<String> parameter, JdbcType jdbcType) throws SQLException {
        try {
            ps.setString(i, OBJECT_MAPPER.writeValueAsString(parameter));
        } catch (Exception e) {
            throw new SQLException("标签列表转换为 JSON 失败：" + parameter, e);
        }
    }

    /** 读取数据库（按列名）：JSON 字符串 -> List */
    @Override
    public List<String> getNullableResult(ResultSet rs, String columnName) throws SQLException {
        return parseJson(rs.getString(columnName));
    }

    /** 读取数据库（按列序号）：JSON 字符串 -> List */
    @Override
    public List<String> getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
        return parseJson(rs.getString(columnIndex));
    }

    /** 存储过程出参用，本项目用不到，但必须实现 */
    @Override
    public List<String> getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
        return parseJson(cs.getString(columnIndex));
    }

    /** JSON 字符串解析为 List；空值/空串返回空列表，保证前端永远拿到数组 */
    private List<String> parseJson(String json) throws SQLException {
        if (json == null || json.isBlank()) {
            return List.of();
        }
        try {
            return OBJECT_MAPPER.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            throw new SQLException("JSON 解析为标签列表失败：" + json, e);
        }
    }
}
