const boxes = document.querySelectorAll(".box");
const image = document.querySelector(".image");
const hiddenDiv = document.querySelector(".hidden");
const shownDiv = document.querySelector(".shown");


boxes.forEach((box) => {
  box.addEventListener("dragover", (e) => {
    e.preventDefault(); // 允许拖拽
  });

  box.addEventListener("drop", (e) => {
    e.preventDefault();
    box.appendChild(image); // 将图片放入目标容器

    // 判断是否拖入右边的box
    if (box.id === "right") {
        hiddenDiv.classList.remove("hidden"); 
        shownDiv.classList.add("hidden")// 显示文字
      } else {
        hiddenDiv.classList.add("hidden");
        shownDiv.classList.remove("hidden")
  }});
});

// 彩虹颜色数组
const rainbowColors = [
    '#ff0000', '#ff7f00', '#ffff00', 
    '#00ff00', '#0000ff', '#4b0082', '#9400d3'
];

// 获取随机颜色
function getRandomColor() {
    return rainbowColors[Math.floor(Math.random() * rainbowColors.length)];
}

// 添加彩虹文字效果
document.querySelectorAll('h1').forEach(heading => {
    const text = heading.textContent;
    heading.innerHTML = ''; // 清空原有内容
    
    // 为每个字符创建 span
    [...text].forEach(char => {
        const span = document.createElement('span');
        span.textContent = char;
        span.style.display = 'inline-block';
        span.style.color = 'white'; // 初始颜色设为白色
        
        // 添加鼠标悬停事件
        span.addEventListener('mouseover', () => {
            span.style.color = getRandomColor(); // 先设置随机颜色
            span.classList.add('rainbow-text');
        });
        
        // 添加鼠标离开事件
        span.addEventListener('mouseout', () => {
            span.classList.remove('rainbow-text');
            span.style.color = 'white'; // 恢复白色
        });
        
        heading.appendChild(span);
    });
});

// 添加彩虹涟漪效果
let lastRippleTime = 0;
const rippleInterval = 500; // 控制涟漪产生的间隔时间（毫秒）

document.addEventListener('mousemove', (e) => {
    const currentTime = Date.now();
    if (currentTime - lastRippleTime < rippleInterval) return;
    lastRippleTime = currentTime;

    const ripple = document.createElement('div');
    ripple.className = 'ripple';
    ripple.style.left = (e.clientX - 50) + 'px';  // 50是ripple宽度的一半
    ripple.style.top = (e.clientY - 50) + 'px';   // 50是ripple高度的一半
    
    document.body.appendChild(ripple);
    
    // 动画结束后移除元素
    ripple.addEventListener('animationend', () => {
        ripple.remove();
    });
});

// 添加3D模型
const modelContainer = document.createElement('div');
modelContainer.style.position = 'fixed';
modelContainer.style.top = '20px';
modelContainer.style.left = '20px';
modelContainer.style.width = '300px';
modelContainer.style.height = '300px';
modelContainer.style.zIndex = '1000';
document.body.appendChild(modelContainer);

// 创建场景
const scene = new THREE.Scene();
scene.background = null; // 移除黑色背景
const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ 
    antialias: true, 
    alpha: true,  // 确保透明背景
    clearColor: 0x00000000  // 设置透明清除颜色
});
renderer.setClearColor(0x000000, 0); // 设置完全透明的背景
renderer.setSize(300, 300);
renderer.setPixelRatio(window.devicePixelRatio);
modelContainer.appendChild(renderer.domElement);

// 加载模型
const loader = new THREE.GLTFLoader();
let model;

// 添加加载状态提示
const loadingText = document.createElement('div');
loadingText.style.position = 'absolute';
loadingText.style.top = '50%';
loadingText.style.left = '50%';
loadingText.style.transform = 'translate(-50%, -50%)';
loadingText.style.color = 'white';
loadingText.textContent = 'Loading model...';
modelContainer.appendChild(loadingText);

