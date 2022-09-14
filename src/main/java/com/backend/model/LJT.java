package com.backend.model;

/**
 * <b>LJT (LessonJoinTeacher)</b> model
 */
public class LJT extends Lesson{

    private String name;
    private String surname;

    //Constructor with empty attributes values for queries
    public LJT() {
        super();
        this.name = "";
        this.surname = "";
    }
    public LJT(Lesson l, String name, String surname){
        super(l);
        this.name = name;
        this.surname = surname;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSurname() {
        return surname;
    }

    public void setSurname(String surname) {
        this.surname = surname;
    }

    @Override
    public String toString() {
        return "{" + super.toString() +
                "name='" + name + '\'' +
                ", surname='" + surname + '\'' +
                '}';
    }
}