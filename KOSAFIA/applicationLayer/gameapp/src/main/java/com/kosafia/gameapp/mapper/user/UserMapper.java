package com.kosafia.gameapp.mapper.user;

import com.kosafia.gameapp.models.user.User;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface UserMapper {
    User findByEmail(String email); // XML의 id와 일치

    void insertUser(User user); // 새로운 사용자 추가 메서드

    // 사용자 업데이트 메서드
    void updateUser(User user);

    // 회원 탈퇴: 사용자 상태(status)를 비활성화(0)로 업데이트
    void deactivateUser(@Param("userId") long userId);

    User findByProviderId(String providerId); // 구글 providerId로 사용자 찾기

}