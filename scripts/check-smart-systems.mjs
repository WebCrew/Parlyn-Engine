import fs from 'node:fs/promises';
import { WorldDocument } from '../src/engine/world/WorldDocument.mjs';
import { resolveEncounter } from '../src/engine/world/DeterministicEncounter.mjs';

const sampleUrl = new URL('../samples/Parlyn-Test-Project/worlds/Main.parlyn-world.json', import.meta.url);
const source = JSON.parse(await fs.readFile(sampleUrl, 'utf8'));
const world = WorldDocument.fromJSON(source);

if (world.capsules.length !== 2) throw new Error('Smart Systems proof requires two Scene Capsules.');
if (world.ways.length !== 1) throw new Error('Smart Systems proof requires one Parlyn Way.');
if (world.landmarks.length !== 1) throw new Error('Smart Systems proof requires one stable landmark.');
if (world.encounters.length !== 1) throw new Error('Smart Systems proof requires one encounter.');

const first = resolveEncounter(world.encounters[0], world.seed);
const second = resolveEncounter(world.encounters[0], world.seed);
if (first !== second) throw new Error('Encounter resolution is not deterministic.');

world.remember('landmark.split-oak', { discovered:true });
const restored = WorldDocument.fromJSON(world.toJSON());
if (!restored.recall('landmark.split-oak').discovered) throw new Error('World Memory did not survive serialization.');

console.log(`Smart Systems data check passed (encounter: ${first}).`);
