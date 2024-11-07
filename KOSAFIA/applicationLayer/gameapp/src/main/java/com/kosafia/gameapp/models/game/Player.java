package com.kosafia.gameapp.models.game;

public class Player {
    private String name;
    private Role role;

    public String getName() {
        return name;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public Role getRole() {
        return role;
    }

    @Override
    public String toString() {
        return name + " (" + role + ")";
    }

}
