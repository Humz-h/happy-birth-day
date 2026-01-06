import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

// ========================
// SCENE - CAMERA - RENDER
// ========================
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  2000
);
camera.position.z = 60;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Label renderer cho text
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0';
labelRenderer.domElement.style.pointerEvents = 'none';
document.body.appendChild(labelRenderer.domElement);

// ========================
// CONTROLS (ZOOM / DRAG)
// ========================
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enableZoom = true;
controls.minDistance = 20;
controls.maxDistance = 200;
controls.enablePan = true;
controls.touches = {
  ONE: THREE.TOUCH.ROTATE,
  TWO: THREE.TOUCH.DOLLY_PAN
};

// Raycaster cho click detection
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// ========================
// GALAXY STARFIELD
// ========================
const starGeometry = new THREE.BufferGeometry();
const starCount = 5000;
const starPositions = [];

for (let i = 0; i < starCount; i++) {
  starPositions.push(
    (Math.random() - 0.5) * 1000,
    (Math.random() - 0.5) * 1000,
    (Math.random() - 0.5) * 1000
  );
}

starGeometry.setAttribute(
  'position',
  new THREE.Float32BufferAttribute(starPositions, 3)
);

const starMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 1,
  transparent: true,
  opacity: 0.8
});

const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

// ========================
// LOAD IMAGES (NGƯỜI YÊU)
// ========================
const imageGroup = new THREE.Group();
scene.add(imageGroup);

const loader = new THREE.TextureLoader();
const centerImageName = 'z7396814981077_b32a016ef34c314db26d499774e0f406.jpg';

// Danh sách ảnh và lời chúc
const imageFiles = [
  'z7396811886560_37ecce73b8e4e890d13baba2cb4cb149.jpg',
  'z7396811894906_d182e68402e42525415a750edd35b57b.jpg',
  'z7396811900488_b34c9098cd8852e6ebea25c1219a82d8.jpg',
  'z7396811901278_093766c4058b151953d81e2f560057a5.jpg',
  'z7396811971355_e9a98dd907b22d41c04b1fab9ed20ecf.jpg',
  'z7396811978692_a02542cbdf7c933bb1bcc8d5053df8bc.jpg',
  'z7396811998930_dd53b1e74405031e0aac851e0f0b54e3.jpg',
  'z7396812024182_7224f4b8ec05309b43d62a80f37ffb3f.jpg',
  'z7396812032330_1b98e221270af6e935977c80c6f11ada.jpg',
  'z7396812041009_d0c9284bef4f062e5c71b35090fdd698.jpg',
  'z7396812053952_5baa13e178d40d986a696e03fdfe9be3.jpg',
  'z7396812074240_1616a60cf5da07d38350faf33f4ed733.jpg',
  'z7396814981077_b32a016ef34c314db26d499774e0f406.jpg', // Ảnh trung tâm
  'z7396814990652_701572528abc2b0ef4bba5a2aa879412.jpg'
];

  // Lời chúc ý nghĩa cho mỗi ảnh
  const messages = [
    'Có em trong đời là điều may mắn nhất mà anh từng có.',
    'Chỉ cần em cười, cả ngày của anh tự nhiên đẹp hẳn lên.',
    'Anh không cần thế giới, anh chỉ cần em.',
    'Mỗi ngày bên em đều là một ngày đáng trân trọng.',
    'Em là lý do khiến anh luôn muốn trở thành phiên bản tốt hơn.',
    'Yêu em không phải vì điều gì cả, chỉ vì em là em.',
    'Dù hôm nay có mệt đến đâu, nghĩ tới em là anh thấy ổn.',
    'Cảm ơn em vì đã ở đây và yêu anh.',
    'Trái tim anh từ lúc gặp em đã không còn thuộc về anh nữa rồi.',
    'Chỉ cần nắm tay em, mọi chuyện đều có thể vượt qua.',
    'Em không hoàn hảo, nhưng với anh em là duy nhất.',
    'Anh thích cách em bước vào cuộc sống anh và ở lại.',
    'Nếu được chọn lại, anh vẫn chọn yêu em từ đầu.', // Ảnh trung tâm
    'Bên em, anh thấy bình yên theo cách rất riêng.'
  ];

