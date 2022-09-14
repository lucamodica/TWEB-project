package com.backend.model;

/**
 * <b>Teacher</b> model
 */
public class Teacher {

    private String id_number;
    private String name;
    private String surname;

    public Teacher(String ID_number, String name, String surname) {
        this.id_number = ID_number;
        this.name = name;
        this.surname = surname;
    }
    //Constructor with empty attributes values for queries
    public Teacher(){
        this.id_number = "";
        this.name = "";
        this.surname = "";
    }

    public String getId_number() {
        return id_number;
    }

    public void setId_number(String id_number) {
        this.id_number = id_number;
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
        return "ID_number=" + id_number +
                ", name='" + name + '\'' +
                ", surname='" + surname + '\'';
    }
}
