import { Html } from '@react-three/drei';
import Paddle from './Paddle';

interface OpponentsProps {
  options: string[];
}

export default function Opponents({ options }: OpponentsProps) {
  const positions = [
    -3.5,
    -1.2,
    1.2,
    3.5
  ];

  const colors = ['#a855f7', '#ec4899', '#eab308', '#06b6d4'];

  return (
    <group position={[0, 1, -6]}>
      {options.map((option, index) => (
        <group key={index} position={[positions[index], 0, 0]}>
          <Paddle
            color={colors[index % colors.length]}
            rotation={[0, 0, -positions[index] * 0.25]}
          />
          <Html position={[0, index % 2 === 0 ? 2.53 : 0.8, 0]} center>
            <div className="option-label">
              {option}
            </div>
          </Html>
        </group>
      ))}
    </group>
  );
}