let loadedImages = [];
let selectedImage = null;
let isZooming = false;
let isShowingMessage = false;
let cameraTarget = null;
let cameraTargetPos = null;
let cameraStartPos = new THREE.Vector3();
let cameraStartTarget = new THREE.Vector3();
let cameraAnimationProgress = 1;
let imageOriginalRotation = new THREE.Euler();
let imageOriginalQuaternion = new THREE.Quaternion();
let imageTargetQuaternion = new THREE.Quaternion();
let imageOriginalPosition = new THREE.Vector3();
let imageOriginalScale = new THREE.Vector3(1, 1, 1);
let isResetting = false;
let messageZoomProgress = 1;
let messageZoomStartPos = new THREE.Vector3();
let messageZoomTargetPos = new THREE.Vector3();
let resetStartPos = new THREE.Vector3();
let resetStartTarget = new THREE.Vector3();
let resetProgress = 1;
let resetMesh = null;

// Hàm typewriter effect
function typewriterText(element, text, speed = 50) {
  element.textContent = '';
  element.style.opacity = '1';
  let i = 0;
  
  function type() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }
  
  type();
}

// Hàm tạo text label
function createLabel(text, mesh) {
  const labelDiv = document.createElement('div');
  labelDiv.className = 'image-label';
  labelDiv.textContent = '';
  labelDiv.style.color = '#ffffff';
  labelDiv.style.fontSize = '18px';
  labelDiv.style.fontFamily = '"Segoe UI", Arial, sans-serif';
  labelDiv.style.textAlign = 'center';
  labelDiv.style.background = 'linear-gradient(135deg, rgba(255, 192, 203, 0.95) 0%, rgba(255, 105, 180, 0.95) 100%)';
  labelDiv.style.padding = '12px 20px';
  labelDiv.style.borderRadius = '12px';
  labelDiv.style.border = '2px solid rgba(255, 255, 255, 0.5)';
  labelDiv.style.boxShadow = '0 4px 20px rgba(255, 105, 180, 0.6), 0 0 30px rgba(255, 192, 203, 0.4)';
  labelDiv.style.whiteSpace = 'normal';
  labelDiv.style.maxWidth = '320px';
  labelDiv.style.maxHeight = '180px';
  labelDiv.style.overflowY = 'auto';
  labelDiv.style.overflowX = 'hidden';
  labelDiv.style.lineHeight = '1.4';
  labelDiv.style.pointerEvents = 'none';
  labelDiv.style.opacity = '0';
  labelDiv.style.transition = 'opacity 0.5s';
  labelDiv.style.wordWrap = 'break-word';
  labelDiv.style.position = 'relative';
  labelDiv.style.top = '0';
  labelDiv.style.boxSizing = 'border-box';
  
  mesh.userData.originalText = text;
  
  const label = new CSS2DObject(labelDiv);
  label.position.set(0, -10.5, 0);
  mesh.add(label);
  mesh.userData.label = label;
  mesh.userData.labelDiv = labelDiv;
  
  return label;
}

// Lấy các phần tử modal
const imageModal = document.getElementById('imageModal');
const modalImage = document.getElementById('modalImage');
const modalMessage = document.getElementById('modalMessage');

function zoomToImage(mesh) {
  if (isZooming) return;
  isZooming = true;
  selectedImage = mesh;
  
  imageOriginalPosition.copy(mesh.position);
  imageOriginalRotation.copy(mesh.rotation);
  imageOriginalQuaternion.copy(mesh.quaternion);
  imageTargetQuaternion.setFromEuler(new THREE.Euler(0, 0, 0));
  
  const worldPos = new THREE.Vector3();
  mesh.getWorldPosition(worldPos);
  
  const normal = new THREE.Vector3(0, 0, 1);
  normal.applyQuaternion(mesh.quaternion);
  
  const cameraToMesh = new THREE.Vector3().subVectors(camera.position, worldPos).normalize();
  const dot = normal.dot(cameraToMesh);
  
  if (dot < 0) {
    normal.negate();
  }
  
  const distance = 30;
  const cameraOffset = normal.clone().multiplyScalar(distance);
  const targetCameraPos = worldPos.clone().add(cameraOffset);
  
  cameraStartPos.copy(camera.position);
  cameraStartTarget.copy(controls.target);
  cameraTarget = worldPos.clone();
  cameraTargetPos = targetCameraPos.clone();
  cameraAnimationProgress = 0;
  
  controls.enabled = false;
}

