import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';
import Paddle from './Paddle';

interface PlayerPaddleProps {
  onPositionUpdate?: (x: number) => void;
  isPaused?: boolean;
}

export default function PlayerPaddle({ onPositionUpdate, isPaused }: PlayerPaddleProps) {
  const paddleRef = useRef<Group>(null);

  useFrame((state) => {
    if (!paddleRef.current || isPaused) return;

    if (state.pointer.y > 0) return;

    let targetX = state.pointer.x * 6;

    targetX = Math.max(-4.2, Math.min(4.2, targetX));

    paddleRef.current.position.x += (targetX - paddleRef.current.position.x) * 0.2;
    
    // Tilt paddle based on X position
    paddleRef.current.rotation.z = -paddleRef.current.position.x * 0.15;

    if (onPositionUpdate) {
      onPositionUpdate(paddleRef.current.position.x);
    }
  });

  return (
    <Paddle
      ref={paddleRef}
      position={[0, 1, 6]}
      color="#22c55e"
    />
  );
}
