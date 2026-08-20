import { useState, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Trophy, Gem, Pause, Play, Volume2, VolumeX, RotateCcw, HelpCircle } from 'lucide-react';
import { GameScene } from './components/GameScene';
import { SoundManager } from './sound';
import confetti from 'canvas-confetti';
import { fetchQuizData } from './api';
import { QuizQuestion } from './types/api';

function App() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [quizFetchState, setQuizFetchState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [quizError, setQuizError] = useState<string>('');
  const [showHintModal, setShowHintModal] = useState(false);
  
  const [hasStartedGame, setHasStartedGame] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isCanvasLoaded, setIsCanvasLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [feedback, setFeedback] = useState<{type: 'correct' | 'wrong', key: number} | null>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    SoundManager.isMuted = isMuted;
  }, [isMuted]);

  const loadQuizData = useCallback(async () => {
    setQuizFetchState('loading');
    setQuizError('');
    try {
      const data = await fetchQuizData();
      setQuestions(data);
      setQuizFetchState('done');
    } catch (err: any) {
      setQuizFetchState('error');
      setQuizError(err.message || 'Failed to fetch quiz data');
    }
  }, []);

  const handleStartGameClick = () => {
    if (quizFetchState === 'idle' || quizFetchState === 'error') {
      loadQuizData();
    }
    setHasStartedGame(true);
    setIsPaused(false);
  };

  const resetGame = useCallback(() => {
    setHasStartedGame(false);
    setQuizFetchState('idle');
    setQuestions([]);
    setIsCanvasLoaded(false);
    setShowHintModal(false);
    setCurrentQuestionIndex(0);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setIsPaused(true);
    setIsGameOver(false);
  }, []);

  const handleAnswer = useCallback((selectedIndex: number) => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;
    
    const selectedOption = currentQuestion.options[selectedIndex];
    const isCorrect = selectedOption === currentQuestion.answer.value;

    if (isCorrect) {
      setScore(s => s + 10);
      setStreak(s => {
        const newStreak = s + 1;
        setMaxStreak(ms => Math.max(ms, newStreak));
        return newStreak;
      });
      SoundManager.playWin();
      triggerWinConfetti();
      setFeedback({ type: 'correct', key: Date.now() });
    } else {
      setScore(s => Math.max(0, s - 5));
      setStreak(0);
      SoundManager.playLose();
      setFeedback({ type: 'wrong', key: Date.now() });
    }
    
    setTimeout(() => {
      setFeedback(null);
      setShowHintModal(false);
      setCurrentQuestionIndex(i => {
        if (i < questions.length - 1) {
          return i + 1;
        } else {
          setIsGameOver(true);
          return i;
        }
      });
    }, 1000);
  }, [questions, currentQuestionIndex]);

  const triggerWinConfetti = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#fbbf24', '#38bdf8', '#4ade80']
    });
  };

  const currentQuestion = questions[currentQuestionIndex];

  const isGameReady = hasStartedGame && quizFetchState === 'done' && isCanvasLoaded;

  return (
    <div className="game-container">
      {(!hasStartedGame || !isGameReady) && (
        <div className="start-screen">
          <h1 className="title">TRIVIA SMASH</h1>
          <button 
            className="play-button" 
            onClick={handleStartGameClick}
            disabled={hasStartedGame && quizFetchState === 'loading'}
            style={{ opacity: (hasStartedGame && quizFetchState === 'loading') ? 0.5 : 1 }}
          >
            {quizFetchState === 'error' ? 'Retry' : (
              (hasStartedGame && (!isCanvasLoaded || quizFetchState !== 'done')) ? 'Loading...' : 'Start Game'
            )}
          </button>
          {quizFetchState === 'error' && (
            <p className="error-text">{quizError}</p>
          )}
        </div>
      )}

      {isGameReady && !isGameOver && (
        <div className="top-ui">
          {currentQuestion && (
            <>
              <div className="question-container">
                <h2 className="question-text">
                  {currentQuestion.prompt.label}: <span className="highlight">{currentQuestion.prompt.value}</span>
                </h2>
              </div>
              <div className="top-controls">
                {currentQuestion.hint && (
                  <button className="control-btn" onClick={() => setShowHintModal(true)} title="Show Hint">
                    <HelpCircle size={24} />
                  </button>
                )}
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
        {feedback && hasStartedGame && (
          <div key={feedback.key} className={`feedback-popup ${feedback.type}`}>
            {feedback.type === 'correct' ? '+10 CORRECT!' : '-5 WRONG!'}
          </div>
        )}
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

        {showHintModal && currentQuestion?.hint && (
          <div className="game-over-overlay" onClick={() => setShowHintModal(false)}>
            <div className="game-over-modal" onClick={e => e.stopPropagation()}>
              <h2 className="game-over-title" style={{ fontSize: '2rem' }}>{currentQuestion.hint.label}</h2>
              <p style={{ fontSize: '1.2rem', color: '#fff', margin: '1rem 0' }}>{currentQuestion.hint.value}</p>
              <button className="play-again-btn" onClick={() => setShowHintModal(false)}>CLOSE</button>
            </div>
          </div>
        )}

        {hasStartedGame && (
          <Canvas
            shadows
            camera={{
              position: isMobile ? [0, 16, 14] : [0, 9, 16],
              fov: isMobile ? 65 : 48
            }}
            onCreated={() => setIsCanvasLoaded(true)}
          >
            {currentQuestion && (
              <GameScene
                question={currentQuestion}
                onAnswer={handleAnswer}
                isPaused={!isGameReady || isPaused}
                isGameOver={isGameOver}
                key={currentQuestionIndex}
              />
            )}
          </Canvas>
        )}
      </div>

      {isGameReady && !isGameOver && (
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
