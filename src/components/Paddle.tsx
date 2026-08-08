import { forwardRef } from 'react';
import { Group } from 'three';
import { ThreeElements } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';

export type PaddleProps = ThreeElements['group'] & {
  color?: string;
};

const Paddle = forwardRef<Group, PaddleProps>(({ color = "#ef4444", ...props }, ref) => {
  return (
    <group ref={ref} {...props}>
      <group rotation={[Math.PI / 2, 0, 0]}>
        {/* Blade Core (Wood) */}
        <mesh castShadow>
          <cylinderGeometry args={[0.6, 0.6, 0.02, 32]} />
          <meshStandardMaterial color="#deb887" /> {/* Burlywood */}
        </mesh>
        
        {/* Top Rubber (Colored) */}
        <mesh position={[0, 0.015, 0]} castShadow>
          <cylinderGeometry args={[0.58, 0.58, 0.015, 32]} />
          <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>

        {/* Bottom Rubber (Black) */}
        <mesh position={[0, -0.015, 0]} castShadow>
          <cylinderGeometry args={[0.58, 0.58, 0.015, 32]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
        </mesh>
        
        {/* Handle */}
        <RoundedBox args={[0.22, 0.12, 0.7]} radius={0.04} smoothness={4} position={[0, 0, 0.95]} rotation={[-0.1, 0, 0]} castShadow>
          <meshStandardMaterial color="#8b5a2b" /> {/* SaddleBrown */}
        </RoundedBox>
      </group>
    </group>
  );
});

export default Paddle;
