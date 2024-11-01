-- 데이터베이스 생성
DROP DATABASE kosafia_db;
CREATE DATABASE kosafia_db;
USE kosafia_db;

-- Users 테이블: 사용자 기본 정보
CREATE TABLE `Users` (
    `user_id` INT NOT NULL AUTO_INCREMENT COMMENT '사용자 ID',
    `user_email` VARCHAR(50) NOT NULL UNIQUE COMMENT '사용자 이메일',
    `username` VARCHAR(50) NOT NULL COMMENT '사용자 이름',
    `password` VARCHAR(100) NOT NULL COMMENT '비밀번호',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '1: 활동, 0: 탈퇴',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '계정 생성일',
    PRIMARY KEY (`user_id`)
) COMMENT '사용자 정보 테이블';

-- GameRoom 테이블: 게임방 정보
CREATE TABLE `GameRoom` (
    `room_id` INT NOT NULL AUTO_INCREMENT COMMENT '방 ID',
    `creator_id` INT NOT NULL COMMENT '방장 ID',
    `room_name` VARCHAR(50) NOT NULL COMMENT '방 이름',
    `max_players` INT NOT NULL DEFAULT 8 COMMENT '최대 플레이어 수',
    `current_players` INT NOT NULL DEFAULT 0 COMMENT '현재 플레이어 수',
    `is_private` BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'TRUE: 비공개방, FALSE: 공개방',
    `room_password` VARCHAR(50) NULL COMMENT '방 비밀번호',
    `room_status` ENUM('waiting', 'playing', 'ended') NOT NULL DEFAULT 'waiting' COMMENT '방 상태',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '방 생성 시간',
    `updated_at` TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '방 업데이트 시간',
    PRIMARY KEY (`room_id`),
    FOREIGN KEY (`creator_id`) REFERENCES `Users` (`user_id`)
) COMMENT '게임방 정보 테이블';

-- RoomParticipants 테이블: 방 참가자 정보 (Users와 GameRoom의 다대다 관계 해소)
CREATE TABLE `RoomParticipants` (
    `participant_id` INT NOT NULL AUTO_INCREMENT COMMENT '참가자 ID',
    `room_id` INT NOT NULL COMMENT '방 ID',
    `user_id` INT NOT NULL COMMENT '사용자 ID',
    `is_ready` BOOLEAN NOT NULL DEFAULT FALSE COMMENT '준비 상태',
    `joined_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '입장 시간',
    PRIMARY KEY (`participant_id`),
    UNIQUE KEY `UK_room_user` (`room_id`, `user_id`),
    FOREIGN KEY (`room_id`) REFERENCES `GameRoom` (`room_id`),
    FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`)
) COMMENT '방 참가자 정보 테이블';

-- GameSession 테이블: 게임 세션 정보
CREATE TABLE `GameSession` (
    `session_id` INT NOT NULL AUTO_INCREMENT COMMENT '세션 ID',
    `room_id` INT NOT NULL COMMENT '방 ID',
    `status` ENUM('waiting', 'ongoing', 'ended') NOT NULL DEFAULT 'waiting' COMMENT '게임 상태',
    `started_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '세션 시작 시간',
    `ended_at` TIMESTAMP NULL COMMENT '세션 종료 시간',
    PRIMARY KEY (`session_id`),
    FOREIGN KEY (`room_id`) REFERENCES `GameRoom` (`room_id`)
) COMMENT '게임 세션 정보 테이블';

-- Roles 테이블: 게임 역할 정보
CREATE TABLE `Roles` (
    `role_id` INT NOT NULL AUTO_INCREMENT COMMENT '역할 ID',
    `role_name` ENUM('mafia', 'doctor', 'police', 'citizen', 'observer') NOT NULL COMMENT '역할 이름',
    `description` TEXT NULL COMMENT '역할 설명',
    PRIMARY KEY (`role_id`),
    UNIQUE KEY `UK_role_name` (`role_name`)
) COMMENT '게임 역할 정보 테이블';

-- SessionParticipants 테이블: 게임 세션 참가자 정보
CREATE TABLE `SessionParticipants` (
    `session_participant_id` INT NOT NULL AUTO_INCREMENT COMMENT '세션 참가자 ID',
    `session_id` INT NOT NULL COMMENT '세션 ID',
    `user_id` INT NOT NULL COMMENT '사용자 ID',
    `role_id` INT NOT NULL COMMENT '역할 ID',
    `is_alive` BOOLEAN NOT NULL DEFAULT TRUE COMMENT '생존 상태',
    PRIMARY KEY (`session_participant_id`),
    UNIQUE KEY `UK_session_user` (`session_id`, `user_id`),
    FOREIGN KEY (`session_id`) REFERENCES `GameSession` (`session_id`),
    FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`),
    FOREIGN KEY (`role_id`) REFERENCES `Roles` (`role_id`)
) COMMENT '게임 세션 참가자 정보 테이블';

