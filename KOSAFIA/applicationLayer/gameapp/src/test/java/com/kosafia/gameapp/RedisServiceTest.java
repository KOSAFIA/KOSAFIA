// package com.kosafia.gameapp;

// import static org.junit.jupiter.api.Assertions.assertEquals;

// import org.junit.jupiter.api.BeforeEach;
// import org.junit.jupiter.api.Test;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.boot.test.context.SpringBootTest;

// import com.kosafia.gameapp.services.gameroom.RedisService;



// @SpringBootTest
// public class RedisServiceTest {
// @Autowired
//     private RedisService redisService;

//     @BeforeEach
//     public void setup() {
//         // 테스트 전에 Redis에 있는 데이터를 초기화할 수 있습니다.
//         redisService.deleteData("test_key");

//     }

//     @Test
//     public void testSaveAndGetData() {
//         // 데이터 저장
//         redisService.saveData("test_key", "Hello, Redis!");

//         // 데이터 조회
//         String result = redisService.getData("test_key");

//         // 결과 검증
//         assertEquals("Hello, Redis!", result);
//     }

//     @Test
//     public void testDeleteData() {
//         // 데이터 저장
//         redisService.saveData("test_key", "Hello, Redis!");

//         // 데이터 삭제
//         redisService.deleteData("test_key");

//         // 데이터 조회 (삭제 후 null 확인)
//         String result = redisService.getData("test_key");
//         assertEquals(null, result);
//     }
// }
