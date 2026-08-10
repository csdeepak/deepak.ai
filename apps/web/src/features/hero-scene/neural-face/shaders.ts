/**
 * GLSL for the surface particle-portrait material (D-052 Track 2).
 *
 * Vertex: per-node phase drives sub-pixel simplex-ish drift + gentle
 * breathing; point size scales by brightness with perspective attenuation;
 * the whole cloud takes a subtle pointer parallax.
 * Fragment: circular smoothstep alpha mask, brightness-modulated cool tint,
 * a global opacity uniform for the Beat-2 cross-fade. Additive blend +
 * depthWrite:false are set on the material, not here.
 */

export const surfaceVertexShader = /* glsl */ `
  uniform float uTime;
  uniform vec2 uPointer;
  uniform float uSize;
  uniform float uOpacity;
  uniform float uPixelRatio;
  attribute float aBright;
  varying float vBright;
  varying float vFade;

  float hash(vec3 p) {
    return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453);
  }

  void main() {
    vBright = aBright;
    vFade = uOpacity;

    vec3 p = position;
    float ph = hash(position) * 6.2831853;

    // Sub-pixel idle drift (~0.6% of face width) — "alive, not animated".
    float drift = 0.006;
    p.x += sin(uTime * 0.6 + ph) * drift;
    p.y += cos(uTime * 0.5 + ph * 1.3) * drift;
    p.z += sin(uTime * 0.4 + ph * 0.7) * drift * 0.5;

    // Subtle parallax of the whole cloud toward the pointer.
    p.xy += uPointer * 0.03 * (0.4 + p.z);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float breathe = 0.85 + 0.15 * sin(uTime * 0.9 + ph);
    gl_PointSize = uSize * uPixelRatio * (0.5 + aBright) * breathe / max(0.001, -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

export const surfaceFragmentShader = /* glsl */ `
  precision mediump float;
  uniform vec3 uTint;
  varying float vBright;
  varying float vFade;

  void main() {
    vec2 c = gl_PointCoord - vec2(0.5);
    float d = length(c);
    float a = smoothstep(0.5, 0.0, d);      // soft circular mask
    a *= (0.25 + 0.75 * vBright) * vFade;
    if (a <= 0.001) discard;
    gl_FragColor = vec4(uTint * (0.6 + 0.6 * vBright), a);
  }
`;
