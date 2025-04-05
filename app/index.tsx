import React, { useEffect, useState, useCallback } from "react";
import { Text, TouchableOpacity, View, StyleSheet } from "react-native";

// Types for TypeScript
type Square = "X" | "O" | null;
type Winner = "X" | "O" | "draw" | null;

const initialBoard: Square[] = Array(9).fill(null);

const TicTacToeGame = () => {
  const [board, setBoard] = useState<Square[]>(initialBoard);
  const [isPlayerTurn, setIsPlayerTurn] = useState<boolean>(true);
  const [winner, setWinner] = useState<Winner>(null);

  // Check the winner after each board update
  useEffect(() => {
    checkWinner();
  }, [board]);

  // Function to check for a winner or draw
  const checkWinner = useCallback(() => {
    const winningCombinations = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (const [a, b, c] of winningCombinations) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        setWinner(board[a]);
        return;
      }
    }

    // Check if it's a draw
    if (board.every((square) => square !== null)) {
      setWinner("draw");
    }
  }, [board]);

  // Handle square press and update the board
  const handleSquarePress = (index: number) => {
    if (board[index] || winner) return; // Prevent moves after game ends
    const newBoard = [...board];
    newBoard[index] = isPlayerTurn ? "X" : "O";
    setBoard(newBoard);
    setIsPlayerTurn((prev) => !prev); // Switch turn
  };

  // Reset the game to the initial state
  const handleReset = () => {
    setBoard(initialBoard);
    setIsPlayerTurn(true);
    setWinner(null);
  };

  // Render each square with styles and content
  const renderSquare = (index: number) => {
    return (
      <TouchableOpacity
        key={index}
        style={styles.square}
        onPress={() => handleSquarePress(index)}
        disabled={!!board[index] || !!winner}
      >
        <Text style={[styles.squareText, getSquareTextColor(board[index])]}>
          {board[index] || ""}
        </Text>
      </TouchableOpacity>
    );
  };

  // Dynamically change the text color based on the player
  const getSquareTextColor = (value: Square) => ({
    color: value === "X" ? "#435585" : "#E5C3A6",
  });

  // Display the game result message
  const renderResult = () => {
    if (winner) {
      return winner === "draw"
        ? "It's a draw!"
        : `Player ${winner} wins!`;
    }
    return `Player ${isPlayerTurn ? "X" : "O"}'s turn`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.board}>{[...Array(9)].map((_, index) => renderSquare(index))}</View>
      <Text style={styles.result}>{renderResult()}</Text>
      <TouchableOpacity style={styles.button} onPress={handleReset}>
        <Text style={styles.buttonText}>Reset Game</Text>
      </TouchableOpacity>
    </View>
  );
};

// Styles separated for better readability and maintenance
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  board: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: 300,
    height: 300,
    marginBottom: 20,
  },
  square: {
    width: 100,
    height: 100,
    borderWidth: 2,
    borderColor: "#363062",
    justifyContent: "center",
    alignItems: "center",
  },
  squareText: {
    fontSize: 36,
    fontWeight: "bold",
  },
  result: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: "#363062",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#363062",
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "semibold",
    textAlign: "center",
  },
});

export default TicTacToeGame;
