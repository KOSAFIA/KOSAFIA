package com.kosafia.gameapp.mapper.user;

import com.kosafia.gameapp.models.user.User;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper {
    User findByEmail(String email); // XML의 id와 일치
}