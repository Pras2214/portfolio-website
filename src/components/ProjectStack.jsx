// ... imports
import React, { useRef, useState, useMemo, useEffect, useLayoutEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useScroll, RoundedBox, useTexture, Text, Html } from '@react-three/drei';
import { easing } from 'maath';
import * as THREE from 'three';

// Card Dimensions Config
const CARD_DIMENSIONS = {
    desktop: { box: [5.6, 0.19, 4.0], plane: [5.55, 3.95], textWidth: 5 },
    mobile: { box: [1.9, 0.19, 3.7], plane: [1.88, 3.68], textWidth: 1.8 },
    square: { box: [4.4, 0.19, 4.4], plane: [4.35, 4.35], textWidth: 4.0 },
    a4_vertical: { box: [3.1, 0.19, 4.4], plane: [3.05, 4.35], textWidth: 3.5 },
    a4_horizontal: { box: [4.4, 0.19, 3.1], plane: [4.35, 3.05], textWidth: 3.5 }
};

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

function ProjectCard({ index, activeId, setActiveId, hoveredIndex, setHoveredIndex, data, position: initialPos, rotation: initialRot, scrollRef, onOpen, gl }) {
    const meshRef = useRef();
    const coverMeshRef = useRef();
    // const scroll = useScroll(); // Removed: using passed ref
    const isActive = activeId === index;
    const isAnyActive = activeId !== null;
    const isHovered = hoveredIndex === index;
    const [textBounds, setTextBounds] = useState(null);

    // Mouse tracking for tilt effect on active project
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isImageHovered, setIsImageHovered] = useState(false);

    // FLICKER FIX: Local Scroll Lock
    // Even if scrollRef is reset, it might be overwritten by the unmounting stack scroll bridge.
    // We enforce a hard lock to 0 for the first few frames of activation.
    const lockScrollRef = useRef(false);

    useLayoutEffect(() => {
        if (isActive) {
            lockScrollRef.current = true;
            // Unlock after 100ms (enough time for transition to settle)
            const t = setTimeout(() => {
                lockScrollRef.current = false;
            }, 100);
            return () => clearTimeout(t);
        }
    }, [isActive]);

    const project = data[index] || {};
    const layout = project.layout || 'desktop';
    const dims = CARD_DIMENSIONS[layout] || CARD_DIMENSIONS.desktop;

    // Image Handling
    const hasCoverImage = !!project.coverImage;

    // Random idle rotation speed and direction
    const randomSpeed = useMemo(() => (Math.random() * 0.2 + 0.1) * (Math.random() > 0.5 ? 1 : -1), []);

    const detailImages = project.details ? project.details.map(d => d.image) : [];

    // --- OPTIMIZATION: Deferred Texture Loading ---

    // 1. Initial Load: Async Cover Image (Non-blocking)
    const coverUrl = project.coverImage || '/placeholders/no-image.png';
    const [coverTexture, setCoverTexture] = useState(null);

    useLayoutEffect(() => {
        const loader = new THREE.TextureLoader();
        loader.load(coverUrl, (tex) => {
            tex.anisotropy = gl.capabilities.getMaxAnisotropy();
            tex.needsUpdate = true;
            setCoverTexture(tex);
        });
    }, [coverUrl, gl]);

    // 2. Deferred Load: Detail images loaded on Hover or Active
    const [detailTextures, setDetailTextures] = useState({});
    const [areDetailsLoaded, setAreDetailsLoaded] = useState(false);
    // const { gl } = useThree(); // REMOVED: gl is now passed as prop
    useEffect(() => {
        // Trigger load if Hovered OR Active, and not yet loaded
        if ((isHovered || isActive) && !areDetailsLoaded && detailImages.length > 0) {

            const loader = new THREE.TextureLoader();
            let loadedCount = 0;
            const totalToLoad = detailImages.length;

            detailImages.forEach((url) => {
                if (!url) {
                    loadedCount++;
                    if (loadedCount === totalToLoad) {
                        setAreDetailsLoaded(true);
                    }
                    return;
                }

                // If already loaded in previous partial batch, skip re-loading
                if (detailTextures[url]) {
                    loadedCount++;
                    if (loadedCount === totalToLoad) {
                        setAreDetailsLoaded(true);
                    }
                    return;
                }

                loader.load(
                    url,
                    (tex) => {
                        tex.anisotropy = gl.capabilities.getMaxAnisotropy();
                        tex.needsUpdate = true;

                        // INCREMENTAL UPDATE: Update state as soon as ONE texture loads
                        // This ensures the user sees images as they arrive, rather than waiting for the whole batch
                        setDetailTextures(prev => ({ ...prev, [url]: tex }));

                        loadedCount++;
                        if (loadedCount === totalToLoad) {
                            setAreDetailsLoaded(true);
                        }
                    },
                    undefined,
                    (err) => {
                        console.warn('Failed to load detail texture:', url, err);
                        loadedCount++; // Fail gracefully
                        if (loadedCount === totalToLoad) {
                            setAreDetailsLoaded(true);
                        }
                    }
                );
            });
        }
    }, [isHovered, isActive, areDetailsLoaded, detailImages, gl]);


    // Helper to get texture by URL (Handling both synchronous Cover and async Details)
    const getTexture = (url) => {
        // 1. Is it the cover? active or not, we likely have it.
        if (url === project.coverImage) return coverTexture;

        // 2. Is it in our lazy loaded map?
        if (detailTextures[url]) return detailTextures[url];

        // 3. Fallback: If we are asking for a detail image but it's not loaded yet,
        // show the Cover Image temporarily to prevent transparent flicker.
        return coverTexture;
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
        // FLICKER FIX: If locked, force to 0.
        let scrollOffset = scrollRef?.current || 0;
        if (lockScrollRef.current) scrollOffset = 0;

        // Position Logic
        if (isActive) {
            // STICKY MODE (Scrollytelling)
            easing.damp3(meshRef.current.position, [3.5, 0, 0], 0.4, delta);

            // Apply tilt effect to entire card when hovered (matching ProjectsPage effect)
            if (isImageHovered) {
                // Calculate tilt based on mouse position (matching ProjectsPage logic)
                // Mouse position is normalized from -1 to 1
                const rotateX = -mousePos.y * 0.087; // ~5 degrees max - up/down tilt
                const rotateZ = -mousePos.x * 0.087; // ~5 degrees max - left/right tilt (using Z-axis, not Y)

                // Apply tilt to the card (X and Z axis for perspective effect, avoiding Y-axis clockwise rotation)
                easing.dampE(
                    meshRef.current.rotation,
                    [Math.PI / 2 + rotateX, 0, rotateZ],
                    0.15,
                    delta
                );
            } else {
                // Reset to flat when not hovered
                easing.dampE(
                    meshRef.current.rotation,
                    [Math.PI / 2, 0, 0],
                    0.4,
                    delta
                );
            }

            easing.damp3(meshRef.current.scale, [1.45, 1.45, 1.45], 0.4, delta);

            // Keep cover mesh rotation flat and position fixed (no parallax)
            if (coverMeshRef.current) {
                coverMeshRef.current.rotation.set(-Math.PI / 2, 0, 0);
                coverMeshRef.current.position.set(0, 0.1001, 0); // Parallax movement removed
            }

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
            const targetRotZ = isHovered ? 0 : initialRot[2];

            if (hoveredIndex === null) {
                // Global Idle -> Independent Spin
                // We damp X and Z to keep them stable while Y spins freely
                easing.damp(meshRef.current.rotation, 'x', targetRotX, 0.3, delta);
                easing.damp(meshRef.current.rotation, 'z', targetRotZ, 0.3, delta);
                meshRef.current.rotation.y += delta * randomSpeed;
            } else {
                // Focus Mode -> Stabilize
                // Damp all axes to their target positions (reset Y to initial or flat)
                const targetRotY = isHovered ? 0 : initialRot[1];
                easing.dampE(meshRef.current.rotation, [targetRotX, targetRotY, targetRotZ], 0.3, delta);
            }
        }
    });

    const isMobile = layout === 'mobile';
    const pillFontSize = isMobile ? 0.22 : 0.30;
    const baseMinWidth = isMobile ? 1.5 : 2.5; // Dynamic min width
    const pillMinWidth = baseMinWidth; // Fallback
    const pillHeight = isMobile ? 0.65 : 0.75; // Increased mobile height for better fit
    const pillPaddingX = isMobile ? 0.1 : 0.15;
    const pillPaddingY = isMobile ? 0.15 : 0.2;

    // ... useFrame for text bounds removed as not critical here ...

    // Dynamic Font Size Calculation to fit long names in the box
    const MAX_CHAR_BEFORE_SHRINK = isMobile ? 7 : 12;
    const titleLength = project.title ? project.title.length : 10;
    const fontScale = titleLength > MAX_CHAR_BEFORE_SHRINK ? (MAX_CHAR_BEFORE_SHRINK / titleLength) : 1;
    const finalFontSize = pillFontSize * fontScale;
    const minFontSize = isMobile ? 0.13 : 0.14;
    const dynamicFontSize = Math.max(finalFontSize, minFontSize);

    // Dynamic Vertical Spacing
    const titleOffsetY = isMobile ? 0.08 : 0.12;
    const typeOffsetY = isMobile ? -0.12 : -0.15;
    const clickHintY = isMobile ? -0.25 : -0.28;

    return (
        <group
            ref={meshRef}
            position={initialPos}
            rotation={initialRot}
            onClick={(e) => {
                e.stopPropagation();
                if (isActive) {
                    setActiveId(null); // Close if already active
                } else if (!isAnyActive) {
                    // FLICKER FIX: Delegated to Parent to manage Transition State
                    if (onOpen) {
                        onOpen(index);
                    } else {
                        // Fallback (Should typically not happen if onOpen is passed)
                        if (scrollRef) scrollRef.current = 0;
                        setActiveId(index);
                        setHoveredIndex(null);
                    }
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

            <mesh
                ref={coverMeshRef}
                position={[0, 0.1001, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                material={shaderMaterial}
                onPointerMove={(e) => {
                    if (isActive) {
                        e.stopPropagation();
                        // Get normalized mouse position relative to the mesh
                        // e.uv gives us 0-1 coordinates, convert to -1 to 1
                        const x = (e.uv.x - 0.5) * 2;
                        const y = (e.uv.y - 0.5) * 2;
                        setMousePos({ x, y });
                    }
                }}
                onPointerOver={(e) => {
                    if (isActive) {
                        e.stopPropagation();
                        setIsImageHovered(true);
                    }
                }}
                onPointerOut={(e) => {
                    if (isActive) {
                        e.stopPropagation();
                        setIsImageHovered(false);
                        setMousePos({ x: 0, y: 0 });
                    }
                }}
            >
                <planeGeometry args={dims.plane} />
            </mesh>

            {isHovered && (
                <>
                    {/* Shadow/Backing for Text - SLEEK */}
                    <RoundedBox
                        args={[textBounds ? Math.max(textBounds[0], baseMinWidth) + pillPaddingX : baseMinWidth, pillHeight * 1.1, 0.001]}
                        position={[0.09, 0.2, 0.075]} // Slightly elevated
                        rotation={[-Math.PI / 2, 0, 0]}
                        radius={0.04}
                        smoothness={4}
                        raycast={() => null}
                    >
                        <meshBasicMaterial color="#000000" transparent opacity={0.075} toneMapped={true} />
                    </RoundedBox>

                    {/* Main White Pill - SLEEK */}
                    <RoundedBox
                        args={[textBounds ? Math.max(textBounds[0], baseMinWidth) + pillPaddingX : baseMinWidth, pillHeight * 1.1, 0.01]}
                        position={[0, 0.3, 0]} // Slightly elevated
                        rotation={[-Math.PI / 2, 0, 0]}
                        radius={0.075}
                        smoothness={4}
                        raycast={() => null}
                    >
                        <meshBasicMaterial color="#f7f5f3" toneMapped={false} />
                    </RoundedBox>

                    <group position={[0, 0.31, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                        {/* Title - Centered */}
                        <Text
                            position={[0, titleOffsetY, 0]}
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
                                    if (!textBounds || Math.abs(textBounds[0] - width) > 0.02) {
                                        setTextBounds([width, 0]);
                                    }
                                }
                            }}
                        >
                            {project.title}
                        </Text>

                        {/* Project Type - Subtle & Tucked */}
                        <Text
                            position={[0, typeOffsetY, 0]}
                            fontSize={0.11}
                            color="#888888" // Softer grey
                            font="/Fonts/Playfair_Display/PlayfairDisplay-VariableFont_wght.ttf"
                            anchorX="center"
                            anchorY="middle"
                            letterSpacing={0.05}
                            raycast={() => null}
                        >
                            {(project.type || "Project").toUpperCase()}
                        </Text>
                        <Text
                            position={[0, clickHintY, 0]} // Floating well below
                            fontSize={0.09}
                            color="#555555" // Dark Grey for visibility
                            fontStyle="italic"
                            font="/Fonts/Playfair_Display/PlayfairDisplay-VariableFont_wght.ttf"
                            anchorX="center"
                            anchorY="middle"
                            raycast={() => null}
                        >
                            (Click to explore)
                        </Text>
                    </group>
                </>
            )}
        </group>
    );
}

export default function ProjectStack({ activeId, setActiveId, data = [], onLoad, scrollRef }) {
    // const scroll = useScroll(); // Removed
    const groupRef = useRef();
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const GAP = 1.5;

    // FLICKER FIX: Transition State
    // We use this ref to "freeze" the stack position logic for exactly one frame (or until the state update settles).
    // This prevents the stack from jumping to the "scroll=0" position immediately when we click a card,
    // because we have to reset scrollRef.current = 0 for the incoming active card's shader.
    const transitioningRef = useRef(false);

    // Reset transitioning state when activeId stabilizes
    useEffect(() => {
        if (activeId !== null) {
            transitioningRef.current = false;
        }
    }, [activeId]);

    const handleProjectSelect = (index) => {
        // 1. Mark transition as started so useFrame knows to IGNORE the sudden scrollRef=0 change
        transitioningRef.current = true;

        // 2. Reset scroll to 0 immediately so the NEW active card starts at the top (covers 0-frame shader glitch)
        if (scrollRef) scrollRef.current = 0;

        // 3. Trigger State Update
        setActiveId(index);
        setHoveredIndex(null);
    };

    // Mount Transition State
    useEffect(() => {
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

                // FLICKER FIX: Only update position if we are NOT in the middle of a transition
                if (!transitioningRef.current) {
                    easing.damp3(groupRef.current.position, [0, targetY, 0], 0.2, delta);
                }
            } else {
                // Active Logic -> Reset Group to Center
                easing.damp3(groupRef.current.position, [0, 0, 0], 0.5, delta);
            }

            // Idle Rotation Logic Removed (Moved to ProjectCard for individual control)
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
                    onOpen={handleProjectSelect}
                    gl={useThree().gl} // Pass gl from parent context
                />
            ))}
        </group>
    );
}
