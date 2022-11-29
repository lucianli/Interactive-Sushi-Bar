import {defs, tiny} from './examples/common.js';
import {Shape_From_File} from "./examples/obj-file-demo.js";
import {Sushi} from "./sushi.js";
import {Color_Phong_Shader, Shadow_Textured_Phong_Shader,
    Depth_Texture_Shader_2D, Buffered_Texture, LIGHT_DEPTH_TEX_SIZE} from "./examples/shadow-demo-shaders.js";

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture
} = tiny;

const {Cube, Torus, Capped_Cylinder, Subdivision_Sphere, Phong_Shader, Textured_Phong, Fake_Bump_Map, Surface_Of_Revolution} = defs;


export class SushiBar extends Scene {
    constructor() {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();

        this.segment_colors = [];

        for (let i =0 ; i<41; i++) {
            let tint = 0.2*Math.random()-0.1;
            this.segment_colors.push(color(0.6+tint, 0.3+tint, 0.1+tint, 1.0));
        }

        const bell_points = Vector3.cast([0, 0, 1.25], [0.3, 0, 1.2], [0.4, 0, 0.85], [0.45, 0, 0.65], [0.53, 0, 0.5], [0.65, 0, 0.4], [0.78, 0, 0.27], [0.82, 0, 0.18], [0.85, 0, 0], [0, 0, 0], [0, 0, 1.25]);
        const lightbulb_points = Vector3.cast([0, 0, 0.8], [0.15, 0, 0.8], [0.2, 0, 0.5], [0.3, 0, 0.3], [0.45, 0, 0.1], [0.5, 0, 0], [0.52, 0, -0.1], [0.5, 0, -0.2], [0.45, 0, -0.3], [0.3, 0, -0.42], [0.15, 0, -0.48], [0, 0, -0.5]);
        const lightshade_points = Vector3.cast([0, 0, 2], [0.15, 0, 2], [0.15, 0, 0], [1.25, 0, -1.25], [1.1, 0, -1.25], [0, 0, 0]);

        // At the beginning of our program, load one of each of these shape definitions onto the GPU.
        this.shapes = {
            torus: new Torus(7, 25),
            cube: new Cube(),
            capped_cylinder: new Capped_Cylinder(6, 24),
            bell: new Surface_Of_Revolution(15, 15, bell_points),
            plate: new Shape_From_File("assets/plate.obj"),
            sphere: new Subdivision_Sphere(4),
            lightbulb: new Surface_Of_Revolution(15, 15, lightbulb_points),
            lightshade: new Surface_Of_Revolution(15, 15, lightshade_points)
        };

        // *** Materials
        this.materials = {
            phong_white: new Material(new Phong_Shader(), {
                ambient: 1,
                diffusivity: 1,
                color: hex_color("#ffffff")
            }),
            placemat: new Material(new Shadow_Textured_Phong_Shader(1), {
                color: color(0.3, 0.3, 0.3, 1),
                ambient: 0.7, diffusivity: 0.5, specularity: 0.5,
                color_texture: new Texture("assets/placemat.png"),
                light_depth_texture: null
            }),
            plate: new Material(new Shadow_Textured_Phong_Shader(1), {
                color: color(0.25, 0.25, 0.25, 1),
                ambient: 0.7, diffusivity: 0.5, specularity: 0.5,
                color_texture: new Texture("assets/plate.png"),
                light_depth_texture: null
            }),
            chopstick: new Material(new Shadow_Textured_Phong_Shader(1), {
                color: hex_color("#763e03"), ambient: 0.5, diffusivity: 1, specularity: 0.5,
                color_texture: null,
                light_depth_texture: null
            }),
            bell: new Material(new Shadow_Textured_Phong_Shader(1), {
                color: hex_color("#8f6e01"), ambient: 1, diffusivity: 0.8, specularity: 1,
                color_texture: null,
                light_depth_texture: null
            }),
            handle: new Material(new Shadow_Textured_Phong_Shader(1), {
                color: hex_color("#361e03"), ambient: 1, diffusivity: 0.8, specularity: 0.8,
                color_texture: null,
                light_depth_texture: null
            }),
            conveyor_belt: new Material(new Shadow_Textured_Phong_Shader(1), {
                color: color(0.5, 0.5, 0.5, 1),
                ambient: 0.5, diffusivity: 0.5, specularity: 0.5,
                color_texture: new Texture("assets/belt.png"),
                light_depth_texture: null
            }),
            wall: new Material(new Shadow_Textured_Phong_Shader(1), {
                color: color(0.5, 0.5, 0.5, 1),
                ambient: 0.5, diffusivity: 0.5, specularity: 0.5,
                color_texture: new Texture("assets/wall.png"),
                light_depth_texture: null
            }),
            table: new Material(new Shadow_Textured_Phong_Shader(1), {
                color: color(0.4, 0.4, 0.4, 1),
                ambient: 0.6, diffusivity: 0.5, specularity: 0.5,
                color_texture: new Texture("assets/table.png"),
                light_depth_texture: null
            }),
            pure: new Material(new Color_Phong_Shader(), {}),
            tray: new Material(new Shadow_Textured_Phong_Shader(1), {
                color: color(0.1, 0.1, 0.1, 1),
                ambient: 1, diffusivity: 0.6, specularity: 0.5,
                color_texture: null,
                light_depth_texture: null
            }),
            sushi: new Material(new Shadow_Textured_Phong_Shader(1), {
                color: color(0.1, 0.35, 0.15, 1),
                ambient: 0.6, diffusivity: 0.6, specularity: 0.6,
                color_texture: null,
                light_depth_texture: null
            }),
            light: new Material(new Phong_Shader(), {
                color: hex_color("#fff8c5"), ambient: 1, diffusivity: 0, specularity: 0
            }),
            lightshade: new Material(new Phong_Shader(), {
                color: hex_color("bb2222"), ambient: 0.8, diffusivity: 1, specularity: 1
            }),
            rice: new Material(new Fake_Bump_Map(), {
                color: hex_color("#111111"),
                ambient: 1,
                diffusivity: 0,
                specularity: 0,
                texture: new Texture("assets/rice.png")
            }),
            seaweed: new Material(new Textured_Phong(), {
                color: hex_color("#111111"),
                ambient: 1,
                diffusivity: 0,
                specularity: 0,
                texture: new Texture("assets/seaweed.jpg")
            }),
            salmon: new Material(new Fake_Bump_Map(), {
                color: hex_color("#111111"),
                ambient: 1,
                diffusivity: 0,
                specularity: 0,
                texture: new Texture("assets/salmon.jpg")
            })
        };

        this.initial_camera_location = Mat4.look_at(vec3(0, 9, 20), vec3(0, 0, 0), vec3(0, 1, 0));

        this.sushi_cam = this.initial_camera_location;

        this.sendMore = false;
        this.sushi_rolls = [];

        this.mouse_coord = Mat4.translation(0, 0,0);

        //select sushi is index in sushi_rolls of currently selected sushi
        this.selected_sushi = null;
        this.ringbell_time = 0;

        this.init_ok = false;
    }

