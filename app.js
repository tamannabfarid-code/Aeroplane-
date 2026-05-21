// Complete vehicle collection specs matched to your exact naming rules
const fleetData = [
    {
        id: "biplane",
        name: "Artemis Class Biplane",
        vendor: "AeroClassics",
        type: "Classic Prop",
        role: "Sport / Transport",
        range: "350 miles",
        speed: "95 knots",
        capacity: "2",
        cost: "150,000 Credits",
        icon: "artemis class biplane-plane.png",
        color: 0xd4ac0d
    },
    {
        id: "g6",
        name: "Artemis G-6 Interceptor",
        vendor: "Vanguard Aero",
        type: "Supersonic Jet",
        role: "Air Defense",
        range: "1,200 miles",
        speed: "Mach 1.6",
        capacity: "1",
        cost: "1,450,000 Credits",
        icon: "artemis g-6 interceptor-plane.png",
        color: 0x7b7d7d
    },
    {
        id: "f22",
        name: "F-22 Raptor",
        vendor: "Lockheed Precision",
        type: "Stealth Fighter",
        role: "Tactical Superiority",
        range: "1,800 miles",
        speed: "Mach 2.25",
        capacity: "1",
        cost: "2,500,000 Credits",
        icon: "f-22 raptor-plane.png",
        color: 0x34495e
    },
    {
        id: "nomad",
        name: "Nomad Skycar",
        vendor: "Omni-Tech VTOL",
        type: "Quad-VTOL Car",
        role: "Personal Transport",
        range: "450 miles",
        speed: "210 knots",
        capacity: "4",
        cost: "850,000 Credits",
        icon: "nomad skycar-plane.png",
        color: 0x2e4053
    }
];

let activeIndex = 0;
const ribbon = document.getElementById('selector-ribbon');

// --- UI Framework Setup ---
function setupUI() {
    fleetData.forEach((plane, index) => {
        const card = document.createElement('div');
        card.className = `plane-card ${index === 0 ? 'active' : ''}`;
        card.setAttribute('data-index', index);
        card.innerHTML = `
            <div class="card-icon">
                <img src="${plane.icon}" alt="${plane.name}" onerror="this.parentElement.style.background='rgba(0,0,0,0.05)'">
            </div>
            <p>${plane.name}</p>
        `;
        
        card.addEventListener('click', () => selectPlane(index));
        ribbon.appendChild(card);
    });
}

function selectPlane(index) {
    if(index === activeIndex) return;
    
    // Toggle Active Border Highlights on Ribbon Selector
    document.querySelectorAll('.plane-card').forEach((c, i) => {
        c.classList.toggle('active', i === index);
    });

    activeIndex = index;
    const data = fleetData[index];

    // Inject matching specs into the right-hand panel
    document.getElementById('plane-title').innerText = data.name;
    document.getElementById('plane-thumb').src = data.icon;
    document.getElementById('plane-thumb').style.display = 'block'; 
    document.getElementById('val-vendor').innerText = data.vendor;
    document.getElementById('val-type').innerText = data.type;
    document.getElementById('val-role').innerText = data.role;
    document.getElementById('val-range').innerText = data.range;
    document.getElementById('val-speed').innerText = data.speed;
    document.getElementById('val-cap').innerText = data.capacity;
    document.getElementById('val-cost').innerText = data.cost;

    // Trigger Slide transition 
    trigger3DTransition(index);
}

// --- Three.js 3D Viewport Engine ---
let scene, camera, renderer, modelGroup;
let meshes = [];
let targetX = 0; 
const slideSpeed = 0.08; // Determines smoothness of slide in animation

function init3D() {
    const container = document.getElementById('canvas-container');
    
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f3f5); // Studio grey background finish

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 2, 7);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Balanced Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight1.position.set(5, 10, 7);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xaed6f1, 0.4);
    dirLight2.position.set(-5, 2, -5);
    scene.add(dirLight2);

    modelGroup = new THREE.Group();
    scene.add(modelGroup);

    buildProceduralPlaceholders();

    window.addEventListener('resize', onWindowResize);
    animate();
}