function resetCamera() {
  if (!isZooming) return;
  
  resetMesh = selectedImage;
  isResetting = true;
  resetProgress = 0;
  resetStartPos.copy(camera.position);
  resetStartTarget.copy(controls.target);
  
  if (resetMesh) {
    imageOriginalRotation.copy(resetMesh.rotation);
    imageOriginalQuaternion.copy(resetMesh.quaternion);
  }
}

function showMessage(mesh) {
  if (isShowingMessage) return;
  isShowingMessage = true;
  
  mesh.visible = true;
  if (mesh.material) {
    mesh.material.opacity = 1;
    mesh.material.transparent = true;
  }
  
  imageOriginalScale.copy(mesh.scale);
  messageZoomStartPos.copy(camera.position);
  
  const worldPos = new THREE.Vector3();
  mesh.getWorldPosition(worldPos);
  
  const normal = new THREE.Vector3(0, 0, 1);
  normal.applyQuaternion(mesh.quaternion);
  
  const cameraToMesh = new THREE.Vector3().subVectors(camera.position, worldPos).normalize();
  const dot = normal.dot(cameraToMesh);
  
  if (dot < 0) {
    normal.negate();
  }
  
  const closeDistance = 25;
  const cameraOffset = normal.clone().multiplyScalar(closeDistance);
  messageZoomTargetPos.copy(worldPos).add(cameraOffset);
  
  messageZoomProgress = 0;
  
  const labelDiv = mesh.userData.labelDiv;
  if (labelDiv) {
    labelDiv.style.opacity = '1';
    labelDiv.textContent = '';
    setTimeout(() => {
      typewriterText(labelDiv, mesh.userData.originalText || mesh.userData.message, 30);
    }, 100);
  }
}

function hideMessage(mesh) {
  if (!isShowingMessage) return;
  isShowingMessage = false;
  
  messageZoomProgress = 0;
  messageZoomStartPos.copy(camera.position);
  
  if (cameraTargetPos) {
    messageZoomTargetPos.copy(cameraTargetPos);
  }
  
  const labelDiv = mesh.userData.labelDiv;
  if (labelDiv) {
    labelDiv.style.opacity = '0';
    labelDiv.textContent = '';
  }
}


// Load tất cả ảnh
imageFiles.forEach((filename, i) => {
  const isCenter = filename === centerImageName;
  
  loader.load(`images/${filename}`, texture => {
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide
    });

    const geometry = new THREE.PlaneGeometry(12, 16);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData.originalTexture = texture;
    
    // Ảnh trung tâm ở giữa, các ảnh khác xung quanh với độ sâu khác nhau
    if (isCenter) {
      mesh.position.set(0, 0, 0);
      mesh.userData.speed = 0.0005; // Xoay chậm hơn
      mesh.userData.baseScale = 1.0; // Scale gốc
    } else {
      // Phân bố rải rác hơn với độ sâu (z-axis) rõ rệt
      // Tạo nhiều lớp độ sâu khác nhau, rải rác hơn
      const depthLayers = 4; // 4 lớp độ sâu
      const layerIndex = Math.floor((i / imageFiles.length) * depthLayers);
      const zDepth = -80 + layerIndex * 40; // Từ -80 đến +80 (xa đến gần)
      const zVariation = (Math.random() - 0.5) * 20; // Biến thiên lớn hơn trong mỗi lớp
      const finalZ = zDepth + zVariation;
      
      // Bán kính quỹ đạo trên mặt phẳng XY - rải rác hơn
      const xyRadius = 50 + Math.random() * 40; // Từ 50 đến 90 (rải rác hơn)
      const angle = (i * Math.PI * 2) / (imageFiles.length - 1) + (Math.random() - 0.5) * 1.5; // Góc rải rác hơn
      
      // Phân bố trên quỹ đạo với độ cao rải rác hơn
      const x = Math.cos(angle) * xyRadius + (Math.random() - 0.5) * 15; // Thêm độ ngẫu nhiên
      const y = (Math.random() - 0.5) * 60; // Độ cao ngẫu nhiên từ -30 đến +30
      
      mesh.position.set(x, y, finalZ);
      
      // Scale dựa trên độ sâu: xa nhỏ, gần lớn
      // Z từ -80 đến +80, scale từ 0.4 đến 1.2
      const normalizedZ = (finalZ + 80) / 160; // 0 (xa nhất) đến 1 (gần nhất)
      const scale = 0.4 + normalizedZ * 0.8; // 0.4 đến 1.2
      mesh.scale.set(scale, scale, scale);
      mesh.userData.baseScale = scale;
      
      mesh.userData.speed = Math.random() * 0.002 + 0.001;
      mesh.userData.xyRadius = xyRadius;
      mesh.userData.initialAngle = angle;
      mesh.userData.zDepth = finalZ;
      mesh.userData.initialY = y;
    }
    
    mesh.userData.originalPosition = mesh.position.clone();
    mesh.userData.isCenter = isCenter;
    mesh.userData.message = messages[i];
    mesh.userData.imageSrc = `images/${filename}`; // Lưu đường dẫn ảnh
    
    // Tạo label
    createLabel(messages[i], mesh);
    
    // Thêm cursor pointer
    mesh.userData.isClickable = true;
    
    imageGroup.add(mesh);
    loadedImages.push(mesh);
  });
});

