package com.backend.model;

/**
 * <b>Affilation</b> model
 */
public class Affilation {

    private String teacher_id;
    private String course_title;

    public Affilation(String teacher_id, String course_title) {
        this.teacher_id = teacher_id;
        this.course_title = course_title;
    }
    //Constructor with empty attributes values for queries
    public Affilation() {
        this.teacher_id = "";
        this.course_title = "";
    }

    public String getTeacher_id() {
        return teacher_id;
    }

    public void setTeacher_id(String teacher_id) {
        this.teacher_id = teacher_id;
    }

    public String getCourse_title() {
        return course_title;
    }

    public void setCourse_title(String course_title) {
        this.course_title = course_title;
    }

    @Override
    public String toString() {
        return "Affilation{" +
                "teacher_id='" + teacher_id + '\'' +
                ", course_title='" + course_title + '\'' +
                '}';
    }
}
