import React, { useEffect, useState, useCallback } from "react";
import { Text, TouchableOpacity, View, StyleSheet, Modal, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Make sure to install this package

type Square = "X" | "O" | null;
type Winner = "X" | "O" | "draw" | null;
type Theme = "light" | "dark";

const initialBoard: Square[] = Array(9).fill(null);

const TicTacToeGame = () => {
  const [board, setBoard] = useState<Square[]>(initialBoard);
  const [isPlayerTurn, setIsPlayerTurn] = useState<boolean>(true);
  const [winner, setWinner] = useState<Winner>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    checkWinner();
  }, [board]);

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

    if (board.every((square) => square !== null)) {
      setWinner("draw");
    }
  }, [board]);

  const handleSquarePress = (index: number) => {
    if (board[index] || winner) return;
    const newBoard = [...board];
    newBoard[index] = isPlayerTurn ? "X" : "O";
    setBoard(newBoard);
    setIsPlayerTurn((prev) => !prev);
  };

  const handleReset = () => {
    setBoard(initialBoard);
    setIsPlayerTurn(true);
    setWinner(null);
    setModalVisible(false);
  };

  const renderSquare = (index: number) => (
    <TouchableOpacity
      key={index}
      style={[
        styles.square,
        board[index] && styles.squareClicked,
        theme === "dark" ? styles.lightSquare : styles.darkSquare, // Reversed here
      ]}
      onPress={() => handleSquarePress(index)}
      disabled={!!board[index] || !!winner}
    >
      <Text style={[styles.squareText, getSquareTextColor(board[index])]}>
        {board[index] || ""}
      </Text>
    </TouchableOpacity>
  );

  const getSquareTextColor = (value: Square) => ({
    color: value === "X" ? "#435585" : "#E5C3A6",
  });

  const renderResult = () => {
    if (winner) {
      return winner === "draw"
        ? "It's a draw!"
        : `Player ${winner} wins!`;
    }
    return `Player ${isPlayerTurn ? "X" : "O"}'s turn`;
  };

  useEffect(() => {
    if (winner !== null) {
      setModalVisible(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [winner]);

  const getThemeStyles = (theme: Theme) => {
    switch (theme) {
      case "dark":
        return {
          container: { backgroundColor: "#333", padding: 20 },
          title: { color: "#fff" },
          square: { borderColor: "#fff" },
          squareText: { color: "#fff" },
          result: { color: "#fff" },
          button: { backgroundColor: "#555" },
          modal: { backgroundColor: "#222", color: "#fff" },
          modalText: { color: "#fff" },
          lightSquare: { backgroundColor: "#444" }, // Now the light square in dark theme
          darkSquare: { backgroundColor: "#555" }, // Now the dark square in dark theme
        };
      default: // light theme
        return {
          container: { backgroundColor: "#F7F7F7", padding: 20 },
          title: { color: "#363062" },
          square: { borderColor: "#363062" },
          squareText: { color: "#435585" },
          result: { color: "#363062" },
          button: { backgroundColor: "#363062" },
          modal: { backgroundColor: "#fff", color: "#363062" },
          modalText: { color: "#363062" },
          lightSquare: { backgroundColor: "#F1F1F1" }, // Now the light square in light theme
          darkSquare: { backgroundColor: "#FFF" }, // Now the dark square in light theme
        };
    }
  };

  const themeStyles = getThemeStyles(theme);

  return (
    <View style={[styles.container, themeStyles.container]}>
      <Text style={[styles.title, themeStyles.title]}>Tic Tac Toe</Text>
      <View style={styles.board}>
        {[...Array(9)].map((_, index) => renderSquare(index))}
      </View>
      <Text style={[styles.result, themeStyles.result]}>{renderResult()}</Text>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Animated.View style={[styles.modalContainer, { opacity: fadeAnim }]}>
          <View style={[styles.modal, { backgroundColor: themeStyles.modal.backgroundColor }]}>
            <Text style={[styles.modalText, themeStyles.modalText]}>{renderResult()}</Text>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: themeStyles.button.backgroundColor }]}
              onPress={handleReset}
            >
              <Text style={styles.buttonText}>Reset Game</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Modal>

      <TouchableOpacity
        style={styles.themeButton}
        onPress={() => setTheme(theme === "light" ? "dark" : "light")}
      >
        <Ionicons name={theme === "light" ? "moon" : "sunny"} size={24} color={theme === "light" ? "#333" : "#fff"} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  board: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: 300,
    height: 300,
    marginBottom: 20,
    borderRadius: 10,
    overflow: "hidden",
  },
  square: {
    width: 100,
    height: 100,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
  },
  squareClicked: {
    backgroundColor: "#F1F1F1",
  },
  squareText: {
    fontSize: 36,
    fontWeight: "bold",
  },
  result: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modal: {
    padding: 30,
    borderRadius: 10,
    alignItems: "center",
    width: 250,
  },
  modalText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  themeButton: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "transparent",
    padding: 10,
    borderRadius: 25,
  },
  lightSquare: {
    backgroundColor: "#FFF", // Now the light square in light theme
  },
  darkSquare: {
    backgroundColor: "#F1F1F1", // Now the dark square in light theme
  },
});

export default TicTacToeGame;
