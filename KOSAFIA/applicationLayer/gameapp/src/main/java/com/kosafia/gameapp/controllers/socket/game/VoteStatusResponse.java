package com.kosafia.gameapp.controllers.socket.game;

import lombok.Builder;
import java.util.Map;

@Builder
public record VoteStatusResponse(
    Map<Integer, Integer> voteStatus
) {}
