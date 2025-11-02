// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0a);

// Camera setup
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.z = 5;

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('canvas-container').appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 5, 5);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
scene.add(directionalLight);

const pointLight1 = new THREE.PointLight(0x667eea, 1, 100);
pointLight1.position.set(-5, 3, 0);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0xf093fb, 1, 100);
pointLight2.position.set(5, -3, 0);
scene.add(pointLight2);

// Create initial geometry
let currentMesh;
let isAnimating = true;
let currentColor = 0x667eea;

function createMesh(geometryType) {
    // Remove existing mesh
    if (currentMesh) {
        scene.remove(currentMesh);
        currentMesh.geometry.dispose();
        currentMesh.material.dispose();
    }

    // Create geometry based on type
    let geometry;
    switch (geometryType) {
        case 'sphere':
            geometry = new THREE.SphereGeometry(1.5, 32, 32);
            break;
        case 'torus':
            geometry = new THREE.TorusGeometry(1.2, 0.4, 16, 100);
            break;
        case 'cone':
            geometry = new THREE.ConeGeometry(1.2, 2.5, 32);
            break;
        case 'cube':
        default:
            geometry = new THREE.BoxGeometry(2, 2, 2);
            break;
    }

    // Create material with current color
    const material = new THREE.MeshStandardMaterial({
        color: currentColor,
        metalness: 0.7,
        roughness: 0.2,
        emissive: currentColor,
        emissiveIntensity: 0.2
    });

    currentMesh = new THREE.Mesh(geometry, material);
    currentMesh.castShadow = true;
    currentMesh.receiveShadow = true;
    scene.add(currentMesh);

    // Add wireframe overlay
    const wireframeGeometry = geometry.clone();
    const wireframeMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true,
        transparent: true,
        opacity: 0.1
    });
    const wireframe = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
    currentMesh.add(wireframe);
}

// Initialize with cube
createMesh('cube');

// Add floating particles
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 1000;
const posArray = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 20;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

const particlesMaterial = new THREE.PointsMaterial({
    size: 0.02,
    color: 0xffffff,
    transparent: true,
    opacity: 0.6
});

const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

// Mouse interaction
let mouseX = 0;
let mouseY = 0;
let targetRotationX = 0;
let targetRotationY = 0;

document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    
    targetRotationY = mouseX * Math.PI;
    targetRotationX = mouseY * Math.PI;
});

// Touch support
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', (event) => {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
});

document.addEventListener('touchmove', (event) => {
    const touchX = event.touches[0].clientX;
    const touchY = event.touches[0].clientY;
    
    const deltaX = (touchX - touchStartX) / window.innerWidth;
    const deltaY = (touchY - touchStartY) / window.innerHeight;
    
    targetRotationY += deltaX * Math.PI;
    targetRotationX += deltaY * Math.PI;
    
    touchStartX = touchX;
    touchStartY = touchY;
});

// Scroll to zoom
document.addEventListener('wheel', (event) => {
    camera.position.z += event.deltaY * 0.01;
    camera.position.z = Math.max(2, Math.min(10, camera.position.z));
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    if (currentMesh) {
        if (isAnimating) {
            currentMesh.rotation.x += 0.005;
            currentMesh.rotation.y += 0.01;
        }

        // Smooth mouse follow
        currentMesh.rotation.x += (targetRotationX - currentMesh.rotation.x) * 0.05;
        currentMesh.rotation.y += (targetRotationY - currentMesh.rotation.y) * 0.05;
    }

    // Animate particles
    particlesMesh.rotation.y += 0.0005;
    particlesMesh.rotation.x += 0.0002;

    // Animate lights
    const time = Date.now() * 0.001;
    pointLight1.position.x = Math.sin(time) * 5;
    pointLight1.position.z = Math.cos(time) * 5;
    pointLight2.position.x = Math.cos(time) * 5;
    pointLight2.position.z = Math.sin(time) * 5;

    renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Control functions
function changeShape(shape) {
    createMesh(shape);
}

function toggleAnimation() {
    isAnimating = !isAnimating;
}

function changeColor(color) {
    currentColor = new THREE.Color(color);
    if (currentMesh) {
        currentMesh.material.color.set(currentColor);
        currentMesh.material.emissive.set(currentColor);
    }
}
