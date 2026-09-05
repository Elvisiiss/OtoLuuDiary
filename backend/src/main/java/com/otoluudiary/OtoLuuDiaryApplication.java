package com.otoluudiary;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * OtoLuuDiary 后端启动类
 * 运行 main 方法即可启动整个后端服务
 *
 * 启动后访问地址：http://localhost:8080/api/...
 */
@SpringBootApplication
@MapperScan("com.otoluudiary.mapper")  // 扫描 MyBatis Mapper 接口
public class OtoLuuDiaryApplication {

    public static void main(String[] args) {
        SpringApplication.run(OtoLuuDiaryApplication.class, args);
        System.out.println("============================================");
        System.out.println("  OtoLuuDiary 后端启动成功！");
        System.out.println("  服务地址: http://localhost:8080/api");
        System.out.println("============================================");
    }
}
