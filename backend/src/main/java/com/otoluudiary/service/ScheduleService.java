package com.otoluudiary.service;

import com.otoluudiary.mapper.ScheduleMapper;
import com.otoluudiary.model.Schedule;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ScheduleService {

    @Autowired
    private ScheduleMapper scheduleMapper;

    public List<Schedule> list(String userId) {
        return scheduleMapper.findByUserId(userId);
    }

    public Schedule create(String userId, String name, Integer dayOfWeek, Integer timeSlot, String location) {
        Schedule schedule = new Schedule();
        schedule.setUserId(userId);
        schedule.setName(name);
        schedule.setDayOfWeek(dayOfWeek);
        schedule.setTimeSlot(timeSlot);
        schedule.setLocation(location);
        schedule.setCreatedAt(System.currentTimeMillis());
        scheduleMapper.insert(schedule);
        return schedule;
    }

    public boolean delete(Long id) {
        return scheduleMapper.deleteById(id) > 0;
    }
}
