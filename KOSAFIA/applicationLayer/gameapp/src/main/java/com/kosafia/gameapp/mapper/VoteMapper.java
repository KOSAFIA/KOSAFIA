package com.kosafia.gameapp.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import com.kosafia.gameapp.dto.MafiaVoteDto;

import io.lettuce.core.dynamic.annotation.Param;

@Mapper
public interface VoteMapper {
    @Insert("INSERT INTO Vote (turn_id, voter_id, target_id, vote_type, voted_at) VALUES (#{turnId}, #{voterId}, #{targetId}, #{voteType}, NOW())")
    void insertVote(MafiaVoteDto mafiaVoteDto);

    @Delete("DELETE FROM Vote WHERE turn_id = #{turnId} AND voter_id = #{voterId}")
    void deletePreviousVote(@Param("turnId") int turnId, @Param("voterId") int voterId);

    @Select("SELECT target_id AS targetId, COUNT(*) AS votes FROM Vote WHERE turn_id = #{turnId} AND vote_type = 'mafia' GROUP BY target_id")
    List<Map<String, Object>> getVoteResultsByTurn(@Param("turnId") int turnId);
}