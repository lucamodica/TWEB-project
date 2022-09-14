package com.backend.model;

/**
 * <b>User</b> model
 */
public class User {


    private String account;
    private String password;
    private String role;

    public User(String account, String password, String role) {
        this.account = account;
        this.password = password;
        this.role = role;
    }
    //Constructor for guests
    public User(String role){
        this.account = "";
        this.password = "";
        this.role = role;
    }
    //Constructor with empty attributes values for queries
    public User() {
        this.account = "";
        this.password = "";
        this.role = "";
    }

    public String getAccount() {
        return account;
    }

    public void setAccount(String account) {
        this.account = account;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    @Override
    public String toString() {
        return "{" +
                "account='" + account + '\'' +
                ", password='" + password + '\'' +
                ", role='" + role + '\'' +
                '}';
    }
}
