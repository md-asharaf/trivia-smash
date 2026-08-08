export default function Table() {
  return (
    <group position={[0, -0.5, 0]}>
      <mesh receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[10, 0.2, 14]} />
        <meshStandardMaterial color="#0ea5e9" />
      </mesh>

      <mesh receiveShadow position={[0, -0.15, 0]}>
        <boxGeometry args={[10.2, 0.4, 14.2]} />
        <meshStandardMaterial color="#e5e5e5" />
      </mesh>

      {/* Center Line Vertical */}
      <mesh position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.1, 14]} />
        <meshStandardMaterial color="white" />
      </mesh>

      <mesh position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 0.1]} />
        <meshStandardMaterial color="white" />
      </mesh>

      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[10.2, 1, 0.1]} />
        <meshStandardMaterial color="#1a1a1a" transparent opacity={0.6} />
      </mesh>
      <mesh position={[0, 1.1, 0]}>
        <boxGeometry args={[10.2, 0.1, 0.15]} />
        <meshStandardMaterial color="white" />
      </mesh>
    </group>
  );
}
