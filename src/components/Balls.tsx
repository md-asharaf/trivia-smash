import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { InstancedMesh, Object3D, Color } from 'three';
import { SoundManager } from '../sound';

interface BallsProps {
  paddlePosRef: React.MutableRefObject<{ x: number, z: number, vz: number }>;
  onHitResult: (index: number) => void;
  isPaused?: boolean;
}

export default function Balls({ paddlePosRef, onHitResult, isPaused }: BallsProps) {
  const startZ = -6;
  const speed = 6;
  const positions = [-3.5, -1.2, 1.2, 3.5];
  const floorY = 0.4;

  const [phase, setPhase] = useState<'serve' | 'return' | 'ended'>('serve');
  const [ballZ, setBallZ] = useState(startZ);
  const [hitIndex, setHitIndex] = useState(-1);
  const [returnSpeedMult, setReturnSpeedMult] = useState(1.3);
  const [hitZ, setHitZ] = useState(6);

  const ballYRef = useRef(floorY);
  const velocityYRef = useRef(0);
  const gravity = -25;

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

  const getServeY = (z: number) => {
    if (z < -3) {
      return floorY + 0.3 * (z + 6) * (-3 - z);
    } else if (z < 3) {
      return floorY + 0.15 * (z + 3) * (3 - z);
    } else if (z <= 6) {
      return floorY + 0.2 * (z - 3) * (6 - z);
    }
    return floorY;
  };

  useFrame((_, delta) => {
    if (phase === 'ended' || isPaused) return;

    const checkServeBounce = (prev: number, next: number) => {
      if ((prev <= -3 && next > -3) || (prev > -3 && next <= -3) ||
        (prev <= 3 && next > 3) || (prev > 3 && next <= 3)) {
        SoundManager.playBounce();
      }
    };

    const currentTargetZ = paddlePosRef.current.z;
    const paddlePower = paddlePosRef.current.vz;

    if (phase === 'serve') {
      let nextZ = ballZ + speed * delta;

      let hit = -1;

      if (nextZ >= currentTargetZ - 0.6 && nextZ <= currentTargetZ + 0.6) {
        const px = paddlePosRef.current.x;
        for (let i = 0; i < positions.length; i++) {
          if (Math.abs(px - positions[i]) < 1.0) {
            hit = i;
            break;
          }
        }
      }

      if (hit !== -1) {
        nextZ = currentTargetZ;
        setHitIndex(hit);
        setHitZ(currentTargetZ);
        // Dynamic hit calculation using exact mouse thrust power
        let bounceZ = -3;
        let timeToBounce = 0.8; // default time in air
        
        if (paddlePower < -15) { // Smash (thrusting forward hard)
          bounceZ = -5.5;
          timeToBounce = 0.3; // Very fast
        } else if (paddlePower < -4) { // Fast drive
          bounceZ = -4.0;
          timeToBounce = 0.5;
        } else if (paddlePower > 4) { // Drop shot (pulling backward)
          bounceZ = -1.5; // Bounce just over the net (opponent side)
          timeToBounce = 1.0; // Slower lob
        }

        const distZ = currentTargetZ - bounceZ;
        const requiredSpeed = distZ / timeToBounce;
        const speedMult = requiredSpeed / speed;
        
        setReturnSpeedMult(speedMult);
        SoundManager.playHit();

        // Physics initialization
        ballYRef.current = getServeY(currentTargetZ);
        velocityYRef.current = (floorY - ballYRef.current - 0.5 * gravity * timeToBounce * timeToBounce) / timeToBounce;

        setPhase('return');
      } else if (nextZ >= 7.5) {
        setPhase('ended');
        onHitResult(-1);
      } else {
        checkServeBounce(ballZ, nextZ);
        setBallZ(nextZ);
      }

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
      let nextZ = ballZ - speed * delta * returnSpeedMult;

      velocityYRef.current += gravity * delta;
      let nextY = ballYRef.current + velocityYRef.current * delta;

      if (nextY <= floorY && velocityYRef.current < 0) {
        nextY = floorY;
        velocityYRef.current = Math.abs(velocityYRef.current) * 0.45; // Reduced bounce restitution for realistic ping pong feel
        SoundManager.playBounce();
      }
      ballYRef.current = nextY;

      if (nextZ <= startZ) {
        nextZ = startZ;
        setPhase('ended');
        onHitResult(hitIndex);
      } else {
        setBallZ(nextZ);
      }

      if (meshRef.current) {
        for (let i = 0; i < positions.length; i++) {
          if (i === hitIndex) {
            dummy.position.set(positions[i], ballYRef.current, nextZ);
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
          } else {
            const t = (hitZ - nextZ) / (speed * returnSpeedMult);
            const dropY = floorY - 9.8 * t * t * 0.5;
            dummy.position.set(positions[i], dropY, hitZ + t * speed * 0.5);
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
