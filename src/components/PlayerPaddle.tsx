import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';
import Paddle from './Paddle';

interface PlayerPaddleProps {
  onPositionUpdate?: (pos: { x: number, z: number }) => void;
  isPaused?: boolean;
}

export default function PlayerPaddle({ onPositionUpdate, isPaused }: PlayerPaddleProps) {
  const paddleRef = useRef<Group>(null);

  useFrame((state) => {
    if (!paddleRef.current || isPaused) return;

    let targetX = state.pointer.x * 6;
    let targetZ = 6 + (state.pointer.y + 0.5) * -4;

    targetX = Math.max(-4.2, Math.min(4.2, targetX));
    targetZ = Math.max(4.5, Math.min(7.5, targetZ));

    paddleRef.current.position.x += (targetX - paddleRef.current.position.x) * 0.2;
    paddleRef.current.position.z += (targetZ - paddleRef.current.position.z) * 0.2;

    // Tilt paddle based on X position
    paddleRef.current.rotation.z = -paddleRef.current.position.x * 0.15;

    if (onPositionUpdate) {
      onPositionUpdate({ x: paddleRef.current.position.x, z: paddleRef.current.position.z });
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
