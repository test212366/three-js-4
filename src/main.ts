import * as THREE from 'three'
import { renderer, scene } from './core/renderer'
import { fpsGraph, gui } from './core/gui'
import camera from './core/camera'
import { controls } from './core/orbit-control'

import './style.css'

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight('#ffffff', 1)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.normalBias = 0.05
directionalLight.position.set(0.25, 2, 2.25)

scene.add(directionalLight)

const shadersProps = {
	color: '#fff'
}


//modelPosition.y += sin(modelPosition.x * uFrequency - uTime) * uAmplitude;
const shaderMaterial = new THREE.RawShaderMaterial({
	vertexShader: `
	
	uniform mat4 projectionMatrix;
	uniform mat4 viewMatrix;
	uniform mat4 modelMatrix;
	uniform vec2 uFrequency;
	uniform vec2 uAmplitude;
	uniform float uTime;

	attribute vec3 position;
	attribute vec2 uv;

	varying vec2 vUv;

	void main() {
		vec4 modelPosition = modelMatrix * vec4(position, 1.0);
		modelPosition.y += sin(modelPosition.x * uFrequency.x + uTime) * uAmplitude.x;
		modelPosition.x += cos(modelPosition.y * uFrequency.y + uTime) * uAmplitude.y;
		vec4 viewPosition = viewMatrix * modelPosition;
		viewPosition.y += 0.2;
 
		gl_Position = projectionMatrix * viewPosition;

		vUv = uv;
	}
	
	`,
	fragmentShader: `
	precision mediump float;

	uniform vec3 uColor;
	varying vec2 vUv;

	void main() {
		gl_FragColor = vec4(vUv, 0.5, 1.0);
	}
	`,
	wireframe:true,
	side: THREE.DoubleSide,
	uniforms: {
		uFrequency: {value: new THREE.Vector2(20, 5)},
		uAmplitude: {value: new THREE.Vector2(0.1, 0.1)},
		uTime: {value: 0.0},
		uColor: {value: new THREE.Color(shadersProps.color)}
	}
})



const sphereMaterial = new THREE.MeshToonMaterial({ color: 'teal' })

const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(1, 32, 32),
  shaderMaterial,
)

sphere.position.set(0, 2, 0)
sphere.castShadow = true
scene.add(sphere)

const DirectionalLightFolder = gui.addFolder({
  title: 'Directional Light',
})

Object.keys(directionalLight.position).forEach(key => {
  DirectionalLightFolder.addInput(
    directionalLight.position,
    key as keyof THREE.Vector3,
    {
      min: -100,
      max: 100,
      step: 1,
    },
  )
})


const planeGeometry = new THREE.PlaneGeometry(10, 10, 20, 20)

const plane = new THREE.Mesh(
	planeGeometry,
//   new THREE.MeshToonMaterial({ color: '#444' }),
//   shaderMaterial
)

plane.rotation.set(-Math.PI / 2, 0, 0)
plane.receiveShadow = true
scene.add(plane)


const folderX = gui.addFolder({
	title: 'X',
	expanded: true,
})

folderX.addInput(shaderMaterial.uniforms.uFrequency.value, 'x', {
	label: 'Frequency',
	min: 0,
	max: 10,
	step: 0.1
})
folderX.addInput(shaderMaterial.uniforms.uAmplitude.value, 'x', {
	label: 'Amplityde',
	min: 0,
	max: 10,
	step: 0.1
})
const folderY = gui.addFolder({
	title: 'Y',
	expanded: true,
})
folderY.addInput(shaderMaterial.uniforms.uFrequency.value, 'y', {
	label: 'Frequency',
	min: 0,
	max: 10,
	step: 0.1
})
folderY.addInput(shaderMaterial.uniforms.uAmplitude.value, 'y', {
	label: 'Amplityde',
	min: 0,
	max: 10,
	step: 0.1
})

gui.addInput(shadersProps, 'color').on('change', ev => {
	shaderMaterial.uniforms.uColor.value = new THREE.Color(ev.value)
})


gui.addInput(shaderMaterial, 'wireframe')



const clock = new THREE.Clock()



const loop = () => {
  fpsGraph.begin()

	const elapsedTime = clock.getElapsedTime()

	shaderMaterial.uniforms.uTime.value = elapsedTime
  
	controls.update()
  renderer.render(scene, camera)

  fpsGraph.end()
  requestAnimationFrame(loop)
}

loop()
