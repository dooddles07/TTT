import React, { useEffect, useState, useCallback } from "react";
import { Text, TouchableOpacity, View, StyleSheet, Modal, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Square = "X" | "O" | null;
type Winner = "X" | "O" | "draw" | null;
type Theme = "light" | "dark";
type Mode = "ai" | "2p" | null;

const initialBoard: Square[] = Array(9).fill(null);

const TicTacToeGame = () => {
  const [board, setBoard] = useState<Square[]>(initialBoard);
  const [isPlayerTurn, setIsPlayerTurn] = useState<boolean>(true);
  const [winner, setWinner] = useState<Winner>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [theme, setTheme] = useState<Theme>("dark");
  const [showStartModal, setShowStartModal] = useState(true);
  const [showModeModal, setShowModeModal] = useState(false);
  const [mode, setMode] = useState<Mode>(null);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const [hasGameStarted, setHasGameStarted] = useState<boolean>(false);
  const [playerScore, setPlayerScore] = useState<number>(0);
  const [aiScore, setAiScore] = useState<number>(0);
  const [winningCombination, setWinningCombination] = useState<number[] | null>(null);

  useEffect(() => {
    checkWinner();
  }, [board]);

  useEffect(() => {
    if (mode === "ai" && !isPlayerTurn && !winner) {
      const aiTimeout = setTimeout(() => makeAIMove(), 500);
      return () => clearTimeout(aiTimeout);
    }
  }, [isPlayerTurn, board, mode, winner]);

  const checkWinner = useCallback(() => {
    const winningCombinations = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];

    for (const [a, b, c] of winningCombinations) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        setWinner(board[a]);
        setWinningCombination([a, b, c]);
        return;
      }
    }

    if (board.every((square) => square !== null)) {
      setWinner("draw");
    }
  }, [board]);

  const makeAIMove = () => {
    const newBoard = [...board];
    for (let i = 0; i < newBoard.length; i++) {
      if (newBoard[i] === null) {
        newBoard[i] = "O";
        break;
      }
    }
    setBoard(newBoard);
    setIsPlayerTurn(true);
  };

  const handleSquarePress = (index: number) => {
    if (board[index] || winner || (mode === "ai" && !isPlayerTurn)) return;

    const newBoard = [...board];
    newBoard[index] = isPlayerTurn ? "X" : "O";
    setBoard(newBoard);
    setIsPlayerTurn((prev) => !prev);
  };

  const handleReset = () => {
    if (winner === "X") setPlayerScore(prev => prev + 1);
    if (winner === "O") setAiScore(prev => prev + 1);

    setBoard(initialBoard);
    setIsPlayerTurn(true);
    setWinner(null);
    setModalVisible(false);
    setWinningCombination(null);

    if (!hasGameStarted) setShowStartModal(true);
  };

  const getSquareTextColor = (value: Square) => {
    if (value === "X") return { color: "#435585" };
    if (value === "O") return { color: "#F39C12" };
    return {};
  };

  const renderSquare = (index: number) => {
    const isWinningSquare = winningCombination?.includes(index);
    const squareStyle = isWinningSquare
      ? [styles.square, styles.squareClicked, styles.winningSquare]
      : [styles.square, board[index] && styles.squareClicked];

    return (
      <TouchableOpacity
        key={index}
        style={[squareStyle, theme === "dark" ? styles.darkSquare : styles.lightSquare]}
        onPress={() => handleSquarePress(index)}
        disabled={!!board[index] || !!winner}
      >
        <Text style={[styles.squareText, getSquareTextColor(board[index])]}>
          {board[index] || ""}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderResult = () => {
    if (winner) return winner === "draw" ? "It's a draw!" : `Player ${winner} wins!`;
    return mode === "ai"
      ? isPlayerTurn ? "Your turn" : "AI is thinking..."
      : `Player ${isPlayerTurn ? "X" : "O"}'s turn`;
  };

  useEffect(() => {
    if (winner !== null) {
      setModalVisible(true);
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    }
  }, [winner]);

  const themeStyles = getThemeStyles(theme);

  const handleBackToModeSelect = () => {
    setHasGameStarted(false);
    setBoard(initialBoard);
    setWinner(null);
    setIsPlayerTurn(true);
    setPlayerScore(0);
    setAiScore(0);
    setShowModeModal(true);
  };

  return (
    <View style={[styles.container, themeStyles.container]}>
      <Text style={[styles.title, themeStyles.title]}>Brix's TicTacToe</Text>

      {/* Modal for starting game */}
      <Modal visible={showStartModal} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={[styles.modal, { backgroundColor: themeStyles.modal.backgroundColor }]}>
          <Text style={[styles.modalText, themeStyles.modalText, { fontSize: 28, fontWeight: "600", textAlign: "center", letterSpacing: 1.5 }]}>
  Brix's Tic-Tac-Toe
</Text>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: themeStyles.button.backgroundColor }]}
              onPress={() => {
                setShowStartModal(false);
                setShowModeModal(true);
                setHasGameStarted(true);
              }}
            >
              <Text style={styles.buttonText}>Start</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal for selecting mode */}
      <Modal visible={showModeModal} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={[styles.modal, { backgroundColor: themeStyles.modal.backgroundColor }]}>
            <Text style={[styles.modalText, themeStyles.modalText]}>Choose Mode</Text>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#435585" }]}
              onPress={() => {
                setMode("ai");
                setPlayerScore(0);
                setAiScore(0);
                setShowModeModal(false);
              }}
            >
              <Text style={styles.buttonText}>VS AI</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#F39C12", marginTop: 10 }]}
              onPress={() => {
                setMode("2p");
                setPlayerScore(0);
                setAiScore(0);
                setShowModeModal(false);
              }}
            >
              <Text style={[styles.buttonText, { color: "#333" }]}>2 Players</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Main board */}
      {!showStartModal && !showModeModal && (
        <>
          <View style={styles.board}>
            {[...Array(9)].map((_, index) => renderSquare(index))}
          </View>
          <Text style={[styles.result, themeStyles.result]}>{renderResult()}</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBackToModeSelect}
          >
            <Ionicons name="arrow-back" size={24} color={theme === "light" ? "#363062" : "#fff"} />
          </TouchableOpacity>
        </>
      )}

      {/* Modal for result */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <Animated.View style={[styles.modalContainer, { opacity: fadeAnim }]}>
          <View style={[styles.modal, { backgroundColor: themeStyles.modal.backgroundColor }]}>
            <Text style={[styles.modalText, themeStyles.modalText]}>{renderResult()}</Text>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: themeStyles.button.backgroundColor }]}
              onPress={handleReset}
            >
              <Text style={styles.buttonText}>Reset Game</Text>
            </TouchableOpacity>
            <Text style={[styles.scoreText, themeStyles.modalText]}>
              X = {playerScore} | O = {aiScore}
            </Text>
          </View>
        </Animated.View>
      </Modal>

      {/* Theme Toggle */}
      <TouchableOpacity style={styles.themeButton} onPress={() => setTheme(theme === "light" ? "dark" : "light")}>
        <Ionicons name={theme === "light" ? "moon" : "sunny"} size={24} color={theme === "light" ? "#333" : "#fff"} />
      </TouchableOpacity>
    </View>
  );
};

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
      };
    default:
      return {
        container: { backgroundColor: "#F7F7F7", padding: 20 },
        title: { color: "#363062" },
        square: { borderColor: "#363062" },
        squareText: { color: "#363062" },
        result: { color: "#363062" },
        button: { backgroundColor: "#435585" },
        modal: { backgroundColor: "#fff", color: "#333" },
        modalText: { color: "#333" },
      };
  }
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 36, marginBottom: 20 },
  board: { flexDirection: "row", flexWrap: "wrap", width: 300, justifyContent: "space-between", marginBottom: 20 },
  square: { width: 90, height: 90, alignItems: "center", justifyContent: "center", borderWidth: 2, borderRadius: 10, margin: 5 },
  squareClicked: { opacity: 0.7 },
  squareText: { fontSize: 48, fontWeight: "bold" },
  winningSquare: { transform: [{ scale: 1.2 }] },
  result: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0, 0, 0, 0.5)" },
  modal: { width: 300, padding: 20, borderRadius: 10 },
  modalText: { fontSize: 24, marginBottom: 20, textAlign: "center" },
  button: { padding: 15, borderRadius: 5, marginBottom: 10 },
  buttonText: { color: "#fff", fontSize: 18, textAlign: "center" },
  scoreText: { fontSize: 18, textAlign: "center", marginTop: 10 },
  themeButton: { position: "absolute", top: 40, right: 20 },
  backButton: {position: "absolute",top: 40,left: 20,backgroundColor: "transparent", padding: 10,},
  lightSquare: { backgroundColor: "#E5C3A6" },
  darkSquare: { backgroundColor: "#E0E0E0" },
});

export default TicTacToeGame;