// Hover effect - đổi cursor
let hoveredImage = null;
window.addEventListener('mousemove', (event) => {
  // Không xử lý hover nếu đang trong modal
  if (imageModal.classList.contains('active') || isZooming) {
    if (hoveredImage) {
      renderer.domElement.style.cursor = 'grab';
      hoveredImage = null;
    }
    return;
  }
  
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(imageGroup.children, true);
  
  if (intersects.length > 0) {
    const hoveredMesh = intersects[0].object;
    if (hoveredMesh.userData.isClickable && !hoveredMesh.userData.isHidden) {
      if (hoveredImage !== hoveredMesh) {
        renderer.domElement.style.cursor = 'pointer';
        hoveredImage = hoveredMesh;
      }
    } else {
      if (hoveredImage) {
        renderer.domElement.style.cursor = 'grab';
        hoveredImage = null;
      }
    }
  } else {
    if (hoveredImage) {
      renderer.domElement.style.cursor = 'grab';
      hoveredImage = null;
    }
  }
});

function handleImageClick(event) {
  const clientX = event.clientX || (event.touches && event.touches[0] ? event.touches[0].clientX : event.changedTouches[0].clientX);
  const clientY = event.clientY || (event.touches && event.touches[0] ? event.touches[0].clientY : event.changedTouches[0].clientY);
  
  mouse.x = (clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(clientY / window.innerHeight) * 2 + 1;
  
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(imageGroup.children, true);
  
  if (intersects.length > 0) {
    const clickedMesh = intersects[0].object;
    if (clickedMesh.userData.isClickable && !clickedMesh.userData.isHidden) {
      if (isZooming && selectedImage === clickedMesh) {
        if (isShowingMessage) {
          hideMessage(clickedMesh);
        } else {
          showMessage(clickedMesh);
        }
      } else {
        zoomToImage(clickedMesh);
      }
    }
  } else {
    if (isZooming) {
      if (isShowingMessage) {
        hideMessage(selectedImage);
      } else {
        resetCamera();
      }
    }
  }
}

let touchStartTime = 0;
let touchStartPos = { x: 0, y: 0 };

window.addEventListener('click', handleImageClick);

window.addEventListener('touchstart', (event) => {
  if (event.touches.length === 1) {
    touchStartTime = Date.now();
    touchStartPos.x = event.touches[0].clientX;
    touchStartPos.y = event.touches[0].clientY;
  }
}, { passive: true });

window.addEventListener('touchend', (event) => {
  if (event.changedTouches.length === 1) {
    const touchEndTime = Date.now();
    const touchDuration = touchEndTime - touchStartTime;
    const touchEndPos = {
      x: event.changedTouches[0].clientX,
      y: event.changedTouches[0].clientY
    };
    
    const touchDistance = Math.sqrt(
      Math.pow(touchEndPos.x - touchStartPos.x, 2) + 
      Math.pow(touchEndPos.y - touchStartPos.y, 2)
    );
    
    if (touchDuration < 300 && touchDistance < 10) {
      event.preventDefault();
      handleImageClick(event);
    }
  }
}, { passive: false });

// ========================
// ANIMATION LOOP
// ========================
function animate() {
  requestAnimationFrame(animate);

  // Galaxy xoay nhẹ (sempre)
  stars.rotation.y += 0.0005;

  // Animação da câmera voando até a imagem
  if (isZooming && !isResetting && cameraTarget && cameraTargetPos && cameraAnimationProgress < 1) {
    cameraAnimationProgress += 0.008;
    if (cameraAnimationProgress > 1) cameraAnimationProgress = 1;
    
    const t = cameraAnimationProgress;
    const ease = t < 0.5 
      ? 2 * t * t 
      : 1 - Math.pow(-2 * t + 2, 2) / 2;
    
    camera.position.lerpVectors(cameraStartPos, cameraTargetPos, ease);
    controls.target.lerpVectors(cameraStartTarget, cameraTarget, ease);
    
    if (selectedImage) {
      const smoothEase = ease;
      
      const currentQuat = imageOriginalQuaternion.clone();
      currentQuat.slerp(imageTargetQuaternion, smoothEase);
      selectedImage.quaternion.copy(currentQuat);
      selectedImage.updateMatrixWorld();
      
      if (cameraAnimationProgress >= 1) {
        selectedImage.rotation.set(0, 0, 0);
        selectedImage.quaternion.copy(imageTargetQuaternion);
        selectedImage.updateMatrixWorld();
      }
    }
  }

  // Animação zoom in quando mostrar mensagem
  if (isShowingMessage && selectedImage && messageZoomProgress < 1) {
    messageZoomProgress += 0.012;
    if (messageZoomProgress > 1) messageZoomProgress = 1;
    
    const t = messageZoomProgress;
    const ease = t < 0.5 
      ? 2 * t * t 
      : 1 - Math.pow(-2 * t + 2, 2) / 2;
    
    camera.position.lerpVectors(messageZoomStartPos, messageZoomTargetPos, ease);
    
    const targetScale = 1.2;
    const currentScale = THREE.MathUtils.lerp(1, targetScale, ease);
    selectedImage.scale.set(currentScale, currentScale, currentScale);
    
    if (selectedImage.material) {
      selectedImage.material.opacity = 1;
      selectedImage.material.transparent = true;
      selectedImage.material.map = selectedImage.material.map || selectedImage.userData.originalTexture;
      if (!selectedImage.userData.originalTexture) {
        selectedImage.userData.originalTexture = selectedImage.material.map;
      }
    }
    
    selectedImage.visible = true;
    selectedImage.updateMatrixWorld();
  }

  // Animação brilho contínuo quando mensagem está visível
  if (isShowingMessage && selectedImage && messageZoomProgress >= 1) {
    if (selectedImage.material) {
      selectedImage.material.opacity = 1;
      selectedImage.material.transparent = true;
      selectedImage.material.map = selectedImage.userData.originalTexture || selectedImage.material.map;
    }
    selectedImage.visible = true;
    selectedImage.updateMatrixWorld();
  }

  // Animação zoom out quando esconder mensagem
  if (!isShowingMessage && isZooming && selectedImage && messageZoomProgress < 1) {
    messageZoomProgress += 0.012;
    if (messageZoomProgress > 1) messageZoomProgress = 1;
    
    const t = messageZoomProgress;
    const ease = t < 0.5 
      ? 2 * t * t 
      : 1 - Math.pow(-2 * t + 2, 2) / 2;
    
    camera.position.lerpVectors(messageZoomStartPos, messageZoomTargetPos, ease);
    
    const currentScale = THREE.MathUtils.lerp(selectedImage.scale.x, 1, ease);
    selectedImage.scale.set(currentScale, currentScale, currentScale);
    
    if (selectedImage.material) {
      selectedImage.material.map = selectedImage.userData.originalTexture || selectedImage.material.map;
      selectedImage.material.opacity = 1;
      selectedImage.material.transparent = true;
    }
    
    selectedImage.updateMatrixWorld();
  }

  // Animação zoom out (reset)
  if (isResetting && resetProgress < 1) {
    resetProgress += 0.008;
    if (resetProgress > 1) resetProgress = 1;
    
    const t = resetProgress;
    const ease = t < 0.5 
      ? 2 * t * t 
      : 1 - Math.pow(-2 * t + 2, 2) / 2;
    
    camera.position.lerpVectors(resetStartPos, cameraStartPos, ease);
    controls.target.lerpVectors(resetStartTarget, cameraStartTarget, ease);
    
    if (resetMesh) {
      const smoothEase = ease;
      const currentQuat = imageTargetQuaternion.clone();
      currentQuat.slerp(imageOriginalQuaternion, smoothEase);
      resetMesh.quaternion.copy(currentQuat);
    }
    
    if (resetProgress >= 1) {
      isZooming = false;
      isShowingMessage = false;
      isResetting = false;
      controls.enabled = true;
      
      if (resetMesh && resetMesh.userData.labelDiv) {
        resetMesh.userData.labelDiv.style.opacity = '0';
      }
      
      selectedImage = null;
      resetMesh = null;
      cameraAnimationProgress = 1;
    }
  }

  // Ảnh trôi trong không gian (sempre, exceto a imagem selecionada)
  const time = Date.now() * 0.001;
  
  imageGroup.children.forEach((img, index) => {
    if (!img.userData.isHidden && img !== selectedImage) {
        // Ảnh trung tâm xoay tại chỗ
        if (img.userData.isCenter) {
          img.rotation.y += img.userData.speed;
          // Thêm chuyển động nhẹ lên xuống
          img.position.y = Math.sin(time * 0.5) * 2;
        } else {
          // Các ảnh khác quay quanh trung tâm, giữ nguyên độ sâu đã được phân bố
          if (img.userData.xyRadius !== undefined) {
            const orbitSpeed = img.userData.speed * 30;
            const angle = img.userData.initialAngle + time * orbitSpeed;
            
            // Quỹ đạo tròn trên mặt phẳng XY, giữ nguyên độ sâu z
            const x = Math.cos(angle) * img.userData.xyRadius;
            const y = img.userData.initialY + Math.sin(time * 0.3 + img.userData.initialAngle) * 5;
            const z = img.userData.zDepth; // Giữ nguyên độ sâu
            
            img.position.set(x, y, z);
            
            // Giữ scale dựa trên độ sâu (xa nhỏ, gần lớn)
            if (img.userData.baseScale !== undefined) {
              img.scale.set(
                img.userData.baseScale,
                img.userData.baseScale,
                img.userData.baseScale
              );
            }
            
            // Xoay ảnh
            img.rotation.y += img.userData.speed;
          } else {
            // Fallback cho ảnh cũ (nếu có)
            const baseAngle = (index * Math.PI * 2) / (imageGroup.children.length - 1);
            const orbitSpeed = img.userData.speed * 50;
            const angle = baseAngle + time * orbitSpeed;
            
            const radius = img.userData.originalPosition.length();
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            const y = Math.sin(time * 0.3 + baseAngle) * 8;
            
            img.position.set(x, y, z);
            img.rotation.y += img.userData.speed;
          }
        }
      }
    });

  if (!isZooming || cameraAnimationProgress >= 1) {
    controls.update();
  }
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
}

animate();

// ========================
// RESIZE
// ========================
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
});

