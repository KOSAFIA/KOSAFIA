package com.kosafia.gameapp.knytestset;


import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class KnyUserDTO {

    private Integer user_id;
    private String user_email;
    private String username;
    private String password;
    private boolean status;
    private boolean timestamp;
}
