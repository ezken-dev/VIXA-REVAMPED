'use client';

import React, {useEffect, useRef} from 'react';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {FLAGSHIP_PROJECTS, type FlagshipProject} from './ProjectDetailModal';

interface WorkRibbonCanvasProps {
  /** Master scroll progress (0.00 -> 1.00) */
  scrollProgressRef: React.MutableRefObject<number>;
  /** Stage 6 scroll progress (0.00 -> 1.00) for Work Ribbon -> 3D CRT Monitor Zoom-In */
  stage6ProgressRef: React.MutableRefObject<number>;
  /** Callback when a card in the 3D ribbon is clicked */
  onSelectProject: (project: FlagshipProject) => void;
  /** Optional ref to drive the top-center Stage 5 header fade as the ribbon twists */
  headerTwistRef?: React.MutableRefObject<number>;
}

const PI = 3.141592653589793;
const BANK = -0.16;
const REAR_Y = 0.1;
const REAR_Z = 0.2;
const VTWIST = 1.8;
const TAIL = 1.0;
const SHIFT = -0.2;

const VERTEX_SHADER = /* glsl */ `
  uniform vec2 u_res;
  uniform float u_sheetW;
  uniform float u_sheetD;
  uniform float u_sheetT;
  uniform float u_sheetC;
  uniform float u_sheetV;
  uniform float u_leanA;
  uniform float u_leanW;
  uniform float u_diag;
  uniform float u_axis;
  uniform float u_dent;
  uniform float u_hover;

  varying vec2 vUv;
  varying float vWx;
  varying vec3 vWorldPos;

  const float PI = 3.141592653589793;
  const float BANK = -0.16;
  const float REAR_Y = 0.1;
  const float REAR_Z = 0.2;
  const float VTWIST = 1.8;
  const float TAIL = 1.0;
  const float SHIFT = -0.2;

  float qFunc(float wx) {
    return (wx / max(u_sheetW, 0.0001)) * u_sheetT + SHIFT;
  }

  float shape(float q) {
    return mix(1.0 - q * q, sin(PI * q), u_sheetC) * exp(-TAIL * q * q);
  }

  float shapeSlope(float q) {
    return mix(
      -2.0 * q * (1.0 + TAIL * (1.0 - q * q)),
      PI * cos(PI * q) - 2.0 * TAIL * q * sin(PI * q),
      u_sheetC
    ) * exp(-q * q);
  }

  float zDisp(float wx) {
    return -u_sheetD * shape(qFunc(wx));
  }

  float roll(float wx) {
    return BANK * shapeSlope(qFunc(wx)) / PI * u_sheetC;
  }

  void main() {
    vUv = uv;
    vec3 pos = position;

    // 1. Hover Dent
    vec2 qUv = 2.0 * uv - 1.0;
    float dome = (1.0 - qUv.x * qUv.x) * (1.0 - qUv.y * qUv.y);
    pos.z -= u_hover * u_dent * u_res.y * dome;

    // 2. World Transform
    vec4 wp = modelMatrix * vec4(pos, 1.0);

    // 3. Phone Axis Swap
    if (u_axis > 0.5) {
      float tmp = wp.x;
      wp.x = wp.y;
      wp.y = tmp;
    }

    float wx = wp.x;
    vWx = wx;

    // 4. Wind / Roll around X-axis
    float normX = wx / max(u_sheetW, 0.0001);
    float twistTerm = u_sheetV > 0.0
      ? VTWIST * u_sheetV * smoothstep(0.3, 0.9, abs(normX)) * sign(normX)
      : 0.0;
    float a = roll(wx) + twistTerm;
    float ca = cos(a);
    float sa = sin(a);
    float wy = wp.y * ca - wp.z * sa;
    float wz = wp.y * sa + wp.z * ca;
    wp.y = wy;
    wp.z = wz;

    // 5. Bend
    wp.z += zDisp(wx);

    // 6. Diagonal & Rear Lift
    wp.y += u_diag * wx;
    if (u_sheetV > 0.0) {
      float m = 1.0 - smoothstep(-1.0, 0.3, normX);
      wp.y += REAR_Y * u_sheetW * u_sheetV * m;
      wp.z += REAR_Z * u_sheetW * u_sheetV * m;
    }

    // 7. Lean ("Door")
    if (u_leanW > 0.0) {
      float s = clamp(wx / u_leanW, -1.0, 1.0);
      wp.z += u_leanA * (s * (1.5 - 0.5 * s * s));
    }

    // 8. Swap back if Phone
    if (u_axis > 0.5) {
      float tmp = wp.x;
      wp.x = wp.y;
      wp.y = tmp;
    }

    vWorldPos = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  uniform sampler2D u_media;
  uniform sampler2D u_overlay;
  uniform vec4 u_crop;
  uniform vec2 u_res;
  uniform float u_sheetW;
  uniform float u_sheetD;
  uniform float u_sheetT;
  uniform float u_sheetC;
  uniform float u_leanA;
  uniform float u_leanW;
  uniform float u_axis;
  uniform float u_dent;
  uniform float u_hover;
  uniform float u_shade;
  uniform float u_shadeS;
  uniform float u_corner;
  uniform float u_alpha;

  varying vec2 vUv;
  varying float vWx;
  varying vec3 vWorldPos;

  const float PI = 3.141592653589793;
  const float BANK = -0.16;
  const float TAIL = 1.0;
  const float SHIFT = -0.2;

  float qFunc(float wx) {
    return (wx / max(u_sheetW, 0.0001)) * u_sheetT + SHIFT;
  }

  float shape(float q) {
    return mix(1.0 - q * q, sin(PI * q), u_sheetC) * exp(-TAIL * q * q);
  }

  float shapeSlope(float q) {
    return mix(
      -2.0 * q * (1.0 + TAIL * (1.0 - q * q)),
      PI * cos(PI * q) - 2.0 * TAIL * q * sin(PI * q),
      u_sheetC
    ) * exp(-q * q);
  }

  float zDisp(float wx) {
    return -u_sheetD * shape(qFunc(wx));
  }

  float roll(float wx) {
    return BANK * shapeSlope(qFunc(wx)) / PI * u_sheetC;
  }

  void main() {
    // 1. Sample u_media with cover crop and composite u_overlay
    vec2 mediaUv = u_crop.xy + vUv * u_crop.zw;
    vec4 media = texture2D(u_media, mediaUv);
    vec4 overlay = texture2D(u_overlay, vUv);
    vec3 rgb = mix(media.rgb, overlay.rgb, overlay.a);

    // 2. Depth Darkening
    vec2 qUv = 2.0 * vUv - 1.0;
    float dome = (1.0 - qUv.x * qUv.x) * (1.0 - qUv.y * qUv.y);
    float depth = clamp(
      (u_sheetD - zDisp(vWx)) / (2.0 * max(u_sheetD, 0.001)) + u_hover * 0.15 * dome,
      0.0,
      1.0
    );
    rgb = mix(rgb, vec3(0.059), u_shade * 0.8 * pow(depth, u_shadeS));

    // 3. Analytic Normal Lighting & Blinn-Phong Sheen
    vec3 L = normalize(vec3(-0.4, 0.5, 1.0));
    float qVal = qFunc(vWx);
    float dzdxSheet = -u_sheetD * shapeSlope(qVal) * (u_sheetT / max(u_sheetW, 0.0001));
    float sLean = u_leanW > 0.0 ? clamp(vWx / u_leanW, -1.0, 1.0) : 0.0;
    float sClamped = min(abs(sLean), 1.0);
    float dzdxLean = u_leanW > 0.0
      ? (u_leanA / u_leanW) * 1.5 * (1.0 - sClamped * sClamped)
      : 0.0;
    float dzdxDent = u_hover * u_dent * (u_res.y / max(u_res.x, 0.0001)) * 4.0 * qUv.x * (1.0 - qUv.y * qUv.y);
    float dzdyDent = u_hover * u_dent * 4.0 * qUv.y * (1.0 - qUv.x * qUv.x);

    float dzdx = dzdxSheet + dzdxLean + dzdxDent;
    float dzdy = dzdyDent;
    vec3 n0 = normalize(vec3(-dzdx, -dzdy, 1.0));

    float rAng = roll(vWx);
    float cr = cos(rAng);
    float sr = sin(rAng);
    vec3 N = normalize(vec3(n0.x, n0.y * cr - n0.z * sr, n0.y * sr + n0.z * cr));
    if (u_axis > 0.5) {
      float tmpN = N.x;
      N.x = N.y;
      N.y = tmpN;
    }

    // Diffuse
    rgb *= 1.0 - 0.12 * (1.0 - (dot(N, L) * 0.5 + 0.5));

    // Specular Blinn-Phong (gloss 48.0, strength 0.35)
    vec3 V = normalize(cameraPosition - vWorldPos);
    vec3 H = normalize(L + V);
    float spec = pow(max(dot(N, H), 0.0), 48.0) * 0.35;
    rgb += vec3(spec);

    // 4. Anti-Aliased Rounded Corners (SDF rounded box in card space (aspect, 1.0))
    float aspect = u_res.x / max(u_res.y, 0.0001);
    vec2 p = abs(vUv - 0.5) * vec2(aspect, 1.0);
    vec2 halfSize = vec2(aspect * 0.5, 0.5) - vec2(u_corner);
    vec2 d = p - halfSize;
    float dist = length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - u_corner;
    float fw = max(fwidth(dist), 0.0008);
    float cornerAlpha = 1.0 - smoothstep(-fw, fw, dist);

    gl_FragColor = vec4(rgb, cornerAlpha * u_alpha);
  }
`;

