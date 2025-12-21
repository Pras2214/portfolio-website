
import React, { useRef } from 'react';
import { useScroll } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { easing } from 'maath';

function GalleryItem({ color, index, total }) {
    // Horizontal layout: X axis
    // Gap 6.5 (Width 6 + Gap 0.5)
    // Start at some offset?
    const GAP = 7.0;
    const xPos = index * GAP;

    return (
        <mesh position={[xPos, 0, 0]}>
            <planeGeometry args={[6.4, 3.6]} /> {/* 16:9 aspectish */}
            <meshBasicMaterial color={color} />

            {/* Gloss Header Bar (Visual detail) */}
            <mesh position={[0, 1.6, 0.01]}>
                <planeGeometry args={[6.4, 0.4]} />
                <meshBasicMaterial color="black" transparent opacity={0.1} />
            </mesh>
        </mesh>
    );
}

export default function ProjectGalleryHorizontal({ images = [] }) {
    const scroll = useScroll();
    const groupRef = useRef();

    // Total width of the content
    const GAP = 7.0;
    const totalWidth = (images.length - 1) * GAP;

    useFrame((state, delta) => {
        // Vertical Scroll -> Horizontal Movement
        // scroll.offset (0..1)
        // We want to move from 0 to -totalWidth
        // Adding some damping for parallax feel

        // Target X position:
        // Start: x=0 (First image centered?)
        // Let's center the active area. 
        // We want the group to move LEFT, so X becomes negative.
        const targetX = -scroll.offset * totalWidth;

        if (groupRef.current) {
            // Position the group. 
            // We start with the group at X=3 or so to be on the right side?
            // Actually, if we want them to take over the screen, maybe Center (0,0)?
            // User said "Details on left... images on right".
            // So default position should be Right (e.g. X=4).

            // X = StartPos + ScrollOffset
            easing.damp3(groupRef.current.position, [4 + targetX, 0, 0], 0.2, delta);
        }
    });

    return (
        <group ref={groupRef} position={[4, 0, 0]}>
            {images.map((color, i) => (
                <GalleryItem key={i} index={i} color={color} total={images.length} />
            ))}
        </group>
    );
}
