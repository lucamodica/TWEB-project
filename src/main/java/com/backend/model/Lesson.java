package com.backend.model;

import com.backend.utilities.GenericUtils;

import java.util.regex.Pattern;

/**
 * <b>Lesson</b> model
 */
public class Lesson {

    private String teacher;
    private String t_slot;
    private String day;
    private String status;
    private String user;
    private String course;

    public Lesson(String teacher, String t_slot, String day,
                  String status, String user, String course) {
        this.teacher = teacher;
        this.t_slot = t_slot;
        this.day = day;
        this.status = status;
        this.user = user;
        this.course = course;
    }
    //Constructor with empty attributes values for queries
    public Lesson() {
        this.teacher = "";
        this.t_slot = "";
        this.day = "";
        this.status = "";
        this.user = "";
        this.course = "";
    }
    //Constructor used in especially in the LJT modal one
    public Lesson(Lesson l) {
        this.teacher = l.getTeacher();
        this.t_slot = l.getT_slot();
        this.day = l.getDay();
        this.status = l.getStatus();
        this.user = l.getUser();
        this.course = l.getCourse();
    }
    //Constructor with the only table primary key
    public Lesson(String teacher, String t_slot, String day,
                  String user){
        this.teacher = teacher;
        this.t_slot = t_slot;
        this.day = day;
        this.user = user;
    }

    public String getTeacher() {
        return teacher;
    }

    public void setTeacher(String teacher) {
        this.teacher = teacher;
    }

    public String getUser() {
        return user;
    }

    public void setUser(String user) {
        this.user = user;
    }

    public String getCourse() {
        return course;
    }

    public void setCourse(String course) {
        this.course = course;
    }

    public String getT_slot() {
        return t_slot;
    }

    public void setT_slot(String t_slot) {
        this.t_slot = t_slot;
    }

    public String getDay() {
        return day;
    }

    public void setDay(String day) {
        this.day = day;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public static boolean checks(Lesson lesson){
        return GenericUtils.getLessonTimeSlots().contains(lesson.getT_slot()) &&
                GenericUtils.getLessonDays().contains(lesson.getDay()) &&
                GenericUtils.getLessonStatus().contains(lesson.getStatus()) &&
                Pattern.matches("[0-9]+", lesson.getTeacher());
    }

    @Override
    public String toString() {
        return "Lesson{" +
                "teacher='" + teacher + '\'' +
                ", t_slot='" + t_slot + '\'' +
                ", day='" + day + '\'' +
                ", status='" + status + '\'' +
                ", user='" + user + '\'' +
                ", course='" + course + '\'' +
                '}';
    }
}
