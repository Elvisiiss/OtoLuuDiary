package com.otoluudiary.service;

import com.otoluudiary.mapper.TodoMapper;
import com.otoluudiary.model.Todo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class TodoService {

    @Autowired
    private TodoMapper todoMapper;

    public List<Todo> list(String userId, String filter) {
        if ("today".equals(filter)) {
            return todoMapper.findByUserIdToday(userId, LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE));
        } else if ("week".equals(filter)) {
            LocalDate today = LocalDate.now();
            LocalDate weekEnd = today.plusDays(7 - today.getDayOfWeek().getValue());
            return todoMapper.findByUserIdWeek(userId, today.format(DateTimeFormatter.ISO_LOCAL_DATE), weekEnd.format(DateTimeFormatter.ISO_LOCAL_DATE));
        } else if ("important".equals(filter)) {
            return todoMapper.findByUserIdImportant(userId);
        }
        return todoMapper.findByUserId(userId);
    }

    public Todo getById(Long id) {
        return todoMapper.findById(id);
    }

    public Todo create(String userId, String title, String description, Integer importance,
                        String repeatType, String repeatConfig, String repeatEndType, String repeatEndValue, String dueDate) {
        long now = System.currentTimeMillis();
        Todo todo = new Todo();
        todo.setUserId(userId);
        todo.setTitle(title);
        todo.setContent(title != null ? title : "");
        todo.setDescription(description);
        todo.setImportance(importance != null ? importance : 0);
        todo.setRepeatType(repeatType);
        todo.setRepeatConfig(repeatConfig);
        todo.setRepeatEndType(repeatEndType);
        todo.setRepeatEndValue(repeatEndValue);
        todo.setDueDate(dueDate);
        todo.setDone(false);
        todo.setCreatedAt(now);
        todo.setUpdatedAt(now);
        todoMapper.insert(todo);
        return todo;
    }

    public boolean update(Long id, String title, String description, Integer importance,
                           String repeatType, String repeatConfig, String repeatEndType, String repeatEndValue, String dueDate) {
        Todo existing = todoMapper.findById(id);
        if (existing == null) return false;
        existing.setTitle(title);
        existing.setContent(title != null ? title : "");
        existing.setDescription(description);
        existing.setImportance(importance != null ? importance : 0);
        existing.setRepeatType(repeatType);
        existing.setRepeatConfig(repeatConfig);
        existing.setRepeatEndType(repeatEndType);
        existing.setRepeatEndValue(repeatEndValue);
        existing.setDueDate(dueDate);
        existing.setUpdatedAt(System.currentTimeMillis());
        return todoMapper.update(existing) > 0;
    }

    public boolean setDone(Long id, boolean done) {
        Todo todo = todoMapper.findById(id);
        if (todo == null) return false;

        boolean result = todoMapper.updateDone(id, done, System.currentTimeMillis()) > 0;

        // 标记完成时，如果有循环设置，自动创建下一期待做
        if (result && done && todo.getRepeatType() != null && !todo.getRepeatType().isEmpty()) {
            createNextOccurrence(todo);
        }

        return result;
    }

    /**
     * 根据循环设置自动创建下一期待做
     * 逻辑：以当前todo的创建日为基准，找循环周期中的下一个日期
     */
    private void createNextOccurrence(Todo todo) {
        LocalDate baseDate = LocalDate.ofEpochDay(todo.getCreatedAt() / 86400000L);
        LocalDate today = LocalDate.now();
        LocalDate nextDate = null;

        switch (todo.getRepeatType()) {
            case "daily":
                nextDate = today.plusDays(1);
                break;
            case "weekday":
                nextDate = today.plusDays(1);
                // 跳过周末
                while (nextDate.getDayOfWeek() == DayOfWeek.SATURDAY
                        || nextDate.getDayOfWeek() == DayOfWeek.SUNDAY) {
                    nextDate = nextDate.plusDays(1);
                }
                break;
            case "weekly":
                nextDate = today.plusDays(7);
                break;
            case "monthly":
                nextDate = today.plusMonths(1);
                break;
            case "custom":
                nextDate = calcNextCustomWeekday(baseDate, todo.getRepeatConfig());
                break;
            default:
                return; // 未知循环类型，不创建
        }

        if (nextDate == null) return;

        // 检查循环结束条件
        if (isRepeatEnded(todo, nextDate)) return;

        long now = System.currentTimeMillis();
        Todo next = new Todo();
        next.setUserId(todo.getUserId());
        next.setTitle(todo.getTitle());
        next.setContent(todo.getTitle());
        next.setDescription(todo.getDescription());
        next.setImportance(todo.getImportance());
        next.setRepeatType(todo.getRepeatType());
        next.setRepeatConfig(todo.getRepeatConfig());
        next.setRepeatEndType(todo.getRepeatEndType());
        next.setRepeatEndValue(todo.getRepeatEndValue());
        next.setDueDate(nextDate.format(DateTimeFormatter.ISO_LOCAL_DATE));
        next.setDone(false);
        next.setCreatedAt(nextDate.atStartOfDay(java.time.ZoneId.systemDefault()).toInstant().toEpochMilli());
        next.setUpdatedAt(now);
        todoMapper.insert(next);
    }

    /**
     * 计算自定义星期循环的下一个日期
     * 以 baseDate 的星期为起点，找 weekdays 列表中的下一个
     * 例：baseDate=周二, weekdays=[2,4] -> 周四(本周)
     *     baseDate=周四, weekdays=[2,4] -> 周二(下周)
     */
    private LocalDate calcNextCustomWeekday(LocalDate baseDate, String repeatConfig) {
        if (repeatConfig == null || repeatConfig.isEmpty()) return null;

        List<Integer> weekdays = parseWeekdays(repeatConfig);
        if (weekdays.isEmpty()) return null;

        int baseDay = baseDate.getDayOfWeek().getValue(); // 1=Mon,7=Sun
        int idx = weekdays.indexOf(baseDay);

        if (idx >= 0 && idx < weekdays.size() - 1) {
            // 当前日在列表中且不是最后一个 -> 取下一个
            int diff = weekdays.get(idx + 1) - baseDay;
            return baseDate.plusDays(diff);
        } else {
            // 当前日不在列表中，或是列表最后一个 -> 取下周的第一个
            int firstDay = weekdays.get(0);
            int diff = (firstDay - baseDay + 7) % 7;
            if (diff == 0) diff = 7; // 同一天算下周
            return baseDate.plusDays(diff);
        }
    }

    /**
     * 从 JSON 配置中解析星期列表，排序后返回
     * 输入: {"weekdays":[4,2]} -> 输出: [2, 4]
     */
    private List<Integer> parseWeekdays(String repeatConfig) {
        List<Integer> weekdays = new ArrayList<>();
        try {
            // 简单解析 {"weekdays":[2,4]}
            int start = repeatConfig.indexOf("[");
            int end = repeatConfig.indexOf("]");
            if (start >= 0 && end > start) {
                String nums = repeatConfig.substring(start + 1, end).trim();
                if (!nums.isEmpty()) {
                    for (String s : nums.split(",")) {
                        weekdays.add(Integer.parseInt(s.trim()));
                    }
                }
            }
        } catch (Exception e) {
            // 解析失败返回空
        }
        weekdays.sort(Integer::compareTo);
        return weekdays;
    }

    /**
     * 检查循环是否已结束
     */
    private boolean isRepeatEnded(Todo todo, LocalDate nextDate) {
        if (todo.getRepeatEndType() == null || "never".equals(todo.getRepeatEndType())) {
            return false;
        }
        if ("count".equals(todo.getRepeatEndType()) && todo.getRepeatEndValue() != null) {
            // 剩余次数用完则结束（这里简化处理：用 created_at 推算）
            return false; // 由前端控制，暂不处理
        }
        if ("date".equals(todo.getRepeatEndType()) && todo.getRepeatEndValue() != null) {
            try {
                LocalDate endDate = LocalDate.parse(todo.getRepeatEndValue());
                return nextDate.isAfter(endDate);
            } catch (Exception e) {
                return false;
            }
        }
        return false;
    }

    public boolean delete(Long id) {
        return todoMapper.deleteById(id) > 0;
    }
}
