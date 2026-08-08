import { useState, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Trophy, Gem, Pause, Play, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { GameScene } from './components/GameScene';
import { generateQuestions, Question } from './gameLogic';
import rawData from '../public/data.json';
import { SoundManager } from './sound';
import confetti from 'canvas-confetti';

function App() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    SoundManager.isMuted = isMuted;
  }, [isMuted]);

  useEffect(() => {
    setQuestions(generateQuestions(rawData, 10));
  }, []);

  const resetGame = useCallback(() => {
    setQuestions(generateQuestions(rawData, 10));
    setCurrentQuestionIndex(0);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setIsPaused(false);
    setIsGameOver(false);
  }, []);

  const handleAnswer = useCallback((selectedIndex: number) => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;
    const isCorrect = selectedIndex === currentQuestion.correctAnswerIndex;

    if (isCorrect) {
      setScore(s => s + 10);
      setStreak(s => {
        const newStreak = s + 1;
        setMaxStreak(ms => Math.max(ms, newStreak));
        return newStreak;
      });
      SoundManager.playWin();
      triggerConfetti();
    } else {
      setScore(s => Math.max(0, s - 5));
      setStreak(0);
      SoundManager.playLose();
    }
    setTimeout(() => {
      setCurrentQuestionIndex(i => {
        if (i < questions.length - 1) {
          return i + 1;
        } else {
          setIsGameOver(true);
          triggerConfetti(); // Big explosion for finishing!
          return i;
        }
      });
    }, 1000);
  }, [questions, currentQuestionIndex]);

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
      {!isGameOver && (
        <div className="top-ui">
          {currentQuestion && (
            <>
              <div className="question-container">
                <h2 className="question-text">
                  What is the airline of <span className="highlight">{currentQuestion.country}</span>?
                </h2>
              </div>
              <div className="top-controls">
                <button className="control-btn" onClick={resetGame} title="New Game">
                  <RotateCcw size={24} />
                </button>
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
      )}

      <div className="canvas-container">
        {isGameOver && (
          <div className="game-over-overlay">
            <div className="game-over-modal">
              <h1 className="game-over-title">MATCH COMPLETE</h1>
              <div className="game-over-stats">
                <div className="go-stat">
                  <span>FINAL SCORE</span>
                  <h2 className="score-text">{score}</h2>
                </div>
                <div className="go-stat">
                  <span>MAX STREAK</span>
                  <h2 className="streak-text">
                    {maxStreak} <Gem size={24} color="#38bdf8" style={{ display: 'inline', verticalAlign: 'middle', marginLeft: '4px' }} />
                  </h2>
                </div>
              </div>
              <button className="play-again-btn" onClick={resetGame}>PLAY AGAIN</button>
            </div>
          </div>
        )}

        {currentQuestion && (
          <Canvas shadows camera={{ position: [0, 8, 14], fov: 45 }}>
            <GameScene
              question={currentQuestion}
              onAnswer={handleAnswer}
              isPaused={isPaused}
              key={currentQuestionIndex}
            />
          </Canvas>
        )}
      </div>

      {!isGameOver && (
        <div className="bottom-ui">
          {currentQuestion && (
            <div className="stats-container">
              <div className="stat-box">
                <Trophy className="score-icon" color="#fbbf24" />
                <span className="stat-value">{score}</span>
              </div>
              <div className="stat-box" title="Answer Streak">
                <Gem className="score-icon" color="#38bdf8" />
                <span className="stat-value">{streak}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
