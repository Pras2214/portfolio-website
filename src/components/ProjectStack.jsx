import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useScroll, RoundedBox, Text } from '@react-three/drei';
import { easing } from 'maath';

const PALETTES = {
    UI: ['#e0e0e0', '#f5f5f5', '#ffffff'],
    UX: ['#2d3436', '#636e72', '#b2bec3'],
    GRAPHIC: ['#a29bfe', '#ff7675', '#55efc4', '#fd79a8']
};

// ... (imports)

// Helper to interpolate colors
// We can use generic logic or pass colors in props.
// Let's assume we can access project.details[i].imageColor

// Card Dimensions Config
const CARD_DIMENSIONS = {
    desktop: { box: [4.5, 0.15, 3.2], plane: [4.45, 3.15], textWidth: 4 },
    mobile: { box: [1.5, 0.15, 2.7], plane: [1.45, 2.65], textWidth: 2.2 },
    square: { box: [3.5, 0.15, 3.5], plane: [3.45, 3.45], textWidth: 3.2 },
    a4_vertical: { box: [2.5, 0.15, 3.53], plane: [2.45, 3.48], textWidth: 2.8 },
    a4_horizontal: { box: [3.53, 0.15, 2.5], plane: [3.48, 2.45], textWidth: 2.8 }
};

function ProjectCard({ index, activeId, setActiveId, hoveredIndex, setHoveredIndex, data, position: initialPos, rotation: initialRot }) {
    const meshRef = useRef();
    const coverMeshRef = useRef();
    const scroll = useScroll();
    const isActive = activeId === index;
    const isAnyActive = activeId !== null;
    const isHovered = hoveredIndex === index;

    const project = data[index] || {};
    const layout = project.layout || 'desktop';
    const dims = CARD_DIMENSIONS[layout] || CARD_DIMENSIONS.desktop;

    useFrame((state, delta) => {
        if (!meshRef.current) return;

        // Position Logic
        if (isActive) {
            // STICKY MODE (Scrollytelling)
            // Move to Right Side
            easing.damp3(meshRef.current.position, [3.5, 0, 0], 0.4, delta);

            // ROTATION FILTER: Face Camera directly
            easing.dampE(meshRef.current.rotation, [Math.PI / 2, 0, 0], 0.4, delta);

            // Scale Up 2x
            easing.damp3(meshRef.current.scale, [2, 2, 2], 0.4, delta);

            // Color Animation (Cover Image)
            if (coverMeshRef.current && project.details) {
                const totalSections = project.details.length;
                const sectionLength = 1 / totalSections;
                const currentSection = Math.min(
                    Math.floor(scroll.offset / sectionLength),
                    totalSections - 1
                );
                const targetColor = project.details[currentSection]?.imageColor || '#b2bec3';
                easing.dampC(coverMeshRef.current.material.color, targetColor, 0.2, delta);
            }
        } else if (isAnyActive) {
            // Move Away (Inactive)
            easing.damp3(meshRef.current.position, [-20, initialPos[1], -10], 0.5, delta);
            easing.damp3(meshRef.current.scale, [1, 1, 1], 0.4, delta);
        } else {
            // IDLE / STACK MODE
            let targetY = initialPos[1];
            if (hoveredIndex !== null) {
                if (index > hoveredIndex) targetY += 1.8;
                if (index < hoveredIndex) targetY -= 1.8;
            }
            const targetZPos = isHovered ? 2.5 : 0;
            easing.damp3(meshRef.current.position, [initialPos[0], targetY, targetZPos], 0.3, delta);

            // Allow scale to breathe or reset
            const targetScale = isHovered ? 1.05 : 1;
            easing.damp3(meshRef.current.scale, [targetScale, targetScale, targetScale], 0.3, delta);

            // Hover Rotation
            const targetRotX = isHovered ? 1.3 : initialRot[0];
            const targetRotY = isHovered ? 0 : initialRot[1];
            const targetRotZ = isHovered ? 0 : initialRot[2];
            easing.dampE(meshRef.current.rotation, [targetRotX, targetRotY, targetRotZ], 0.3, delta);
        }
    });

    return (
        <group
            ref={meshRef}
            position={initialPos}
            rotation={initialRot}
            onClick={(e) => {
                e.stopPropagation();
                if (!isActive && !isAnyActive) {
                    setActiveId(index);
                    setHoveredIndex(null);
                }
            }}
            onPointerOver={(e) => {
                e.stopPropagation();
                if (!isAnyActive) setHoveredIndex(index);
            }}
            onPointerOut={() => {
                if (!isAnyActive) setHoveredIndex(null);
            }}
        >
            {/* Card Body - Dynamic Size */}
            <RoundedBox args={dims.box} radius={0.05} smoothness={4}>
                <meshPhysicalMaterial
                    color={isActive ? '#ffffff' : '#f5f5f5'}
                    roughness={0.2}
                    metalness={0.1}
                    clearcoat={0.5}
                    clearcoatRoughness={0.1}
                />
            </RoundedBox>

            {/* FULL BLEED Cover Image Placeholder - Dynamic Size */}
            <mesh ref={coverMeshRef} position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={dims.plane} />
                <meshBasicMaterial color="#b2bec3" />
            </mesh>

            {(isHovered) && (
                <Text
                    position={[0, 0.22, 0]}
                    renderOrder={1}
                    rotation={[-Math.PI / 2, 0, 0]}
                    fontSize={0.25}
                    color="#2d3436"
                    anchorX="center"
                    anchorY="middle"
                    maxWidth={dims.textWidth}
                >
                    {project.title.toUpperCase()}
                </Text>
            )}
        </group>
    );
}

export default function ProjectStack({ activeId, setActiveId, data = [] }) {
    const scroll = useScroll();
    const groupRef = useRef();
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const GAP = 1.2;

    // Use Ref to ensure useFrame always sees strict latest state
    const activeRef = useRef(activeId);
    activeRef.current = activeId;

    useFrame((state, delta) => {
        if (groupRef.current) {
            if (activeRef.current === null) {
                // Stack Scroll Logic
                // Dynamic Range Calculation (Required for Navigation Mapping)
                // Index 0 (Bottom Card) is at Y=0. Index N (Top Card) is at Y = (N-1)*GAP.

                const endY = 0;
                // Start Position: Top Card near Center/Top
                const topCardY = (data.length - 1) * GAP;
                const startY = -topCardY - 1.5;

                // Interpolate
                const targetY = startY + (scroll.offset * (endY - startY));

                easing.damp3(groupRef.current.position, [0, targetY, 0], 0.2, delta);
            } else {
                // Active Logic -> Reset Group to Center
                easing.damp3(groupRef.current.position, [0, 0, 0], 0.5, delta);
            }
        }
    });

    return (
        <group ref={groupRef} position={[0, -8, 0]}>
            {data.map((project, i) => (
                <ProjectCard
                    key={i}
                    index={i}
                    activeId={activeId}
                    setActiveId={setActiveId}
                    hoveredIndex={hoveredIndex}
                    setHoveredIndex={setHoveredIndex}
                    data={data}
                    position={[0, i * GAP, 0]}
                    rotation={[0.4, (i % 2 === 0 ? 0.1 : -0.1), 0]}
                />
            ))}
        </group>
    );
}
