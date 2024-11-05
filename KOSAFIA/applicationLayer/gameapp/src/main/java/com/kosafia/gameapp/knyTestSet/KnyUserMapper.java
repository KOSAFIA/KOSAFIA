package com.kosafia.gameapp.knytestset;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface KnyUserMapper {

    KnyUserDTO findUserByEmail(String email);
}