    //Removes a sushi to "eat" it 
    eat_sushi() {
        for (let i = 0; i < this.sushi_rolls.length; i++) {
            let cur_sushi = this.sushi_rolls[i];
            if (cur_sushi.tray_location == "placed") {
                if(this.sushi_rolls.length == 1) {
                    this.sushi_rolls = []
                } else {
                    this.sushi_rolls.splice(i, i);
                }
            }
        }
        
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
            this.new_line();
            this.key_triggered_button("Eat Sushi", ["Control", "e"], () => this.eat_sushi());
            this.new_line();
    }

    my_mouse_down(e, pos, context, program_state) {
        let pos_ndc_near = vec4(pos[0], pos[1], -1.0, 1.0);
        let pos_ndc_far  = vec4(pos[0], pos[1],  1.0, 1.0);
        let center_ndc_near = vec4(0.0, 0.0, -1.0, 1.0);
        let P = this.projection_transform;
        let V = program_state.camera_inverse;
        let pos_world_near = Mat4.inverse(P.times(V)).times(pos_ndc_near);
        let pos_world_far  = Mat4.inverse(P.times(V)).times(pos_ndc_far);
        let center_world_near  = Mat4.inverse(P.times(V)).times(center_ndc_near);
        pos_world_near.scale_by(1 / pos_world_near[3]);
        pos_world_far.scale_by(1 / pos_world_far[3]);
        center_world_near.scale_by(1 / center_world_near[3]);
        

        //our scene is somewhere between the near center world and the far world
        //we use the ratio to find where our table is
        let near_far_ratio = 0.0105;
        let world_coord = center_world_near.times(1-near_far_ratio).plus(pos_world_far.times(near_far_ratio));
        return world_coord;
    }

