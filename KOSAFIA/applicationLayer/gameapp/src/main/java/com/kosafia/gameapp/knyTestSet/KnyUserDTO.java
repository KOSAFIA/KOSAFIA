package com.kosafia.gameapp.knyTestSet;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class KnyUserDTO {

    private String email;
    private String name;
    private Integer userpk;
    private Integer roompk;
    private Boolean status;
    private Boolean is_ready;
    private String password;
}
