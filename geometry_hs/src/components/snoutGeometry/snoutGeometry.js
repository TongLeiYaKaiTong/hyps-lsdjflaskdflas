import { CylinderGeometry } from 'three'


export default class SnoutGeometry extends CylinderGeometry {
    constructor(radius_bottom, radius_top, height, x_offset = 0, z_offset = 0) {
        super(radius_top, radius_bottom, height, 32);

        this.type = 'SnoutGeometry';

        const vertices = this.vertices;
        const length = vertices.length;

        // 全部向上偏移高度
        for (let i = 0; i < length; i++) {
            const vector = vertices[i];
            vector.y += height;
        }

        // 获取顶部点
        const top_vertices = vertices.slice(0, length / 2 - 1);
        top_vertices.push(vertices[length - 2]);

        // 顶部圆环顶点偏移
        for (const vector of top_vertices) {
            vector.x += x_offset;
            vector.z += z_offset;
        }
    }
};

