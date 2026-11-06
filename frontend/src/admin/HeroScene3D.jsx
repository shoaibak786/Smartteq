import { Component, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/* Flat, twisting S ribbon inspired by the Smartteq logo */

const PATH = [
    [2.3, 1.6, 0.0],
    [0.7, 1.85, 0.6],
    [-1.6, 1.05, 0.0],
    [-1.4, 0.0, -0.6],
    [0.1, -0.15, 0.0],
    [1.7, -0.95, 0.6],
    [1.4, -1.75, 0.0],
    [-0.6, -1.7, -0.5],
    [-2.3, -2.0, 0.0]
].map(([x, y, z]) => new THREE.Vector3(x, y, z));

const HALF_WIDTH = 0.34;
const HALF_THICK = 0.06;
const SEGMENTS = 220;

function buildFrames(curve) {
    const zAxis = new THREE.Vector3(0, 0, 1);
    const frames = [];

    for (let i = 0; i <= SEGMENTS; i++) {
        const u = i / SEGMENTS;
        const p = curve.getPointAt(u);
        const t = curve.getTangentAt(u).normalize();
        const n = new THREE.Vector3().crossVectors(zAxis, t).normalize();
        const s = new THREE.Vector3().crossVectors(t, n).normalize();

        // twist the ribbon along the path (like the folds in the logo)
        const theta = 1.0 * Math.sin(u * Math.PI * 3);
        const d = n.clone().multiplyScalar(Math.cos(theta)).addScaledVector(s, Math.sin(theta));
        const e = n.clone().multiplyScalar(-Math.sin(theta)).addScaledVector(s, Math.cos(theta));

        frames.push({ p, t, d, e });
    }

    return frames;
}

function buildRibbonGeometry(frames) {
    const corners = [
        [HALF_WIDTH, HALF_THICK],
        [HALF_WIDTH, -HALF_THICK],
        [-HALF_WIDTH, -HALF_THICK],
        [-HALF_WIDTH, HALF_THICK]
    ];

    const positions = [];
    const indices = [];
    const rows = SEGMENTS + 1;

    for (let f = 0; f < 4; f++) {
        const a = corners[f];
        const b = corners[(f + 1) % 4];

        for (let i = 0; i < rows; i++) {
            const { p, d, e } = frames[i];

            positions.push(
                p.x + d.x * a[0] + e.x * a[1],
                p.y + d.y * a[0] + e.y * a[1],
                p.z + d.z * a[0] + e.z * a[1],
                p.x + d.x * b[0] + e.x * b[1],
                p.y + d.y * b[0] + e.y * b[1],
                p.z + d.z * b[0] + e.z * b[1]
            );
        }

        for (let i = 0; i < rows - 1; i++) {
            const v0 = (f * rows + i) * 2;
            const v2 = (f * rows + i + 1) * 2;
            indices.push(v0, v0 + 1, v2, v0 + 1, v2 + 1, v2);
        }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    return geometry;
}

function buildEdgeGeometry(frames, sign) {
    const points = frames
        .filter((_, i) => i % 6 === 0)
        .map(({ p, d, e }) =>
            p.clone()
                .addScaledVector(d, sign * HALF_WIDTH)
                .addScaledVector(e, HALF_THICK)
        );

    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 260, 0.022, 6, false);
}

/* Reflections make the metal look real */
function Environment() {
    const { gl, scene } = useThree();

    useEffect(() => {
        let texture;

        try {
            const generator = new THREE.PMREMGenerator(gl);
            texture = generator.fromScene(new RoomEnvironment(), 0.04).texture;
            scene.environment = texture;
            generator.dispose();
        } catch {
            /* lights alone still work */
        }

        return () => {
            scene.environment = null;
            if (texture) texture.dispose();
        };
    }, [gl, scene]);

    return null;
}

function Ribbon({ offsetX }) {
    const group = useRef();
    const flow = useRef([]);
    const rings = useRef();

    const { curve, glow, ribbon, edgeA, edgeB, chips } = useMemo(() => {
        const curve = new THREE.CatmullRomCurve3(PATH);
        const frames = buildFrames(curve);

        const chipList = [0.12, 0.28, 0.46, 0.64, 0.8, 0.92].map((u) => {
            const { p, t, d, e } = frames[Math.round(u * SEGMENTS)];
            const quaternion = new THREE.Quaternion().setFromRotationMatrix(
                new THREE.Matrix4().makeBasis(t, e, d)
            );
            const position = p.clone().addScaledVector(e, HALF_THICK + 0.012);

            return { position, quaternion };
        });

        return {
            curve,
            glow: new THREE.TubeGeometry(curve, 200, 0.46, 12, false),
            ribbon: buildRibbonGeometry(frames),
            edgeA: buildEdgeGeometry(frames, 1),
            edgeB: buildEdgeGeometry(frames, -1),
            chips: chipList
        };
    }, []);

    useFrame((state, delta) => {
        const g = group.current;
        if (!g) return;

        const t = state.clock.elapsedTime;
        const targetY = Math.sin(t * 0.45) * 0.75 + state.pointer.x * 0.45;
        const targetX = state.pointer.y * -0.3;

        g.rotation.y += (targetY - g.rotation.y) * Math.min(1, delta * 3);
        g.rotation.x += (targetX - g.rotation.x) * Math.min(1, delta * 3);
        g.position.y = Math.sin(t * 0.9) * 0.1;

        // glowing data packets travelling along the ribbon
        flow.current.forEach((m, i) => {
            if (!m) return;
            const u = (t * 0.1 + i / flow.current.length) % 1;
            m.position.copy(curve.getPointAt(u));
            m.scale.setScalar(0.7 + Math.sin(t * 4 + i) * 0.3);
        });

        if (rings.current) {
            rings.current.rotation.y += delta * 0.25;
            rings.current.rotation.z += delta * 0.1;
        }
    });

    return (
        <group ref={group} position={[offsetX, 0, 0]} scale={0.88}>
            <mesh geometry={ribbon}>
                <meshPhysicalMaterial
                    color="#2aa9e0"
                    metalness={0.92}
                    roughness={0.2}
                    clearcoat={1}
                    clearcoatRoughness={0.1}
                    emissive="#0a5f9a"
                    emissiveIntensity={0.4}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* neon edges */}
            <mesh geometry={edgeA}>
                <meshBasicMaterial color="#7defff" />
            </mesh>
            <mesh geometry={edgeB}>
                <meshBasicMaterial color="#7defff" />
            </mesh>

            {/* circuit chips like the logo */}
            {chips.map((chip, i) => (
                <mesh key={i} position={chip.position} quaternion={chip.quaternion}>
                    <boxGeometry args={[0.26, 0.02, 0.14]} />
                    <meshStandardMaterial
                        color="#0b2a44"
                        metalness={0.6}
                        roughness={0.35}
                        emissive="#22d3ee"
                        emissiveIntensity={0.55}
                    />
                </mesh>
            ))}
        
            {/* soft halo around the ribbon */}
            <mesh geometry={glow}>
                <meshBasicMaterial
                    color="#22d3ee"
                    transparent
                    opacity={0.07}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>

            {/* data packets */}
            {Array.from({ length: 18 }).map((_, i) => (
                <mesh key={i} ref={(m) => { flow.current[i] = m; }}>
                    <sphereGeometry args={[0.075, 12, 12]} />
                    <meshBasicMaterial
                        color="#b9f6ff"
                        transparent
                        opacity={0.95}
                        blending={THREE.AdditiveBlending}
                        depthWrite={false}
                    />
                </mesh>
            ))}

            {/* holographic orbit rings */}
            <group ref={rings}>
                <mesh rotation={[Math.PI / 2.3, 0, 0]}>
                    <torusGeometry args={[2.5, 0.008, 8, 180]} />
                    <meshBasicMaterial color="#22d3ee" transparent opacity={0.4} />
                </mesh>
                <mesh rotation={[Math.PI / 1.8, 0.6, 0]}>
                    <torusGeometry args={[2.05, 0.006, 8, 160]} />
                    <meshBasicMaterial color="#2563eb" transparent opacity={0.5} />
                </mesh>
            </group>
        </group>
    );
}

