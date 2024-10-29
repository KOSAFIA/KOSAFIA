<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Welcome to KOSAFIA</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            background-color: #f0f2f5;
        }
        h1 {
            color: #1a73e8;
            margin-bottom: 20px;
        }
        .game-link {
            display: inline-block;
            padding: 12px 24px;
            background-color: #1a73e8;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            font-weight: bold;
            transition: background-color 0.3s;
        }
        .game-link:hover {
            background-color: #1557b0;
        }
    </style>
</head>
<body>
    <h1>Welcome to KOSAFIA!</h1>
    <a href="/react" class="game-link">Enter Game</a>
</body>
</html>