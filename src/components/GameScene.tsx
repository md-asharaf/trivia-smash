import { useRef } from 'react';
import { Environment } from '@react-three/drei';
import Table from './Table';
import PlayerPaddle from './PlayerPaddle';
import Opponents from './Opponents';
import Balls from './Balls';
import { Question } from '../gameLogic';

interface GameSceneProps {
  question: Question;
  onAnswer: (selectedIndex: number) => void;
  isPaused?: boolean;
}

export function GameScene({ question, onAnswer, isPaused }: GameSceneProps) {
  const paddlePosRef = useRef({ x: 0, z: 6, vz: 0 });

  const handlePaddleUpdate = (pos: { x: number, z: number, vz: number }) => {
    paddlePosRef.current = pos;
  };

  return (
    <>
      <ambientLight intensity={0.25} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={2.0}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
      />

      <Environment preset="forest" />

      <Table />

      <Opponents options={question.options} />

      <PlayerPaddle onPositionUpdate={handlePaddleUpdate} isPaused={isPaused} />

      <Balls paddlePosRef={paddlePosRef} onHitResult={onAnswer} isPaused={isPaused} />
    </>
  );
}