function Particles({ count = 90 }) {
    const ref = useRef();

    const positions = useMemo(() => {
        const arr = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            arr[i * 3] = (Math.random() - 0.5) * 8;
            arr[i * 3 + 1] = (Math.random() - 0.5) * 5;
            arr[i * 3 + 2] = (Math.random() - 0.5) * 4;
        }
        return arr;
    }, [count]);

    useFrame((_, delta) => {
        if (ref.current) ref.current.rotation.y -= delta * 0.04;
    });

    return (
        <points ref={ref}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
            </bufferGeometry>
            <pointsMaterial
                color="#67e8f9"
                size={0.045}
                sizeAttenuation
                transparent
                opacity={0.85}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}

function MovingLight() {
    const light = useRef();

    useFrame((state) => {
        if (!light.current) return;
        const t = state.clock.elapsedTime;
        light.current.position.set(Math.sin(t * 0.8) * 4, Math.cos(t * 0.6) * 2.5, 3.5);
    });

    return <pointLight ref={light} intensity={55} color="#22d3ee" />;
}

/* If WebGL is unavailable the page keeps working without the 3D part */
class SceneGuard extends Component {
    constructor(props) {
        super(props);
        this.state = { failed: false };
    }

    static getDerivedStateFromError() {
        return { failed: true };
    }

    render() {
        return this.state.failed ? null : this.props.children;
    }
}

export default function HeroScene3D({ offsetX = 0 }) {
    return (
        <SceneGuard>
            <Canvas
                camera={{ position: [0, 0, 5.8], fov: 42 }}
                dpr={[1, 1.5]}
                gl={{ alpha: true, antialias: true }}
            >
                <Environment />
                <ambientLight intensity={0.35} />
                <MovingLight />
                <pointLight position={[-4, -2, 3]} intensity={40} color="#2563eb" />
                <directionalLight position={[0, 4, 3]} intensity={1.1} />

                <Ribbon offsetX={offsetX} />
                <Particles />
            </Canvas>
        </SceneGuard>
    );
}
