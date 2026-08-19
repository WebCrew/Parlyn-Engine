import * as THREE from 'three';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { RendererBackend } from './RendererBackend.mjs';

export class ThreeRenderer extends RendererBackend {
  constructor(container, callbacks = {}) {
    super();
    this.container = container;
    this.callbacks = callbacks;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.nodeObjects = new Map();
    this.selectedId = null;
    this.selectionBox = null;
    this.transformControls = null;
    this.transformMode = 'select';
    this.suppressSelectionClick = false;
    this.cameraTarget = new THREE.Vector3(0, 0.7, 0);
    this.orbit = { yaw:-0.55, pitch:0.42, distance:11 };
    this.drag = null;
  }

  async initialize(sceneDocument) {
    this.renderer = new THREE.WebGLRenderer({ antialias:true, alpha:false });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.setClearColor(0x0a0f16, 1);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0f16);
    this.scene.fog = new THREE.FogExp2(0x0a0f16, 0.025);
    this.camera = new THREE.PerspectiveCamera(50, 1, 0.05, 1000);
    this.#updateCamera();

    this.scene.add(new THREE.HemisphereLight(0xbfd8ff, 0x1b2330, 1.35));
    const grid = new THREE.GridHelper(30, 30, 0x476f9f, 0x243344);
    grid.position.y = -1.55;
    this.scene.add(grid);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(30,30), new THREE.ShadowMaterial({ color:0x000000, opacity:0.24 }));
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.54;
    ground.receiveShadow = true;
    this.scene.add(ground);

    this.transformControls = new TransformControls(this.camera, this.renderer.domElement);
    this.transformControls.setSize(0.82);
    this.scene.add(this.transformControls.getHelper());
    this.transformControls.addEventListener('mouseDown', () => {
      if (!this.selectedId) return;
      this.suppressSelectionClick = true;
      this.callbacks.onTransformStart?.(this.selectedId);
    });
    this.transformControls.addEventListener('objectChange', () => {
      if (!this.selectedId) return;
      const transform = this.#readObjectTransform(this.selectedId);
      if (transform) this.callbacks.onTransformChange?.(this.selectedId, transform);
    });
    this.transformControls.addEventListener('mouseUp', () => {
      if (!this.selectedId) return;
      const transform = this.#readObjectTransform(this.selectedId);
      if (transform) this.callbacks.onTransformEnd?.(this.selectedId, transform);
      setTimeout(() => { this.suppressSelectionClick = false; }, 0);
    });

    sceneDocument.root.walk((node) => this.#createObjectForNode(node));
    this.#installInteraction();
    this.resize();
  }

  rebuild(sceneDocument) {
    this.transformControls?.detach();
    for (const [id, object] of this.nodeObjects) this.#disposeNodeObject(id, object);
    this.nodeObjects.clear();
    this.selectNode(null);
    sceneDocument.root.walk((node) => this.#createObjectForNode(node));
  }

  addNode(node) { this.#createObjectForNode(node); }

  removeNode(nodeId) {
    const object = this.nodeObjects.get(nodeId);
    if (!object) return;
    if (this.selectedId === nodeId) this.selectNode(null);
    this.#disposeNodeObject(nodeId, object);
    this.nodeObjects.delete(nodeId);
  }

  #disposeNodeObject(id, object) {
    this.scene.remove(object);
    object.traverse?.((child) => {
      child.geometry?.dispose?.();
      if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose?.());
      else child.material?.dispose?.();
    });
  }

  #createObjectForNode(node) {
    if (node.type === 'SceneRoot') return;
    let object;

    if (node.type === 'Sprite2_5D' || node.type === 'Billboard2_5D') {
      const geometry = new THREE.PlaneGeometry(node.metadata.width ?? 2.4, node.metadata.height ?? 1.8);
      const material = new THREE.MeshStandardMaterial({
        color:node.metadata.color ?? 0x4f8edc,
        roughness:0.72,
        metalness:0.03,
        transparent:true,
        opacity:node.metadata.opacity ?? 0.95,
        side:THREE.DoubleSide
      });
      object = new THREE.Mesh(geometry, material);
      object.userData.billboard = node.type === 'Billboard2_5D';
      object.userData.billboardRoll = THREE.MathUtils.degToRad(node.rotation ?? 0);
      object.castShadow = true;
      object.receiveShadow = true;
    } else if (node.type === 'Mesh3D') {
      object = new THREE.Mesh(
        new THREE.BoxGeometry(1.5,1.5,1.5,2,2,2),
        new THREE.MeshStandardMaterial({ color:0x82b2ee, roughness:0.28, metalness:0.18 })
      );
      object.castShadow = true;
      object.receiveShadow = true;
    } else if (node.type === 'Light3D') {
      const group = new THREE.Group();
      const light = node.lightKind === 'point'
        ? new THREE.PointLight(node.color, node.intensity, 20)
        : new THREE.DirectionalLight(node.color, node.intensity);
      light.castShadow = node.castShadow;
      if (light.shadow) light.shadow.mapSize.set(1024,1024);
      group.add(light);
      const marker = new THREE.Mesh(new THREE.SphereGeometry(0.16,16,12), new THREE.MeshBasicMaterial({ color:node.color }));
      group.add(marker);
      group.userData.light = light;
      object = group;
    } else if (node.type === 'Camera3D') {
      const group = new THREE.Group();
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.45,0.3,0.28), new THREE.MeshBasicMaterial({ color:0x9fb7d1, wireframe:true }));
      const lens = new THREE.Mesh(new THREE.ConeGeometry(0.18,0.35,4), new THREE.MeshBasicMaterial({ color:0x4f8edc, wireframe:true }));
      lens.rotation.x = Math.PI / 2;
      lens.position.z = -0.3;
      group.add(body,lens);
      object = group;
    } else return;

    object.userData.parlynNodeId = node.id;
    this.#applyNodeTransform(node, object);
    this.nodeObjects.set(node.id, object);
    this.scene.add(object);
  }

  #applyNodeTransform(node, object) {
    object.position.set(node.position?.x ?? 0, node.position?.y ?? 0, node.position?.z ?? 0);
    if (node.type === 'Sprite2_5D' || node.type === 'Billboard2_5D') {
      object.rotation.set(0, 0, THREE.MathUtils.degToRad(node.rotation ?? 0));
      object.userData.billboardRoll = object.rotation.z;
      object.scale.set(node.scale?.x ?? 1, node.scale?.y ?? 1, 1);
    } else {
      object.rotation.set(
        THREE.MathUtils.degToRad(node.rotation?.x ?? 0),
        THREE.MathUtils.degToRad(node.rotation?.y ?? 0),
        THREE.MathUtils.degToRad(node.rotation?.z ?? 0)
      );
      object.scale.set(node.scale?.x ?? 1, node.scale?.y ?? 1, node.scale?.z ?? 1);
    }
  }

  #readObjectTransform(nodeId) {
    const object = this.nodeObjects.get(nodeId);
    if (!object) return null;
    const is25D = object.userData.billboard || ['Sprite2_5D','Billboard2_5D'].includes(this.callbacks.getNodeType?.(nodeId));
    if (is25D) {
      return {
        position:{ x:object.position.x, y:object.position.y, z:object.position.z },
        rotation:THREE.MathUtils.radToDeg(object.rotation.z),
        scale:{ x:object.scale.x, y:object.scale.y }
      };
    }
    return {
      position:{ x:object.position.x, y:object.position.y, z:object.position.z },
      rotation:{
        x:THREE.MathUtils.radToDeg(object.rotation.x),
        y:THREE.MathUtils.radToDeg(object.rotation.y),
        z:THREE.MathUtils.radToDeg(object.rotation.z)
      },
      scale:{ x:object.scale.x, y:object.scale.y, z:object.scale.z }
    };
  }

  resize() {
    if (!this.renderer || !this.camera) return;
    const { clientWidth:width, clientHeight:height } = this.container;
    if (!width || !height) return;
    this.renderer.setSize(width,height,false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  render() {
    if (!this.renderer || !this.scene || !this.camera) return;
    for (const object of this.nodeObjects.values()) {
      if (object.userData.billboard && !(this.transformControls?.dragging && this.selectedId === object.userData.parlynNodeId)) {
        object.quaternion.copy(this.camera.quaternion);
        object.rotateZ(object.userData.billboardRoll ?? 0);
      }
    }
    if (this.selectionBox) this.selectionBox.update();
    this.renderer.render(this.scene,this.camera);
  }

  selectNode(nodeId) {
    this.selectedId = nodeId;
    this.transformControls?.detach();
    if (this.selectionBox) {
      this.scene.remove(this.selectionBox);
      this.selectionBox.geometry.dispose();
      this.selectionBox.material.dispose();
      this.selectionBox = null;
    }
    const object = this.nodeObjects.get(nodeId);
    if (object) {
      this.selectionBox = new THREE.BoxHelper(object,0x78b8ff);
      this.scene.add(this.selectionBox);
      this.#attachTransformControls();
    }
  }

  setTransformMode(mode) {
    if (!['select','translate','rotate','scale'].includes(mode)) throw new Error(`Unsupported transform mode: ${mode}`);
    this.transformMode = mode;
    this.#attachTransformControls();
  }

  #attachTransformControls() {
    if (!this.transformControls) return;
    this.transformControls.detach();
    if (this.transformMode === 'select' || !this.selectedId) return;
    const object = this.nodeObjects.get(this.selectedId);
    if (!object) return;
    const nodeType = this.callbacks.getNodeType?.(this.selectedId);
    this.transformControls.setMode(this.transformMode);
    this.transformControls.setSpace(this.transformMode === 'translate' ? 'world' : 'local');
    this.transformControls.showX = true;
    this.transformControls.showY = true;
    this.transformControls.showZ = true;
    if (nodeType === 'Sprite2_5D' || nodeType === 'Billboard2_5D') {
      if (this.transformMode === 'rotate') {
        this.transformControls.showX = false;
        this.transformControls.showY = false;
      } else if (this.transformMode === 'scale') {
        this.transformControls.showZ = false;
      }
    }
    this.transformControls.attach(object);
  }

  updateNodeTransform(node) {
    const object = this.nodeObjects.get(node.id);
    if (!object) return;
    this.#applyNodeTransform(node,object);
    if (node.type === 'Light3D' && object.userData.light) {
      const isPoint = object.userData.light.isPointLight;
      if ((node.lightKind === 'point') !== isPoint) {
        const keepSelected = this.selectedId === node.id;
        this.removeNode(node.id);
        this.addNode(node);
        if (keepSelected) this.selectNode(node.id);
        return;
      }
      object.userData.light.color.set(node.color);
      object.userData.light.intensity = node.intensity;
      object.userData.light.castShadow = node.castShadow;
    }
    if (this.selectionBox && this.selectedId === node.id) this.selectionBox.update();
  }

  setView(mode) {
    if (mode === '2.5d') {
      this.orbit = { yaw:-0.18, pitch:0.18, distance:10.5 };
      this.cameraTarget.set(0,0.4,0);
    } else {
      this.orbit = { yaw:-0.72, pitch:0.48, distance:11.5 };
      this.cameraTarget.set(0,0.3,0);
    }
    this.#updateCamera();
  }

  #installInteraction() {
    const canvas = this.renderer.domElement;
    canvas.addEventListener('contextmenu',(event)=>event.preventDefault());
    canvas.addEventListener('pointerdown',(event)=>{
      if (event.button === 2 || event.button === 1) {
        this.drag = { x:event.clientX, y:event.clientY, button:event.button };
        canvas.setPointerCapture(event.pointerId);
      }
    });
    canvas.addEventListener('pointermove',(event)=>{
      if (!this.drag || this.transformControls?.dragging) return;
      const dx=event.clientX-this.drag.x, dy=event.clientY-this.drag.y;
      this.drag.x=event.clientX; this.drag.y=event.clientY;
      if (this.drag.button === 2) {
        this.orbit.yaw -= dx*0.006;
        this.orbit.pitch = THREE.MathUtils.clamp(this.orbit.pitch-dy*0.006,-1.25,1.25);
      } else {
        const factor=this.orbit.distance*0.0016;
        const right=new THREE.Vector3(1,0,0).applyQuaternion(this.camera.quaternion);
        const up=new THREE.Vector3(0,1,0);
        this.cameraTarget.addScaledVector(right,-dx*factor);
        this.cameraTarget.addScaledVector(up,dy*factor);
      }
      this.#updateCamera();
    });
    canvas.addEventListener('pointerup',(event)=>{ if (this.drag) canvas.releasePointerCapture(event.pointerId); this.drag=null; });
    canvas.addEventListener('wheel',(event)=>{
      if (this.transformControls?.dragging) return;
      event.preventDefault();
      this.orbit.distance=THREE.MathUtils.clamp(this.orbit.distance*Math.exp(event.deltaY*0.001),2.5,40);
      this.#updateCamera();
    },{ passive:false });
    canvas.addEventListener('click',(event)=>{
      if (event.button !== 0 || this.suppressSelectionClick || this.transformControls?.dragging) return;
      const rect=canvas.getBoundingClientRect();
      this.pointer.x=((event.clientX-rect.left)/rect.width)*2-1;
      this.pointer.y=-((event.clientY-rect.top)/rect.height)*2+1;
      this.raycaster.setFromCamera(this.pointer,this.camera);
      const candidates=[];
      for (const object of this.nodeObjects.values()) object.traverse?.((child)=>{ if (child.isMesh) candidates.push(child); });
      const hit=this.raycaster.intersectObjects(candidates,false)[0];
      let object=hit?.object;
      while (object && !object.userData?.parlynNodeId) object=object.parent;
      if (object?.userData?.parlynNodeId) this.callbacks.onSelect?.(object.userData.parlynNodeId);
    });
  }

  #updateCamera() {
    if (!this.camera) return;
    const cp=Math.cos(this.orbit.pitch);
    const offset=new THREE.Vector3(
      Math.sin(this.orbit.yaw)*cp,
      Math.sin(this.orbit.pitch),
      Math.cos(this.orbit.yaw)*cp
    ).multiplyScalar(this.orbit.distance);
    this.camera.position.copy(this.cameraTarget).add(offset);
    this.camera.lookAt(this.cameraTarget);
  }

  dispose() {
    this.transformControls?.detach();
    this.renderer?.dispose();
  }
}
