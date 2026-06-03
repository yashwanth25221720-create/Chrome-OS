import { memo, useState, useEffect, useRef, useCallback } from "react";
import { Volume2, VolumeX, RotateCcw, Settings } from "lucide-react";

interface Pipe {
  id: number;
  x: number;
  gapY: number;
}

interface GameState {
  isRunning: boolean;
  score: number;
  gameOver: boolean;
  birdY: number;
  pipes: Pipe[];
  difficulty: "easy" | "normal" | "hard";
  muted: boolean;
}

export default memo(function FlappyBirdWidget() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();
  const [gameState, setGameState] = useState<GameState>({
    isRunning: false,
    score: 0,
    gameOver: false,
    birdY: 150,
    pipes: [],
    difficulty: "normal",
    muted: false,
  });
  const [showSettings, setShowSettings] = useState(false);
  const gameDataRef = useRef({
    birdY: 150,
    birdVelocity: 0,
    pipes: [] as Pipe[],
    nextPipeId: 0,
    score: 0,
    gameTime: 0,
    gravity: 0.5,
    flapPower: -10,
    scoredPipes: new Set<number>(),
  });

  const BIRD_SIZE = 30;
  const PIPE_WIDTH = 60;
  const GAP_SIZE = 120;
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 400;

  const getGameSpeed = useCallback(() => {
    switch (gameState.difficulty) {
      case "easy":
        return 3;
      case "normal":
        return 5;
      case "hard":
        return 7;
    }
  }, [gameState.difficulty]);

  const playSound = useCallback(() => {
    if (!gameState.muted) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.frequency.value = 523.25; // C5
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
      birdY: 150,
      birdVelocity: 0,
      pipes: [],
      nextPipeId: 0,
      score: 0,
      gameTime: 0,
      gravity: 0.5,
      flapPower: -10,
      scoredPipes: new Set(),
    };
  }, []);

  const resetGame = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      gameOver: false,
      isRunning: false,
      score: 0,
      birdY: 150,
      pipes: [],
    }));
    gameDataRef.current = {
      birdY: 150,
      birdVelocity: 0,
      pipes: [],
      nextPipeId: 0,
      score: 0,
      gameTime: 0,
      gravity: 0.5,
      flapPower: -10,
      scoredPipes: new Set(),
    };
  }, []);

  const handleFlap = useCallback(() => {
    if (gameState.isRunning) {
      gameDataRef.current.birdVelocity = gameDataRef.current.flapPower;
      playSound();
    }
  }, [gameState.isRunning, playSound]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        if (!gameState.isRunning && !gameState.gameOver) {
          startGame();
        } else if (gameState.isRunning) {
          handleFlap();
        }
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [gameState.isRunning, gameState.gameOver, startGame, handleFlap]);

  useEffect(() => {
    if (!gameState.isRunning || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const gameLoop = () => {
      const data = gameDataRef.current;
      const speed = getGameSpeed();

      // Update bird physics
      data.birdVelocity += data.gravity;
      data.birdY += data.birdVelocity;

      // Boundaries
      if (data.birdY <= 0 || data.birdY + BIRD_SIZE >= CANVAS_HEIGHT) {
        setGameState((prev) => ({
          ...prev,
          isRunning: false,
          gameOver: true,
          score: data.score,
        }));
        return;
      }

      // Spawn pipes
      data.gameTime++;
      const spawnRate = gameState.difficulty === "easy" ? 150 : gameState.difficulty === "normal" ? 120 : 100;
      if (data.gameTime % spawnRate === 0) {
        const minGapY = 50;
        const maxGapY = CANVAS_HEIGHT - GAP_SIZE - 50;
        const gapY = Math.random() * (maxGapY - minGapY) + minGapY;
        data.pipes.push({ id: data.nextPipeId++, x: CANVAS_WIDTH, gapY });
      }

      // Update pipes
      data.pipes = data.pipes.filter((pipe) => pipe.x > -PIPE_WIDTH);
      data.pipes.forEach((pipe) => {
        pipe.x -= speed;
      });

      // Collision detection and scoring
      for (const pipe of data.pipes) {
        // Check if bird passed the pipe
        if (pipe.x + PIPE_WIDTH < 100 && !data.scoredPipes.has(pipe.id)) {
          data.score += 1;
          data.scoredPipes.add(pipe.id);
          playSound();
        }

        // Check collision
        if (100 < pipe.x + PIPE_WIDTH && pipe.x < 100 + BIRD_SIZE) {
          if (data.birdY < pipe.gapY || data.birdY + BIRD_SIZE > pipe.gapY + GAP_SIZE) {
            setGameState((prev) => ({
              ...prev,
              isRunning: false,
              gameOver: true,
              score: data.score,
            }));
            return;
          }
        }
      }

      setGameState((prev) => ({
        ...prev,
        birdY: data.birdY,
        pipes: data.pipes,
        score: data.score,
      }));

      // Draw
      const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      gradient.addColorStop(0, "#87ceeb");
      gradient.addColorStop(1, "#e0f6ff");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw bird (circle with gradient)
      const birdGradient = ctx.createRadialGradient(100, data.birdY + BIRD_SIZE / 2, 5, 100, data.birdY + BIRD_SIZE / 2, BIRD_SIZE / 2);
      birdGradient.addColorStop(0, "#ffeb3b");
      birdGradient.addColorStop(1, "#fbc02d");
      ctx.fillStyle = birdGradient;
      ctx.beginPath();
      ctx.arc(100, data.birdY + BIRD_SIZE / 2, BIRD_SIZE / 2, 0, Math.PI * 2);
      ctx.fill();

      // Bird eye
      ctx.fillStyle = "white";
      ctx.beginPath();
      ctx.arc(105, data.birdY + BIRD_SIZE / 3, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "black";
      ctx.beginPath();
      ctx.arc(106, data.birdY + BIRD_SIZE / 3, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Draw pipes
      data.pipes.forEach((pipe) => {
        // Top pipe
        ctx.fillStyle = "#4caf50";
        ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.gapY);
        ctx.strokeStyle = "#388e3c";
        ctx.lineWidth = 2;
        ctx.strokeRect(pipe.x, 0, PIPE_WIDTH, pipe.gapY);

        // Bottom pipe
        ctx.fillStyle = "#4caf50";
        ctx.fillRect(pipe.x, pipe.gapY + GAP_SIZE, PIPE_WIDTH, CANVAS_HEIGHT - (pipe.gapY + GAP_SIZE));
        ctx.strokeStyle = "#388e3c";
        ctx.lineWidth = 2;
        ctx.strokeRect(pipe.x, pipe.gapY + GAP_SIZE, PIPE_WIDTH, CANVAS_HEIGHT - (pipe.gapY + GAP_SIZE));
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
        <h3 className="text-sm font-semibold">Flappy Bird</h3>
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
          onClick={handleFlap}
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

      <p className="text-xs text-gray-400 text-center">Space or click to flap</p>
    </div>
  );
});
