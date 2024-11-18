package com.kosafia.gameapp.controllers.socket.game;

import lombok.*;

@Builder
public record ChatMessage(
    String content,
    Integer playerNumber, 
    String username,    
    String role,       
    String type,        
    String imageUrl,    
    String soundUrl,    
    String gameStatus,  
    Integer roomKey     
) {}