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
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [winner, setWinner] = useState<Winner>(null);
  const [winningCombination, setWinningCombination] = useState<number[] | null>(null);
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [theme, setTheme] = useState<Theme>("dark");
  const [mode, setMode] = useState<Mode>(null);
  const [showStartModal, setShowStartModal] = useState(true);
  const [showModeModal, setShowModeModal] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(1))[0];

  useEffect(() => checkWinner(), [board]);

  useEffect(() => {
    if (mode === "ai" && !isPlayerTurn && !winner) {
      const aiTimeout = setTimeout(makeAIMove, 500);
      return () => clearTimeout(aiTimeout);
    }
  }, [isPlayerTurn, board, mode, winner]);

  useEffect(() => {
    if (winner !== null) {
      setModalVisible(true);
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      animateWinningSquares();
    }
  }, [winner]);

  const checkWinner = useCallback(() => {
    const combos = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];
    for (const [a, b, c] of combos) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        setWinner(board[a]);
        setWinningCombination([a, b, c]);
        return;
      }
    }
    if (board.every(square => square !== null)) setWinner("draw");
  }, [board]);

  const animateWinningSquares = () => {
    if (winningCombination) {
      const animations = winningCombination.map((index) =>
        Animated.spring(scaleAnim, {
          toValue: 1.3,
          friction: 3,
          tension: 160,
          useNativeDriver: true,
        })
      );
      Animated.stagger(100, animations).start();
    }
  };

  const makeAIMove = () => {
    const newBoard = [...board];
    const emptyIndex = newBoard.findIndex(square => square === null);
    if (emptyIndex !== -1) newBoard[emptyIndex] = "O";
    setBoard(newBoard);
    setIsPlayerTurn(true);
  };

  const handleSquarePress = (index: number) => {
    if (board[index] || winner || (mode === "ai" && !isPlayerTurn)) return;
    const newBoard = [...board];
    newBoard[index] = isPlayerTurn ? "X" : "O";
    setBoard(newBoard);
    setIsPlayerTurn(prev => !prev);
  };

  const handleReset = () => {
    if (winner === "X") setPlayerScore(prev => prev + 1);
    if (winner === "O") setAiScore(prev => prev + 1);
    setBoard(initialBoard);
    setWinner(null);
    setWinningCombination(null);
    setIsPlayerTurn(true);
    setModalVisible(false);
    scaleAnim.setValue(1); // Reset scale animation
  };

  const renderSquare = (index: number) => {
    const isWinning = winningCombination?.includes(index);
    const animatedStyle = isWinning ? { transform: [{ scale: scaleAnim }] } : {};
    return (
      <TouchableOpacity
        key={index}
        style={[styles.square, board[index] && styles.squareClicked, isWinning && styles.winningSquare, theme === "dark" ? styles.darkSquare : styles.lightSquare]}
        onPress={() => handleSquarePress(index)}
        disabled={!!board[index] || !!winner}
      >
        <Animated.View style={[animatedStyle]}>
          <Text style={[styles.squareText, getSquareTextColor(board[index])]}>{board[index] || ""}</Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const renderResult = () => {
    if (winner) return winner === "draw" ? "It's a draw!" : `Player ${winner} wins!`;
    return mode === "ai" ? (isPlayerTurn ? "Your turn" : "AI is thinking...") : `Player ${isPlayerTurn ? "X" : "O"}'s turn`;
  };

  const handleBackToModeSelect = () => {
    setBoard(initialBoard);
    setWinner(null);
    setIsPlayerTurn(true);
    setPlayerScore(0);
    setAiScore(0);
    setShowModeModal(true);
  };

  const getSquareTextColor = (value: Square) => {
    if (value === "X") return { color: "#435585" };
    if (value === "O") return { color: "#F39C12" };
    return {};
  };

  const themeStyles = getThemeStyles(theme);

  return (
    <View style={[styles.container, themeStyles.container]}>
      <Text style={[styles.title, themeStyles.title]}>Tic-Tac-Toe</Text>
      <TouchableOpacity
        style={styles.themeButton}
        onPress={() => setTheme(theme === "light" ? "dark" : "light")}
      >
        <Ionicons name={theme === "light" ? "moon" : "sunny"} size={24} color={theme === "light" ? "#333" : "#fff"} />
      </TouchableOpacity>

      <Modal visible={showStartModal} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={[styles.modal, themeStyles.modal]}>
            <Text style={[styles.modalText, themeStyles.modalText, { fontSize: 28 }]}>Tic-Tac-Toe</Text>
            <TouchableOpacity
              style={[styles.button, themeStyles.button]}
              onPress={() => {
                setShowStartModal(false);
                setShowModeModal(true);
              }}
            >
              <Text style={styles.buttonText}>Start</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showModeModal} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={[styles.modal, themeStyles.modal]}>
            <Text style={[styles.modalText, themeStyles.modalText]}>Choose Mode</Text>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#435585" }]}
              onPress={() => {
                setMode("ai");
                setShowModeModal(false);
              }}
            >
              <Text style={styles.buttonText}>VS AI</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#F39C12", marginTop: 10 }]}
              onPress={() => {
                setMode("2p");
                setShowModeModal(false);
              }}
            >
              <Text style={[styles.buttonText, { color: "#333" }]}>2 Players</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {!showStartModal && !showModeModal && (
        <>
          <View style={styles.board}>{board.map((_, index) => renderSquare(index))}</View>
          <Text style={[styles.result, themeStyles.result]}>{renderResult()}</Text>
          <TouchableOpacity style={styles.backButton} onPress={handleBackToModeSelect}>
            <Ionicons name="arrow-back" size={24} color={theme === "light" ? "#363062" : "#fff"} />
          </TouchableOpacity>
        </>
      )}

      <Modal visible={modalVisible} transparent animationType="fade">
        <Animated.View style={[styles.modalContainer, { opacity: fadeAnim }]}>
          <View style={[styles.modal, themeStyles.modal]}>
            <Text style={[styles.modalText, themeStyles.modalText]}>{renderResult()}</Text>
            <TouchableOpacity style={[styles.button, themeStyles.button]} onPress={handleReset}>
              <Text style={styles.buttonText}>Reset Game</Text>
            </TouchableOpacity>
            <Text style={[styles.scoreText, themeStyles.modalText]}>
              X = {playerScore} | O = {aiScore}
            </Text>
          </View>
        </Animated.View>
      </Modal>
    </View>
  );
};

