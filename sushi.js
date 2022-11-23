
import {tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture
} = tiny;

export class Sushi {
    constructor(start_time) {
        //start time is the time the sushi was created
        this.start_time = start_time;

    }
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.

    get_start() {
        return this.start_time;
    }
    get_sushi_dist(t, offset, bound) {
        let dist = bound - ((4*t + (offset * 2)) % (bound*2));
        return dist;

    }

    //returns transform matrices for the tray and its two legs
    get_tray_transforms(t) {
        let time_offset = t - this.start_time;
        let tray_dist = this.get_sushi_dist(time_offset / 5.0, 0, 5);
        let tray_transform = Mat4.identity()
            .times(Mat4.rotation(Math.PI/2.0 ,0,1,0))
            .times(Mat4.scale(1,1,5))
            .times(Mat4.translation(7,2.25, tray_dist))
            .times(Mat4.scale(2,0.2,1))
            .times(Mat4.translation(0,-6,0));

        let tray_leg1_transform = tray_transform.times(Mat4.scale(1,2.5,0.20))
            .times(Mat4.translation(0,-1.2,-3));

        let tray_leg2_transform = tray_leg1_transform.times(Mat4.translation(0,0,6));

        return [tray_transform, tray_leg1_transform, tray_leg2_transform];
    }

    //returns transform for overall roll, first horizontal sushi piece and first vertical piece
    get_sushi_transforms(t) {
        let time_offset = t - this.start_time;
        let sushi_dist = this.get_sushi_dist(time_offset / 5.0, 0, 5);
        let roll_transform = Mat4.identity().times(Mat4.translation(sushi_dist * 5 -0.5, 2.25, -6.75))
                .times(Mat4.rotation(Math.PI/8, 0, 1, 0));
        let first_piece_transform = roll_transform.times(Mat4.translation(-1.5, -0.70, 0))
            .times(Mat4.rotation(Math.PI/2.0, 1, 0, 0))
            .times(Mat4.scale(1, 1, 1/1.5));

        let roll_pieces_transform = roll_transform.times(Mat4.rotation(Math.PI / 2.0, 0, 1, 0))
        .times(Mat4.scale(1, 1, 1/1.5));

        return [roll_transform, first_piece_transform, roll_pieces_transform];

    }

}
