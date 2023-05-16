uniform vec3 color;
uniform vec2 mouse;
uniform float alpha;

varying vec2 vUv;

void main(void) {

  vec4 dest = vec4(color, 1.0);

  float d = distance(mouse, vUv);
  dest.rgb *= 1.0 - d;
  dest.a *= alpha;

  gl_FragColor = dest;

}
