import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useScroll, RoundedBox, useTexture, Text, Html } from '@react-three/drei';
import { easing } from 'maath';
import * as THREE from 'three';

// Card Dimensions Config
const CARD_DIMENSIONS = {
    desktop: { box: [4.5, 0.15, 3.2], plane: [4.45, 3.15], textWidth: 4 },
    mobile: { box: [1.5, 0.15, 3], plane: [1.55, 3], textWidth: 1.4 },
    square: { box: [3.5, 0.15, 3.5], plane: [3.45, 3.45], textWidth: 3.2 },
    a4_vertical: { box: [2.5, 0.15, 3.53], plane: [2.45, 3.48], textWidth: 2.8 },
    a4_horizontal: { box: [3.53, 0.15, 2.5], plane: [3.48, 2.45], textWidth: 2.8 }
};

// Custom Shader for Smooth Transition
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

function ProjectCard({ index, activeId, setActiveId, hoveredIndex, setHoveredIndex, data, position: initialPos, rotation: initialRot }) {
    const meshRef = useRef();
    const coverMeshRef = useRef();
    const scroll = useScroll();
    const isActive = activeId === index;
    const isAnyActive = activeId !== null;
    const isHovered = hoveredIndex === index;
    const [textBounds, setTextBounds] = useState(null);

    const project = data[index] || {};
    const layout = project.layout || 'desktop';
    const dims = CARD_DIMENSIONS[layout] || CARD_DIMENSIONS.desktop;

    // Image Handling
    const hasCoverImage = !!project.coverImage;
    // We assume details[i].image exists if the user wants an image for that section.
    // We should build a stable list of images for the "Slideshow". 
    // Ideally, length matches project.details.length for 1-to-1 mapping.
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
            // If loadedTextures is an array, return the specific texture
            if (Array.isArray(loadedTextures)) return loadedTextures[idx];
            // If loadedTextures is a single texture (only one unique URL), return it
            return loadedTextures;
        }
        // Fallback if URL not found (shouldn't happen if uniqueUrls is correctly built)
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

        // Position Logic
        if (isActive) {
            // STICKY MODE (Scrollytelling)
            easing.damp3(meshRef.current.position, [3.5, 0, 0], 0.4, delta);
            easing.dampE(meshRef.current.rotation, [Math.PI / 2, 0, 0], 0.4, delta);
            easing.damp3(meshRef.current.scale, [2, 2, 2], 0.4, delta);

            // Dynamic Content Logic - Shader Update
            if (coverMeshRef.current) {
                // If we have detail images, we drive the transition
                // Map scroll offset (0..1) to Slideshow Index (0 .. details.length-1)

                if (detailImages.length > 0) {
                    const totalSlides = detailImages.length;
                    // Range: 0 to totalSlides - 1
                    // Scroll=0 -> Index 0. Scroll=1 -> Index totalSlides-1.
                    const slideProgress = scroll.offset * (totalSlides - 1);

                    let idx1 = Math.floor(slideProgress);
                    let idx2 = Math.min(idx1 + 1, totalSlides - 1);
                    let globalRatio = slideProgress - idx1;

                    // Constrain for safety
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
                    // Static Cover
                    const tex = getTexture(project.coverImage);
                    shaderMaterial.uniforms.tex1.value = tex;
                    shaderMaterial.uniforms.tex2.value = tex;
                    shaderMaterial.uniforms.transition.value = 0;
                    shaderMaterial.uniforms.hasTexture.value = 1.0;
                } else {
                    // Fallback Color Animation
                    shaderMaterial.uniforms.hasTexture.value = 0.0;

                    const totalSections = project.details.length;
                    const sectionLength = 1 / totalSections;
                    const currentSection = Math.min(
                        Math.floor(scroll.offset / sectionLength),
                        totalSections - 1
                    );
                    const targetColor = new THREE.Color(project.details[currentSection]?.imageColor || '#b2bec3');
                    // We can't easily damp a uniform color inside shader without holding state, 
                    // but we can pass it uniform. 
                    // Let's just lerp the shader uniform value if we want smooth, 
                    // or just set it:
                    shaderMaterial.uniforms.color.value = targetColor;
                }
            }
        } else if (isAnyActive) {
            // Move Away (Inactive)
            easing.damp3(meshRef.current.position, [-20, initialPos[1], -10], 0.5, delta);
            easing.damp3(meshRef.current.scale, [1, 1, 1], 0.4, delta);
        } else {
            // IDLE / STACK MODE
            // Reset to Cover Image
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

    useFrame((state, delta) => {
        if (!meshRef.current) return;
        // ... (rest of useFrame is unchanged, I need to match the start/end lines to avoid cutting code)
        // Wait, replace_file_content replaces the whole block. I should only target the render block.
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
            {/* Card Body */}
            <RoundedBox args={dims.box} radius={0.05} smoothness={4}>
                <meshPhysicalMaterial
                    color={isActive ? '#ffffff' : '#f5f5f5'}
                    roughness={0.2}
                    metalness={0.1}
                    clearcoat={0.5}
                    clearcoatRoughness={0.1}
                />
            </RoundedBox>

            {/* FULL BLEED Cover Plane - Shader Material */}
            <mesh ref={coverMeshRef} position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]} material={shaderMaterial}>
                <planeGeometry args={dims.plane} />
            </mesh>

            {isHovered && (
                <>
                    {/* Shadow (On Card Surface) */}
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

                    {/* Background Surface (Floating Pill) */}
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

                    {/* Text Label */}
                    <Text
                        position={[0, 0.21, 0]}
                        rotation={[-Math.PI / 2, 0, 0]}
                        fontSize={pillFontSize}
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
