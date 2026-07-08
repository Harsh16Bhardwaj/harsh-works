"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

function createSpiceGeometry() {
  const geometry = new THREE.CircleGeometry(0.023, 8);
  return geometry;
}

export function HeroScene({
  className = "hero-scene",
  density = 1,
  direction = 1,
  speedScale = 1,
  particleScale = 1,
  color = 0xd7a448,
  materialOpacity = 0.48,
}) {
  const canvasRef = useRef(null);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.matchMedia("(max-width: 720px)").matches;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    } catch {
      setUnavailable(true);
      return undefined;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.2 : 1.7));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 8);

    const baseSpiceCount = reduceMotion ? 28 : mobile ? 150 : 280;
    const spiceCount = Math.round(baseSpiceCount * density);
    const spiceGeometry = createSpiceGeometry();
    const spiceMaterial = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: materialOpacity,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const spices = new THREE.InstancedMesh(spiceGeometry, spiceMaterial, spiceCount);
    spices.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(spices);

    const dummy = new THREE.Object3D();
    const spiceData = Array.from({ length: spiceCount }, (_, index) => {
      const depth = Math.random() * 4 - 2;
      const group = Math.floor(index / 14);
      const flare = index % 31 === 0;
      const stream = Math.sin(group * 1.7) * 1.15;
      return {
        x: Math.random() * 15 - 7.8,
        y: stream + Math.random() * 1.9 - 0.95,
        z: depth,
        scale: flare ? 1.55 + Math.random() * 0.95 : 0.48 + Math.random() * 0.92,
        speed: (0.26 + Math.random() * 0.58 + (flare ? 0.14 : 0)) * speedScale,
        lift: 0.16 + Math.random() * 0.5,
        sway: 0.12 + Math.random() * 0.32,
        spin: 0.18 + Math.random() * 0.55,
        phase: Math.random() * Math.PI * 2,
        flare,
      };
    });

    const pointer = { x: 0, y: 0 };
    const onPointerMove = (event) => {
      pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
      pointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
    };
    if (!reduceMotion) window.addEventListener("pointermove", onPointerMove, { passive: true });

    function resizeRendererToDisplaySize() {
      const width = Math.max(1, canvas.clientWidth);
      const height = Math.max(1, canvas.clientHeight);
      const pixelRatio = renderer.getPixelRatio();
      const nextWidth = Math.floor(width * pixelRatio);
      const nextHeight = Math.floor(height * pixelRatio);
      const needsResize = canvas.width !== nextWidth || canvas.height !== nextHeight;
      if (needsResize) {
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }
    }

    function updateSpice(seconds) {
      spiceData.forEach((spice, index) => {
        const travel = reduceMotion ? 0 : seconds * spice.speed * direction;
        const shimmer = Math.sin(seconds * spice.lift + spice.phase) * spice.sway;
        const parallaxX = pointer.x * (0.08 + spice.z * 0.01);
        const parallaxY = pointer.y * 0.05;
        let x = spice.x + travel + parallaxX;
        x = ((((x + 7.8) % 15.6) + 15.6) % 15.6) - 7.8;
        const y = spice.y + shimmer + parallaxY;

        dummy.position.set(x, y, spice.z);
        dummy.rotation.set(
          Math.sin(seconds * 0.2 + spice.phase) * 0.36,
          seconds * spice.spin + spice.phase,
          Math.cos(seconds * 0.22 + spice.phase) * 0.28,
        );
        dummy.scale.set(
          spice.scale * particleScale * (spice.flare ? 1.45 : 1),
          spice.scale * particleScale * 0.46,
          spice.scale * particleScale,
        );
        dummy.updateMatrix();
        spices.setMatrixAt(index, dummy.matrix);
      });
      spices.instanceMatrix.needsUpdate = true;
    }

    let raf = 0;
    const render = (time = 0) => {
      const seconds = time * 0.001;
      resizeRendererToDisplaySize();
      updateSpice(seconds);
      renderer.render(scene, camera);
      if (!reduceMotion) raf = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointerMove);
      scene.remove(spices);
      spiceGeometry.dispose();
      spiceMaterial.dispose();
      renderer.dispose();
    };
  }, [color, density, direction, materialOpacity, particleScale, speedScale]);

  if (unavailable) return <div className={`${className} hero-scene-fallback`} aria-hidden="true" />;
  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