// Builds fallback geometry block shapes while real assets finish local config setups
function buildProceduralPlaceholders() {
    // 1. Biplane Assembly
    const biplaneGroup = new THREE.Group();
    const bodyGeo = new THREE.BoxGeometry(0.6, 0.5, 2);
    const wingGeo = new THREE.BoxGeometry(3.2, 0.05, 0.6);
    const matYellow = new THREE.MeshStandardMaterial({ color: fleetData[0].color, roughness: 0.4 });
    const body = new THREE.Mesh(bodyGeo, matYellow);
    const topWing = new THREE.Mesh(wingGeo, matYellow);
    topWing.position.set(0, 0.5, 0.2);
    const bottomWing = new THREE.Mesh(wingGeo, matYellow);
    bottomWing.position.set(0, -0.2, 0.2);
    biplaneGroup.add(body, topWing, bottomWing);
    meshes.push(biplaneGroup);

    // 2. Artemis G-6
    const g6Group = new THREE.Group();
    const jetMat = new THREE.MeshStandardMaterial({ color: fleetData[1].color, roughness: 0.3, metalness: 0.2 });
    const fuselage = new THREE.Mesh(new THREE.ConeGeometry(0.4, 2.5, 4), jetMat);
    fuselage.rotation.x = Math.PI / 2;
    const wings = new THREE.Mesh(new THREE.ConeGeometry(1.5, 1.2, 3), jetMat);
    wings.rotation.x = Math.PI / 2;
    wings.position.set(0, 0, -0.4);
    g6Group.add(fuselage, wings);
    meshes.push(g6Group);

    // 3. F-22 Raptor
    const f22Group = new THREE.Group();
    const stealthMat = new THREE.MeshStandardMaterial({ color: fleetData[2].color, roughness: 0.5, metalness: 0.5 });
    const mainBody = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.2, 2.4), stealthMat);
    const mainWings = new THREE.Mesh(new THREE.ConeGeometry(1.8, 1.5, 4), stealthMat);
    mainWings.rotation.x = Math.PI / 2;
    mainWings.scale.y = 0.1;
    f22Group.add(mainBody, mainWings);
    meshes.push(f22Group);

    // 4. Nomad Skycar VTOL
    const nomadGroup = new THREE.Group();
    const quadMat = new THREE.MeshStandardMaterial({ color: fleetData[3].color, metalness: 0.8, roughness: 0.2 });
    const pod = new THREE.Mesh(new THREE.SphereGeometry(0.6, 16, 16), quadMat);
    pod.scale.set(1, 0.7, 1.6);
    const rotorGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.15, 8);
    const positions = [[0.8,0,0.6], [-0.8,0,0.6], [0.8,0,-0.6], [-0.8,0,-0.6]];
    positions.forEach(pos => {
        const rotor = new THREE.Mesh(rotorGeo, quadMat);
        rotor.position.set(...pos);
        nomadGroup.add(rotor);
    });
    nomadGroup.add(pod);
    meshes.push(nomadGroup);

    modelGroup.add(meshes[0]);
}

function trigger3DTransition(selectedIndex) {
    modelGroup.position.x = 4.5; // Snap new model instantly far off-frame right
    
    while(modelGroup.children.length > 0){ 
        modelGroup.remove(modelGroup.children[0]); 
    }
    
    if(meshes[selectedIndex]) {
        modelGroup.add(meshes[selectedIndex]);
    }
}

function animate() {
    requestAnimationFrame(animate);

    // Continuous smooth object Y axis rotation
    modelGroup.rotation.y += 0.008;

    // Linear Interpolation sliding math
    if (Math.abs(modelGroup.position.x - targetX) > 0.001) {
        modelGroup.position.x += (targetX - modelGroup.position.x) * slideSpeed;
    } else {
        modelGroup.position.x = targetX;
    }

    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.onload = () => {
    setupUI();
    init3D();
};