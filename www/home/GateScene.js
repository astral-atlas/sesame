// @flow strict
/*:: import type { Component } from '@lukekaalim/act'; */
import { h, useState, useEffect, useRef, useMemo } from '@lukekaalim/act';
import { render, C } from '@lukekaalim/act-three';
import { useCurve, useCurves } from '@lukekaalim/act-curve';

import { TextureLoader, MeshBasicMaterial, Color, Vector3 } from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { useAsync } from "../src/hooks/async";

const loader = new GLTFLoader();
const texLoader = new TextureLoader();

export const GateScene/*: Component<{ open: boolean }>*/ = ({ open }) => {
  const [override, setOverride] = useState(true);
  const [data] = useAsync(async () => {
    const { scene } = await new Promise(r => loader.load('./3d/sesame_gate.glb', r));
    const portalText = await new Promise(r => texLoader.load('./3d/gate_portal_text.png', r, () => {}, () => {}))

    const meshes = Object.fromEntries(scene
      .children
      .filter(o => o.type === "Mesh")
      .map(mesh => [mesh.name, mesh]));

    const wallMaterial = new MeshBasicMaterial({ map: meshes['Wall'].material.map });
    const gateMaterial = new MeshBasicMaterial({ map: meshes['GateR'].material.map });
    const portalMaterial = new MeshBasicMaterial({ map: portalText, transparent: true, color: 'white' });

    meshes['Wall'].material = wallMaterial;
    meshes['GateR'].material = gateMaterial;
    meshes['GateL'].material = gateMaterial;
    meshes['ConeA'].material = portalMaterial;
    meshes['ConeB'].material = portalMaterial;
    
    return { scene, meshes };
  }, []);
  const [windowSize, setWindowSize] = useState({ x: window.innerWidth, y: window.innerHeight });
  useEffect(() => {
    window.addEventListener('resize', () => {
      setWindowSize({ x: window.innerWidth, y: window.innerHeight });
    });
  }, []);

  useCurve((open && override) ? 1.4 : 0, v => {
    if (!data)
      return;
    data.meshes['GateL'].rotation.z = -v;
    data.meshes['GateR'].rotation.z = v;
  })


  if (!data)
    return null;

  const timeRef = useRef(performance.now());
  const speed = 0.005;
  const onRender = (timestamp) => {
    const delta = timestamp - timeRef.current;
    timeRef.current = timestamp;

    data.meshes['ConeA'].rotation.y += delta * speed;
    data.meshes['ConeB'].rotation.y -= delta * speed;
  };
  const onClick = () => {
    setOverride(v => !v);
  };

  return [
    h('span', { onClick }, [
      (open && override) && h('audio', { src: './audio/walking.flac', autoplay: true }),
      h(C.three, {
        width: windowSize.x, height: windowSize.y/2,
        setStyle: true,
        background: new Color('white'),
        onRender
      }, [
        h(C.group, { group: data.scene, position: new Vector3(0, -0.5, 3) })
      ])
    ]),
  ];
};