// ---------- Galaxy music autoplay ----------
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const galaxyAudioEl = document.getElementById('galaxy-music');
    if (!galaxyAudioEl) return;

    const filename = 'nhạc galaxy.m4a';
    const candidates = [
      '../assets-galaxy/' + filename,
      '../assets/' + filename
    ];
    
    for (const p of candidates) {
      try {
        const res = await fetch(p, { method: 'HEAD' });
        if (res.ok) {
          galaxyAudioEl.src = p;
          break;
        }
      } catch (e) {
      }
    }

    galaxyAudioEl.volume = 0.7;
    galaxyAudioEl.muted = false;

    async function tryPlay() {
      try {
        await galaxyAudioEl.play();
      } catch (e) {
        galaxyAudioEl.muted = true;
        try {
          await galaxyAudioEl.play();
          setTimeout(() => {
            galaxyAudioEl.muted = false;
            galaxyAudioEl.play().catch(() => {});
          }, 500);
        } catch (e2) {
          const playOnInteraction = () => {
            galaxyAudioEl.muted = false;
            galaxyAudioEl.play().catch(() => {});
            document.removeEventListener('click', playOnInteraction);
            document.removeEventListener('touchstart', playOnInteraction);
            document.removeEventListener('keydown', playOnInteraction);
          };
          document.addEventListener('click', playOnInteraction, { once: true });
          document.addEventListener('touchstart', playOnInteraction, { once: true });
          document.addEventListener('keydown', playOnInteraction, { once: true });
        }
      }
    }

    await tryPlay();
  } catch (e) {
  }
});


