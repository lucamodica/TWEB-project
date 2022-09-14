package com.backend.model;

/**
 * <b>AJT (AffiliationJoinTeacher)</b> model
 */
public class AJT extends Affilation {

    private String name;
    private String surname;

    //Constructor with empty attributes values for queries
    public AJT() {
        super();
        this.name ="";
        this.surname ="";
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
                "  name='" + name + '\'' +
                ", surname='" + surname + '\'' +
                '}';
    }
}
