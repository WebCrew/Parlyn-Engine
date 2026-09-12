import { SceneDocument } from "../engine/scene/SceneDocument.mjs";
import { ProjectDocument } from "../engine/project/ProjectDocument.mjs";
import { WorldDocument } from "../engine/world/WorldDocument.mjs";
import { Node2_5D } from "../engine/core/Node2_5D.mjs";
import { Node3D } from "../engine/core/Node3D.mjs";
import { Camera3D } from "../engine/core/Camera3D.mjs";
import { Light3D } from "../engine/core/Light3D.mjs";
import { History } from "../engine/history/History.mjs";
import { ThreeRenderer } from "../engine/render/ThreeRenderer.mjs";
import { ModuleRegistry } from "../engine/modules/ModuleRegistry.mjs";
import { ExampleModule } from "../modules/example/ExampleModule.mjs";
import { approveUnsavedTransition } from "../engine/editor/UnsavedChanges.mjs";
import { DEFAULT_WORKSPACE_LAYOUT, normalizeWorkspaceLayout } from "../engine/editor/WorkspaceLayout.mjs";
import { createErrorReport } from "../engine/editor/ErrorReport.mjs";
import { DEFAULT_TRANSFORM_SNAPPING, normalizeTransformSnapping } from "../engine/editor/TransformSnapping.mjs";
import { normalizeTransformSpace } from "../engine/editor/TransformSpace.mjs";
async function bootstrap() {
  const $ = (id) => document.getElementById(id);
  const status = $("status");
  const host = window.parlynHost;
  const workspaceLayoutKey = "parlyn.editor.workspace-layout";
  const transformSnappingKey = "parlyn.editor.transform-snapping";
  const transformSpaceKey = "parlyn.editor.transform-space";
  let workspaceLayout = readWorkspaceLayout();
  let transformSnapping = readTransformSnapping();
  let transformSpace = readTransformSpace();
  const history = new History({ limit: 100 });
  let scene = createDemoScene();
  let selected = null;
  let selectedIds = new Set();
  let selectionAnchorId = null;
  let visibleHierarchyIds = [];
  let currentFilePath = null;
  let currentProject = null;
  let currentProjectRoot = null;
  let currentSceneRelativePath = null;
  let currentWorld = null;
  let assets = [];
  let selectedAssetPath = null;
  let projectScenes = [];
  let inspectorStartSnapshot = null;
  let dirty = false;
  let pendingUnsavedDecision = null;
  let currentErrorReport = null;
  let gizmoStartSnapshot = null;
  let transformMode = "select";
  const moduleEvents = new EventTarget();
  const modules = new ModuleRegistry({ events: moduleEvents, log: (message) => {
    console.info(`[Parlyn Module] ${message}`);
    status.textContent = message;
  } });
  modules.register(ExampleModule);
  await modules.initializeDefaults();
  const renderer = new ThreeRenderer($("viewport"), { onSelect: selectById, getNodeType: (id) => scene.findById(id)?.type ?? null, onTransformStart: beginGizmoTransform, onTransformChange: applyGizmoTransform, onTransformEnd: commitGizmoTransform });
  await renderer.initialize(scene);
  renderer.setTransformMode(transformMode);
  applyTransformSpace();
  applyTransformSnapping();
  initializeWorkspaceLayout();
  function readTransformSpace() {
    try {
      const stored = window.localStorage.getItem(transformSpaceKey);
      return normalizeTransformSpace(stored ? JSON.parse(stored) : null);
    } catch (error) {
      console.warn("Saved transform space was ignored:", error);
      return normalizeTransformSpace(null);
    }
  }
  function applyTransformSpace({ persist = false, announce = false } = {}) {
    transformSpace = normalizeTransformSpace(transformSpace);
    renderer.setTransformSpace(transformSpace.space);
    const scaleMode = transformMode === "scale";
    $("transform-space").querySelector(".command-label").textContent = scaleMode ? "Local" : transformSpace.space === "world" ? "World" : "Local";
    $("transform-space").disabled = scaleMode;
    $("transform-space").setAttribute("aria-pressed", String(transformSpace.space === "local"));
    $("transform-space").setAttribute("aria-label", scaleMode ? "Transform orientation: Local (Scale)" : `Transform orientation: ${transformSpace.space === "world" ? "World" : "Local"}`);
    $("transform-space").title = scaleMode ? "Scale always uses local axes" : `Transform orientation: ${transformSpace.space}`;
    if (persist) {
      try { window.localStorage.setItem(transformSpaceKey, JSON.stringify(transformSpace)); }
      catch (error) { console.warn("Transform space could not be saved:", error); }
    }
    if (announce) status.textContent = `Transform orientation: ${transformSpace.space === "world" ? "World" : "Local"}`;
  }
  function toggleTransformSpace() {
    transformSpace.space = transformSpace.space === "world" ? "local" : "world";
    applyTransformSpace({ persist:true, announce:true });
  }
  function readTransformSnapping() {
    try {
      const stored = window.localStorage.getItem(transformSnappingKey);
      return normalizeTransformSnapping(stored ? JSON.parse(stored) : null);
    } catch (error) {
      console.warn("Saved transform snapping was ignored:", error);
      return normalizeTransformSnapping(null);
    }
  }
  function applyTransformSnapping({ persist = false, announce = false } = {}) {
    transformSnapping = normalizeTransformSnapping(transformSnapping);
    renderer.setTransformSnapping(transformSnapping);
    $("snap-toggle").classList.toggle("active", transformSnapping.enabled);
    $("snap-toggle").setAttribute("aria-pressed", String(transformSnapping.enabled));
    $("snap-toggle").title = `Transform Snap: ${transformSnapping.translation} units / ${transformSnapping.rotationDegrees}° / ${transformSnapping.scale} scale`;
    if (persist) {
      try { window.localStorage.setItem(transformSnappingKey, JSON.stringify(transformSnapping)); }
      catch (error) { console.warn("Transform snapping could not be saved:", error); }
    }
    if (announce) status.textContent = transformSnapping.enabled
      ? `Transform Snap on · ${transformSnapping.translation} units · ${transformSnapping.rotationDegrees}° · ${transformSnapping.scale} scale`
      : "Transform Snap off";
  }
  function toggleTransformSnapping() {
    transformSnapping.enabled = !transformSnapping.enabled;
    applyTransformSnapping({ persist:true, announce:true });
  }
  function populateTransformSnapSettings() {
    $("snap-translation").value = String(transformSnapping.translation);
    $("snap-rotation").value = String(transformSnapping.rotationDegrees);
    $("snap-scale").value = String(transformSnapping.scale);
  }
  function openTransformSnapSettings() {
    populateTransformSnapSettings();
    $("snap-settings-dialog").showModal();
  }
  function saveTransformSnapSettings() {
    const inputs = [$("snap-translation"), $("snap-rotation"), $("snap-scale")];
    const invalid = inputs.find((input) => !input.checkValidity());
    if (invalid) {
      invalid.reportValidity();
      return;
    }
    transformSnapping = normalizeTransformSnapping({
      ...transformSnapping,
      translation:Number($("snap-translation").value),
      rotationDegrees:Number($("snap-rotation").value),
      scale:Number($("snap-scale").value)
    });
    applyTransformSnapping({ persist:true });
    $("snap-settings-dialog").close();
    status.textContent = `Snap steps saved · ${transformSnapping.translation} units · ${transformSnapping.rotationDegrees}° · ${transformSnapping.scale} scale`;
  }
  function resetTransformSnapSettings() {
    transformSnapping = { ...DEFAULT_TRANSFORM_SNAPPING, enabled:transformSnapping.enabled };
    applyTransformSnapping({ persist:true });
    populateTransformSnapSettings();
    status.textContent = "Snap steps reset to defaults.";
  }
  function readWorkspaceLayout() {
    try {
      const stored = window.localStorage.getItem(workspaceLayoutKey);
      return normalizeWorkspaceLayout(stored ? JSON.parse(stored) : null);
    } catch (error) {
      console.warn("Saved workspace layout was ignored:", error);
      return normalizeWorkspaceLayout(null);
    }
  }
  function saveWorkspaceLayout() {
    try { window.localStorage.setItem(workspaceLayoutKey, JSON.stringify(workspaceLayout)); }
    catch (error) { console.warn("Workspace layout could not be saved:", error); }
  }
  function applyWorkspaceLayout({ persist = false } = {}) {
    workspaceLayout = normalizeWorkspaceLayout(workspaceLayout);
    const workspace = document.querySelector(".workspace");
    const { panels, sizes } = workspaceLayout;
    $("hierarchy-panel").hidden = !panels.hierarchy;
    $("hierarchy-resizer").hidden = !panels.hierarchy;
    $("inspector-panel").hidden = !panels.inspector;
    $("inspector-resizer").hidden = !panels.inspector;
    $("assets-panel").hidden = !panels.assets;
    $("assets-resizer").hidden = !panels.assets;
    $("hierarchy-resizer").setAttribute("aria-valuenow", String(sizes.hierarchy));
    $("inspector-resizer").setAttribute("aria-valuenow", String(sizes.inspector));
    $("assets-resizer").setAttribute("aria-valuenow", String(sizes.assets));
    $("show-hierarchy").checked = panels.hierarchy;
    $("show-inspector").checked = panels.inspector;
    $("show-assets").checked = panels.assets;
    workspace.style.setProperty("--hierarchy-width", panels.hierarchy ? `${sizes.hierarchy}px` : "0px");
    workspace.style.setProperty("--hierarchy-resizer-width", panels.hierarchy ? "5px" : "0px");
    workspace.style.setProperty("--inspector-width", panels.inspector ? `${sizes.inspector}px` : "0px");
    workspace.style.setProperty("--inspector-resizer-width", panels.inspector ? "5px" : "0px");
    workspace.style.setProperty("--assets-height", panels.assets ? `${sizes.assets}px` : "0px");
    if (persist) saveWorkspaceLayout();
    requestAnimationFrame(() => renderer.resize());
  }
  function setPanelVisible(panel, visible) {
    workspaceLayout.panels[panel] = visible;
    applyWorkspaceLayout({ persist:true });
    status.textContent = `${{ hierarchy:"Hierarchy and Scenes", inspector:"Inspector", assets:"Assets" }[panel]} panel ${visible ? "shown" : "hidden"}.`;
  }
  function closeViewMenu() {
    $("view-menu").hidden = true;
    $("view-menu-button").setAttribute("aria-expanded", "false");
  }
  function initializeWorkspaceLayout() {
    applyWorkspaceLayout();
    $("view-menu-button").addEventListener("click", (event) => {
      event.stopPropagation();
      const willOpen = $("view-menu").hidden;
      $("view-menu").hidden = !willOpen;
      $("view-menu-button").setAttribute("aria-expanded", String(willOpen));
    });
    $("view-menu").addEventListener("click", (event) => event.stopPropagation());
    document.addEventListener("click", closeViewMenu);
    for (const [id, panel] of [["show-hierarchy", "hierarchy"], ["show-inspector", "inspector"], ["show-assets", "assets"]]) {
      $(id).addEventListener("change", () => setPanelVisible(panel, $(id).checked));
    }
    document.querySelectorAll("[data-close-panel]").forEach((button) => button.addEventListener("click", () => setPanelVisible(button.dataset.closePanel, false)));
    $("reset-layout").addEventListener("click", () => {
      workspaceLayout = normalizeWorkspaceLayout(DEFAULT_WORKSPACE_LAYOUT);
      applyWorkspaceLayout({ persist:true });
      closeViewMenu();
      status.textContent = "Workspace layout reset to default.";
    });
    for (const resizer of document.querySelectorAll("[data-resize-panel]")) {
      resizer.addEventListener("pointerdown", (event) => beginPanelResize(event, resizer));
      resizer.addEventListener("keydown", (event) => {
        const panel = resizer.dataset.resizePanel;
        const direction = panel === "assets" ? (event.key === "ArrowUp" ? 1 : event.key === "ArrowDown" ? -1 : 0) : panel === "hierarchy" ? (event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0) : (event.key === "ArrowLeft" ? 1 : event.key === "ArrowRight" ? -1 : 0);
        if (!direction) return;
        event.preventDefault();
        workspaceLayout.sizes[panel] += direction * 10;
        applyWorkspaceLayout({ persist:true });
      });
    }
  }
  function beginPanelResize(event, resizer) {
    if (event.button !== 0) return;
    const panel = resizer.dataset.resizePanel;
    const startX = event.clientX;
    const startY = event.clientY;
    const startSize = workspaceLayout.sizes[panel];
    const workspace = document.querySelector(".workspace");
    resizer.setPointerCapture(event.pointerId);
    resizer.classList.add("dragging");
    workspace.classList.add("is-resizing");
    const move = (moveEvent) => {
      const delta = panel === "hierarchy" ? moveEvent.clientX - startX : panel === "inspector" ? startX - moveEvent.clientX : startY - moveEvent.clientY;
      workspaceLayout.sizes[panel] = startSize + delta;
      applyWorkspaceLayout();
    };
    const finish = () => {
      resizer.removeEventListener("pointermove", move);
      resizer.removeEventListener("pointerup", finish);
      resizer.removeEventListener("pointercancel", finish);
      resizer.classList.remove("dragging");
      workspace.classList.remove("is-resizing");
      workspaceLayout = normalizeWorkspaceLayout(workspaceLayout);
      applyWorkspaceLayout({ persist:true });
    };
    resizer.addEventListener("pointermove", move);
    resizer.addEventListener("pointerup", finish);
    resizer.addEventListener("pointercancel", finish);
  }
  function createDemoScene() {
    const doc = new SceneDocument("Parlyn Showcase");
    const back = doc.root.addChild(new Node2_5D({ name: "Mountain Backdrop", type: "Sprite2_5D", position: { x: -1.4, y: 1, z: -2.2 }, scale: { x: 1.35, y: 1.35 }, depthLayer: "background" }));
    back.metadata = { width: 4.6, height: 2.5, color: 2706291, opacity: 0.92 };
    const mid = doc.root.addChild(new Node2_5D({ name: "Ruins Layer", type: "Sprite2_5D", position: { x: 0.1, y: 0.25, z: -0.35 }, depthLayer: "gameplay" }));
    mid.metadata = { width: 3.8, height: 2.3, color: 4685751, opacity: 0.94 };
    const hero = doc.root.addChild(new Node2_5D({ name: "Hero Billboard", type: "Billboard2_5D", position: { x: -0.6, y: -0.35, z: 1 }, scale: { x: 0.55, y: 0.9 }, depthLayer: "foreground" }));
    hero.metadata = { width: 1.4, height: 2.4, color: 7911679, opacity: 0.98 };
    doc.root.addChild(new Node3D({ name: "3D Prop", type: "Mesh3D", position: { x: 2.1, y: -0.75, z: 0.5 }, rotation: { x: 0, y: 25, z: 0 } }));
    doc.root.addChild(new Light3D({ name: "Key Light", position: { x: 5, y: 8, z: 5 }, intensity: 2.4 }));
    doc.root.addChild(new Camera3D({ name: "Gameplay Camera", position: { x: 0, y: 2.2, z: 9 }, rotation: { x: -8, y: 0, z: 0 }, fov: 50, primary: true }));
    return doc;
  }
  function sceneSnapshot() {
    return scene.toJSON();
  }
  function setDirty(value = true) {
    dirty = value;
    document.title = `Parlyn Engine${dirty ? " *" : ""}`;
  }
  function restoreSnapshot(snapshot, selectionId = null) {
    scene = SceneDocument.fromJSON(snapshot);
    renderer.rebuild(scene);
    if (selectionId && scene.findById(selectionId)) selectById(selectionId);
    else clearSelection();
    updateHistoryButtons();
    setDirty(true);
  }
  function pushHistory(snapshot, label) {
    history.push(snapshot, label);
    updateHistoryButtons();
    setDirty(true);
  }
  function updateHistoryButtons() {
    $("undo").disabled = !history.canUndo;
    $("redo").disabled = !history.canRedo;
  }
  function nodeIcon(node) {
    return { Mesh3D: "\u25C6", Sprite2_5D: "\u25B1", Billboard2_5D: "\u25E9", Light3D: "\u263C", Camera3D: "\u25A3" }[node.type] ?? "\u25C7";
  }
  function renderHierarchy() {
    const root = $("hierarchy");
    root.replaceChildren();
    visibleHierarchyIds = [];
    const rootButton = document.createElement("button");
    rootButton.className = "tree-item scene-root";
    rootButton.innerHTML = `<span class="node-icon">\u25C7</span><span>${escapeHtml(scene.name)}</span>`;
    root.appendChild(rootButton);
    function appendNode(node, depth) {
      const b = document.createElement("button");
      b.className = "tree-item child" + (selectedIds.has(node.id) ? " active" : "");
      b.style.setProperty("--tree-depth", depth);
      b.dataset.id = node.id;
      b.innerHTML = `<span class="node-icon">${nodeIcon(node)}</span><span>${escapeHtml(node.name)}</span>`;
      b.addEventListener("click", (event) => selectById(node.id, { toggle: event.ctrlKey || event.metaKey, range: event.shiftKey }));
      root.appendChild(b);
      visibleHierarchyIds.push(node.id);
      node.children.forEach((child) => appendNode(child, depth + 1));
    }
    scene.root.children.forEach((node) => appendNode(node, 1));
  }
  function escapeHtml(value) {
    const d = document.createElement("div");
    d.textContent = value;
    return d.innerHTML;
  }
  function showError(title, error) {
    currentErrorReport = createErrorReport(title, error);
    console.error(title, error);
    status.textContent = `${currentErrorReport.area}: ${currentErrorReport.message}`;
    $("error-title").textContent = currentErrorReport.operation;
    $("error-area").textContent = currentErrorReport.area;
    $("error-message").textContent = currentErrorReport.message;
    $("error-guidance").textContent = currentErrorReport.guidance;
    $("error-technical").textContent = currentErrorReport.technicalDetails;
    $("error-details").open = false;
    $("copy-error").textContent = "Copy Details";
    const errorDialog = $("error-dialog");
    if (errorDialog.open) errorDialog.close();
    errorDialog.showModal();
  }
  function resetProjectWorkspace() {
    currentProject = null;
    currentProjectRoot = null;
    currentSceneRelativePath = null;
    currentFilePath = null;
    currentWorld = null;
    assets = [];
    selectedAssetPath = null;
    projectScenes = [];
    scene = new SceneDocument("Untitled Scene");
    history.clear();
    renderer.rebuild(scene);
    clearSelection();
    updateHistoryButtons();
    updateProjectUI();
    renderAssets();
    renderProjectScenes();
    setDirty(false);
  }
  function resolveUnsavedDecision(decision) {
    const resolve = pendingUnsavedDecision;
    pendingUnsavedDecision = null;
    if ($("unsaved-dialog").open) $("unsaved-dialog").close();
    resolve?.(decision);
  }
  function askAboutUnsavedChanges() {
    if (!dirty) return Promise.resolve("continue");
    if (pendingUnsavedDecision) return Promise.resolve("cancel");
    $("unsaved-dialog").showModal();
    return new Promise((resolve) => { pendingUnsavedDecision = resolve; });
  }
  async function mayReplaceScene() {
    return approveUnsavedTransition({ dirty, requestDecision:askAboutUnsavedChanges, save:saveScene });
  }
  async function handleAppCloseRequest() {
    if (!await mayReplaceScene()) {
      status.textContent = "Application close canceled.";
      return;
    }
    try { await host.confirmAppClose(); }
    catch (error) { showError("Application close failed", error); }
  }
  async function leaveProjectForLooseScene() {
    if (!currentProject) return true;
    const result = await host.closeProject();
    if (!result.ok) throw new Error("The active project session could not be closed.");
    currentProject = null;
    currentProjectRoot = null;
    currentSceneRelativePath = null;
    currentWorld = null;
    assets = [];
    selectedAssetPath = null;
    projectScenes = [];
    updateProjectUI();
    renderAssets();
    renderProjectScenes();
    return true;
  }
  function clearSelection() {
    selected = null;
    selectedIds.clear();
    selectionAnchorId = null;
    renderer.setSelection([]);
    $("inspector-empty").hidden = false;
    $("inspector").hidden = true;
    $("selected-type").textContent = "None";
    $("delete-node").disabled = true;
    $("duplicate-node").disabled = true;
    $("reparent-node").disabled = true;
    $("frame-selected").disabled = true;
    renderHierarchy();
  }
  function selectById(id, { toggle = false, range = false } = {}) {
    const node = scene.findById(id);
    if (!node) return;
    if (range && selectionAnchorId && visibleHierarchyIds.includes(selectionAnchorId)) {
      const start = visibleHierarchyIds.indexOf(selectionAnchorId);
      const end = visibleHierarchyIds.indexOf(id);
      selectedIds = new Set(visibleHierarchyIds.slice(Math.min(start, end), Math.max(start, end) + 1));
    } else if (toggle) {
      if (selectedIds.has(id)) selectedIds.delete(id);
      else selectedIds.add(id);
      selectionAnchorId = id;
    } else {
      selectedIds = new Set([id]);
      selectionAnchorId = id;
    }
    selected = selectedIds.has(id) ? node : scene.findById([...selectedIds][0]) ?? null;
    renderer.setSelection([...selectedIds], selected?.id ?? null);
    renderHierarchy();
    const count = selectedIds.size;
    if (count === 1 && selected) {
      populateInspector();
      $("selected-type").textContent = selected.type;
    } else {
      $("inspector-empty").hidden = false;
      $("inspector").hidden = true;
      $("selected-type").textContent = count ? `${count} selected` : "None";
    }
    $("delete-node").disabled = count === 0;
    $("duplicate-node").disabled = count !== 1;
    $("reparent-node").disabled = count !== 1;
    $("frame-selected").disabled = count === 0;
    status.textContent = count === 1 ? `Selected: ${selected.name}` : `${count} nodes selected`;
  }
  function populateInspector() {
    $("inspector-empty").hidden = true;
    $("inspector").hidden = false;
    $("selected-type").textContent = selected.type;
    $("name").value = selected.name;
    ["x", "y", "z"].forEach((axis) => $("p" + axis).value = selected.position?.[axis] ?? 0);
    const is25 = selected instanceof Node2_5D;
    $("rotation-25-wrap").hidden = !is25;
    $("rotation-3d-wrap").hidden = is25;
    $("depth-section").hidden = !is25;
    $("sz-wrap").hidden = is25;
    $("light-section").hidden = !(selected instanceof Light3D);
    $("camera-section").hidden = !(selected instanceof Camera3D);
    if (is25) {
      $("r25").value = selected.rotation;
      $("sx").value = selected.scale.x;
      $("sy").value = selected.scale.y;
      $("depth-layer").value = selected.depthLayer;
    } else {
      ["x", "y", "z"].forEach((axis) => $("r" + axis).value = selected.rotation?.[axis] ?? 0);
      ["x", "y", "z"].forEach((axis) => $("s" + axis).value = selected.scale?.[axis] ?? 1);
    }
    if (selected instanceof Light3D) {
      $("light-kind").value = selected.lightKind;
      $("light-color").value = selected.color;
      $("light-intensity").value = selected.intensity;
    }
    if (selected instanceof Camera3D) $("camera-fov").value = selected.fov;
  }
  function number(id, fallback = 0) {
    const value = Number($(id).value);
    return Number.isFinite(value) ? value : fallback;
  }
  function applyInspector() {
    if (!selected) return;
    selected.name = $("name").value.trim() || selected.name;
    selected.position = { x: number("px"), y: number("py"), z: number("pz") };
    if (selected instanceof Node2_5D) {
      selected.rotation = number("r25");
      selected.scale = { x: number("sx", 1), y: number("sy", 1) };
      selected.depthLayer = $("depth-layer").value;
    } else {
      selected.rotation = { x: number("rx"), y: number("ry"), z: number("rz") };
      selected.scale = { x: number("sx", 1), y: number("sy", 1), z: number("sz", 1) };
    }
    if (selected instanceof Light3D) {
      selected.lightKind = $("light-kind").value;
      selected.color = $("light-color").value;
      selected.intensity = number("light-intensity", 1);
    }
    if (selected instanceof Camera3D) selected.fov = number("camera-fov", 50);
    renderer.updateNodeTransform(selected);
    renderHierarchy();
    setDirty(true);
  }
  function beginInspectorEdit() {
    if (selected && !inspectorStartSnapshot) inspectorStartSnapshot = sceneSnapshot();
  }
  function commitInspectorEdit() {
    if (!selected || !inspectorStartSnapshot) return;
    const before = inspectorStartSnapshot;
    inspectorStartSnapshot = null;
    if (JSON.stringify(before) !== JSON.stringify(sceneSnapshot())) {
      pushHistory(before, `Edit ${selected.name}`);
      status.textContent = `Changed: ${selected.name}`;
    }
  }
  function beginGizmoTransform(id) {
    const node = scene.findById(id);
    if (!node || gizmoStartSnapshot) return;
    gizmoStartSnapshot = sceneSnapshot();
  }
  function applyGizmoTransform(id, transform) {
    const node = scene.findById(id);
    if (!node) return;
    node.position = { ...transform.position };
    if (node instanceof Node2_5D) {
      node.rotation = transform.rotation;
      node.scale = { x: transform.scale.x, y: transform.scale.y };
    } else {
      node.rotation = { ...transform.rotation };
      node.scale = { ...transform.scale };
    }
    if (selected?.id === id) populateInspector();
    setDirty(true);
  }
  function commitGizmoTransform(id, transform) {
    applyGizmoTransform(id, transform);
    const node = scene.findById(id);
    const before = gizmoStartSnapshot;
    gizmoStartSnapshot = null;
    if (node && before && JSON.stringify(before) !== JSON.stringify(sceneSnapshot())) {
      pushHistory(before, `${transformModeLabel(transformMode)} ${node.name}`);
      status.textContent = `${transformModeLabel(transformMode)}: ${node.name}`;
    }
  }
  function transformModeLabel(mode) {
    return { translate: "Move", rotate: "Rotate", scale: "Scale", select: "Select" }[mode] ?? mode;
  }
  function setTransformMode(mode) {
    transformMode = mode;
    renderer.setTransformMode(mode);
    applyTransformSpace();
    for (const [id, value] of [["tool-select", "select"], ["tool-move", "translate"], ["tool-rotate", "rotate"], ["tool-scale", "scale"]]) {
      $(id).classList.toggle("active", value === mode);
    }
    status.textContent = `Tool: ${transformModeLabel(mode)}`;
  }
  function renderSmartSystems() {
    const systems = [{ name: "Scene Capsules", status: "foundation", description: "Authored scene packages, anchors and reusable world sections." }, { name: "Parlyn Ways", status: "foundation", description: "Deterministic connections between Scene Capsules." }, { name: "World Memory", status: "foundation", description: "Persistent facts that survive scene reconstruction." }, { name: "Encounter Layers", status: "foundation", description: "Seeded encounter definitions attached to world routes." }, { name: "Adaptive Simulation", status: "planned", description: "Tiered simulation cost based on distance and relevance." }, { name: "Parlyn Horizon", status: "planned", description: "Stable transitions between detailed and distant 2.5D space." }, { name: "Parlyn Voice", status: "planned", description: "Provider-independent voice and localization workflow." }];
    const systemGrid = $("smart-system-grid");
    systemGrid.replaceChildren();
    for (const system of systems) {
      const card = document.createElement("article");
      card.className = `smart-system-card ${system.status}`;
      card.innerHTML = `<div><strong>${escapeHtml(system.name)}</strong><span class="smart-status ${system.status}">${system.status === "foundation" ? "Foundation" : "Planned"}</span></div><p>${escapeHtml(system.description)}</p>`;
      systemGrid.appendChild(card);
    }
    const list = $("smart-data-list");
    list.replaceChildren();
    const groups = [["Scene Capsules", currentWorld?.capsules ?? [], "Capsule"], ["Parlyn Ways", currentWorld?.ways ?? [], "Way"], ["Landmarks", currentWorld?.landmarks ?? [], "Landmark"], ["Encounter Layers", currentWorld?.encounters ?? [], "Encounter"]];
    $("smart-world-name").textContent = currentWorld?.name ?? "No world loaded";
    $("smart-world-seed").textContent = currentWorld ? `Seed: ${currentWorld.seed}` : "Open or create a project to load its world document.";
    for (const [name, items, label] of groups) {
      const section = document.createElement("section");
      section.className = "smart-group";
      section.innerHTML = `<div class="smart-group-head"><strong>${escapeHtml(name)}</strong><span>${items.length}</span></div>`;
      if (!items.length) {
        const empty = document.createElement("small");
        empty.textContent = `No ${label.toLowerCase()} data yet.`;
        section.appendChild(empty);
      } else for (const item of items) {
        const row = document.createElement("div");
        row.className = "smart-row";
        row.innerHTML = `<span>${escapeHtml(item.name ?? item.id)}</span><code>${escapeHtml(item.id)}</code>`;
        section.appendChild(row);
      }
      list.appendChild(section);
    }
    $("save-world").disabled = !currentWorld;
  }
  async function saveWorld() {
    if (!currentProject || !currentWorld) return;
    try {
      const result = await host.saveProjectWorld({ relativePath: currentProject.world, world: currentWorld.toJSON() });
      if (!result.ok) throw new Error("World could not be saved.");
      status.textContent = `Saved world: ${currentProject.world}`;
    } catch (error) {
      showError("World save failed", error);
    }
  }
  function renderModules() {
    const list = $("module-list");
    list.replaceChildren();
    for (const module of modules.list()) {
      const row = document.createElement("div");
      row.className = "module-row";
      const info = document.createElement("div");
      info.className = "module-info";
      info.innerHTML = `<div><strong>${escapeHtml(module.name)}</strong>${module.official ? '<span class="official-chip">Official</span>' : ""}</div><small>${escapeHtml(module.description)}</small><code>${escapeHtml(module.id)} \xB7 v${escapeHtml(module.version)}</code>`;
      const toggle = document.createElement("label");
      toggle.className = "module-toggle";
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = module.enabled;
      const label = document.createElement("span");
      label.textContent = module.enabled ? "Enabled" : "Disabled";
      checkbox.addEventListener("change", async () => {
        checkbox.disabled = true;
        try {
          await modules.setEnabled(module.id, checkbox.checked);
          label.textContent = checkbox.checked ? "Enabled" : "Disabled";
        } catch (error) {
          checkbox.checked = !checkbox.checked;
          showError("Module update failed", error);
        } finally {
          checkbox.disabled = false;
        }
      });
      toggle.append(checkbox, label);
      row.append(info, toggle);
      list.appendChild(row);
    }
  }
  function addNode(kind) {
    const before = sceneSnapshot();
    let node;
    if (kind === "sprite" || kind === "billboard") {
      node = new Node2_5D({ name: kind === "billboard" ? "New 2.5D Billboard" : "New 2.5D Sprite", type: kind === "billboard" ? "Billboard2_5D" : "Sprite2_5D", depthLayer: "gameplay" });
      node.metadata = { width: 2.2, height: 1.6, color: kind === "billboard" ? 7911679 : 5213916, opacity: 0.95 };
    } else if (kind === "mesh") node = new Node3D({ name: "New 3D Mesh", type: "Mesh3D" });
    else if (kind === "light") node = new Light3D({ name: "New Light", position: { x: 3, y: 5, z: 3 }, intensity: 2 });
    else if (kind === "camera") node = new Camera3D({ name: "New Camera", position: { x: 0, y: 2, z: 8 }, fov: 50 });
    scene.root.addChild(node);
    renderer.addNode(node);
    pushHistory(before, `Add ${node.name}`);
    renderHierarchy();
    selectById(node.id);
    status.textContent = `Added: ${node.name}`;
  }
  function deleteSelected() {
    if (!selectedIds.size) return;
    const before = sceneSnapshot();
    const targets = [...selectedIds].map((id) => scene.findById(id)).filter(Boolean);
    const targetIds = new Set(targets.map((node) => node.id));
    const roots = targets.filter((node) => !node.parent || !targetIds.has(node.parent.id));
    if (!roots.length) return;
    for (const node of roots) scene.removeById(node.id);
    renderer.rebuild(scene);
    pushHistory(before, roots.length === 1 ? `Delete ${roots[0].name}` : `Delete ${roots.length} nodes`);
    clearSelection();
    status.textContent = roots.length === 1 ? `Deleted: ${roots[0].name}` : `Deleted: ${roots.length} nodes`;
  }
  function duplicateSelected() {
    if (!selected || selectedIds.size !== 1) return;
    const before = sceneSnapshot();
    const originalName = selected.name;
    const duplicate = scene.duplicateById(selected.id);
    if (!duplicate) return;
    renderer.rebuild(scene);
    pushHistory(before, `Duplicate ${originalName}`);
    renderHierarchy();
    selectById(duplicate.id);
    status.textContent = `Duplicated: ${duplicate.name}`;
  }
  function placeSelectionOnGround() {
    const nodes = [...selectedIds].map((id) => scene.findById(id)).filter(Boolean);
    if (!nodes.length) {
      status.textContent = "Select at least one node to place on the ground.";
      return;
    }
    const before = sceneSnapshot();
    let placed = 0;
    for (const node of nodes) {
      const position = renderer.getGroundedPosition(node.id);
      if (!position) continue;
      node.position = position;
      renderer.updateNodeTransform(node);
      placed += 1;
    }
    if (!placed || JSON.stringify(before) === JSON.stringify(sceneSnapshot())) {
      status.textContent = placed ? "Selection is already on the ground." : "The selection cannot be placed on the ground.";
      return;
    }
    pushHistory(before, placed === 1 ? `Ground ${nodes[0].name}` : `Ground ${placed} nodes`);
    if (selectedIds.size === 1) populateInspector();
    setDirty(true);
    status.textContent = placed === 1 ? `Placed on ground: ${nodes[0].name}` : `Placed ${placed} nodes on ground`;
  }
  function frameSelected() {
    if (!selectedIds.size) {
      status.textContent = "Select at least one node to frame.";
      return;
    }
    const framed = renderer.frameSelection([...selectedIds]);
    status.textContent = framed
      ? selectedIds.size === 1 ? `Framed: ${selected.name}` : `Framed ${selectedIds.size} selected nodes`
      : "The current selection cannot be framed.";
  }
  function nodePath(node) {
    const names = [];
    for (let current = node; current && current !== scene.root; current = current.parent) names.unshift(current.name);
    return names.join(" › ");
  }
  function showReparentDialog() {
    if (!selected || selectedIds.size !== 1) return;
    const excluded = new Set();
    selected.walk((node) => excluded.add(node.id));
    const select = $("reparent-target");
    select.replaceChildren();
    const rootOption = document.createElement("option");
    rootOption.value = scene.root.id;
    rootOption.textContent = "Scene Root";
    select.appendChild(rootOption);
    scene.root.walk((node) => {
      if (node === scene.root || excluded.has(node.id)) return;
      const option = document.createElement("option");
      option.value = node.id;
      option.textContent = nodePath(node);
      select.appendChild(option);
    });
    select.value = selected.parent?.id ?? scene.root.id;
    $("reparent-node-name").textContent = selected.name;
    $("reparent-dialog").showModal();
  }
  function reparentSelected() {
    if (!selected || selectedIds.size !== 1) return;
    const before = sceneSnapshot();
    const target = scene.findById($("reparent-target").value);
    try {
      if (!scene.reparentById(selected.id, target?.id)) {
        $("reparent-dialog").close();
        status.textContent = `${selected.name} already uses that parent.`;
        return;
      }
      pushHistory(before, `Reparent ${selected.name}`);
      renderHierarchy();
      $("reparent-dialog").close();
      status.textContent = `Moved ${selected.name} under ${target === scene.root ? "Scene Root" : target.name}`;
    } catch (error) {
      showError("Node reparent failed", error);
    }
  }
  async function newScene() {
    if (!await mayReplaceScene()) return;
    try {
      await leaveProjectForLooseScene();
      scene = new SceneDocument("Untitled Scene");
      currentFilePath = null;
      history.clear();
      renderer.rebuild(scene);
      clearSelection();
      updateHistoryButtons();
      setDirty(true);
      status.textContent = "New untitled scene";
    } catch (error) {
      showError("New scene failed", error);
    }
  }
  async function saveScene() {
    try {
      if (currentProject && host?.saveProjectScene) {
        const result2 = await host.saveProjectScene({ relativePath: currentSceneRelativePath || currentProject.startupScene, scene: scene.toJSON(), history:history.exportState({ maxBytes:16 * 1024 * 1024 }) });
        if (!result2.ok) throw new Error("Project scene could not be saved.");
        currentFilePath = result2.filePath;
        if (result2.historyWarning) {
          setDirty(true);
          showError("Local history save failed", result2.historyWarning);
          return false;
        }
        setDirty(false);
        status.textContent = `Saved project scene: ${currentSceneRelativePath || currentProject.startupScene}`;
        return true;
      }
      const result = await host.saveSceneAs({ name: scene.name, scene: scene.toJSON() });
      if (result.canceled) {
        status.textContent = "Save canceled.";
        return false;
      }
      currentFilePath = result.filePath;
      setDirty(false);
      status.textContent = `Saved: ${shortPath(currentFilePath)}`;
      return true;
    } catch (error) {
      showError("Scene save failed", error);
      return false;
    }
  }
  async function openScene() {
    if (!await mayReplaceScene()) return;
    try {
      const result = await host.openScene();
      if (result.canceled) return;
      await leaveProjectForLooseScene();
      scene = SceneDocument.fromJSON(result.scene);
      currentFilePath = result.filePath;
      currentSceneRelativePath = null;
      history.clear();
      renderer.rebuild(scene);
      clearSelection();
      updateHistoryButtons();
      setDirty(false);
      status.textContent = `Opened: ${shortPath(currentFilePath)}`;
    } catch (error) {
      showError("Scene open failed", error);
    }
  }
  async function createProject() {
    const name = $("project-input").value.trim() || "My Parlyn Project";
    $("project-dialog").close();
    if (!await mayReplaceScene()) {
      $("project-dialog").showModal();
      return;
    }
    try {
      const projectDoc = new ProjectDocument({ name });
      const result = await host.createProject({ name: projectDoc.name, scene: scene.toJSON() });
      if (result.canceled) return;
      currentProject = ProjectDocument.fromJSON(result.project);
      currentWorld = result.world ? WorldDocument.fromJSON(result.world) : null;
      currentProjectRoot = result.projectRoot;
      currentSceneRelativePath = currentProject.startupScene;
      currentFilePath = null;
      assets = result.assets ?? [];
      selectedAssetPath = null;
      projectScenes = result.scenes ?? [];
      history.clear();
      updateHistoryButtons();
      updateProjectUI();
      renderAssets();
      renderProjectScenes();
      setDirty(false);
      status.textContent = `Project created: ${currentProject.name}`;
    } catch (error) {
      showError("Project creation failed", error);
    }
  }
  async function openProject() {
    if (!await mayReplaceScene()) return;
    try {
      const result = await host.openProject();
      if (result.canceled) return;
      currentProject = ProjectDocument.fromJSON(result.project);
      currentWorld = result.world ? WorldDocument.fromJSON(result.world) : null;
      currentProjectRoot = result.projectRoot;
      currentSceneRelativePath = currentProject.startupScene;
      currentFilePath = null;
      assets = result.assets ?? [];
      selectedAssetPath = null;
      projectScenes = result.scenes ?? [];
      if (result.scene) {
        scene = SceneDocument.fromJSON(result.scene);
        renderer.rebuild(scene);
      }
      if (result.history) {
        try { history.restoreState(result.history); }
        catch (error) { console.warn("Saved scene history was ignored:", error); history.clear(); }
      } else history.clear();
      clearSelection();
      updateHistoryButtons();
      updateProjectUI();
      renderAssets();
      renderProjectScenes();
      setDirty(false);
      status.textContent = result.historyWarning
        ? `Project opened without local history: ${result.historyWarning}`
        : `Project opened: ${currentProject.name}`;
    } catch (error) {
      showError("Project open failed", error);
    }
  }
  async function closeProject() {
    if (!currentProject || !await mayReplaceScene()) return;
    const projectName = currentProject.name;
    try {
      const result = await host.closeProject();
      if (!result.ok) throw new Error("No active project could be closed.");
      resetProjectWorkspace();
      status.textContent = `Project closed: ${projectName}`;
    } catch (error) {
      showError("Project close failed", error);
    }
  }
  function showDeleteProjectDialog() {
    if (!currentProject) return;
    $("delete-project-name").textContent = currentProject.name;
    $("delete-project-path").textContent = currentProjectRoot;
    $("delete-unsaved-warning").hidden = !dirty;
    $("delete-project-confirmation").value = "";
    $("confirm-delete-project").disabled = true;
    $("delete-project-dialog").showModal();
    $("delete-project-confirmation").focus();
  }
  async function deleteProject() {
    if (!currentProject) return;
    const confirmationName = $("delete-project-confirmation").value;
    const projectName = currentProject.name;
    $("confirm-delete-project").disabled = true;
    try {
      const result = await host.deleteProject({ confirmationName });
      if (!result.ok) throw new Error("No active project could be moved to the Recycle Bin.");
      $("delete-project-dialog").close();
      resetProjectWorkspace();
      status.textContent = `Moved to Recycle Bin: ${projectName}`;
    } catch (error) {
      showError("Project deletion failed", error);
      $("confirm-delete-project").disabled = confirmationName !== currentProject?.name;
    }
  }
  function updateProjectUI() {
    $("project-name").textContent = currentProject?.name ?? "Loose Scene";
    $("project-name").title = currentProjectRoot ?? "";
    $("close-project").disabled = !currentProject;
    $("delete-project").disabled = !currentProject;
    $("create-scene").disabled = !currentProject;
    $("move-scene").disabled = !currentProject || !currentSceneRelativePath;
  }
  function assetIcon(ext) {
    if ([".png", ".jpg", ".jpeg", ".webp", ".svg"].includes(ext)) return "\u25A7";
    if ([".glb", ".gltf", ".obj"].includes(ext)) return "\u25C7";
    if ([".wav", ".ogg", ".mp3"].includes(ext)) return "\u266A";
    return "\u25A1";
  }
  function renderAssets() {
    const grid = $("asset-grid");
    grid.replaceChildren();
    $("asset-count").textContent = currentProject ? `${assets.length} imported` : "No project";
    if (!assets.some((asset) => asset.relativePath === selectedAssetPath)) selectedAssetPath = null;
    $("move-asset").disabled = !currentProject || !selectedAssetPath;
    if (!currentProject) {
      grid.innerHTML = '<div class="asset-empty">Create or open a project to import assets.</div>';
      return;
    }
    if (!assets.length) {
      grid.innerHTML = '<div class="asset-empty">No assets yet. Use \u201CImport Assets\u201D to add files to this project.</div>';
      return;
    }
    for (const asset of assets) {
      const card = document.createElement("button");
      card.className = "asset-card" + (asset.relativePath === selectedAssetPath ? " active" : "");
      card.title = asset.relativePath;
      card.innerHTML = `<span>${assetIcon(asset.extension)}</span><strong>${escapeHtml(asset.name)}</strong><small>${escapeHtml(asset.relativePath)}</small>`;
      card.addEventListener("click", () => {
        selectedAssetPath = asset.relativePath;
        renderAssets();
        status.textContent = `Selected asset: ${asset.relativePath}`;
      });
      grid.appendChild(card);
    }
  }
  function renderProjectScenes() {
    const list = $("project-scenes");
    list.replaceChildren();
    $("scene-count").textContent = currentProject ? `${projectScenes.length} available` : "No project";
    if (!currentProject || !projectScenes.length) {
      const empty = document.createElement("div");
      empty.className = "scene-list-empty";
      empty.textContent = currentProject ? "No project scenes found." : "Open or create a project.";
      list.appendChild(empty);
      return;
    }
    for (const entry of projectScenes) {
      const button = document.createElement("button");
      button.className = "scene-entry" + (entry.relativePath === currentSceneRelativePath ? " active" : "");
      button.innerHTML = `<span>◇</span><div><strong>${escapeHtml(entry.name)}</strong><small>${escapeHtml(entry.relativePath)}</small></div>`;
      button.addEventListener("click", () => openProjectScene(entry.relativePath));
      list.appendChild(button);
    }
  }
  async function openProjectScene(relativePath) {
    if (!currentProject || relativePath === currentSceneRelativePath || !await mayReplaceScene()) return;
    try {
      const result = await host.openProjectScene({ relativePath });
      scene = SceneDocument.fromJSON(result.scene);
      currentSceneRelativePath = result.relativePath;
      currentFilePath = null;
      if (result.history) {
        try { history.restoreState(result.history); }
        catch (error) { console.warn("Saved scene history was ignored:", error); history.clear(); }
      } else history.clear();
      renderer.rebuild(scene);
      clearSelection();
      updateHistoryButtons();
      renderProjectScenes();
      setDirty(false);
      status.textContent = result.historyWarning ? `Scene opened without local history: ${result.historyWarning}` : `Opened project scene: ${relativePath}`;
    } catch (error) {
      showError("Project scene open failed", error);
    }
  }
  async function createProjectScene() {
    if (!currentProject || !await mayReplaceScene()) return;
    const name = $("create-scene-name").value.trim() || "New Scene";
    const relativePath = $("create-scene-path").value.trim();
    try {
      const newScene = new SceneDocument(name);
      const result = await host.createProjectScene({ relativePath, scene:newScene.toJSON() });
      projectScenes = result.scenes ?? projectScenes;
      scene = newScene;
      currentSceneRelativePath = result.relativePath;
      currentFilePath = null;
      history.clear();
      renderer.rebuild(scene);
      clearSelection();
      updateHistoryButtons();
      updateProjectUI();
      renderProjectScenes();
      setDirty(false);
      $("create-scene-dialog").close();
      status.textContent = `Scene created: ${result.relativePath}`;
    } catch (error) {
      showError("Project scene creation failed", error);
    }
  }
  async function moveProjectScene() {
    if (!currentProject || !currentSceneRelativePath || !await mayReplaceScene()) return;
    const sourcePath = currentSceneRelativePath;
    try {
      const result = await host.moveProjectScene({ sourcePath, targetPath:$("move-scene-path").value.trim(), name:$("move-scene-name").value.trim() });
      currentProject = ProjectDocument.fromJSON(result.project);
      scene = SceneDocument.fromJSON(result.scene);
      currentSceneRelativePath = result.relativePath;
      projectScenes = result.scenes ?? [];
      history.clear();
      renderer.rebuild(scene);
      clearSelection();
      updateHistoryButtons();
      updateProjectUI();
      renderProjectScenes();
      setDirty(false);
      $("move-scene-dialog").close();
      status.textContent = `Scene moved: ${result.relativePath}`;
    } catch (error) {
      showError("Project scene move failed", error);
    }
  }
  async function importAssets() {
    if (!currentProject) {
      status.textContent = "Create or open a Parlyn project before importing assets.";
      return;
    }
    try {
      const result = await host.importAssets();
      if (result.canceled) return;
      assets = result.assets ?? [];
      renderAssets();
      status.textContent = `Assets ready: ${assets.length}`;
    } catch (error) {
      showError("Asset import failed", error);
    }
  }
  async function moveProjectAsset() {
    if (!currentProject || !selectedAssetPath) return;
    const sourcePath = selectedAssetPath;
    try {
      const result = await host.moveProjectAsset({ sourcePath, targetPath:$("move-asset-path").value.trim() });
      assets = result.assets ?? [];
      selectedAssetPath = result.relativePath;
      renderAssets();
      $("move-asset-dialog").close();
      status.textContent = `Asset moved: ${result.relativePath}`;
    } catch (error) {
      showError("Asset move failed", error);
    }
  }
  function shortPath(filePath) {
    return filePath ? filePath.split(/[\\/]/).slice(-2).join("/") : "";
  }
  function undo() {
    const entry = history.undo(sceneSnapshot());
    if (!entry) return;
    restoreSnapshot(entry.snapshot, selected?.id ?? null);
    status.textContent = `Undo: ${entry.label}`;
  }
  function redo() {
    const entry = history.redo(sceneSnapshot());
    if (!entry) return;
    restoreSnapshot(entry.snapshot, selected?.id ?? null);
    status.textContent = `Redo: ${entry.label}`;
  }
  document.querySelectorAll("#inspector input, #inspector select").forEach((el) => {
    el.addEventListener("focus", beginInspectorEdit);
    el.addEventListener("input", applyInspector);
    el.addEventListener("change", commitInspectorEdit);
    el.addEventListener("blur", commitInspectorEdit);
  });
  $("tool-select").addEventListener("click", () => setTransformMode("select"));
  $("tool-move").addEventListener("click", () => setTransformMode("translate"));
  $("tool-rotate").addEventListener("click", () => setTransformMode("rotate"));
  $("tool-scale").addEventListener("click", () => setTransformMode("scale"));
  $("snap-toggle").addEventListener("click", toggleTransformSnapping);
  $("transform-space").addEventListener("click", toggleTransformSpace);
  $("place-on-ground").addEventListener("click", placeSelectionOnGround);
  $("frame-selected").addEventListener("click", frameSelected);
  $("snap-settings").addEventListener("click", openTransformSnapSettings);
  $("cancel-snap-settings").addEventListener("click", () => $("snap-settings-dialog").close());
  $("save-snap-settings").addEventListener("click", saveTransformSnapSettings);
  $("reset-snap-settings").addEventListener("click", resetTransformSnapSettings);
  $("modules").addEventListener("click", () => {
    renderModules();
    $("module-dialog").showModal();
  });
  $("smart-systems").addEventListener("click", () => {
    renderSmartSystems();
    $("smart-dialog").showModal();
  });
  $("close-smart").addEventListener("click", () => $("smart-dialog").close());
  $("save-world").addEventListener("click", saveWorld);
  $("close-modules").addEventListener("click", () => $("module-dialog").close());
  $("close-error").addEventListener("click", () => $("error-dialog").close());
  $("copy-error").addEventListener("click", async () => {
    if (!currentErrorReport) return;
    try {
      await host.copyText(currentErrorReport.technicalDetails);
      $("copy-error").textContent = "Copied";
      status.textContent = "Technical error details copied to the clipboard.";
    } catch (error) {
      console.error("Copy error details failed", error);
      $("copy-error").textContent = "Copy Failed";
      status.textContent = "Could not copy technical error details.";
    }
  });
  $("close-project").addEventListener("click", closeProject);
  $("delete-project").addEventListener("click", showDeleteProjectDialog);
  $("cancel-delete-project").addEventListener("click", () => $("delete-project-dialog").close());
  $("confirm-delete-project").addEventListener("click", deleteProject);
  $("delete-project-confirmation").addEventListener("input", () => {
    $("confirm-delete-project").disabled = $("delete-project-confirmation").value !== currentProject?.name;
  });
  $("cancel-unsaved").addEventListener("click", () => resolveUnsavedDecision("cancel"));
  $("discard-unsaved").addEventListener("click", () => resolveUnsavedDecision("discard"));
  $("save-unsaved").addEventListener("click", () => resolveUnsavedDecision("save"));
  $("unsaved-dialog").addEventListener("cancel", (event) => { event.preventDefault(); resolveUnsavedDecision("cancel"); });
  host.onAppCloseRequested(handleAppCloseRequest);
  moduleEvents.addEventListener("module-changed", renderModules);
  $("view-25").addEventListener("click", () => {
    renderer.setView("2.5d");
    $("view-25").classList.add("active");
    $("view-3d").classList.remove("active");
    status.textContent = "2.5D editor view";
  });
  $("view-3d").addEventListener("click", () => {
    renderer.setView("3d");
    $("view-3d").classList.add("active");
    $("view-25").classList.remove("active");
    status.textContent = "3D editor view";
  });
  $("play").addEventListener("click", () => status.textContent = "Runtime separation is the next major engine milestone.");
  $("save-scene").addEventListener("click", saveScene);
  $("open-scene").addEventListener("click", openScene);
  $("new-scene").addEventListener("click", newScene);
  $("new-project").addEventListener("click", () => $("project-dialog").showModal());
  $("open-project").addEventListener("click", openProject);
  $("create-scene").addEventListener("click", () => $("create-scene-dialog").showModal());
  $("cancel-create-scene").addEventListener("click", () => $("create-scene-dialog").close());
  $("confirm-create-scene").addEventListener("click", createProjectScene);
  $("move-scene").addEventListener("click", () => {
    const entry = projectScenes.find((item) => item.relativePath === currentSceneRelativePath);
    $("move-scene-name").value = entry?.name ?? scene.name;
    $("move-scene-path").value = currentSceneRelativePath ?? "";
    $("move-scene-dialog").showModal();
  });
  $("cancel-move-scene").addEventListener("click", () => $("move-scene-dialog").close());
  $("confirm-move-scene").addEventListener("click", moveProjectScene);
  $("confirm-project").addEventListener("click", createProject);
  $("cancel-project").addEventListener("click", () => $("project-dialog").close());
  $("add-node").addEventListener("click", () => $("add-dialog").showModal());
  for (const [id, kind] of [["add-sprite", "sprite"], ["add-billboard", "billboard"], ["add-mesh", "mesh"], ["add-light", "light"], ["add-camera", "camera"]]) $(id).addEventListener("click", () => {
    $("add-dialog").close();
    addNode(kind);
  });
  $("cancel-add").addEventListener("click", () => $("add-dialog").close());
  $("delete-node").addEventListener("click", deleteSelected);
  $("duplicate-node").addEventListener("click", duplicateSelected);
  $("reparent-node").addEventListener("click", showReparentDialog);
  $("cancel-reparent").addEventListener("click", () => $("reparent-dialog").close());
  $("confirm-reparent").addEventListener("click", reparentSelected);
  $("undo").addEventListener("click", undo);
  $("redo").addEventListener("click", redo);
  $("import-asset").addEventListener("click", importAssets);
  $("move-asset").addEventListener("click", () => {
    if (!selectedAssetPath) return;
    $("move-asset-path").value = selectedAssetPath;
    $("move-asset-dialog").showModal();
  });
  $("cancel-move-asset").addEventListener("click", () => $("move-asset-dialog").close());
  $("confirm-move-asset").addEventListener("click", moveProjectAsset);
  window.addEventListener("keydown", (event) => {
    const tag = document.activeElement?.tagName?.toLowerCase();
    const editing = tag === "input" || tag === "select" || tag === "textarea";
    const key = event.key.toLowerCase();
    if (!editing && !(event.ctrlKey || event.metaKey)) {
      if (key === "escape" || key === "q") {
        event.preventDefault();
        setTransformMode("select");
        return;
      }
      if (key === "w") {
        event.preventDefault();
        setTransformMode("translate");
        return;
      }
      if (key === "e") {
        event.preventDefault();
        setTransformMode("rotate");
        return;
      }
      if (key === "r") {
        event.preventDefault();
        setTransformMode("scale");
        return;
      }
      if (key === "end") {
        event.preventDefault();
        placeSelectionOnGround();
        return;
      }
      if (key === "f") {
        event.preventDefault();
        frameSelected();
        return;
      }
    }
    if (!(event.ctrlKey || event.metaKey)) return;
    if (key === "d" && !editing) {
      event.preventDefault();
      duplicateSelected();
    }
    if (key === "s") {
      event.preventDefault();
      saveScene();
    }
    if (key === "o" && event.shiftKey) {
      event.preventDefault();
      openProject();
    } else if (key === "o") {
      event.preventDefault();
      openScene();
    }
    if (key === "z" && !event.shiftKey) {
      event.preventDefault();
      undo();
    }
    if (key === "y" || key === "z" && event.shiftKey) {
      event.preventDefault();
      redo();
    }
  });
  const resizeObserver = new ResizeObserver(() => renderer.resize());
  resizeObserver.observe($("viewport"));
  function frame() {
    renderer.render();
    requestAnimationFrame(frame);
  }
  frame();
  renderHierarchy();
  renderAssets();
  renderProjectScenes();
  updateProjectUI();
  selectById(scene.root.children[1].id);
  updateHistoryButtons();
  setDirty(false);
  let appVersion = "unknown";
  try {
    const appInfo = await host.getAppInfo();
    if (appInfo?.version) appVersion = appInfo.version;
  } catch (error) {
    console.warn("Could not read Parlyn application information:", error);
  }
  $("brand-version").textContent = `${appVersion} GitHub Preview`;
  $("footer-version").textContent = `v${appVersion}`;
  status.textContent = `Ready \xB7 Parlyn ${appVersion} \xB7 THREE renderer backend`;
  await host.editorReady();
}
bootstrap().catch((error) => {
  console.error("Parlyn failed to initialize:", error);
  const status = document.getElementById("status");
  if (status) status.textContent = "Initialization failed \u2014 see console.";
});
