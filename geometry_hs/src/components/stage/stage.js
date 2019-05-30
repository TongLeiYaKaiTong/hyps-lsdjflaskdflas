import * as THREE from 'three'
import OrbitControls from 'three-orbitcontrols'

export default class Stage {
    constructor(opts) {
        const scene = new THREE.Scene();

        const renderer = new THREE.WebGLRenderer({ antialias: true });

        const element = document.querySelector(opts.element);
        const witdh = element.clientWidth;
        const height = element.clientHeight;

        renderer.setSize(witdh, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        element.appendChild(renderer.domElement);

        const camera = new THREE.PerspectiveCamera(55, witdh / height, 0.01, 20000);
        camera.position.set(30, 30, 100);

        const light = new THREE.DirectionalLight(0xffffff, 0.8);
        scene.add(light);

        const controls = new OrbitControls(camera, renderer.domElement);
        // controls.maxPolarAngle = Math.PI * 0.495;
        controls.target.set(0, 10, 0);
        controls.minDistance = 40.0;
        controls.maxDistance = 200.0;
        controls.update();


        // 公开属性
        this.element = element;
        this.scene = scene;
        this.camera = camera;
        this.light = light;
        this.renderer = renderer;
        this.controls = controls;

        // 外部调用方法的 this 绑定
        this.animate = this.animate.bind(this);

        const onWindowResize = () => {
            const witdh = element.clientWidth;
            const height = element.clientHeight;

            camera.aspect = witdh / height;
            camera.updateProjectionMatrix();
            renderer.setSize(witdh, height);
        }

        window.addEventListener('resize', onWindowResize, false);
    }

    get_element() {
        return this.element
    }

    animate() {
        window.requestAnimationFrame(this.animate);

        if (this.extend_render) this.extend_render();

        this.renderer.render(this.scene, this.camera);
    }

    add(object) {
        this.scene.add(object);
    }

    remove(object) {
        this.scene.remove(object);
    }
};