    //Takes time t, an offset for the location (for loops) and a bounds
    //will get x/y/z distance within bounds for a given time
    get_segment_transform(t, offset, bound) {
        let dist = bound - ((4*t + (offset * 2)) % (bound*2));
        return dist;
    }

    texture_buffer_init(gl) {
        // Depth Texture
        this.lightDepthTexture = gl.createTexture();
        // Bind it to TinyGraphics
        this.light_depth_texture = new Buffered_Texture(this.lightDepthTexture);
        this.materials.table.light_depth_texture = this.light_depth_texture
        this.materials.placemat.light_depth_texture = this.light_depth_texture
        this.materials.plate.light_depth_texture = this.light_depth_texture
        this.materials.conveyor_belt.light_depth_texture = this.light_depth_texture
        this.materials.wall.light_depth_texture = this.light_depth_texture
        this.materials.bell.light_depth_texture = this.light_depth_texture
        this.materials.handle.light_depth_texture = this.light_depth_texture
        this.materials.chopstick.light_depth_texture = this.light_depth_texture
        this.materials.sushi.light_depth_texture = this.light_depth_texture
        this.materials.tray.light_depth_texture = this.light_depth_texture

        this.lightDepthTextureSize = LIGHT_DEPTH_TEX_SIZE;
        gl.bindTexture(gl.TEXTURE_2D, this.lightDepthTexture);
        gl.texImage2D(
            gl.TEXTURE_2D,      // target
            0,                  // mip level
            gl.DEPTH_COMPONENT, // internal format
            this.lightDepthTextureSize,   // width
            this.lightDepthTextureSize,   // height
            0,                  // border
            gl.DEPTH_COMPONENT, // format
            gl.UNSIGNED_INT,    // type
            null);              // data
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        // Depth Texture Buffer
        this.lightDepthFramebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.lightDepthFramebuffer);
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,       // target
            gl.DEPTH_ATTACHMENT,  // attachment point
            gl.TEXTURE_2D,        // texture target
            this.lightDepthTexture,         // texture
            0);                   // mip level
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        // create a color texture of the same size as the depth texture
        // see article why this is needed_
        this.unusedTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.unusedTexture);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            this.lightDepthTextureSize,
            this.lightDepthTextureSize,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            null,
        );
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        // attach it to the framebuffer
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,        // target
            gl.COLOR_ATTACHMENT0,  // attachment point
            gl.TEXTURE_2D,         // texture target
            this.unusedTexture,         // texture
            0);                    // mip level
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    render_scene(context, program_state, t, shadow_pass=false, draw_light_source=false, draw_shadow=false) {
        // shadow_pass: true if this is the second pass that draw the shadow.
        // draw_light_source: true if we want to draw the light source.
        // draw_shadow: true if we want to draw the shadow
        

        let model_transform = Mat4.identity();
        program_state.draw_shadow = draw_shadow;

        if (draw_light_source && shadow_pass) {
            let light_transform = model_transform.times(Mat4.translation(0, 12, 0))
                .times(Mat4.rotation(0.15*Math.cos(2*t), 0, 0, 1))
                .times(Mat4.translation(0, -5, 0))
                .times(Mat4.rotation(-Math.PI/2, 1, 0, 0));
            this.shapes.lightbulb.draw(context, program_state, light_transform, this.materials.light);
            let lightshade_transform = light_transform.times(Mat4.translation(0, 0, 1.15));
            this.shapes.lightshade.draw(context, program_state, lightshade_transform, this.materials.lightshade);
        }

        //table
        let table_transform = model_transform.times(Mat4.translation(0, -5, 0))
            .times(Mat4.scale(25, 1/2, 7));
        this.shapes.cube.draw(context, program_state, table_transform, shadow_pass ? this.materials.table : this.materials.pure);

        //placemat
        let placemat_transform = model_transform.times(Mat4.translation(0, -4.4, 1))
            .times(Mat4.scale(7, 1/50, 5));
        this.shapes.cube.draw(context, program_state, placemat_transform, shadow_pass ? this.materials.placemat : this.materials.pure);

        //plate
        let plate_transform = model_transform.times(Mat4.translation(0, -4.2, 1))
            .times(Mat4.scale(2, 2, 2))
            .times(Mat4.rotation(-Math.PI/2, 1, 0, 0));
        this.shapes.plate.draw(context, program_state, plate_transform, shadow_pass ? this.materials.plate : this.materials.pure);
        //set plate matrix using placemat
        this.plate_cam = placemat_transform.times(Mat4.scale(1/7, 25, 1/5))
            .times(Mat4.translation(0, 7, 8))
            .times(Mat4.rotation(-0.8, 1, 0, 0));

        //chopsticks
        let chopsticks_transform = model_transform.times(Mat4.translation(4.5, -4.3, 1))
            .times(Mat4.rotation(-Math.PI/50, 0, 1, 0))
            .times(Mat4.scale(1/10, 1/10, 3));
        this.shapes.cube.draw(context, program_state, chopsticks_transform, shadow_pass ? this.materials.chopstick : this.materials.pure);
        chopsticks_transform = model_transform.times(Mat4.translation(5.25, -4.3, 1))
            .times(Mat4.rotation(Math.PI/50, 0, 1, 0))
            .times(Mat4.scale(1/10, 1/10, 3));
        this.shapes.cube.draw(context, program_state, chopsticks_transform, shadow_pass ? this.materials.chopstick : this.materials.pure);

        //back wall
        let back_transform = model_transform.times(Mat4.translation(0, -3, -7))
            .times(Mat4.scale(25, 2.5, 1/2));
        this.shapes.cube.draw(context, program_state, back_transform, shadow_pass ? this.materials.wall : this.materials.pure);


        //conveyor belt
        let conveyor_transform = model_transform.times(Mat4.translation(0, 0, -7))
            .times(Mat4.scale(25, 1/5, 4))
            .times(Mat4.translation(0, -2.5, 0));
        this.shapes.cube.draw(context, program_state, conveyor_transform, shadow_pass ? this.materials.wall : this.materials.pure);

        //draws each belt segment
        for (let i =0 ; i<32; i++) {
            let dist = this.get_segment_transform(t, i, 24);
            let segment_transform = model_transform.times(Mat4.translation(dist, 0,-7))
                .times(Mat4.scale(1, 0.1, 4))
                .times(Mat4.translation(0, -2,0));

            this.shapes.cube.draw(context, program_state, segment_transform, shadow_pass ? this.materials.conveyor_belt : this.materials.pure);
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

            //If we are currently trying to place tray or it has already been placed,
            //then we want to alter the sushi location
            if(cur_sushi.tray_location != "on belt") {
                let cur_coord = null;

                if (cur_sushi.tray_location == "placing") {
                    cur_coord = this.mouse_coord;

                } else if (cur_sushi.tray_location == "placed") {
                    cur_coord = cur_sushi.placed_coords;

                }

                let translate_factor = 0.40;
                tray_transform = Mat4.identity()
                    .times(Mat4.rotation(Math.PI/2.0 ,0,1,0))
                    .times(Mat4.scale(1,1,5))
                    .times(Mat4.translation(translate_factor*cur_coord[2],translate_factor*cur_coord[1], translate_factor*cur_coord[0]))
                    .times(Mat4.scale(2,0.2,1))
                    .times(Mat4.translation(0,-17,0));

                tray_leg1_transform = tray_transform.times(Mat4.scale(1,2.5,0.20))
                    .times(Mat4.translation(0,-1.2,-3));

                tray_leg2_transform = tray_leg1_transform.times(Mat4.translation(0,0,6));

                roll_transform = Mat4.translation(translate_factor*cur_coord[0]*5,translate_factor*cur_coord[1]-2.25, translate_factor*cur_coord[2]-9.75)
                    .times(Mat4.rotation(Math.PI/8, 0, 1, 0));
                first_piece_transform = roll_transform.times(Mat4.translation(-1.5, -0.70, 0))
                    .times(Mat4.rotation(Math.PI/2.0, 1, 0, 0))
                    .times(Mat4.scale(1, 1, 1/1.5));

                roll_pieces_transform = roll_transform.times(Mat4.rotation(Math.PI / 2.0, 0, 1, 0))
                    .times(Mat4.scale(1, 1, 1/1.5));
            }

            this.shapes.capped_cylinder.draw(context, program_state, first_piece_transform.times(Mat4.scale(1.1, 1.1, 0.9)), this.materials.seaweed);
            this.shapes.capped_cylinder.draw(context, program_state, first_piece_transform.times(Mat4.scale(0.5, 0.5, 1.1)), this.materials.salmon);
            this.shapes.capped_cylinder.draw(context, program_state, first_piece_transform, this.materials.rice);
            
            //draw vertical sushis
            for (let i = 0; i < 4; i++) {
                this.shapes.capped_cylinder.draw(context, program_state, roll_pieces_transform.times(Mat4.scale(1.1, 1.1, 0.9)), this.materials.seaweed);
                this.shapes.capped_cylinder.draw(context, program_state, roll_pieces_transform.times(Mat4.scale(0.5, 0.5, 1.1)), this.materials.salmon);
                this.shapes.capped_cylinder.draw(context, program_state, roll_pieces_transform, this.materials.rice);
                roll_transform = roll_transform.times(Mat4.translation(0.8, 0, 0));
                roll_pieces_transform = roll_transform.times(Mat4.rotation(Math.PI / 2.0, 0, 1, 0))
                    .times(Mat4.scale(1, 1, 1/1.5));
            }

            //set sushi camera pointer
            this.sushi_cam = roll_transform.times(Mat4.translation(-4, 1, 8));

            //draw tray
            this.shapes.cube.draw(context, program_state, tray_transform, shadow_pass ? this.materials.tray : this.materials.pure);
            this.shapes.cube.draw(context, program_state, tray_leg1_transform, shadow_pass ? this.materials.tray : this.materials.pure);
            this.shapes.cube.draw(context, program_state, tray_leg2_transform, shadow_pass ? this.materials.tray : this.materials.pure);
        }

        //bell
        let bell_transform = model_transform;
        let handle_transform = model_transform;
        if (this.ringbell_time != 0 && t - this.ringbell_time < 1) {
            handle_transform = handle_transform.times(Mat4.translation(-10, -1.75, 3))
                .times(Mat4.rotation(-Math.PI/2, 1, 0, 0))
                .times(Mat4.rotation(0.2*Math.sin(15*t), 0, 1, 0))
                .times(Mat4.scale(1/7, 1/7, 2));
            bell_transform = handle_transform.times(Mat4.scale(7, 7, 1/2))
                .times(Mat4.translation(0, 0, -2.25));
        }
        else {
            bell_transform = bell_transform.times(Mat4.translation(-10, -4.5, 3))
                .times(Mat4.rotation(-Math.PI/2, 1, 0, 0));
            handle_transform = handle_transform.times(Mat4.translation(-10, -2.25, 3))
                .times(Mat4.rotation(-Math.PI/2, 1, 0, 0))
                .times(Mat4.scale(1/7, 1/7, 2));
        }
        this.shapes.bell.draw(context, program_state, bell_transform, shadow_pass ? this.materials.bell : this.materials.pure);
        this.shapes.capped_cylinder.draw(context, program_state, handle_transform, shadow_pass ? this.materials.handle : this.materials.pure);

    }

    display(context, program_state) {
        // display():  Called once per frame of animation.
        const gl = context.context;

        if (!this.init_ok) {
            const ext = gl.getExtension('WEBGL_depth_texture');
            if (!ext) {
                return alert('need WEBGL_depth_texture');  // eslint-disable-line
            }
            this.texture_buffer_init(gl);

            this.init_ok = true;
        }

        // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            // Define the global camera and projection matrices, which are stored in program_state.
            program_state.set_camera(this.initial_camera_location);

            let canvas = context.canvas;
            const mouse_position = (e, rect = canvas.getBoundingClientRect()) =>
                vec((e.clientX - (rect.left + rect.right) / 2) / ((rect.right - rect.left) / 2),
                    (e.clientY - (rect.bottom + rect.top) / 2) / ((rect.top - rect.bottom) / 2));

            canvas.addEventListener("mousedown", e => {
                e.preventDefault();
                let coords = this.my_mouse_down(e, mouse_position(e), context, program_state);


                //already have a selected sushi that we are placing
                if (this.selected_sushi != null) {

                    //check to see if intersects with any placed sushis
                    for (let i = 0; i < this.sushi_rolls.length; i++) {
                        let cur_sushi = this.sushi_rolls[i];
                        let width = 5;
                        if (cur_sushi.tray_location == "placed" && coords[0] < cur_sushi.placed_coords[0] + width && coords[0] > cur_sushi.placed_coords[0] - width) {
                            return;
                        }
                    }

                    //Successfully place sushi and set coordinates
                    coords[1] = 0.0;
                    coords[2] = 12.0;
                    this.sushi_rolls[this.selected_sushi].place_sushi(coords);
                    this.selected_sushi = null;
                } else {
                    //don't have a selected sushi
                    if(this.sushi_rolls.length > 0) {
                        if(coords[1] < 7.0 && coords[1] > 5.0) {
                            for (let i = 0; i < this.sushi_rolls.length; i++) {
                                let cur_sushi = this.sushi_rolls[i];
                                //if sushi is not on belt, don't care
                                if (cur_sushi.tray_location != "on belt") {
                                    continue;
                                }
                                t = program_state.animation_time / 1000
                                let x_dist = 2 * cur_sushi.get_sushi_dist((t-cur_sushi.start_time) / 5.0, 0, 5);
                                let range = 2;
                                //check to see if we hit the hitbox of the sushi
                                if(coords[0] < x_dist + range && coords[0] > x_dist - range) {
                                    //We are now placing that sushi
                                    cur_sushi.tray_location = "placing";
                                    this.selected_sushi = i;
                                }
                            }
                        }
                    }
                }
            });


            canvas.addEventListener("mousemove", e => {
                e.preventDefault();
                const rect = canvas.getBoundingClientRect()
                let coords = this.my_mouse_down(e, mouse_position(e), context, program_state);
                coords[1] = 0.0;
                coords[2] = 12.0;

                //sets class var mouse coords to the position of the mouse
                this.mouse_coord = coords;
            });
        }

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

        let t = program_state.animation_time / 1000;

        let light_transform = Mat4.translation(0, 10, 0)
            .times(Mat4.rotation(0.15*Math.cos(2*t), 0, 0, 1))
            .times(Mat4.translation(0, -10, 0))
        this.light_position = light_transform.times(vec4(0, 4, 0, 1));
        this.light_view_target = vec4(0, 0, 0, 1);
        this.light_field_of_view = 160*Math.PI/180;
        program_state.lights = [new Light(this.light_position, hex_color("#ffffff"), 1000)];

        const light_view_mat = Mat4.look_at(
            vec3(this.light_position[0], this.light_position[1], this.light_position[2]),
            vec3(this.light_view_target[0], this.light_view_target[1], this.light_view_target[2]),
            vec3(0, 1, 0)
        );
        const light_proj_mat = Mat4.perspective(this.light_field_of_view, 1, 0.5, 500);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.lightDepthFramebuffer);
        gl.viewport(0, 0, this.lightDepthTextureSize, this.lightDepthTextureSize);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        program_state.light_view_mat = light_view_mat;
        program_state.light_proj_mat = light_proj_mat;
        program_state.light_tex_mat = light_proj_mat;
        program_state.view_mat = light_view_mat;
        program_state.projection_transform = light_proj_mat;
        this.render_scene(context, program_state, t, false,false, false);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        program_state.view_mat = program_state.camera_inverse;
        program_state.projection_transform = Mat4.perspective(Math.PI / 4, context.width / context.height, 0.5, 500);
        this.render_scene(context, program_state, t,true, true, true);

        this.projection_transform = Mat4.perspective(Math.PI / 4, context.width / context.height, .1, 1000);
    }

    show_explanation(document_element) {
        document_element.innerHTML += "<h1>CS174A Final Project: Interactive Sushi Bar</h1>";
    }
}