const getThemeStyles = (theme: Theme) => ({
  container: { backgroundColor: theme === "dark" ? "#333" : "#F7F7F7", padding: 20 },
  title: { color: theme === "dark" ? "#fff" : "#363062" },
  button: { backgroundColor: theme === "dark" ? "#555" : "#435585" },
  modal: { backgroundColor: theme === "dark" ? "#222" : "#fff" },
  modalText: { color: theme === "dark" ? "#fff" : "#333" },
  result: { color: theme === "dark" ? "#fff" : "#363062" },
});

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginVertical: 16 },
  board: { flexDirection: "row", flexWrap: "wrap", width: 300, justifyContent: "space-between", marginBottom: 20 },
  square: { width: 90, height: 90, alignItems: "center", justifyContent: "center", borderWidth: 2, borderRadius: 10, margin: 5 },
  squareClicked: { opacity: 0.7 },
  winningSquare: { transform: [{ scale: 1.2 }] },
  squareText: { fontSize: 48, fontWeight: "bold" },
  result: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0, 0, 0, 0.5)" },
  modal: { width: 300, padding: 20, borderRadius: 10 },
  modalText: { fontSize: 24, marginBottom: 20, textAlign: "center" },
  button: { padding: 15, borderRadius: 5, marginBottom: 10 },
  buttonText: { color: "#fff", fontSize: 18, textAlign: "center" },
  scoreText: { fontSize: 18, textAlign: "center", marginTop: 10 },
  themeButton: { position: "absolute", top: 40, right: 20, padding: 10 },
  backButton: { position: "absolute", top: 40, left: 20, padding: 10 },
  lightSquare: { backgroundColor: "#E5C3A6" },
  darkSquare: { backgroundColor: "#E0E0E0" },
});

export default TicTacToeGame;
