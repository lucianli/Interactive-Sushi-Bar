import {defs, tiny} from './examples/common.js';
import {Shape_From_File} from "./examples/obj-file-demo.js";

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture
} = tiny;

const {Cube, Torus, Capped_Cylinder, Phong_Shader, Textured_Phong, Fake_Bump_Map} = defs;


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
        this.trayStartTimes = [];
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

        const light_position = vec4(0, 15, 0, 1);
        // The parameters of the Light are: position, color, size
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 10000)];

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


        for (let i =0 ; i<32; i++) {
            let dist = this.get_segment_transform(t, i, 24);
            let segment_transform = model_transform.times(Mat4.translation(dist, 0,-7))
            .times(Mat4.scale(1, 0.1, 4))
            .times(Mat4.translation(0, -2,0));

            this.shapes.cube.draw(context, program_state, segment_transform, this.materials.conveyor_belt);
        }

        let roll_transform = model_transform.times(Mat4.translation(0, 2.25, 12))
            .times(Mat4.rotation(Math.PI/8, 0, 1, 0));
        let sushipiece_transform = roll_transform.times(Mat4.translation(-1.5, -0.70, 0))
            .times(Mat4.rotation(Math.PI/2.0, 1, 0, 0))
            .times(Mat4.scale(1, 1, 1/1.5));
        this.shapes.capped_cylinder.draw(context, program_state, sushipiece_transform, this.materials.sushi);
        for (let i = 0; i < 4; i++) {
            sushipiece_transform = roll_transform.times(Mat4.rotation(Math.PI / 2.0, 0, 1, 0))
                .times(Mat4.scale(1, 1, 1/1.5));
            this.shapes.capped_cylinder.draw(context, program_state, sushipiece_transform, this.materials.sushi);
            roll_transform = roll_transform.times(Mat4.translation(0.8, 0, 0));
        }

        //tray of sushi
        let noOverlap = t - this.trayStartTimes[this.trayStartTimes.length-1] > 3
        let canFitMore = this.trayStartTimes.length == 0 || (this.trayStartTimes.length < 4 && noOverlap);
        if (this.sendMore && canFitMore) {
            this.trayStartTimes.push(t);
        }
        this.sendMore = false;
        for (let i = 0; i < this.trayStartTimes.length; i++) {
            let timeOffset = t - this.trayStartTimes[i];
            let tray_dist = this.get_segment_transform(timeOffset/5.0, 0, 5);
            let fish_transform = model_transform.times(Mat4.rotation(Math.PI/2.0 ,0,1,0))
                .times(Mat4.scale(1,1,5))
                .times(Mat4.translation(7,2.25, tray_dist));
            let tray_transform = fish_transform.times(Mat4.scale(2,0.2,1))
                .times(Mat4.translation(0,-6,0));

            let tray_leg1_transform = tray_transform.times(Mat4.scale(1,2.5,0.20))
                .times(Mat4.translation(0,-1.2,-3));

            let tray_leg2_transform = tray_leg1_transform.times(Mat4.translation(0,0,6));

            //draw sushi
            let roll_transform = model_transform.times(Mat4.translation(tray_dist*5-0.5, 2.25, -6.75))
                .times(Mat4.rotation(Math.PI/8, 0, 1, 0));
            let sushipiece_transform = roll_transform.times(Mat4.translation(-1.5, -0.70, 0))
                .times(Mat4.rotation(Math.PI/2.0, 1, 0, 0))
                .times(Mat4.scale(1, 1, 1/1.5));
            this.shapes.capped_cylinder.draw(context, program_state, sushipiece_transform, this.materials.sushi);
            for (let i = 0; i < 4; i++) {
                sushipiece_transform = roll_transform.times(Mat4.rotation(Math.PI / 2.0, 0, 1, 0))
                    .times(Mat4.scale(1, 1, 1/1.5));
                this.shapes.capped_cylinder.draw(context, program_state, sushipiece_transform, this.materials.sushi);
                roll_transform = roll_transform.times(Mat4.translation(0.8, 0, 0));
            }
            //set sushi matrix
            this.sushi_cam = roll_transform.times(Mat4.translation(-4, 1, 8));

            //draw tray
            this.shapes.cube.draw(context, program_state, tray_transform, this.materials.tray);
            this.shapes.cube.draw(context, program_state, tray_leg1_transform, this.materials.tray);
            this.shapes.cube.draw(context, program_state, tray_leg2_transform, this.materials.tray);
        }

        //bell
        let bell_transform = model_transform;
        if (t - this.trayStartTimes[this.trayStartTimes.length-1] < 1) {
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

class Texture_Plate extends Textured_Phong {
    fragment_glsl_code() {
        return this.shared_glsl_code() + `
            varying vec2 f_tex_coord;
            uniform sampler2D texture;
            uniform float animation_time;
            
            void main(){
                // Sample the texture image in the correct place:
                vec4 tex_color = texture2D( texture, f_tex_coord );
                
                float dist_to_center = sqrt(pow(f_tex_coord.x-0.5, 2.0) + pow(f_tex_coord.y-0.5, 2.0));
                if (dist_to_center >= 0.3 && dist_to_center <= 0.36) {
                    float color_shift = (dist_to_center-0.3)*3.5;
                    tex_color.x -= color_shift;
                    tex_color.y -= color_shift;
                    tex_color.z -= color_shift;
                }
                
                if( tex_color.w < .01 ) discard;
                                                                         // Compute an initial (ambient) color:
                gl_FragColor = vec4( ( tex_color.xyz + shape_color.xyz ) * ambient, shape_color.w * tex_color.w ); 
                                                                         // Compute the final color with contributions from lights:
                gl_FragColor.xyz += phong_model_lights( normalize( N ), vertex_worldspace );
        } `;
    }
}

class Gouraud_Shader extends Shader {
    // This is a Shader using Phong_Shader as template

    constructor(num_lights = 2) {
        super();
        this.num_lights = num_lights;
    }

    shared_glsl_code() {
        // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
        return ` 
        precision mediump float;
        const int N_LIGHTS = ` + this.num_lights + `;
        uniform float ambient, diffusivity, specularity, smoothness;
        uniform vec4 light_positions_or_vectors[N_LIGHTS], light_colors[N_LIGHTS];
        uniform float light_attenuation_factors[N_LIGHTS];
        uniform vec4 shape_color;
        uniform vec3 squared_scale, camera_center;

        // Specifier "varying" means a variable's final value will be passed from the vertex shader
        // on to the next phase (fragment shader), then interpolated per-fragment, weighted by the
        // pixel fragment's proximity to each of the 3 vertices (barycentric interpolation).
        varying vec3 N, vertex_worldspace;
        // ***** PHONG SHADING HAPPENS HERE: *****                                       
        vec3 phong_model_lights( vec3 N, vec3 vertex_worldspace ){                                        
            // phong_model_lights():  Add up the lights' contributions.
            vec3 E = normalize( camera_center - vertex_worldspace );
            vec3 result = vec3( 0.0 );
            for(int i = 0; i < N_LIGHTS; i++){
                // Lights store homogeneous coords - either a position or vector.  If w is 0, the 
                // light will appear directional (uniform direction from all points), and we 
                // simply obtain a vector towards the light by directly using the stored value.
                // Otherwise if w is 1 it will appear as a point light -- compute the vector to 
                // the point light's location from the current surface point.  In either case, 
                // fade (attenuate) the light as the vector needed to reach it gets longer.  
                vec3 surface_to_light_vector = light_positions_or_vectors[i].xyz - 
                                               light_positions_or_vectors[i].w * vertex_worldspace;                                             
                float distance_to_light = length( surface_to_light_vector );

                vec3 L = normalize( surface_to_light_vector );
                vec3 H = normalize( L + E );
                // Compute the diffuse and specular components from the Phong
                // Reflection Model, using Blinn's "halfway vector" method:
                float diffuse  =      max( dot( N, L ), 0.0 );
                float specular = pow( max( dot( N, H ), 0.0 ), smoothness );
                float attenuation = 1.0 / (1.0 + light_attenuation_factors[i] * distance_to_light * distance_to_light );
                
                vec3 light_contribution = shape_color.xyz * light_colors[i].xyz * diffusivity * diffuse
                                                          + light_colors[i].xyz * specularity * specular;
                result += attenuation * light_contribution;
            }
            return result;
        } `;
    }

    vertex_glsl_code() {
        // ********* VERTEX SHADER *********
        return this.shared_glsl_code() + `
            attribute vec3 position, normal;                            
            // Position is expressed in object coordinates.
            
            uniform mat4 model_transform;
            uniform mat4 projection_camera_model_transform;
    
            void main(){                                                                   
                // The vertex's final resting place (in NDCS):
                gl_Position = projection_camera_model_transform * vec4( position, 1.0 );
                // The final normal vector in screen space.
                N = normalize( mat3( model_transform ) * normal / squared_scale);
                vertex_worldspace = ( model_transform * vec4( position, 1.0 ) ).xyz;
                
                vertex_color = vec4( shape_color.xyz * ambient, shape_color.w );
                vertex_color.xyz += phong_model_lights( normalize( N ), vertex_worldspace );
            } `;
    }

    fragment_glsl_code() {
        // ********* FRAGMENT SHADER *********
        // A fragment is a pixel that's overlapped by the current triangle.
        // Fragments affect the final image or get discarded due to depth.
        return this.shared_glsl_code() + `
            varying vec4 vertex_color;
            
            void main(){                                                           
                // Compute an initial (ambient) color:
                gl_FragColor = vertex_color;
            } `;
    }

    send_material(gl, gpu, material) {
        // send_material(): Send the desired shape-wide material qualities to the
        // graphics card, where they will tweak the Phong lighting formula.
        gl.uniform4fv(gpu.shape_color, material.color);
        gl.uniform1f(gpu.ambient, material.ambient);
        gl.uniform1f(gpu.diffusivity, material.diffusivity);
        gl.uniform1f(gpu.specularity, material.specularity);
        gl.uniform1f(gpu.smoothness, material.smoothness);
    }

    send_gpu_state(gl, gpu, gpu_state, model_transform) {
        // send_gpu_state():  Send the state of our whole drawing context to the GPU.
        const O = vec4(0, 0, 0, 1), camera_center = gpu_state.camera_transform.times(O).to3();
        gl.uniform3fv(gpu.camera_center, camera_center);
        // Use the squared scale trick from "Eric's blog" instead of inverse transpose matrix:
        const squared_scale = model_transform.reduce(
            (acc, r) => {
                return acc.plus(vec4(...r).times_pairwise(r))
            }, vec4(0, 0, 0, 0)).to3();
        gl.uniform3fv(gpu.squared_scale, squared_scale);
        // Send the current matrices to the shader.  Go ahead and pre-compute
        // the products we'll need of the of the three special matrices and just
        // cache and send those.  They will be the same throughout this draw
        // call, and thus across each instance of the vertex shader.
        // Transpose them since the GPU expects matrices as column-major arrays.
        const PCM = gpu_state.projection_transform.times(gpu_state.camera_inverse).times(model_transform);
        gl.uniformMatrix4fv(gpu.model_transform, false, Matrix.flatten_2D_to_1D(model_transform.transposed()));
        gl.uniformMatrix4fv(gpu.projection_camera_model_transform, false, Matrix.flatten_2D_to_1D(PCM.transposed()));

        // Omitting lights will show only the material color, scaled by the ambient term:
        if (!gpu_state.lights.length)
            return;

        const light_positions_flattened = [], light_colors_flattened = [];
        for (let i = 0; i < 4 * gpu_state.lights.length; i++) {
            light_positions_flattened.push(gpu_state.lights[Math.floor(i / 4)].position[i % 4]);
            light_colors_flattened.push(gpu_state.lights[Math.floor(i / 4)].color[i % 4]);
        }
        gl.uniform4fv(gpu.light_positions_or_vectors, light_positions_flattened);
        gl.uniform4fv(gpu.light_colors, light_colors_flattened);
        gl.uniform1fv(gpu.light_attenuation_factors, gpu_state.lights.map(l => l.attenuation));
    }

    update_GPU(context, gpu_addresses, gpu_state, model_transform, material) {
        // update_GPU(): Define how to synchronize our JavaScript's variables to the GPU's.  This is where the shader
        // recieves ALL of its inputs.  Every value the GPU wants is divided into two categories:  Values that belong
        // to individual objects being drawn (which we call "Material") and values belonging to the whole scene or
        // program (which we call the "Program_State").  Send both a material and a program state to the shaders
        // within this function, one data field at a time, to fully initialize the shader for a draw.

        // Fill in any missing fields in the Material object with custom defaults for this shader:
        const defaults = {color: color(0, 0, 0, 1), ambient: 0, diffusivity: 1, specularity: 1, smoothness: 40};
        material = Object.assign({}, defaults, material);

        this.send_material(context, gpu_addresses, material);
        this.send_gpu_state(context, gpu_addresses, gpu_state, model_transform);
    }
}

class Ring_Shader extends Shader {
    update_GPU(context, gpu_addresses, graphics_state, model_transform, material) {
        // update_GPU():  Defining how to synchronize our JavaScript's variables to the GPU's:
        const [P, C, M] = [graphics_state.projection_transform, graphics_state.camera_inverse, model_transform],
            PCM = P.times(C).times(M);
        context.uniformMatrix4fv(gpu_addresses.model_transform, false, Matrix.flatten_2D_to_1D(model_transform.transposed()));
        context.uniformMatrix4fv(gpu_addresses.projection_camera_model_transform, false,
            Matrix.flatten_2D_to_1D(PCM.transposed()));
    }

    shared_glsl_code() {
        // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
        return `
        precision mediump float;
        varying vec4 point_position;
        varying vec4 center;
        `;
    }

    vertex_glsl_code() {
        // ********* VERTEX SHADER *********
        return this.shared_glsl_code() + `
        attribute vec3 position;
        uniform mat4 model_transform;
        uniform mat4 projection_camera_model_transform;
        
        void main(){
          gl_Position = projection_camera_model_transform * vec4( position, 1.0 );
          point_position = vec4( position, 1.0 );
          center = vec4( 0.0, 0.0, 0.0, 1.0 );
        }`;
    }

    fragment_glsl_code() {
        // ********* FRAGMENT SHADER *********
        return this.shared_glsl_code() + `
        uniform vec4 shape_color;
        
        void main(){
          float factor = 0.5 + 0.5 * sin(distance(point_position, center) * 75.0);
          gl_FragColor = vec4(0.7 * factor, 0.5 * factor, 0.25 * factor, 1.0);
        }`;
    }
}
