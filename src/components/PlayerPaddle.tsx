import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';
import Paddle from './Paddle';

interface PlayerPaddleProps {
  onPositionUpdate?: (pos: { x: number, z: number, vz: number }) => void;
  isPaused?: boolean;
}

export default function PlayerPaddle({ onPositionUpdate, isPaused }: PlayerPaddleProps) {
  const paddleRef = useRef<Group>(null);
  const prevTargetZRef = useRef(6);
  const smoothedVelocityZRef = useRef(0);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    const handleDown = () => { isDraggingRef.current = true; };
    const handleUp = () => { isDraggingRef.current = false; };
    
    window.addEventListener('pointerdown', handleDown);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleUp);
    
    return () => {
      window.removeEventListener('pointerdown', handleDown);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleUp);
    };
  }, []);

  useFrame((state, delta) => {
    if (!paddleRef.current || isPaused) return;

    if (isDraggingRef.current) {
      let targetX = state.pointer.x * 6;
      let targetZ = 6 + (state.pointer.y + 0.5) * -4;

      targetX = Math.max(-4.2, Math.min(4.2, targetX));
      targetZ = Math.max(4.5, Math.min(7.5, targetZ));

      paddleRef.current.position.x += (targetX - paddleRef.current.position.x) * 0.2;
      paddleRef.current.position.z += (targetZ - paddleRef.current.position.z) * 0.2;
      
      const rawVelocity = delta > 0 ? (targetZ - prevTargetZRef.current) / delta : 0;
      smoothedVelocityZRef.current += (rawVelocity - smoothedVelocityZRef.current) * 0.3;
      prevTargetZRef.current = targetZ;
    } else {
      smoothedVelocityZRef.current *= 0.8;
    }

    // Tilt paddle based on X position
    paddleRef.current.rotation.z = -paddleRef.current.position.x * 0.15;

    if (onPositionUpdate) {
      onPositionUpdate({ 
        x: paddleRef.current.position.x, 
        z: paddleRef.current.position.z,
        vz: smoothedVelocityZRef.current
      });
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
