uniform float uTime;
uniform float uBreath;

varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  vNormal = normal;
  vPosition = position;

  vec3 pos = position;

  // Breathing distortion — subtle expansion along normal
  float breath = sin(uTime * 1.5) * 0.012 * uBreath;
  pos += normal * breath;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