-- GameTurn 테이블: 게임 턴 정보
CREATE TABLE `GameTurn` (
    `turn_id` INT NOT NULL AUTO_INCREMENT COMMENT '턴 ID',
    `session_id` INT NOT NULL COMMENT '세션 ID',
    `turn_number` INT NOT NULL COMMENT '턴 번호',
    `turn_type` ENUM('night', 'day', 'vote') NOT NULL COMMENT '턴 타입',
    `started_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '턴 시작 시간',
    `ended_at` TIMESTAMP NULL COMMENT '턴 종료 시간',
    `duration_seconds` INT NOT NULL DEFAULT 60 COMMENT '턴 진행 시간(초)',
    PRIMARY KEY (`turn_id`),
    FOREIGN KEY (`session_id`) REFERENCES `GameSession` (`session_id`)
) COMMENT '게임 턴 정보 테이블';

-- Vote 테이블: 투표 정보 (마피아 투표와 처형 투표 통합)
CREATE TABLE `Vote` (
    `vote_id` INT NOT NULL AUTO_INCREMENT COMMENT '투표 ID',
    `turn_id` INT NOT NULL COMMENT '턴 ID',
    `voter_id` INT NOT NULL COMMENT '투표자 ID',
    `target_id` INT NULL COMMENT '투표 대상 ID',
    `vote_type` ENUM('mafia', 'execution') NOT NULL COMMENT '투표 유형',
    `vote_result` ENUM('agree', 'disagree') NULL COMMENT '찬반투표 결과',
    `voted_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '투표 시간',
    PRIMARY KEY (`vote_id`),
    FOREIGN KEY (`turn_id`) REFERENCES `GameTurn` (`turn_id`),
    FOREIGN KEY (`voter_id`) REFERENCES `Users` (`user_id`),
    FOREIGN KEY (`target_id`) REFERENCES `Users` (`user_id`)
) COMMENT '투표 정보 테이블';

-- ChatMessage 테이블: 채팅 메시지 정보
CREATE TABLE `ChatMessage` (
    `message_id` INT NOT NULL AUTO_INCREMENT COMMENT '메시지 ID',
    `room_id` INT NOT NULL COMMENT '방 ID',
    `user_id` INT NOT NULL COMMENT '작성자 ID',
    `message_type` ENUM('normal', 'mafia', 'system') NOT NULL COMMENT '메시지 유형',
    `content` TEXT NOT NULL COMMENT '메시지 내용',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '작성 시간',
    PRIMARY KEY (`message_id`),
    FOREIGN KEY (`room_id`) REFERENCES `GameRoom` (`room_id`),
    FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`)
) COMMENT '채팅 메시지 정보 테이블';

-- GameResult 테이블: 게임 결과 정보
CREATE TABLE `GameResult` (
    `result_id` INT NOT NULL AUTO_INCREMENT COMMENT '결과 ID',
    `session_id` INT NOT NULL COMMENT '세션 ID',
    `winning_team` ENUM('mafia', 'citizen') NOT NULL COMMENT '승리 팀',
    `ended_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '게임 종료 시간',
    PRIMARY KEY (`result_id`),
    FOREIGN KEY (`session_id`) REFERENCES `GameSession` (`session_id`)
) COMMENT '게임 결과 정보 테이블';