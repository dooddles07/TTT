import React, { useEffect, useState, useCallback } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Square = "X" | "O" | null;
type Winner = "X" | "O" | "draw" | null;
type Theme = "light" | "dark";
type Mode = "ai" | "2p" | null;

const TicTacToeGame = () => {
  const [boardSize, setBoardSize] = useState(3);
  const [board, setBoard] = useState<Square[]>(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [winner, setWinner] = useState<Winner>(null);
  const [winningCombination, setWinningCombination] = useState<number[] | null>(null);
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [theme, setTheme] = useState<Theme>("dark");
  const [mode, setMode] = useState<Mode>(null);
  const [showStartModal, setShowStartModal] = useState(true);
  const [showModeModal, setShowModeModal] = useState(false);
  const [showBoardSizeModal, setShowBoardSizeModal] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    setBoard(Array(boardSize * boardSize).fill(null));
  }, [boardSize]);

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
    const lines: number[][] = [];
    const size = boardSize;

    for (let i = 0; i < size; i++) {
      const row = [], col = [];
      for (let j = 0; j < size; j++) {
        row.push(i * size + j);
        col.push(j * size + i);
      }
      lines.push(row, col);
    }

    const diag1 = [], diag2 = [];
    for (let i = 0; i < size; i++) {
      diag1.push(i * size + i);
      diag2.push(i * size + (size - i - 1));
    }
    lines.push(diag1, diag2);

    for (const line of lines) {
      const [first, ...rest] = line;
      if (board[first] && rest.every(i => board[i] === board[first])) {
        setWinner(board[first]);
        setWinningCombination(line);
        return;
      }
    }

    if (board.every(square => square !== null)) setWinner("draw");
  }, [board, boardSize]);

  const animateWinningSquares = () => {
    if (winningCombination) {
      Animated.spring(scaleAnim, {
        toValue: 1.3,
        friction: 3,
        tension: 160,
        useNativeDriver: true,
      }).start();
    }
  };

  const makeAIMove = () => {
    const emptyIndexes = board.map((v, i) => (v === null ? i : -1)).filter(i => i !== -1);
    const randomIndex = emptyIndexes[Math.floor(Math.random() * emptyIndexes.length)];
    if (randomIndex !== undefined) {
      const newBoard = [...board];
      newBoard[randomIndex] = "O";
      setBoard(newBoard);
      setIsPlayerTurn(true);
    }
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
    setBoard(Array(boardSize * boardSize).fill(null));
    setWinner(null);
    setWinningCombination(null);
    setIsPlayerTurn(true);
    setModalVisible(false);
    scaleAnim.setValue(1);
  };

  const renderSquare = (index: number) => {
    const isWinning = winningCombination?.includes(index);
    const animatedStyle = isWinning ? { transform: [{ scale: scaleAnim }] } : {};
    const squareSize = Dimensions.get("window").width / boardSize - 20;

    return (
      <TouchableOpacity
        key={index}
        style={[styles.square, { width: squareSize, height: squareSize }, isWinning && styles.winningSquare, theme === "dark" ? styles.darkSquare : styles.lightSquare]}
        onPress={() => handleSquarePress(index)}
        disabled={!!board[index] || !!winner}
      >
        <Animated.View style={animatedStyle}>
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
    setBoard(Array(boardSize * boardSize).fill(null));
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
      <Text style={[styles.title, themeStyles.title]}>Brix Tic-Tac-Toe</Text>
      <TouchableOpacity style={styles.themeButton} onPress={() => setTheme(theme === "light" ? "dark" : "light")}>
        <Ionicons name={theme === "light" ? "moon" : "sunny"} size={24} color={theme === "light" ? "#333" : "#fff"} />
      </TouchableOpacity>

      <Modal visible={showStartModal} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={[styles.modal, themeStyles.modal]}>
            <Text style={[styles.modalText, themeStyles.modalText, { fontSize: 28 }]}>Tic-Tac-Toe</Text>
            <TouchableOpacity style={[styles.button, themeStyles.button]} onPress={() => { setShowStartModal(false); setShowBoardSizeModal(true); }}>
              <Text style={styles.buttonText}>Start</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showBoardSizeModal} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={[styles.modal, themeStyles.modal]}>
            <Text style={[styles.modalText, themeStyles.modalText]}>Choose Board Size</Text>
            {[3, 4, 5, 6, 7].map(size => (
              <TouchableOpacity key={size} style={[styles.button, themeStyles.button, { marginTop: 10 }]} onPress={() => { setBoardSize(size); setShowBoardSizeModal(false); setShowModeModal(true); }}>
                <Text style={styles.buttonText}>{size} x {size}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      <Modal visible={showModeModal} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.modalBackButton} onPress={() => { setShowModeModal(false); setShowBoardSizeModal(true); }}>
            <Ionicons name="arrow-back" size={28} color={theme === "light" ? "#363062" : "#fff"} />
          </TouchableOpacity>
          <View style={[styles.modal, themeStyles.modal]}>
            <Text style={[styles.modalText, themeStyles.modalText]}>Choose Mode</Text>
            <TouchableOpacity style={[styles.button, { backgroundColor: "#435585" }]} onPress={() => { setMode("ai"); setShowModeModal(false); }}>
              <Text style={styles.buttonText}>VS AI</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, { backgroundColor: "#F39C12", marginTop: 10 }]} onPress={() => { setMode("2p"); setShowModeModal(false); }}>
              <Text style={[styles.buttonText, { color: "#333" }]}>2 Players</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {!showStartModal && !showModeModal && !showBoardSizeModal && (
        <>
          <View style={[styles.board, { width: Dimensions.get("window").width - 20, flexDirection: "row", flexWrap: "wrap" }]}>
            {board.map((_, index) => renderSquare(index))}
          </View>
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
            <Text style={[styles.scoreText, themeStyles.modalText]}>X = {playerScore} | O = {aiScore}</Text>
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
  board: { justifyContent: "center", alignItems: "center", marginBottom: 20 },
  square: { alignItems: "center", justifyContent: "center", borderWidth: 2, borderRadius: 10, margin: 5 },
  winningSquare: { transform: [{ scale: 1.2 }] },
  squareText: { fontSize: 32, fontWeight: "bold" },
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
  modalBackButton: { position: "absolute", top: 40, left: 20, zIndex: 10, padding: 10,},
});

export default TicTacToeGame;
