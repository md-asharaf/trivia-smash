import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { InstancedMesh, Object3D, Color } from 'three';
import { SoundManager } from '../sound';

interface BallsProps {
  paddleXRef: React.MutableRefObject<number>;
  onHitResult: (index: number) => void;
  isPaused?: boolean;
}

export default function Balls({ paddleXRef, onHitResult, isPaused }: BallsProps) {
  const startZ = -6;
  const targetZ = 6;
  const speed = 6; // Units per second in Z direction
  const positions = [-3.5, -1.2, 1.2, 3.5];
  const floorY = 0.4; // Table Y (0.2) + Ball radius (0.2)

  // Game phases: 'serve' | 'return' | 'ended'
  const [phase, setPhase] = useState<'serve' | 'return' | 'ended'>('serve');
  const [ballZ, setBallZ] = useState(startZ);
  const [hitIndex, setHitIndex] = useState(-1);

  const meshRef = useRef<InstancedMesh>(null);
  const dummy = new Object3D();

  const colors = ['#a855f7', '#ec4899', '#eab308', '#06b6d4'];
  const colorObj = new Color();

  useEffect(() => {
    if (meshRef.current) {
      for (let i = 0; i < positions.length; i++) {
        colorObj.set(colors[i]);
        meshRef.current.setColorAt(i, colorObj);
      }
      if (meshRef.current.instanceColor) {
        meshRef.current.instanceColor.needsUpdate = true;
      }
    }
  }, []);

  // Helper function to calculate Y based on Z for the serving phase
  const getServeY = (z: number) => {
    if (z < -3) {
      // Arc 1: -6 to -3
      return floorY + 0.3 * (z + 6) * (-3 - z);
    } else if (z < 3) {
      // Arc 2: -3 to 3 (over net)
      return floorY + 0.15 * (z + 3) * (3 - z);
    } else if (z <= 6) {
      // Arc 3: 3 to 6
      return floorY + 0.2 * (z - 3) * (6 - z);
    }
    return floorY;
  };

  // Helper function to calculate Y for the return phase
  const getReturnY = (z: number) => {
    if (z > -3) {
      // Arc 1: 6 to -3 (over net)
      return floorY + 0.08 * (6 - z) * (z + 3);
    } else if (z >= -6) {
      // Arc 2: -3 to -6
      return floorY + 0.3 * (-3 - z) * (z + 6);
    }
    return floorY;
  };

  useFrame((_, delta) => {
    if (phase === 'ended' || isPaused) return;

    const checkBounce = (prev: number, next: number) => {
      // Bounce points are roughly at Z = -3 and Z = 3
      if ((prev <= -3 && next > -3) || (prev > -3 && next <= -3) ||
        (prev <= 3 && next > 3) || (prev > 3 && next <= 3)) {
        SoundManager.playBounce();
      }
    };

    if (phase === 'serve') {
      let nextZ = ballZ + speed * delta;

      // Check if reached player paddle
      if (nextZ >= targetZ) {
        nextZ = targetZ;

        // Detect hit
        const px = paddleXRef.current;
        let hit = -1;
        for (let i = 0; i < positions.length; i++) {
          if (Math.abs(px - positions[i]) < 1.0) {
            hit = i;
            break;
          }
        }

        setHitIndex(hit);
        if (hit !== -1) {
          SoundManager.playHit();
          setPhase('return');
        } else {
          // Missed all balls
          setPhase('ended');
          onHitResult(-1);
        }
      } else {
        checkBounce(ballZ, nextZ);
        setBallZ(nextZ);
      }

      // Update instanced mesh for serve phase
      if (meshRef.current) {
        for (let i = 0; i < positions.length; i++) {
          const y = getServeY(nextZ);
          dummy.position.set(positions[i], y, nextZ);
          dummy.updateMatrix();
          meshRef.current.setMatrixAt(i, dummy.matrix);
        }
        meshRef.current.instanceMatrix.needsUpdate = true;
      }
    } else if (phase === 'return') {
      let nextZ = ballZ - speed * delta * 1.5; // Return is slightly faster

      if (nextZ <= startZ) {
        nextZ = startZ;
        setPhase('ended');
        onHitResult(hitIndex);
      } else {
        checkBounce(ballZ, nextZ);
        setBallZ(nextZ);
      }

      // Update instanced mesh for return phase
      if (meshRef.current) {
        for (let i = 0; i < positions.length; i++) {
          if (i === hitIndex) {
            // Only the hit ball returns
            const y = getReturnY(nextZ);
            dummy.position.set(positions[i], y, nextZ);
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
          } else {
            // Other balls simulate falling off the table
            const t = (targetZ - nextZ) / (speed * 1.5);
            const dropY = floorY - 9.8 * t * t * 0.5;
            dummy.position.set(positions[i], dropY, targetZ + t * speed * 0.5);
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
          }
        }
        meshRef.current.instanceMatrix.needsUpdate = true;
      }
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, 4]} castShadow>
      <sphereGeometry args={[0.2, 32, 32]} />
      <meshStandardMaterial color="#ffffff" roughness={0.1} metalness={0.8} emissive="#444444" emissiveIntensity={0.5} />
    </instancedMesh>
  );
}
