-- CREATE DATABASE kosafia_db;
-- DROP DATABASE kosafia_db;
use kosafia_db;

CREATE TABLE `Users` (
    `user_id` INT NOT NULL AUTO_INCREMENT COMMENT '사용자 ID',
    `room_id` INT NOT NULL COMMENT '방 ID',
    `user_email` VARCHAR(50) NOT NULL COMMENT '사용자 이메일',
    `username` VARCHAR(50) NOT NULL COMMENT '사용자 이름',
    `password` VARCHAR(100) NOT NULL COMMENT '비밀번호',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '1: 활동, 0: 탈퇴',
    `is_ready` BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'TRUE: 준비 상태, FALSE: 미준비 상태',
    PRIMARY KEY (`user_id`, `room_id`)
);

CREATE TABLE `GameRoom` (
    `room_id` INT NOT NULL AUTO_INCREMENT COMMENT '방 ID',
    `user_id` INT NOT NULL COMMENT '생성자 사용자 ID',
    `room_name` VARCHAR(50) NOT NULL COMMENT '방 이름',
    `current_players` INT NOT NULL DEFAULT 0 COMMENT '현재 플레이어 수',
    `is_private` BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'TRUE: 비공개방, FALSE: 공개방',
    `room_password` VARCHAR(50) NOT NULL COMMENT '방 비밀번호',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '방 생성 시간',
    `updated_at` TIMESTAMP NULL COMMENT '방 업데이트 시간',
    PRIMARY KEY (`room_id`, `user_id`)
);

CREATE TABLE `GameSessions` (
    `session_id` INT NOT NULL AUTO_INCREMENT COMMENT '세션 ID',
    `room_id` INT NOT NULL COMMENT '방 ID',
    `status` ENUM('waiting', 'ongoing', 'ended') NOT NULL DEFAULT 'waiting' COMMENT 'waiting: 게임 진행 전, ongoing: 게임 진행 중, ended: 게임 종료',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '세션 생성 시간',
    `ended_at` TIMESTAMP NULL COMMENT '세션 종료 시간',
    PRIMARY KEY (`session_id`, `room_id`)
);

CREATE TABLE `Turn` (
    `turn_id` INT NOT NULL AUTO_INCREMENT COMMENT '턴 ID',
    `session_id` INT NOT NULL COMMENT '세션 ID',
    `turn_number` INT NOT NULL COMMENT '턴 번호',
    `turn_type` ENUM('night', 'day', 'mafia_vote', 'execution_vote') NOT NULL COMMENT 'night: 밤, day: 낮, mafia_vote: 마피아 투표, execution_vote: 사형 투표',
    `start_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '턴 시작 시간',
    `end_time` TIMESTAMP NULL COMMENT '턴 종료 시간',
    PRIMARY KEY (`turn_id`, `session_id`)
);

CREATE TABLE `Roles` (
    `role_id` INT NOT NULL AUTO_INCREMENT COMMENT '역할 ID',
    `role_name` ENUM('mafia', 'doctor', 'police', 'citizen', 'observer') NOT NULL COMMENT '역할 이름',
    PRIMARY KEY (`role_id`)
);

CREATE TABLE `MafiaVote` (
    `mafia_vote_id` INT NOT NULL AUTO_INCREMENT COMMENT '마피아 투표 ID',
    `turn_id` INT NOT NULL COMMENT '턴 ID',
    `voter_id` INT NOT NULL COMMENT '투표한 사용자 ID',
    `voted_user_id` INT NOT NULL COMMENT '투표 대상 사용자 ID',
    PRIMARY KEY (`mafia_vote_id`, `turn_id`)
);

CREATE TABLE `UserRole` (
    `user_role_id` INT NOT NULL AUTO_INCREMENT COMMENT '사용자 역할 ID',
    `user_id` INT NOT NULL COMMENT '사용자 ID',
    `session_id` INT NOT NULL COMMENT '세션 ID',
    `role_id` INT NOT NULL COMMENT '역할 ID',
    `is_alive` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'TRUE: 생존, FALSE: 사망',
    PRIMARY KEY (`user_role_id`, `user_id`, `session_id`, `role_id`)
);

CREATE TABLE `ExecutionVote` (
    `execution_vote_id` INT NOT NULL AUTO_INCREMENT COMMENT '사형 투표 ID',
    `turn_id` INT NOT NULL COMMENT '턴 ID',
    `voter_id` INT NOT NULL COMMENT '투표한 사용자 ID',
    `vote_choice` ENUM('agree', 'disagree') NOT NULL DEFAULT 'agree' COMMENT 'agree: 찬성, disagree: 반대',
    PRIMARY KEY (`execution_vote_id`, `turn_id`)
);

CREATE TABLE `Timer` (
    `timer_id` INT NOT NULL AUTO_INCREMENT COMMENT '타이머 ID',
    `turn_id` INT NOT NULL COMMENT '턴 ID',
    `duration_seconds` INT NOT NULL DEFAULT 60 COMMENT '지정된 시간(초 단위)',
    `is_adjustable` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'TRUE: 시간 조절 가능, FALSE: 시간 고정',
    PRIMARY KEY (`timer_id`, `turn_id`)
);

ALTER TABLE `Users` 
ADD CONSTRAINT `FK_GameRoom_TO_Users` FOREIGN KEY (`room_id`) REFERENCES `GameRoom` (`room_id`);

ALTER TABLE `GameRoom` 
ADD CONSTRAINT `FK_Users_TO_GameRoom` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`);

ALTER TABLE `GameSessions` 
ADD CONSTRAINT `FK_GameRoom_TO_GameSessions` FOREIGN KEY (`room_id`) REFERENCES `GameRoom` (`room_id`);

ALTER TABLE `Turn` 
ADD CONSTRAINT `FK_GameSessions_TO_Turn` FOREIGN KEY (`session_id`) REFERENCES `GameSessions` (`session_id`);

ALTER TABLE `MafiaVote` 
ADD CONSTRAINT `FK_Turn_TO_MafiaVote` FOREIGN KEY (`turn_id`) REFERENCES `Turn` (`turn_id`);

ALTER TABLE `UserRole` 
ADD CONSTRAINT `FK_Users_TO_UserRole` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`);

ALTER TABLE `UserRole` 
ADD CONSTRAINT `FK_GameSessions_TO_UserRole` FOREIGN KEY (`session_id`) REFERENCES `GameSessions` (`session_id`);

ALTER TABLE `UserRole` 
ADD CONSTRAINT `FK_Roles_TO_UserRole` FOREIGN KEY (`role_id`) REFERENCES `Roles` (`role_id`);

ALTER TABLE `ExecutionVote` 
ADD CONSTRAINT `FK_Turn_TO_ExecutionVote` FOREIGN KEY (`turn_id`) REFERENCES `Turn` (`turn_id`);

ALTER TABLE `Timer` 
ADD CONSTRAINT `FK_Turn_TO_Timer` FOREIGN KEY (`turn_id`) REFERENCES `Turn` (`turn_id`);
