import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js';

const UP = 0;
const DOWN = 1;
const LEFT = 2;
const RIGHT = 3;
const CW = 4;
const CCW = 5;

const INTERPOLATION_SPEED = 0.25;
const ASPECT_RATIO = 1;

const CUBE_GEOMETRY = new THREE.BoxGeometry();
const CUBE_MATERIALS = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff].map(
  color => new THREE.MeshBasicMaterial({ color })
);

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host { display: block; }
    canvas { display: block; }
    .button-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }
    .button-row {
      display: flex;
      justify-content: center;
      gap: 20px;
    }
    button {
      padding: 10px 20px;
      font-size: 16px;
      cursor: pointer;
    }
    .cube-renderer {
      margin: 10px auto;
      width: 100%;
      max-width: 400px;
    }
  </style>
  <div class="button-container">
    <div class="button-row">
      <button data-dir="0">Up</button>
    </div>
    <div class="button-row">
      <button data-dir="2">Left</button>
      <button data-dir="3">Right</button>
    </div>
    <div class="button-row">
      <button data-dir="5">CCW</button>
      <button data-dir="1">Down</button>
      <button data-dir="4">CW</button>
    </div>
  </div>
  <div class="cube-renderer"></div>
`;

export class CubeRotation extends HTMLElement {
  static get observedAttributes() { return ['src']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(TEMPLATE.content.cloneNode(true));

    this._currentRotation = 0;
    this._nextRotation = 0;
    this._interpolationTime = 1;
    this._lastFrameTimestamp = null;
    this._rotations = null;
    this._rotationMap = null;
    this._animationFrame = null;

    this._animate = this._animate.bind(this);
  }

  connectedCallback() {
    this._initRenderer();
    this._initButtons();
    const src = this.getAttribute('src');
    if(src) this._loadData(src);
  }

  disconnectedCallback() {
    if(this._animationFrame !== null) {
      cancelAnimationFrame(this._animationFrame);
      this._animationFrame = null;
    }
    this._resizeObserver?.disconnect();
    this._renderer?.dispose();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if(name === 'src' && newValue !== oldValue && this.isConnected) {
      this._loadData(newValue);
    }
  }

  async _loadData(src) {
    try {
      const data = await fetch(src).then(r => r.json());
      this._rotations = data.rotations.map(([x, y, z, w]) => new THREE.Quaternion(x, y, z, w));
      this._rotationMap = data.transitions;
      this._currentRotation = 0;
      this._nextRotation = 0;
      this._interpolationTime = 1;
      this._updateButtonVisibility();
      this._updateButtonAvailability();
      this._cube.quaternion.copy(this._rotations[0]);
      this._renderer.render(this._scene, this._camera);
    } catch (e) {
      console.error(`CubeRotation: failed to load data from "${src}"`, e);
    }
  }

  _initRenderer() {
    const container = this.shadowRoot.querySelector('.cube-renderer');

    this._scene = new THREE.Scene();
    this._camera = new THREE.PerspectiveCamera(75, ASPECT_RATIO, 0.1, 1000);
    this._camera.position.z = 2;

    this._renderer = new THREE.WebGLRenderer();
    container.appendChild(this._renderer.domElement);
    this._renderer.setSize(container.clientWidth, container.clientWidth / ASPECT_RATIO);

    this._cube = new THREE.Mesh(CUBE_GEOMETRY, CUBE_MATERIALS);
    this._scene.add(this._cube);

    this._resizeObserver = new ResizeObserver(() => {
      const width = container.clientWidth;
      this._renderer.setSize(width, width / ASPECT_RATIO);
      if(this._rotations) this._renderer.render(this._scene, this._camera);
    });
    this._resizeObserver.observe(container);
  }

  _initButtons() {
    this.shadowRoot.querySelectorAll('button[data-dir]').forEach(button => {
      button.addEventListener('click', () => this._move(parseInt(button.dataset.dir)));
    });
  }

  _updateButtonVisibility() {
    const hasCCW = this._rotationMap.some(row => row[CCW] != null);
    const hasCW = this._rotationMap.some(row => row[CW]  != null);
    this.shadowRoot.querySelector(`button[data-dir="${CCW}"]`).hidden = !hasCCW;
    this.shadowRoot.querySelector(`button[data-dir="${CW}"]`).hidden  = !hasCW;
  }

  _updateButtonAvailability() {
    this.shadowRoot.querySelectorAll('button[data-dir]').forEach(btn => {
      const direction = parseInt(btn.dataset.dir);
      btn.disabled =
        this._rotationMap[this._nextRotation][direction] == null ||
        this._rotationMap[this._nextRotation][direction] === this._nextRotation ||
        this._rotationMap[this._nextRotation][direction] < 0
      ;
    });
  }

  _move(direction) {
    if(this._rotations == null) return;
    this._currentRotation = this._nextRotation;
    this._nextRotation = this._rotationMap[this._currentRotation][direction] ?? this._currentRotation;
    this._interpolationTime = 0;
    this._lastFrameTimestamp = null;
    this._updateButtonAvailability();
    if(this._animationFrame === null) {
      this._animationFrame = requestAnimationFrame(this._animate);
    }
  }

  _animate(time) {
    const deltaTime = this._lastFrameTimestamp !== null ? (time - this._lastFrameTimestamp) / 1000 : 0;
    this._lastFrameTimestamp = time;

    this._interpolationTime = clamp(this._interpolationTime + deltaTime / INTERPOLATION_SPEED, 0, 1);
    this._cube.quaternion.copy(this._rotations[this._currentRotation]);
    this._cube.quaternion.slerp(this._rotations[this._nextRotation], this._interpolationTime);
    this._renderer.render(this._scene, this._camera);

    if(this._interpolationTime < 1) {
      this._animationFrame = requestAnimationFrame(this._animate)
    } else {
      this._animationFrame = null;
    }
  }
}

customElements.define('cube-rotation', CubeRotation);