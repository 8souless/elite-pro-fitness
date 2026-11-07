/**
 * Three.js WebGL emblem with rim lighting, specular sweep, and graceful fallback.
 */

export function createEmblemScene(canvas, url) {
  try {
    if (typeof window === "undefined" || !window.THREE) {
      return null;
    }

    // Test WebGL support
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) {
      return null;
    }

    const THREE = window.THREE;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    let width = canvas.clientWidth || 300;
    let height = canvas.clientHeight || 300;
    renderer.setSize(width, height, false);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(
      -width / 2,
      width / 2,
      height / 2,
      -height / 2,
      0.1,
      1000
    );
    camera.position.z = 10;

    // Load emblem texture
    const textureLoader = new THREE.TextureLoader();
    let textureReady = false;
    const texture = textureLoader.load(
      url,
      () => {
        textureReady = true;
      },
      undefined,
      (err) => {
        console.warn("WebGL emblem texture failed to load:", err);
      }
    );

    // Aspect ratio of the trimmed EPF emblem is ~1765 / 1499 = 1.177
    const aspect = 1765 / 1499;
    const baseH = 260;
    const baseW = baseH * aspect;
    const geometry = new THREE.PlaneGeometry(baseW, baseH);

    const uniforms = {
      uTexture: { value: texture },
      uTime: { value: 0 },
      uAlpha: { value: 1 },
      uRimColor: { value: new THREE.Color("#F5A623") },
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthTest: false,
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D uTexture;
        uniform float uTime;
        uniform float uAlpha;
        uniform vec3 uRimColor;
        varying vec2 vUv;
        void main() {
          vec4 col = texture2D(uTexture, vUv);
          if (col.a < 0.01) discard;
          float sweep = clamp(sin(vUv.x * 2.5 - uTime * 0.8) * 0.5 + 0.5, 0.0, 1.0);
          vec3 rim = uRimColor * sweep * 0.3 * col.a;
          gl_FragColor = vec4(col.rgb + rim, col.a * uAlpha);
        }
      `,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    let isLost = false;
    canvas.addEventListener("webglcontextlost", (e) => {
      e.preventDefault();
      isLost = true;
      const heroRoot = canvas.closest("#hero");
      if (heroRoot) {
        heroRoot.dataset.webgl = "off";
      }
    });

    return {
      resize(w, h) {
        if (isLost) return;
        width = w;
        height = h;
        renderer.setSize(w, h, false);
        camera.left = -w / 2;
        camera.right = w / 2;
        camera.top = h / 2;
        camera.bottom = -h / 2;
        camera.updateProjectionMatrix();
      },
      render(state, pointer = { x: 0, y: 0 }) {
        if (isLost || !textureReady) return;

        // Position mesh in CSS pixel coordinates relative to center
        const targetX = (state.emblemX - 0.5) * width;
        const targetY = -(state.emblemY - 0.5) * height;

        mesh.position.set(targetX, targetY, 0);

        const baseScale = state.emblemScale || 1;
        mesh.scale.set(baseScale, baseScale, 1);

        // Tilt based on pointer
        mesh.rotation.y = pointer.x * (Math.PI / 18); // ~10 degrees
        mesh.rotation.x = -pointer.y * (Math.PI / 24);

        uniforms.uTime.value = performance.now() * 0.001;
        uniforms.uAlpha.value = state.emblemOpacity;

        renderer.render(scene, camera);
      },
      destroy() {
        renderer.dispose();
      },
    };
  } catch (err) {
    console.warn("createEmblemScene init error:", err);
    return null;
  }
}
