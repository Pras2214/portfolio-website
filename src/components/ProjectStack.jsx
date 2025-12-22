// ... imports
import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useScroll, RoundedBox, useTexture, Text, Html } from '@react-three/drei';
import { easing } from 'maath';
import * as THREE from 'three';

// Card Dimensions Config
const CARD_DIMENSIONS = {
    desktop: { box: [4.5, 0.15, 3.2], plane: [4.45, 3.15], textWidth: 4 },
    mobile: { box: [1.5, 0.15, 2.95], plane: [1.5, 2.95], textWidth: 1.4 },
    square: { box: [3.5, 0.15, 3.5], plane: [3.45, 3.45], textWidth: 3.2 },
    a4_vertical: { box: [2.5, 0.15, 3.53], plane: [2.45, 3.48], textWidth: 2.8 },
    a4_horizontal: { box: [3.53, 0.15, 2.5], plane: [3.48, 2.45], textWidth: 2.8 }
};

// ... Shader Material (no changes) ...
const ImageTransitionMaterial = {
    uniforms: {
        tex1: { value: null },
        tex2: { value: null },
        transition: { value: 0 },
        hasTexture: { value: 0 }, // 0 = Color Only, 1 = Texture
        color: { value: new THREE.Color('#b2bec3') },
        uDims: { value: new THREE.Vector2(1, 1) },
        uRadius: { value: 0.05 }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D tex1;
      uniform sampler2D tex2;
      uniform float transition;
      uniform float hasTexture;
      uniform vec3 color;
      uniform vec2 uDims;
      uniform float uRadius;
      varying vec2 vUv;

      float sdRoundedBox( in vec2 p, in vec2 b, in float r ) {
          vec2 q = abs(p) - b + r;
          return min(max(q.x,q.y),0.0) + length(max(q,0.0)) - r;
      }
      
      void main() {
        // Rounded Corner Clipping
        vec2 pos = (vUv - 0.5) * uDims;
        vec2 halfSize = uDims * 0.5;
        float d = sdRoundedBox(pos, halfSize, uRadius);
        
        // Smooth edge (Anti-aliasing)
        float alpha = 1.0 - smoothstep(0.0, 0.005, d);
        if (alpha < 0.01) discard;

        if (hasTexture > 0.5) {
            vec4 t1 = texture2D(tex1, vUv);
            vec4 t2 = texture2D(tex2, vUv);
            gl_FragColor = mix(t1, t2, transition);
        } else {
            gl_FragColor = vec4(color, 1.0);
        }
        
        // Apply alpha to output? Usually default opacity logic is fine but discard handles the shape
        gl_FragColor.a = alpha; 
      }
    `
};

// Preload function
const preloadTextures = (data) => {
    data.forEach(project => {
        if (project.coverImage) useTexture.preload(project.coverImage);
        if (project.details) {
            project.details.forEach(d => {
                if (d.image) useTexture.preload(d.image);
            });
        }
    });
};

function ProjectCard({ index, activeId, setActiveId, hoveredIndex, setHoveredIndex, data, position: initialPos, rotation: initialRot, scrollRef }) {
    const meshRef = useRef();
    const coverMeshRef = useRef();
    // const scroll = useScroll(); // Removed: using passed ref
    const isActive = activeId === index;
    const isAnyActive = activeId !== null;
    const isHovered = hoveredIndex === index;
    const [textBounds, setTextBounds] = useState(null);

    const project = data[index] || {};
    const layout = project.layout || 'desktop';
    const dims = CARD_DIMENSIONS[layout] || CARD_DIMENSIONS.desktop;

    // Image Handling
    const hasCoverImage = !!project.coverImage;
    const detailImages = project.details ? project.details.map(d => d.image) : [];

    // Unique texture URLs to load
    const uniqueUrls = useMemo(() => {
        const set = new Set();
        if (project.coverImage) set.add(project.coverImage);
        detailImages.forEach(url => { if (url) set.add(url); });
        return Array.from(set);
    }, [project.coverImage, detailImages]);

    // Load textures
    const loadedTextures = useTexture(uniqueUrls.length > 0 ? uniqueUrls : ['/placeholders/no-image.png']);

    // Helper to get texture by URL
    const getTexture = (url) => {
        const idx = uniqueUrls.indexOf(url);
        if (idx !== -1) {
            if (Array.isArray(loadedTextures)) return loadedTextures[idx];
            return loadedTextures;
        }
        return null;
    };

    // Prepare Shader Material
    const shaderMaterial = useMemo(() => {
        return new THREE.ShaderMaterial({
            uniforms: THREE.UniformsUtils.clone(ImageTransitionMaterial.uniforms),
            vertexShader: ImageTransitionMaterial.vertexShader,
            fragmentShader: ImageTransitionMaterial.fragmentShader,
            toneMapped: false,
            transparent: true // Enable transperency for AA edges
        });
    }, []);

    // Update dimensions uniform when dims change
    React.useLayoutEffect(() => {
        if (shaderMaterial) {
            shaderMaterial.uniforms.uDims.value.set(dims.plane[0], dims.plane[1]);
            shaderMaterial.uniforms.uRadius.value = 0.05;
        }
    }, [dims, shaderMaterial]);

    useFrame((state, delta) => {
        if (!meshRef.current) return;

        // Get Scroll Offset securely
        const scrollOffset = scrollRef?.current || 0;

        // Position Logic
        if (isActive) {
            // STICKY MODE (Scrollytelling)
            easing.damp3(meshRef.current.position, [3.5, 0, 0], 0.4, delta);
            easing.dampE(meshRef.current.rotation, [Math.PI / 2, 0, 0], 0.4, delta);
            easing.damp3(meshRef.current.scale, [2, 2, 2], 0.4, delta);

            // Dynamic Content Logic - Shader Update
            if (coverMeshRef.current) {
                if (detailImages.length > 0) {
                    const totalSlides = detailImages.length;
                    const slideProgress = scrollOffset * (totalSlides - 1);

                    let idx1 = Math.floor(slideProgress);
                    let idx2 = Math.min(idx1 + 1, totalSlides - 1);
                    let globalRatio = slideProgress - idx1;

                    if (idx1 < 0) idx1 = 0;

                    const url1 = detailImages[idx1] || project.coverImage;
                    const url2 = detailImages[idx2] || project.coverImage;

                    const tex1 = getTexture(url1);
                    const tex2 = getTexture(url2);

                    shaderMaterial.uniforms.tex1.value = tex1;
                    shaderMaterial.uniforms.tex2.value = tex2;
                    shaderMaterial.uniforms.transition.value = globalRatio;
                    shaderMaterial.uniforms.hasTexture.value = 1.0;

                } else if (hasCoverImage) {
                    const tex = getTexture(project.coverImage);
                    shaderMaterial.uniforms.tex1.value = tex;
                    shaderMaterial.uniforms.tex2.value = tex;
                    shaderMaterial.uniforms.transition.value = 0;
                    shaderMaterial.uniforms.hasTexture.value = 1.0;
                } else {
                    shaderMaterial.uniforms.hasTexture.value = 0.0;
                    const totalSections = project.details.length;
                    const sectionLength = 1 / totalSections;
                    const currentSection = Math.min(
                        Math.floor(scrollOffset / sectionLength),
                        totalSections - 1
                    );
                    const targetColor = new THREE.Color(project.details[currentSection]?.imageColor || '#b2bec3');
                    shaderMaterial.uniforms.color.value = targetColor;
                }
            }
        } else if (isAnyActive) {
            // Move Away (Inactive)
            easing.damp3(meshRef.current.position, [-20, initialPos[1], -10], 0.5, delta);
            easing.damp3(meshRef.current.scale, [1, 1, 1], 0.4, delta);
        } else {
            // IDLE / STACK MODE
            if (coverMeshRef.current) {
                if (hasCoverImage) {
                    const tex = getTexture(project.coverImage);
                    shaderMaterial.uniforms.tex1.value = tex;
                    shaderMaterial.uniforms.tex2.value = tex;
                    shaderMaterial.uniforms.transition.value = 0;
                    shaderMaterial.uniforms.hasTexture.value = 1.0;
                } else {
                    shaderMaterial.uniforms.hasTexture.value = 0.0;
                    shaderMaterial.uniforms.color.value = new THREE.Color('#b2bec3');
                }
            }

            let targetY = initialPos[1];
            if (hoveredIndex !== null) {
                if (index > hoveredIndex) targetY += 1.8;
                if (index < hoveredIndex) targetY -= 1.8;
            }
            const targetZPos = isHovered ? 2.5 : 0;
            easing.damp3(meshRef.current.position, [initialPos[0], targetY, targetZPos], 0.3, delta);

            const targetScale = isHovered ? 1.05 : 1;
            easing.damp3(meshRef.current.scale, [targetScale, targetScale, targetScale], 0.3, delta);

            const targetRotX = isHovered ? 1.3 : initialRot[0];
            const targetRotY = isHovered ? 0 : initialRot[1];
            const targetRotZ = isHovered ? 0 : initialRot[2];
            easing.dampE(meshRef.current.rotation, [targetRotX, targetRotY, targetRotZ], 0.3, delta);
        }
    });

    const isMobile = layout === 'mobile';
    const pillFontSize = isMobile ? 0.18 : 0.25;
    const pillMinWidth = isMobile ? 0.8 : 1.6;
    const pillHeight = isMobile ? 0.4 : 0.6;
    const pillPaddingX = isMobile ? 0.08 : 0.12;
    const pillPaddingY = isMobile ? 0.12 : 0.16;

    // ... useFrame for text bounds removed as not critical here ...

    // Dynamic Font Size Calculation to fit long names in the box
    const MAX_CHAR_BEFORE_SHRINK = 12; // Start shrinking earlier to be safe
    const titleLength = project.title ? project.title.length : 10;
    // We add a slight buffer to the divisor to make the shrink curve gentler but effective
    const fontScale = titleLength > MAX_CHAR_BEFORE_SHRINK ? (MAX_CHAR_BEFORE_SHRINK / titleLength) : 1;
    const finalFontSize = pillFontSize * fontScale;
    const minFontSize = 0.14; // Prevent it from getting unreadably small
    const dynamicFontSize = Math.max(finalFontSize, minFontSize);

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
            <RoundedBox args={dims.box} radius={0.05} smoothness={4}>
                <meshPhysicalMaterial
                    color={isActive ? '#ffffff' : '#f5f5f5'}
                    roughness={0.2}
                    metalness={0.1}
                    clearcoat={0.5}
                    clearcoatRoughness={0.1}
                />
            </RoundedBox>

            <mesh ref={coverMeshRef} position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]} material={shaderMaterial}>
                <planeGeometry args={dims.plane} />
            </mesh>

            {isHovered && (
                <>
                    <RoundedBox
                        args={[textBounds ? textBounds[0] + pillPaddingX : pillMinWidth, pillHeight, 0.001]}
                        position={[0.09, 0.1, 0.075]}
                        rotation={[-Math.PI / 2, 0, 0]}
                        radius={0.04}
                        smoothness={4}
                        raycast={() => null}
                    >
                        <meshBasicMaterial color="#000000" transparent opacity={0.075} toneMapped={true} />
                    </RoundedBox>

                    <RoundedBox
                        args={[textBounds ? textBounds[0] + pillPaddingX : pillMinWidth, textBounds ? textBounds[1] + pillPaddingY : pillHeight, 0.01]}
                        position={[0, 0.2, 0]}
                        rotation={[-Math.PI / 2, 0, 0]}
                        radius={0.075}
                        smoothness={4}
                        raycast={() => null}
                    >
                        <meshBasicMaterial color="#f7f5f3" toneMapped={false} />
                    </RoundedBox>

                    <Text
                        position={[0, 0.21, 0]}
                        rotation={[-Math.PI / 2, 0, 0]}
                        fontSize={dynamicFontSize}
                        color="#1a1a1a"
                        fontStyle="italic"
                        font="/Fonts/Playfair_Display/PlayfairDisplay-VariableFont_wght.ttf"
                        anchorX="center"
                        anchorY="middle"
                        outlineWidth={0.0008}
                        raycast={() => null}
                        onSync={(troika) => {
                            if (troika.boundingBox) {
                                const width = troika.boundingBox.max.x - troika.boundingBox.min.x;
                                const height = troika.boundingBox.max.y - troika.boundingBox.min.y;
                                if (!textBounds || Math.abs(textBounds[0] - width) > 0.02 || Math.abs(textBounds[1] - height) > 0.02) {
                                    setTextBounds([width, height]);
                                }
                            }
                        }}
                    >
                        {project.title}
                    </Text>
                </>
            )}
        </group>
    );
}

export default function ProjectStack({ activeId, setActiveId, data = [], onLoad, scrollRef }) {
    // const scroll = useScroll(); // Removed
    const groupRef = useRef();
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const GAP = 1.2;

    // Mount Transition State
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        // Trigger mount animation
        // setMounted(true); // Removed as per instruction

        // Preload textures
        preloadTextures(data);

        // Trigger Ready State
        if (onLoad) onLoad();
    }, [data, onLoad]);


    // Use Ref to ensure useFrame always sees strict latest state
    const activeRef = useRef(activeId);
    activeRef.current = activeId;

    // Calculate Start Position (Dynamic based on data length)
    // Same logic as inside useFrame to ensure consistency
    const endY = 0;
    const topCardY = (data.length - 1) * GAP;
    const startY = -topCardY - 1.5;

    useFrame((state, delta) => {
        if (groupRef.current) {
            // Entrance Animation: Scale up smoothly when mounted
            // const targetScale = mounted ? 1 : 0.9; // Removed as per instruction
            // Only apply this scale damp if we are NOT in active mode
            // (Active mode has its own scale logic in ProjectCard, but the group itself usually stays at 1)
            // Actually, the group scale is separate from card scale.
            // Let's just animate group scale for the entrance.
            // easing.damp3(groupRef.current.scale, [targetScale, targetScale, targetScale], 0.5, delta); // Removed as per instruction

            // Fade In Animation using simple lerp on group opacity (if possible) or position
            // Since we can't easily set group opacity for all children, we can animate scale or use a transitionGroup
            // A simple scale-up from 0.9 is nice.

            // NOTE: Group opacity doesn't cascade to children in ThreeJS by default without custom logic.
            // But we can animate y-position slightly for an 'entrance' effect.

            if (activeRef.current === null) {
                // Stack Scroll Logic
                // We use the same endY and startY calculated above

                // Interpolate
                const scrollOffset = scrollRef?.current || 0;
                const targetY = startY + (scrollOffset * (endY - startY));

                // Entrance Animation override
                // If we want a smooth fade in, we might need a simpler approach:
                // Just let the suspended component appear. Since we preloaded, it should be faster.
                // Or: Initial Y could be lower and damp to target.

                easing.damp3(groupRef.current.position, [0, targetY, 0], 0.2, delta);
            } else {
                // Active Logic -> Reset Group to Center
                easing.damp3(groupRef.current.position, [0, 0, 0], 0.5, delta);
            }
        }
    });

    return (
        <group ref={groupRef} position={[0, startY, 0]}>
            {/* Preload Font to prevent Suspense fallback on first hover */}
            <Text
                font="/Fonts/Playfair_Display/PlayfairDisplay-VariableFont_wght.ttf"
                visible={false}
                text="preload"
            />
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
                    scrollRef={scrollRef}
                />
            ))}
        </group>
    );
}