function smoothstepJS(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function qFuncJS(wx: number, sheetW: number, sheetT: number): number {
  return (wx / Math.max(sheetW, 0.0001)) * sheetT + SHIFT;
}

function shapeJS(q: number, sheetC: number): number {
  const bowl = 1.0 - q * q;
  const sCurve = Math.sin(PI * q);
  return (bowl + (sCurve - bowl) * sheetC) * Math.exp(-TAIL * q * q);
}

function shapeSlopeJS(q: number, sheetC: number): number {
  const bowlSlope = -2.0 * q * (1.0 + TAIL * (1.0 - q * q));
  const sCurveSlope =
    PI * Math.cos(PI * q) - 2.0 * TAIL * q * Math.sin(PI * q);
  return (bowlSlope + (sCurveSlope - bowlSlope) * sheetC) * Math.exp(-q * q);
}

function zDispJS(
  wx: number,
  sheetW: number,
  sheetD: number,
  sheetT: number,
  sheetC: number
): number {
  return -sheetD * shapeJS(qFuncJS(wx, sheetW, sheetT), sheetC);
}

function rollJS(
  wx: number,
  sheetW: number,
  sheetT: number,
  sheetC: number
): number {
  return (
    ((BANK * shapeSlopeJS(qFuncJS(wx, sheetW, sheetT), sheetC)) / PI) * sheetC
  );
}

function computeCoverCrop(
  mediaWidth: number,
  mediaHeight: number,
  cardAspect: number,
  targetVec: THREE.Vector4
) {
  const ma =
    mediaWidth > 0 && mediaHeight > 0 ? mediaWidth / mediaHeight : cardAspect;
  const a = cardAspect;
  let scaleX = 1.0;
  let scaleY = 1.0;
  if (a > ma) {
    scaleY = ma / a;
    scaleX = 1.0;
  } else {
    scaleX = a / ma;
    scaleY = 1.0;
  }
  const offsetX = (1.0 - scaleX) * 0.5;
  const offsetY = (1.0 - scaleY) * 0.5;
  targetVec.set(offsetX, offsetY, scaleX, scaleY);
}

function buildOverlayTexture(
  caption: string,
  cardW: number,
  cardH: number,
  U: number,
  dpr: number,
  isPhone: boolean,
  maxAnisotropy: number
): THREE.CanvasTexture {
  const s = (2 * Math.min(dpr, 2)) / 1.5;
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(cardW * s));
  canvas.height = Math.max(1, Math.round(cardH * s));

  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const grad = ctx.createLinearGradient(
      0,
      canvas.height * 0.68,
      0,
      canvas.height
    );
    grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0.38)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, canvas.height * 0.68, canvas.width, canvas.height * 0.32);

    // Caption (Bottom-Left)
    const fontSize = (isPhone ? 16 : 18) * U;
    const fontPx = fontSize * s;
    const insetLeft = (isPhone ? 10 : 20) * U * s;
    const baselineY = canvas.height - (10 * U + 0.22 * fontSize) * s;

    ctx.save();
    ctx.font = `400 ${fontPx.toFixed(2)}px "Plus Jakarta Sans", "Inter Tight", sans-serif`;
    if ('letterSpacing' in ctx) {
      (
        ctx as CanvasRenderingContext2D & {letterSpacing?: string}
      ).letterSpacing = `${(-0.03 * fontPx).toFixed(2)}px`;
    }
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 12 * U * s;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2 * U * s;
    ctx.fillText(caption, insetLeft, baselineY);
    ctx.restore();

    // Action Pill Button (Bottom-Right)
    const radius = 12.5 * U * s;
    const insetRight = (isPhone ? 10 : 20) * U * s;
    const insetBottom = 10 * U * s;
    const cx = canvas.width - insetRight - radius;
    const cy = canvas.height - insetBottom - radius;

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fill();

    const arm = 4.5 * U * s;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = Math.max(1, 1.4 * U * s);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    if (!isPhone) {
      ctx.moveTo(cx - arm, cy);
      ctx.lineTo(cx + arm, cy);
      ctx.moveTo(cx, cy - arm);
      ctx.lineTo(cx, cy + arm);
    } else {
      ctx.moveTo(cx - arm, cy);
      ctx.lineTo(cx + arm, cy);
      ctx.moveTo(cx + 0.2 * arm, cy - 0.8 * arm);
      ctx.lineTo(cx + arm, cy);
      ctx.moveTo(cx + 0.2 * arm, cy + 0.8 * arm);
    }
    ctx.stroke();
    ctx.restore();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Builds the emissive phosphor preview texture for `CRT_Monitor_monitor_glass_0`
 * so as the camera dollies into the 3D CRT monitor, the curved glass radiates
 * the stepped cyan light bars, scanlines, and FAQ preview before locking to full screen.
 */
function buildCrtScreenTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 384;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#06080d';
    ctx.fillRect(0, 0, 512, 384);

    // Radial phosphor glow
    const rad = ctx.createRadialGradient(256, 130, 10, 256, 160, 240);
    rad.addColorStop(0, '#0f3850');
    rad.addColorStop(0.6, '#081824');
    rad.addColorStop(1, '#06080d');
    ctx.fillStyle = rad;
    ctx.fillRect(0, 0, 512, 384);

    // 5 left and 5 right stepped vertical cyan light bars
    const leftH = [160, 135, 108, 82, 58];
    for (let i = 0; i < 5; i++) {
      const g = ctx.createLinearGradient(0, 0, 0, leftH[i]);
      g.addColorStop(0, 'rgba(0, 210, 255, 0.35)');
      g.addColorStop(1, 'rgba(0, 210, 255, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(18 + i * 28, 0, 22, leftH[i]);
      ctx.fillRect(512 - 40 - i * 28, 0, 22, leftH[i]);
    }

    // FAQ Pill & Headline preview
    ctx.fillStyle = 'rgba(0, 210, 255, 0.2)';
    ctx.beginPath();
    ctx.roundRect(232, 62, 48, 20, 10);
    ctx.fill();

    ctx.fillStyle = '#7ce8ff';
    ctx.font = '600 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('FAQ', 256, 76);

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 20px sans-serif';
    ctx.fillText('Compare any website quote', 256, 110);
    ctx.fillStyle = '#7ce8ff';
    ctx.font = 'italic 20px serif';
    ctx.fillText('with ours.', 256, 134);

    // Accordion preview bars
    for (let r = 0; r < 4; r++) {
      ctx.fillStyle = 'rgba(16, 22, 34, 0.9)';
      ctx.strokeStyle =
        r === 0 ? 'rgba(0, 210, 255, 0.65)' : 'rgba(255, 255, 255, 0.14)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(86, 172 + r * 42, 340, 32, 7);
      ctx.fill();
      ctx.stroke();
    }

    // CRT Scanlines
    ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
    for (let y = 0; y < 384; y += 3) {
      ctx.fillRect(0, y, 512, 1);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  tex.needsUpdate = true;
  return tex;
}

interface CardRuntimeItem {
  project: FlagshipProject;
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  material: THREE.ShaderMaterial;
  video: HTMLVideoElement;
  videoTexture: THREE.VideoTexture | null;
  posterTexture: THREE.Texture | null;
  fallbackTexture: THREE.DataTexture;
  overlayTexture: THREE.CanvasTexture | null;
  usingVideo: boolean;
  playing: boolean;
  hover: number;
  cardW: number;
  cardH: number;
  baseOffset: number;
  cssX: number;
  cssY: number;
  worldX: number;
  worldY: number;
  worldW: number;
  worldH: number;
}

const _projVec = new THREE.Vector3();

export default function WorkRibbonCanvas({
  scrollProgressRef,
  stage6ProgressRef,
  onSelectProject,
  headerTwistRef,
}: WorkRibbonCanvasProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const onSelectProjectRef = useRef(onSelectProject);

  useEffect(() => {
    onSelectProjectRef.current = onSelectProject;
  }, [onSelectProject]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = (() => {
      const probe = document.createElement('canvas').getContext('webgl2');
      if (!probe) return true;
      const ext = probe.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : probe.RENDERER;
      const gpu = String(probe.getParameter(param));
      probe.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    const dpr = isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);

    const vwInit =
      document.documentElement.clientWidth || window.innerWidth || 1280;
    const vhInit = window.innerHeight || 800;
    renderer.setSize(vwInit, vhInit);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    // Studio environment reflection for 3D CRT monitor casing & glass
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTexture = pmremGenerator.fromScene(
      new RoomEnvironment(),
      0.04
    ).texture;
    scene.environment = envTexture;
    pmremGenerator.dispose();

    // PBR Lighting matching the background room video:
    // Warm amber desk lamp light (#ff9e44) on the left + cool moonlight (#38bdf8) on the right
    const warmLampLight = new THREE.PointLight(0xff9e44, 65, 95, 1.5);
    warmLampLight.position.set(-16, 9, 26);
    scene.add(warmLampLight);

    const coolMoonLight = new THREE.PointLight(0x38bdf8, 55, 95, 1.5);
    coolMoonLight.position.set(18, 7, 25);
    scene.add(coolMoonLight);

    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x1a1410, 0.85);
    scene.add(hemiLight);

    const camera = new THREE.PerspectiveCamera(
      53.4,
      vwInit / vhInit,
      0.1,
      2000
    );
    camera.position.set(0, 0, 41.18);
    camera.lookAt(0, 0, 0);
    camera.updateMatrixWorld();

    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
    const sharedGeometry = new THREE.PlaneGeometry(1, 1, 96, 24);

    const ribbonGroup = new THREE.Group();
    scene.add(ribbonGroup);

    // Load 3D Retro Computer Monitor (`/assets/aistudio/retro_computer_monitor.glb`)
    const crtMonitorGroup = new THREE.Group();
    crtMonitorGroup.visible = false;
    scene.add(crtMonitorGroup);

    const extraMonitorMats: THREE.MeshStandardMaterial[] = [];

    const crtScreenTex = buildCrtScreenTexture(maxAnisotropy);
    const crtPlasticMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x18202d),
      roughness: 0.44,
      metalness: 0.2,
      transparent: true,
      opacity: 0,
    });
    const crtGlassMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x050b12),
      map: crtScreenTex,
      emissive: new THREE.Color(0x00d2ff),
      emissiveMap: crtScreenTex,
      emissiveIntensity: 1.35,
      roughness: 0.08,
      metalness: 0.15,
      transparent: true,
      opacity: 0,
    });

    const gltfLoader = new GLTFLoader();
    gltfLoader.load(
      '/assets/aistudio/retro_computer_monitor.glb',
      (gltf) => {
        const model = gltf.scene;

        // The model screen faces +X in model coordinates.
        // We place it in a pivot group, rotate -90 deg around Y so the curved screen faces +Z (the camera),
        // and offset it by (0, -0.3681, -1.7858) so the curved CRT screen tube is centered at (0, 0, 0).
        const monitorPivot = new THREE.Group();
        model.rotation.y = -Math.PI / 2;
        model.position.set(0, -0.3681, -1.7858);
        monitorPivot.add(model);

        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            const matName = (mesh.material as THREE.Material)?.name || '';

            // Curved CRT glass tube screen
            if (mesh.name === 'Object_4' || matName === 'Screen') {
              // Remap UV coordinates of the curved CRT screen mesh so that
              // our emissive phosphor CRT texture covers the screen tube cleanly
              const geo = mesh.geometry;
              const pos = geo.attributes.position;
              const uvs = geo.attributes.uv;
              if (pos && uvs) {
                for (let i = 0; i < pos.count; i++) {
                  const y = pos.getY(i);
                  const z = pos.getZ(i);
                  // Horizontal U along Z axis (from left +0.743 to right -0.743 in unrotated space)
                  const u = (0.7432662 - z) / (2 * 0.7432662);
                  // Vertical V along Y axis (from bottom -0.411 to top +0.746)
                  const v = (y - (-0.411058)) / (0.7459795 - (-0.411058));
                  uvs.setXY(
                    i,
                    Math.max(0, Math.min(1, u)),
                    Math.max(0, Math.min(1, v))
                  );
                }
                uvs.needsUpdate = true;
              }
              mesh.material = crtGlassMat;
            } else if (
              mesh.name === 'Object_5' ||
              matName === 'Screen_plastic' ||
              mesh.name.startsWith('Object_')
            ) {
              if (matName.includes('Input')) {
                // Accent input jacks on back/side
                const origMat = mesh.material as THREE.MeshStandardMaterial;
                if (origMat && origMat.isMeshStandardMaterial) {
                  const jackMat = origMat.clone();
                  jackMat.transparent = true;
                  jackMat.opacity = 0;
                  mesh.material = jackMat;
                  extraMonitorMats.push(jackMat);
                } else {
                  mesh.material = crtPlasticMat;
                }
              } else {
                mesh.material = crtPlasticMat;
              }
            }
          }
        });

        crtMonitorGroup.add(monitorPivot);
      },
      undefined,
      () => {
        // Fallback procedural CRT_Monitor if network load ever fails
        const fallbackBezel = new THREE.Mesh(
          new THREE.BoxGeometry(13.6, 10.6, 5.5),
          crtPlasticMat
        );
        fallbackBezel.name = 'CRT_Monitor_monitor_plastic_0';
        const fallbackGlass = new THREE.Mesh(
          new THREE.PlaneGeometry(10.5, 7.85, 24, 24),
          crtGlassMat
        );
        fallbackGlass.name = 'CRT_Monitor_monitor_glass_0';
        fallbackGlass.position.z = 2.8;
        crtMonitorGroup.add(fallbackBezel, fallbackGlass);
      }
    );

    // Build all 8 cards in the Work Ribbon
    const items: CardRuntimeItem[] = FLAGSHIP_PROJECTS.map((project) => {
      const fbData = new Uint8Array([14, 18, 28, 255]);
      const fallbackTexture = new THREE.DataTexture(fbData, 1, 1);
      fallbackTexture.colorSpace = THREE.SRGBColorSpace;
      fallbackTexture.needsUpdate = true;

      const cropVec = new THREE.Vector4(0, 0, 1, 1);

      const material = new THREE.ShaderMaterial({
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        transparent: true,
        depthTest: false,
        depthWrite: false,
        uniforms: {
          u_media: {value: fallbackTexture},
          u_overlay: {value: fallbackTexture},
          u_crop: {value: cropVec},
          u_res: {value: new THREE.Vector2(1, 1)},
          u_sheetW: {value: 20},
          u_sheetD: {value: 4},
          u_sheetT: {value: 1.15},
          u_sheetC: {value: 1.0},
          u_sheetV: {value: 0.0},
          u_leanA: {value: -2.4},
          u_leanW: {value: 20},
          u_diag: {value: 0.03},
          u_axis: {value: 0.0},
          u_dent: {value: 0.035},
          u_hover: {value: 0.0},
          u_shade: {value: 1.0},
          u_shadeS: {value: 1.0},
          u_corner: {value: 0.04},
          u_alpha: {value: 0.0},
        },
      });
      (
        material.extensions as unknown as Record<string, boolean>
      ).derivatives = true;

      const mesh = new THREE.Mesh(sharedGeometry, material);
      mesh.frustumCulled = false;
      ribbonGroup.add(mesh);

      const video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = 'auto';
      video.src = `https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/${project.videoPath}.mp4`;

      const item: CardRuntimeItem = {
        project,
        mesh,
        material,
        video,
        videoTexture: null,
        posterTexture: null,
        fallbackTexture,
        overlayTexture: null,
        usingVideo: false,
        playing: false,
        hover: 0,
        cardW: 400,
        cardH: 230,
        baseOffset: 0,
        cssX: 0,
        cssY: 0,
        worldX: 0,
        worldY: 0,
        worldW: 1,
        worldH: 1,
      };

      const posterUrl = `https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2F${project.posterId}.png&w=1280&q=85`;
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        if (item.usingVideo) return;
        const pTex = new THREE.Texture(img);
        pTex.colorSpace = THREE.SRGBColorSpace;
        pTex.anisotropy = maxAnisotropy;
        pTex.minFilter = THREE.LinearFilter;
        pTex.magFilter = THREE.LinearFilter;
        pTex.needsUpdate = true;
        item.posterTexture = pTex;
        item.material.uniforms.u_media.value = pTex;
        computeCoverCrop(
          img.naturalWidth || 1280,
          img.naturalHeight || 720,
          project.aspect,
          item.material.uniforms.u_crop.value
        );
      };
      img.src = posterUrl;

      const activateVideoTexture = () => {
        if (item.usingVideo) return;
        item.usingVideo = true;
        const vTex = new THREE.VideoTexture(video);
        vTex.colorSpace = THREE.SRGBColorSpace;
        vTex.minFilter = THREE.LinearFilter;
        vTex.magFilter = THREE.LinearFilter;
        vTex.anisotropy = maxAnisotropy;
        item.videoTexture = vTex;
        item.material.uniforms.u_media.value = vTex;
        computeCoverCrop(
          video.videoWidth || 1280,
          video.videoHeight || 720,
          project.aspect,
          item.material.uniforms.u_crop.value
        );
      };

      const anyVid = video as HTMLVideoElement & {
        requestVideoFrameCallback?: (cb: () => void) => number;
      };
      if (typeof anyVid.requestVideoFrameCallback === 'function') {
        anyVid.requestVideoFrameCallback(activateVideoTexture);
      }
      video.addEventListener('playing', activateVideoTexture, {once: true});
      video.addEventListener('loadeddata', () => {
        if (video.readyState >= 2) {
          computeCoverCrop(
            video.videoWidth || 1280,
            video.videoHeight || 720,
            project.aspect,
            item.material.uniforms.u_crop.value
          );
        }
      });

      return item;
    });

    // Layout & World Mapping state
    let vw = vwInit;
    let vh = vhInit;
    let isPhone = vw <= 649;
    let U = isPhone ? vw / 390 : vw / 1500;
    const H = Math.tan(((53.4 * Math.PI) / 180) / 2) * 41.18; // ~20.7107
    let W = H * (vw / vh);
    let k = (2 * H) / vh;
    let loopLength = 1;
    let current = isPhone ? -0.177 * vh : 100;
    let target = current;
    let userOffset = isPhone ? -0.177 * vh : 100;
    let lastScrollStageP = 0;
    let wasPhone = isPhone;

    const updateLayout = () => {
      vw = document.documentElement.clientWidth || window.innerWidth || 1280;
      vh = window.innerHeight || 800;
      isPhone = vw <= 649;
      U = isPhone ? vw / 390 : vw / 1500;
      W = H * (vw / vh);
      k = (2 * H) / vh;

      const curDpr = isSoftwareGl
        ? 1
        : Math.min(window.devicePixelRatio || 1, 2);
      renderer.setPixelRatio(curDpr);
      renderer.setSize(vw, vh);

      camera.aspect = vw / vh;
      camera.updateProjectionMatrix();

      if (isPhone !== wasPhone) {
        wasPhone = isPhone;
        userOffset = isPhone ? -0.177 * vh : 100;
        current = userOffset;
        target = userOffset;
      }

      let runningSum = 0;
      const gap = (isPhone ? 20 : 10) * U;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const aspect = item.project.aspect;

        if (!isPhone) {
          item.cardH = Math.min(0.435 * vh, 550 * U);
          item.cardW = item.cardH * aspect;
        } else {
          item.cardW = vw - 40 * U;
          item.cardH = item.cardW / aspect;
        }

        item.baseOffset = runningSum;
        runningSum += (isPhone ? item.cardH : item.cardW) + gap;

        item.worldW = item.cardW * k;
        item.worldH = item.cardH * k;
        item.mesh.scale.set(item.worldW, item.worldH, 1);

        if (item.overlayTexture) {
          item.overlayTexture.dispose();
        }
        item.overlayTexture = buildOverlayTexture(
          item.project.caption,
          item.cardW,
          item.cardH,
          U,
          curDpr,
          isPhone,
          maxAnisotropy
        );

        const u = item.material.uniforms;
        u.u_overlay.value = item.overlayTexture;
        u.u_res.value.set(item.worldW, item.worldH);
        u.u_sheetW.value = isPhone ? H : W;
        u.u_sheetT.value = isPhone ? 1.0 : 1.15;
        u.u_sheetC.value = isPhone ? 0.0 : 1.0;
        u.u_leanA.value = isPhone ? 0.0 : -0.12 * W;
        u.u_leanW.value = isPhone ? 0.0 : W;
        u.u_diag.value = isPhone ? 0.0 : 0.03;
        u.u_axis.value = isPhone ? 1.0 : 0.0;
        u.u_shade.value = isPhone ? 0.0 : 1.0;
        u.u_shadeS.value = isPhone ? 0.6 : 1.0;
        u.u_corner.value = ((isPhone ? 15 : 20) * U) / item.cardH;
      }

      loopLength = Math.max(1, runningSum);
    };

    updateLayout();

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Pointer, Drag, Wheel & Keyboard state
    let pointerNdcX = -999;
    let pointerNdcY = -999;
    let pointerInside = false;
    let hoveredIndex = -1;

    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let lastDragPos = 0;
    let totalDragDist = 0;

    const updatePointerFromClient = (clientX: number, clientY: number) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointerNdcX = ((clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
      pointerNdcY =
        -(((clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1);
      pointerInside = true;
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (
        scrollProgressRef.current < 0.56 ||
        stage6ProgressRef.current > 0.15
      ) {
        return;
      }
      isDragging = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      lastDragPos = isPhone ? e.clientY : e.clientX;
      totalDragDist = 0;
      updatePointerFromClient(e.clientX, e.clientY);
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (
        scrollProgressRef.current < 0.56 ||
        stage6ProgressRef.current > 0.15
      ) {
        return;
      }
      updatePointerFromClient(e.clientX, e.clientY);

      if (isDragging) {
        const curPos = isPhone ? e.clientY : e.clientX;
        const delta = lastDragPos - curPos;
        lastDragPos = curPos;
        totalDragDist +=
          Math.abs(e.clientX - dragStartX) + Math.abs(e.clientY - dragStartY);
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        userOffset += delta * 1.15;
      }
    };

    const handlePointerUp = () => {
      if (!isDragging) return;
      isDragging = false;
      if (
        totalDragDist < 10 &&
        hoveredIndex >= 0 &&
        hoveredIndex < items.length &&
        stage6ProgressRef.current <= 0.15
      ) {
        onSelectProjectRef.current(items[hoveredIndex].project);
      }
    };

    const handlePointerLeave = () => {
      isDragging = false;
      pointerInside = false;
      pointerNdcX = -999;
      pointerNdcY = -999;
    };

    const handleWheel = (e: WheelEvent) => {
      if (
        scrollProgressRef.current < 0.58 ||
        stage6ProgressRef.current > 0.12
      ) {
        return;
      }
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) * 0.6) {
        userOffset += e.deltaX * 1.1;
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        scrollProgressRef.current < 0.58 ||
        stage6ProgressRef.current > 0.12
      ) {
        return;
      }
      if (e.key === 'ArrowRight') {
        userOffset += 220;
      } else if (e.key === 'ArrowLeft') {
        userOffset -= 220;
      }
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove, {passive: true});
    window.addEventListener('pointerup', handlePointerUp, {passive: true});
    domEl.addEventListener('pointerleave', handlePointerLeave);
    window.addEventListener('wheel', handleWheel, {passive: true});
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', updateLayout, {passive: true});

    const deformWorldPoint = (
      wxIn: number,
      wyIn: number,
      wzIn: number,
      sheetW: number,
      sheetD: number,
      sheetT: number,
      sheetC: number,
      sheetV: number,
      leanA: number,
      leanW: number,
      diag: number
    ) => {
      let wx = wxIn;
      let wy = wyIn;
      let wz = wzIn;

      if (isPhone) {
        const tmp = wx;
        wx = wy;
        wy = tmp;
      }

      const normX = wx / Math.max(sheetW, 0.0001);
      const twistTerm =
        sheetV > 0
          ? VTWIST *
            sheetV *
            smoothstepJS(0.3, 0.9, Math.abs(normX)) *
            Math.sign(normX)
          : 0;
      const a = rollJS(wx, sheetW, sheetT, sheetC) + twistTerm;
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      const ry = wy * ca - wz * sa;
      const rz = wy * sa + wz * ca;
      wy = ry;
      wz = rz;

      wz += zDispJS(wx, sheetW, sheetD, sheetT, sheetC);
      wy += diag * wx;

      if (sheetV > 0) {
        const m = 1.0 - smoothstepJS(-1.0, 0.3, normX);
        wy += REAR_Y * sheetW * sheetV * m;
        wz += REAR_Z * sheetW * sheetV * m;
      }

      if (leanW > 0) {
        const s = Math.max(-1, Math.min(1, wx / leanW));
        wz += leanA * (s * (1.5 - 0.5 * s * s));
      }

      if (isPhone) {
        const tmp = wx;
        wx = wy;
        wy = tmp;
      }

      _projVec.set(wx, wy, wz).project(camera);
    };

    let frameId = 0;
    let lastTime = performance.now();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync
        ? gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0)
        : null;
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    const tick = () => {
      const now = performance.now();
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;

      const s = scrollProgressRef.current;
      const p6 = stage6ProgressRef.current;

      // Stage 5 enters around s = 0.56 -> 0.60; Stage 6 locks full-screen FAQ at p6 >= 0.50
      const enterAlpha = smoothstepJS(0.56, 0.61, s);
      // Phase A: Ribbon fades & translates upward/outward across p6: 0.00 -> 0.25
      const phaseARibbonExit = smoothstepJS(0.0, 0.24, p6);
      const ribbonAlpha = enterAlpha * (1 - phaseARibbonExit);

      const isWebGLVisible = enterAlpha > 0.01 && p6 < 0.52;

      if (!isWebGLVisible) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].playing) {
            items[i].playing = false;
            items[i].video.pause();
          }
        }
        if (headerTwistRef) {
          headerTwistRef.current = 0;
        }
        renderer.clear();
      } else {
        // ─────────────────────────────────────────────────────────────────
        // 1. Update 3D Retro CRT Monitor & Camera Zoom-In Trajectory
        // ─────────────────────────────────────────────────────────────────
        if (p6 <= 0.005) {
          crtMonitorGroup.visible = false;
          camera.position.set(0, 0, 41.18);
          camera.lookAt(0, 0, 0);
        } else {
          crtMonitorGroup.visible = true;
          // Phase A — Monitor Emergence (p6: 0.00 -> 0.25)
          const pA = smoothstepJS(0.0, 0.25, p6);
          const monScale = (0.85 + 0.15 * pA) * (isPhone ? 4.0 : 5.15);
          const monRotY = -0.18 * (1 - pA);
          const monPosY = -3.8 * (1 - pA);

          crtMonitorGroup.scale.setScalar(monScale);
          crtMonitorGroup.rotation.set(0, monRotY, 0);
          crtMonitorGroup.position.set(0, monPosY, 0);

          const monOpacity = smoothstepJS(0.01, 0.18, p6);
          crtPlasticMat.opacity = monOpacity;
          crtGlassMat.opacity = monOpacity;
          for (let i = 0; i < extraMonitorMats.length; i++) {
            extraMonitorMats[i].opacity = monOpacity;
          }

          // Phase B — Dolly Through the CRT Glass (p6: 0.25 -> 0.45)
          const pB = smoothstepJS(0.25, 0.45, p6);
          // Smoothly dolly camera from z = 41.18 straight into the curved CRT tube glass
          const camZ = 41.18 - pB * 37.8;
          camera.position.set(0, 0, camZ);
          camera.lookAt(0, 0, 0);

          // Intensify emissive phosphor glow as camera approaches the glass
          crtGlassMat.emissiveIntensity = 1.35 + pB * 1.85;
        }
        camera.updateMatrixWorld();

        // ─────────────────────────────────────────────────────────────────
        // 2. Update 3D Work Ribbon (when visible in Stage 5 & Phase A)
        // ─────────────────────────────────────────────────────────────────
        ribbonGroup.visible = ribbonAlpha > 0.005;
        if (ribbonAlpha <= 0.005) {
          for (let i = 0; i < items.length; i++) {
            if (items[i].playing) {
              items[i].playing = false;
              items[i].video.pause();
            }
          }
        } else {
          // Translate Work Ribbon upward/outward during Phase A monitor emergence
          const scrollStageP = Math.max(0, Math.min(1, (s - 0.59) / 0.19));
          const scrollDelta =
            (scrollStageP - lastScrollStageP) * loopLength * 0.92;
          lastScrollStageP = scrollStageP;
          userOffset += scrollDelta;

          target = userOffset;

          if (!isPhone) {
            target = current + Math.tanh((target - current) / vw) * vw;
          }

          const ratio = Math.min(dt * 60, 2);
          current += (target - current) * 0.1 * ratio;

          const t = Math.tanh((target - current) / (isPhone ? 245 : 550));
          const vel = t * Math.abs(t);
          const r = Math.min(1, Math.abs(vel));

          if (headerTwistRef) {
            headerTwistRef.current = Math.min(1, r + phaseARibbonExit);
          }

          const sheetW = isPhone ? H : W;
          const sheetD = !isPhone
            ? W * 0.2 * (1 + 1.1 * r)
            : H * 0.18 * 1.1 * r;
          const sheetV = !isPhone ? r : 0;
          const sheetT = isPhone ? 1.0 : 1.15;
          const sheetC = isPhone ? 0.0 : 1.0;
          const leanA = isPhone ? 0.0 : -0.12 * W;
          const leanW = isPhone ? 0.0 : W;
          const diag = isPhone ? 0.0 : 0.03;

          const leftBound = -(loopLength - vw) / 2;
          const topBound = -(loopLength - vh) / 2;
          const phaseALiftWorldY = phaseARibbonExit * 14;
          const phaseAPushWorldZ = phaseARibbonExit * 8;

          for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (!isPhone) {
              const rawX = item.baseOffset - current;
              const wrappedX =
                leftBound +
                ((((rawX - leftBound) % loopLength) + loopLength) % loopLength);
              item.cssX = wrappedX;
              item.cssY = (vh - item.cardH) * 0.5;
            } else {
              const rawY = item.baseOffset - current;
              const wrappedY =
                topBound +
                ((((rawY - topBound) % loopLength) + loopLength) % loopLength);
              item.cssX = (vw - item.cardW) * 0.5;
              item.cssY = wrappedY;
            }

            item.worldX = (item.cssX + item.cardW * 0.5 - vw * 0.5) * k;
            item.worldY =
              -(item.cssY + item.cardH * 0.5 - vh * 0.5) * k + phaseALiftWorldY;
            item.mesh.position.set(
              item.worldX,
              item.worldY,
              phaseAPushWorldZ
            );

            const nearScreen = !isPhone
              ? item.cssX + item.cardW > -0.5 * vw && item.cssX < 1.5 * vw
              : item.cssY + item.cardH > -0.5 * vh && item.cssY < 1.5 * vh;
            const shouldPlay =
              ribbonAlpha > 0.1 && nearScreen && !document.hidden;

            if (shouldPlay && !item.playing) {
              item.playing = true;
              item.video.play().catch(() => {});
            } else if (!shouldPlay && item.playing) {
              item.playing = false;
              item.video.pause();
            }
          }

          // CPU Deformed Hover Picking (only when ribbon is interactive before Stage 6 zoom)
          hoveredIndex = -1;
          if (pointerInside && !isDragging && p6 <= 0.1) {
            for (let i = items.length - 1; i >= 0; i--) {
              const item = items[i];
              let minX = Infinity;
              let maxX = -Infinity;
              let minY = Infinity;
              let maxY = -Infinity;

              const sampleCols = 4;
              for (let c = 0; c <= sampleCols; c++) {
                const uFrac = c / sampleCols - 0.5;
                const wxSample = item.worldX + uFrac * item.worldW;
                for (let rIdx = 0; rIdx <= 1; rIdx++) {
                  const vFrac = rIdx - 0.5;
                  const wySample = item.worldY + vFrac * item.worldH;
                  deformWorldPoint(
                    wxSample,
                    wySample,
                    0,
                    sheetW,
                    sheetD,
                    sheetT,
                    sheetC,
                    sheetV,
                    leanA,
                    leanW,
                    diag
                  );
                  if (_projVec.x < minX) minX = _projVec.x;
                  if (_projVec.x > maxX) maxX = _projVec.x;
                  if (_projVec.y < minY) minY = _projVec.y;
                  if (_projVec.y > maxY) maxY = _projVec.y;
                }
              }

              if (
                pointerNdcX >= minX &&
                pointerNdcX <= maxX &&
                pointerNdcY >= minY &&
                pointerNdcY <= maxY
              ) {
                hoveredIndex = i;
                break;
              }
            }
          }

          domEl.style.cursor =
            p6 > 0.1
              ? 'default'
              : isDragging
              ? 'grabbing'
              : hoveredIndex >= 0
              ? 'pointer'
              : 'grab';

          const easeInHover = 1 - Math.exp(-8 * dt);
          const easeOutHover = 1 - Math.exp(-6 * dt);

          for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const isHov = i === hoveredIndex;
            item.hover +=
              ((isHov ? 1.0 : 0.0) - item.hover) *
              (isHov ? easeInHover : easeOutHover);

            const u = item.material.uniforms;
            u.u_sheetD.value = sheetD;
            u.u_sheetV.value = sheetV;
            u.u_hover.value = item.hover;
            u.u_alpha.value = ribbonAlpha;
          }
        }

        renderer.render(scene, camera);
      }

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      domEl.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      domEl.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', updateLayout);

      for (const item of items) {
        item.video.pause();
        item.video.src = '';
        item.videoTexture?.dispose();
        item.posterTexture?.dispose();
        item.fallbackTexture.dispose();
        item.overlayTexture?.dispose();
        item.material.dispose();
      }
      crtScreenTex.dispose();
      crtPlasticMat.dispose();
      crtGlassMat.dispose();
      for (const mat of extraMonitorMats) {
        mat.dispose();
      }
      envTexture.dispose();
      sharedGeometry.dispose();
      renderer.dispose();
      if (domEl.parentNode === container) {
        container.removeChild(domEl);
      }
    };
  }, [scrollProgressRef, stage6ProgressRef, headerTwistRef]);

  return (
    <div
      ref={mountRef}
      aria-label="Interactive 3D WebGL Work Ribbon and 3D Retro CRT Monitor zoom transition"
      className="w-full h-full"
    />
  );
}
