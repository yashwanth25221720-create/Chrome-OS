import { memo, useState, useEffect, useRef, useCallback } from "react";
import { Volume2, VolumeX, RotateCcw, Settings } from "lucide-react";

interface GameState {
  isRunning: boolean;
  score: number;
  gameOver: boolean;
  dinoY: number;
  obstacles: Array<{ id: number; x: number }>;
  difficulty: "easy" | "normal" | "hard";
  muted: boolean;
}

export default memo(function DinoGameWidget() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();
  const [gameState, setGameState] = useState<GameState>({
    isRunning: false,
    score: 0,
    gameOver: false,
    dinoY: 300,
    obstacles: [],
    difficulty: "normal",
    muted: false,
  });
  const [showSettings, setShowSettings] = useState(false);
  const gameDataRef = useRef({
    dinoY: 300,
    dinoVelocity: 0,
    isJumping: false,
    obstacles: [] as Array<{ id: number; x: number }>,
    nextObstacleId: 0,
    score: 0,
    gameTime: 0,
    gravity: 0.6,
    jumpPower: -15,
  });

  const DINO_SIZE = 40;
  const GROUND_Y = 300;
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 400;

  const getGameSpeed = useCallback(() => {
    switch (gameState.difficulty) {
      case "easy":
        return 5;
      case "normal":
        return 7;
      case "hard":
        return 10;
    }
  }, [gameState.difficulty]);

  const playSound = useCallback(() => {
    if (!gameState.muted) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.frequency.value = 800;
      gain.gain.setValueAtTime(0.3, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      osc.start(audioContext.currentTime);
      osc.stop(audioContext.currentTime + 0.1);
    }
  }, [gameState.muted]);

  const startGame = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      isRunning: true,
      gameOver: false,
      score: 0,
    }));
    gameDataRef.current = {
      dinoY: GROUND_Y,
      dinoVelocity: 0,
      isJumping: false,
      obstacles: [],
      nextObstacleId: 0,
      score: 0,
      gameTime: 0,
      gravity: 0.6,
      jumpPower: -15,
    };
  }, []);

  const resetGame = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      gameOver: false,
      isRunning: false,
      score: 0,
      dinoY: GROUND_Y,
      obstacles: [],
    }));
    gameDataRef.current = {
      dinoY: GROUND_Y,
      dinoVelocity: 0,
      isJumping: false,
      obstacles: [],
      nextObstacleId: 0,
      score: 0,
      gameTime: 0,
      gravity: 0.6,
      jumpPower: -15,
    };
  }, []);

  const handleJump = useCallback(() => {
    if (!gameDataRef.current.isJumping && gameState.isRunning) {
      gameDataRef.current.isJumping = true;
      gameDataRef.current.dinoVelocity = gameDataRef.current.jumpPower;
      playSound();
    }
  }, [gameState.isRunning, playSound]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        if (!gameState.isRunning && !gameState.gameOver) {
          startGame();
        } else {
          handleJump();
        }
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [gameState.isRunning, gameState.gameOver, startGame, handleJump]);

  useEffect(() => {
    if (!gameState.isRunning || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const gameLoop = () => {
      const data = gameDataRef.current;
      const speed = getGameSpeed();

      // Update dino physics
      data.dinoVelocity += data.gravity;
      data.dinoY += data.dinoVelocity;

      if (data.dinoY >= GROUND_Y) {
        data.dinoY = GROUND_Y;
        data.dinoVelocity = 0;
        data.isJumping = false;
      }

      // Spawn obstacles
      data.gameTime++;
      const spawnRate = gameState.difficulty === "easy" ? 120 : gameState.difficulty === "normal" ? 100 : 80;
      if (data.gameTime % spawnRate === 0) {
        data.obstacles.push({ id: data.nextObstacleId++, x: CANVAS_WIDTH });
      }

      // Update obstacles
      data.obstacles = data.obstacles.filter((obs) => obs.x > -30);
      data.obstacles.forEach((obs) => {
        obs.x -= speed;
      });

      // Collision detection
      for (const obs of data.obstacles) {
        if (
          data.dinoY + DINO_SIZE > GROUND_Y - 10 &&
          obs.x < 80 &&
          obs.x + 25 > 50
        ) {
          setGameState((prev) => ({
            ...prev,
            isRunning: false,
            gameOver: true,
            score: data.score,
          }));
          return;
        }
      }

      // Score
      data.obstacles.forEach((obs) => {
        if (obs.x === 50 && data.dinoY < GROUND_Y - 10) {
          data.score += 1;
          playSound();
        }
      });

      setGameState((prev) => ({
        ...prev,
        dinoY: data.dinoY,
        obstacles: data.obstacles,
        score: data.score,
      }));

      // Draw
      ctx.fillStyle = "#f5f5f5";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Ground line
      ctx.strokeStyle = "#ccc";
      ctx.lineWidth = 2;
      ctx.setLineDash([20, 10]);
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y);
      ctx.lineTo(CANVAS_WIDTH, GROUND_Y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw dino
      ctx.fillStyle = "#ff6b6b";
      ctx.beginPath();
      ctx.ellipse(65, data.dinoY + DINO_SIZE / 2, DINO_SIZE / 2, DINO_SIZE / 2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Draw eye
      ctx.fillStyle = "white";
      ctx.beginPath();
      ctx.arc(75, data.dinoY + DINO_SIZE / 3, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "black";
      ctx.beginPath();
      ctx.arc(76, data.dinoY + DINO_SIZE / 3, 2, 0, Math.PI * 2);
      ctx.fill();

      // Draw obstacles
      ctx.fillStyle = "#4ecdc4";
      data.obstacles.forEach((obs) => {
        ctx.fillRect(obs.x, GROUND_Y - 30, 25, 30);
        ctx.strokeStyle = "#2a9d8f";
        ctx.lineWidth = 2;
        ctx.strokeRect(obs.x, GROUND_Y - 30, 25, 30);
      });

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameState.isRunning, gameState.difficulty, getGameSpeed, playSound]);

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold">Dino Game</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1 hover:bg-gray-700 rounded text-xs"
            title="Settings"
          >
            <Settings size={16} />
          </button>
          <button
            onClick={() => setGameState((prev) => ({ ...prev, muted: !prev.muted }))}
            className="p-1 hover:bg-gray-700 rounded text-xs"
          >
            {gameState.muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="bg-gray-700 p-3 rounded space-y-2 text-xs">
          <div>
            <label className="block mb-1">Difficulty</label>
            <select
              value={gameState.difficulty}
              onChange={(e) =>
                setGameState((prev) => ({
                  ...prev,
                  difficulty: e.target.value as any,
                }))
              }
              className="w-full bg-gray-600 text-white p-1 rounded"
            >
              <option value="easy">Easy</option>
              <option value="normal">Normal</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>
      )}

      <div className="bg-black rounded overflow-hidden">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="w-full cursor-pointer"
          onClick={handleJump}
        />
      </div>

      <div className="flex justify-between items-center text-sm">
        <div>Score: {gameState.score}</div>
        {gameState.gameOver && <div className="text-red-400 font-semibold">Game Over!</div>}
      </div>

      <div className="flex gap-2">
        {!gameState.isRunning && !gameState.gameOver && (
          <button
            onClick={startGame}
            className="flex-1 bg-green-600 hover:bg-green-500 text-white py-2 rounded text-sm font-semibold"
          >
            Start
          </button>
        )}
        {(gameState.isRunning || gameState.gameOver) && (
          <button
            onClick={resetGame}
            className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-2 rounded text-sm font-semibold flex items-center justify-center gap-2"
          >
            <RotateCcw size={16} />
            Reset
          </button>
        )}
      </div>

      <p className="text-xs text-gray-400 text-center">Space or click to jump</p>
    </div>
  );
});