// 尝试加载模型
console.log('Starting to load model...');
const modelPath = 'color.glb';

// 先检查文件是否存在
fetch(modelPath)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        console.log('Model file exists, starting GLTFLoader...');
        return response.blob();
    })
    .then(() => {
        loader.load(
            modelPath,
            (gltf) => {
                console.log('Model loaded successfully!');
                model = gltf.scene;
                scene.add(model);
                
                // 在缩放前记录原始尺寸
                const originalBox = new THREE.Box3().setFromObject(model);
                const originalSize = originalBox.getSize(new THREE.Vector3());
                console.log('Original model size:', originalSize);
                
                // 尝试更大的缩放值
                model.scale.set(0.1, 0.1, 0.1); // 显著增加缩放值
                
                // 在缩放后记录新尺寸
                const newBox = new THREE.Box3().setFromObject(model);
                const newSize = newBox.getSize(new THREE.Vector3());
                console.log('New model size after scaling:', newSize);
                
                // 计算模型的边界框
                const box = new THREE.Box3().setFromObject(model);
                const center = box.getCenter(new THREE.Vector3());
                const size = box.getSize(new THREE.Vector3());
                
                console.log('Model dimensions:', size);
                console.log('Model center:', center);
                
                // 调整相机位置
                const maxDim = Math.max(size.x, size.y, size.z);
                const fov = camera.fov * (Math.PI / 180);
                let cameraZ = Math.abs(maxDim / Math.sin(fov / 2));
                camera.position.z = cameraZ * 1; // 增加相机距离以适应更大的模型
                
                console.log('Camera position:', camera.position);
                console.log('Camera distance:', cameraZ);
                
                // 将模型居中
                model.position.x = -center.x;
                model.position.y = -center.y;
                model.position.z = -center.z;
                
                // 添加环境光（增加光照强度）
                const ambientLight = new THREE.AmbientLight(0xffffff, 2);
                scene.add(ambientLight);
                
                // 添加平行光（增加光照强度）
                const directionalLight = new THREE.DirectionalLight(0xffffff, 0.1);
                directionalLight.position.set(1, 1, 1);
                scene.add(directionalLight);
                
                // 移除加载提示
                loadingText.remove();
            },
            // 加载进度回调
            (xhr) => {
                const percent = (xhr.loaded / xhr.total * 100).toFixed(2);
                console.log(`${percent}% loaded`);
                loadingText.textContent = `Loading model... ${percent}%`;
            },
            // 错误回调
            (error) => {
                console.error('GLTFLoader error:', error);
                console.error('Error details:', {
                    message: error.message,
                    type: error.type,
                    url: error.url
                });
                loadingText.textContent = `Error loading model: ${error.message}`;
                loadingText.style.color = 'red';
            }
        );
    })
    .catch(error => {
        console.error('Fetch error:', error);
        loadingText.textContent = `Error: Cannot find model file (${error.message})`;
        loadingText.style.color = 'red';
    });

// 动画循环
function animate() {
    requestAnimationFrame(animate);
    
    if (model) {
        // 获取鼠标位置
        const mouseX = (window.mouseX || 0) - window.innerWidth / 2;
        const mouseY = (window.mouseY || 0) - window.innerHeight / 2;
        
        // 计算旋转角度（限制在较小范围内）
        const targetRotationX = mouseY * 0.0002; // 减小旋转幅度
        const targetRotationY = mouseX * 0.0002; // 减小旋转幅度
        
        // 平滑过渡到目标旋转
        model.rotation.x += (targetRotationX - model.rotation.x) * 0.1;
        model.rotation.y += (targetRotationY - model.rotation.y) * 0.1;
    }
    
    renderer.render(scene, camera);
}

// 跟踪鼠标位置
document.addEventListener('mousemove', (event) => {
    window.mouseX = event.clientX;
    window.mouseY = event.clientY;
});

animate();