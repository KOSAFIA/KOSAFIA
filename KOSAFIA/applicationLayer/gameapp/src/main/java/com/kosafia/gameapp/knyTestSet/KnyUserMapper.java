package com.kosafia.gameapp.knyTestSet;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface KnyUserMapper {

    KnyUserDTO findUserByEmail(String email);
}
