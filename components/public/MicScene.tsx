"use client";

import { useEffect, useRef, useCallback } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

/**
 * Vanilla Three.js 3D mic scene — uses only `three`, no React reconciler.
 * Returns an `updateMouse` callback to feed normalized mouse coords.
 */
export function useMicScene(containerRef: React.RefObject<HTMLDivElement | null>) {
  const mouseRef = useRef({ x: 0, y: 0 });

  const updateMouse = useCallback((x: number, y: number) => {
    mouseRef.current.x = x;
    mouseRef.current.y = y;
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isMobile = container.clientWidth < 640;

    // ── Renderer ──
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1 : 1.5));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x020617);
    container.appendChild(renderer.domElement);

    // ── Scene + Camera ──
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      isMobile ? 50 : 42,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, isMobile ? 0.6 : 0.3, isMobile ? 5.5 : 6);

    // ── Lights ──
    const ambient = new THREE.AmbientLight(0x1a1a2e, 0.08);
    scene.add(ambient);

    const spotlight = new THREE.SpotLight(0xfff4d6, 120, 0, 0.28, 0.6);
    spotlight.position.set(0, 6, 3);
    spotlight.castShadow = true;
    spotlight.shadow.mapSize.set(isMobile ? 1024 : 2048, isMobile ? 1024 : 2048);
    spotlight.shadow.bias = -0.0001;
    scene.add(spotlight);
    scene.add(spotlight.target);

    const rimLight = new THREE.PointLight(0x3b6fd4, 18, 12, 2);
    rimLight.position.set(-4, 1, 2);
    scene.add(rimLight);

    const fillLight = new THREE.PointLight(0xff9a3c, 8, 8, 2);
    fillLight.position.set(1.5, -1, 3);
    scene.add(fillLight);

    // ── Shadow plane ──
    const planeGeo = new THREE.PlaneGeometry(20, 20);
    const planeMat = new THREE.ShadowMaterial({ transparent: true, opacity: 0.45 });
    const shadowPlane = new THREE.Mesh(planeGeo, planeMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -1.8;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // ── Particles (stage dust) ──
    const PARTICLE_COUNT = isMobile ? 60 : 120;
    const particlePositions = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 6;
      particlePositions[i * 3 + 1] = Math.random() * 4 - 1;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.018,
      color: 0xfff4d6,
      transparent: true,
      opacity: 0.35,
      sizeAttenuation: true,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // ── Load mic model ──
    let micPivot: THREE.Group | null = null;
    const manager = new THREE.LoadingManager();
    manager.onError = (url) => {
      // Suppress blob-texture errors — fallback materials applied below
      console.warn("[MicScene] Resource failed to load, using fallback:", url);
    };
    const loader = new GLTFLoader(manager);
    loader.load(
      "/models/mic.glb",
      (gltf) => {
        const model = gltf.scene;

        // Measure and auto-scale so the mic fits nicely in view
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const TARGET_HEIGHT = isMobile ? 1.6 : 2.4;
        const scaleFactor = TARGET_HEIGHT / maxDim;
        model.scale.setScalar(scaleFactor);

        // Re-measure after scaling and center
        box.setFromObject(model);
        box.getCenter(center);
        model.position.sub(center);

        // Wrap in a pivot group so rotations happen about the center
        micPivot = new THREE.Group();
        micPivot.add(model);
        scene.add(micPivot);

        // Enable shadows + apply a metallic fallback material for meshes
        // whose textures failed to load from the GLB
        const fallback = new THREE.MeshStandardMaterial({
          color: 0x888888,
          metalness: 0.95,
          roughness: 0.15,
        });
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            const mat = mesh.material as THREE.MeshStandardMaterial;
            if (mat.map && !mat.map.image) {
              mesh.material = fallback;
            }
          }
        });
      },
      undefined,
      (err) => {
        console.warn("[MicScene] GLB load error:", err);
      }
    );

    // ── Animation loop ──
    const clock = new THREE.Clock();
    let frameId: number;

    function animate() {
      frameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      const mouse = mouseRef.current;

      if (micPivot) {
        micPivot.rotation.y = t * 0.25 + mouse.x * 0.22;
        micPivot.position.y = Math.sin(t * 1.1) * 0.06;
        micPivot.rotation.z = Math.sin(t * 0.6) * 0.01;
        micPivot.rotation.x = THREE.MathUtils.lerp(micPivot.rotation.x, mouse.y * 0.18, 0.05);
      }

      spotlight.position.x = THREE.MathUtils.lerp(spotlight.position.x, mouse.x * 1.5, 0.04);
      spotlight.position.z = THREE.MathUtils.lerp(spotlight.position.z, 3 + mouse.y * 0.8, 0.04);

      const pos = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        pos[i * 3 + 1] += 0.001;
        if (pos[i * 3 + 1] > 3) pos[i * 3 + 1] = -1;
      }
      particleGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    }
    animate();

    // ── Resize ──
    function onResize() {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      const mobile = w < 640;
      camera.aspect = w / h;
      camera.fov = mobile ? 50 : 42;
      camera.position.z = mobile ? 5.5 : 6;
      camera.position.y = mobile ? 0.6 : 0.3;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener("resize", onResize);

    // ── Cleanup ──
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      planeGeo.dispose();
      planeMat.dispose();
      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.geometry.dispose();
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => m.dispose());
          } else {
            mesh.material.dispose();
          }
        }
      });
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [containerRef]);

  return { updateMouse };
}
