import { useState, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Trophy, Gem, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { GameScene } from './components/GameScene';
import { generateQuestions, Question } from './gameLogic';
import rawData from '../public/data.json';
import { SoundManager } from './sound';
import confetti from 'canvas-confetti';

type GameState = 'start' | 'playing' | 'gameover';

function App() {
  const [gameState, setGameState] = useState<GameState>('start');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    SoundManager.isMuted = isMuted;
  }, [isMuted]);

  const startGame = useCallback(() => {
    const newQuestions = generateQuestions(rawData, 10);
    setQuestions(newQuestions);
    setCurrentQuestionIndex(0);
    setScore(0);
    setStreak(0);
    setGameState('playing');
  }, []);

  const handleAnswer = useCallback((selectedIndex: number) => {
    if (gameState !== 'playing') return;

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedIndex === currentQuestion.correctAnswerIndex;

    if (isCorrect) {
      setScore(s => s + 10);
      setStreak(s => s + 1);
      SoundManager.playWin();
      triggerConfetti();
    } else {
      setScore(s => Math.max(0, s - 5));
      setStreak(0);
      SoundManager.playLose();
    }
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(i => i + 1);
      } else {
        setGameState('gameover');
      }
    }, 1000);
  }, [gameState, questions, currentQuestionIndex]);

  const triggerConfetti = () => {
    const duration = 2000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff']
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="game-container">
      <div className="top-ui">
        {gameState === 'playing' && currentQuestion && (
          <>
            <div className="question-container">
              <h2 className="question-text">
                What is the airline of <span className="highlight">{currentQuestion.country}</span>?
              </h2>
            </div>
            <div className="top-controls">
              <button className="control-btn" onClick={() => setIsPaused(!isPaused)}>
                {isPaused ? <Play size={24} /> : <Pause size={24} />}
              </button>
              <button className="control-btn" onClick={() => setIsMuted(!isMuted)}>
                {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
              </button>
            </div>
          </>
        )}
      </div>

      <div className="canvas-container">
        {gameState === 'start' && (
          <div className="start-screen">
            <h1 className="title">TABLE TENNIS TRIVIA</h1>
            <button className="play-button" onClick={startGame}>PLAY NOW</button>
          </div>
        )}

        {gameState === 'gameover' && (
          <div className="game-over-screen">
            <h1 className="title">GAME OVER</h1>
            <h2 style={{ fontSize: '3rem', marginBottom: '2rem' }}>Final Score: {score}</h2>
            <button className="play-button" onClick={startGame}>PLAY AGAIN</button>
          </div>
        )}

        {gameState === 'playing' && currentQuestion && (
          <Canvas shadows camera={{ position: [0, 8, 14], fov: 45 }}>
            <GameScene
              question={currentQuestion}
              onAnswer={handleAnswer}
              isPaused={isPaused}
              key={currentQuestionIndex} // Remount scene on new question
            />
          </Canvas>
        )}
      </div>

      <div className="bottom-ui">
        {gameState === 'playing' && currentQuestion && (
          <div className="stats-container">
            <div className="stat-box">
              <Trophy className="score-icon" color="#fbbf24" />
              <span className="stat-value">{score.toString().padStart(2, '0')}</span>
            </div>
            <div className="stat-box" title="Answer Streak">
              <Gem className="score-icon" color="#38bdf8" />
              <span className="stat-value">{streak}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
