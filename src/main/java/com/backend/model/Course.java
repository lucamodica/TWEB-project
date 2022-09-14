package com.backend.model;

/**
 * <b>Affilation</b> model
 */
public class Course {

    private String title;
    private String desc;

    public Course(String title, String desc) {
        this.title = title;
        this.desc = desc;
    }

    public Course() {
        this.title = "";
        this.desc = "";
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDesc() {
        return desc;
    }

    public void setDesc(String desc) {
        this.desc = desc;
    }

    @Override
    public String toString() {
        return "Course{" +
                "title=" + title +
                ", desc='" + desc + '\'' +
                '}';
    }
}
