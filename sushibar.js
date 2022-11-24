import {defs, tiny} from './examples/common.js';
import {Shape_From_File} from "./examples/obj-file-demo.js";
import {Sushi} from "./sushi.js";

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture
} = tiny;

const {Cube, Torus, Capped_Cylinder, Phong_Shader, Textured_Phong, Fake_Bump_Map} = defs;

import {Texture_Plate} from './sushibar-shaders.js';


export class SushiBar extends Scene {
    constructor() {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();

        this.segment_colors = [];

        for (let i =0 ; i<41; i++) {
            let tint = 0.2*Math.random()-0.1;
            this.segment_colors.push(color(0.6+tint, 0.3+tint, 0.1+tint, 1.0));
        }


        // At the beginning of our program, load one of each of these shape definitions onto the GPU.
        this.shapes = {
            torus: new Torus(7, 25),
            cube: new Cube(),
            capped_cylinder: new Capped_Cylinder(6, 24),
            bell: new Shape_From_File("assets/bell.obj"),
            plate: new Shape_From_File("assets/plate.obj")
        };

        // *** Materials
        this.materials = {
            phong_white: new Material(new Phong_Shader(), {
                ambient: .4,
                diffusivity: .6,
                color: hex_color("#ffffff")
            }),
            placemat: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1,
                texture: new Texture("assets/placemat.png")
            }),
            plate: new Material(new Texture_Plate(), {
                color: hex_color("#000000"),
                ambient: 1,
                texture: new Texture("assets/plate.png")
            }),
            bell: new Material(new Phong_Shader(), {
                color: hex_color("#ab8d24"),
                ambient: 1,
                specularity: 0
            }),
            conveyor_belt: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1,
                texture: new Texture("assets/belt.png")
            }),
            wall: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1,
                texture: new Texture("assets/wall.png")
            }),
            table: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1,
                texture: new Texture("assets/table.png")
            }),
            tray: new Material(new Phong_Shader(), {
                color: hex_color("#111111"),
                ambient: 1,
                specularity: 1
            }),
            sushi: new Material(new Fake_Bump_Map(), {
                color: hex_color("#111111"),
                ambient: 1,
                diffusivity: 0,
                specularity: 0,
                texture: new Texture("assets/rice.png")
            })
        };

        this.initial_camera_location = Mat4.look_at(vec3(0, 5, 20), vec3(0, 0, 0), vec3(0, 1, 0));

        this.sushi_cam = this.initial_camera_location;

        this.sendMore = false;
        this.sushi_rolls = [];
        this.ringbell_time = 0;
    }

    make_control_panel() {
        // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
            this.key_triggered_button("Ring bell for more sushi", ["Control", "r"], () => this.sendMore = true);
            this.new_line();
            this.key_triggered_button("View bar", ["Control", "b"], () => this.attached = () => this.initial_camera_location);
            this.new_line();
            this.key_triggered_button("View plate", ["Control", "p"], () => this.attached = () => this.plate_cam);
            this.new_line();
            this.key_triggered_button("View sushi", ["Control", "s"], () => this.attached = () => this.sushi_cam);
        ;
        this.new_line();
    }

    //Takes time t, an offset for the location (for loops) and a bounds
    //will get x/y/z distance within bounds for a given time
    get_segment_transform(t, offset, bound) {
        let dist = bound - ((4*t + (offset * 2)) % (bound*2));
        return dist;
    }

    display(context, program_state) {
        // display():  Called once per frame of animation.
        // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            // Define the global camera and projection matrices, which are stored in program_state.
            program_state.set_camera(this.initial_camera_location);
        }

        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, .1, 1000);

        const light1_position = vec4(0, 7, 0, 1);
        // The parameters of the Light are: position, color, size
        program_state.lights = [new Light(light1_position, color(1, 0.7, 0.7, 1), 10000)];

        const t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;
        let model_transform = Mat4.identity();

        //table
        let table_transform = model_transform.times(Mat4.translation(0, -5, 0))
            .times(Mat4.scale(25, 1/2, 7));
        this.shapes.cube.draw(context, program_state, table_transform, this.materials.table);

        //placemat
        let placemat_transform = model_transform.times(Mat4.translation(0, -4.4, 1))
            .times(Mat4.scale(7, 1/50, 5));
        this.shapes.cube.draw(context, program_state, placemat_transform, this.materials.placemat);

        //plate
        let plate_transform = model_transform.times(Mat4.translation(0, -4.2, 1))
            .times(Mat4.scale(2, 1, 2))
            .times(Mat4.rotation(-Math.PI/2, 1, 0, 0));
        this.shapes.plate.draw(context, program_state, plate_transform, this.materials.plate);
        //set plate matrix using placemat
        //this.plate = this.initial_camera_location.times(Mat4.translation(0, 6, 9));
        this.plate_cam = placemat_transform.times(Mat4.scale(1/7, 25, 1/5))
            .times(Mat4.translation(0, 7, 8))
            .times(Mat4.rotation(-0.8, 1, 0, 0));

        //chopsticks
        let chopsticks_transform = model_transform.times(Mat4.translation(4.5, -4.3, 1))
            .times(Mat4.rotation(-Math.PI/50, 0, 1, 0))
            .times(Mat4.scale(1/10, 1/10, 3));
        this.shapes.cube.draw(context, program_state, chopsticks_transform, this.materials.phong_white.override({color: hex_color("#763e03")}));
        chopsticks_transform = model_transform.times(Mat4.translation(5.25, -4.3, 1))
            .times(Mat4.rotation(Math.PI/50, 0, 1, 0))
            .times(Mat4.scale(1/10, 1/10, 3));
        this.shapes.cube.draw(context, program_state, chopsticks_transform, this.materials.phong_white.override({color: hex_color("#763e03")}));

        //back wall
        let back_transform = model_transform.times(Mat4.translation(0, -3, -7))
            .times(Mat4.scale(25, 2.5, 1/2));
        this.shapes.cube.draw(context, program_state, back_transform, this.materials.wall);
        

        //conveyor belt
        let conveyor_transform = model_transform.times(Mat4.translation(0, 0, -7))
            .times(Mat4.scale(25, 1/5, 4))
            .times(Mat4.translation(0, -2.5, 0));
        this.shapes.cube.draw(context, program_state, conveyor_transform, this.materials.wall);

        //draws each belt segment
        for (let i =0 ; i<32; i++) {
            let dist = this.get_segment_transform(t, i, 24);
            let segment_transform = model_transform.times(Mat4.translation(dist, 0,-7))
            .times(Mat4.scale(1, 0.1, 4))
            .times(Mat4.translation(0, -2,0));

            this.shapes.cube.draw(context, program_state, segment_transform, this.materials.conveyor_belt);
        }

        
        //Draw Sushi Rolls

        let noOverlap = this.sushi_rolls.length == 0 || (t - this.sushi_rolls[this.sushi_rolls.length - 1].get_start() > 3);
        let canFitMore = this.sushi_rolls.length == 0 || (this.sushi_rolls.length < 4 && noOverlap);
        if (this.sendMore && canFitMore) {
            this.sushi_rolls.push(new Sushi(t));
            this.ringbell_time = t;
        }
        this.sendMore = false;

        for (let i = 0; i < this.sushi_rolls.length; i++) {
            let cur_sushi = this.sushi_rolls[i];

            let [tray_transform, tray_leg1_transform, tray_leg2_transform] = cur_sushi.get_tray_transforms(t);
            let [roll_transform, first_piece_transform, roll_pieces_transform] = cur_sushi.get_sushi_transforms(t);
            
            //draw horizontal sushi
            this.shapes.capped_cylinder.draw(context, program_state, first_piece_transform, this.materials.phong_white.override({color: hex_color("#107528")}));
            
            //draw vertical sushis
            for (let i = 0; i < 4; i++) {
                this.shapes.capped_cylinder.draw(context, program_state, roll_pieces_transform, this.materials.phong_white.override({color: hex_color("#107528")}));
                roll_transform = roll_transform.times(Mat4.translation(0.8, 0, 0));
                roll_pieces_transform = roll_transform.times(Mat4.rotation(Math.PI / 2.0, 0, 1, 0))
                    .times(Mat4.scale(1, 1, 1/1.5));
            }

            //set sushi camera pointer
            this.sushi_cam = roll_transform.times(Mat4.translation(-4, 1, 8));

            //draw tray
            this.shapes.cube.draw(context, program_state, tray_transform, this.materials.tray);
            this.shapes.cube.draw(context, program_state, tray_leg1_transform, this.materials.tray);
            this.shapes.cube.draw(context, program_state, tray_leg2_transform, this.materials.tray);
        }

        //bell
        let bell_transform = model_transform;
        if (this.ringbell_time != 0 && t - this.ringbell_time < 1) {
            bell_transform = bell_transform.times(Mat4.translation(-10, -2.5, 3))
                .times(Mat4.rotation(-0.35, 1, 0, 0))
                .times(Mat4.rotation(0.3*Math.sin(15*t), 0, 0, 1));
        }
        else {
            bell_transform = bell_transform.times(Mat4.translation(-10, -3.3, 3))
                .times(Mat4.rotation(-0.35, 1, 0, 0));
        }
        this.shapes.bell.draw(context, program_state, bell_transform, this.materials.bell);

        //camera matrix
        if (this.attached != undefined)
        {
            let desired;
            if (this.attached() == this.initial_camera_location)
            {
                desired = this.attached();
            }
            else
            {
                desired = Mat4.inverse(this.attached());
            }
            program_state.camera_inverse = desired.map((x, i) =>
                Vector.from(program_state.camera_inverse[i]).mix(x, 0.1));
        }
    }

    show_explanation(document_element) {
        document_element.innerHTML += "<h1>CS174A Final Project: Interactive Sushi Bar</h1>";
    }
}