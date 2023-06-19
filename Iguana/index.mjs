import Event from "./event/event.mjs";
import pubsub from "./pubsub/pubsub.mjs";
import Box from "./tools/selection/box.mjs";
import Brush from "./tools/brushes/brush.mjs";
import Renderer from "./renderer/renderer.mjs";
import Layers from "./layer/layer.mjs";
import loadImage from "./utils/upload.mjs";
import Caretaker from "./memento/caretaker.mjs";

const { createApp, ref, onMounted, reactive, watch } = Vue;
const { createVuetify } = Vuetify;

const vuetify = createVuetify()

const app = createApp({
    setup() {
        //data
        const canvas = ref(null),
            tab = null,
            caretaker = reactive(Caretaker.get()),
            mementos = caretaker.getMementos(),
            layers = reactive(Layers.get()),
            listLayers = layers.getLayers(),
            brush = new Brush().listen();

        let isBoxSelected = false,
            isBrushSelected = false;
        //classes that use canvas after dom is mounted
        let event, box, renderer;
        //onmount dom
        onMounted(() => {
            const cnvs = canvas.value;
            renderer = new Renderer(cnvs)
            event = new Event(cnvs).listen();
            box = Box.get().listen();
        });          

        //event listeners
        pubsub.subscribe("drawbox", (dim) => {
            layers.add("selection", dim);
            renderer.render();
        })

        pubsub.subscribe("drawn", (dim) => {
            layers.add("selection", dim);
            renderer.render();
            caretaker.saveMemento(layers);
        })

        pubsub.subscribe("drawbrush", (dim) => {
            layers.add("brush", dim);
            renderer.render();
        })

        pubsub.subscribe("brushdrawn", (dim) => {
            layers.add("brush", dim);
            renderer.render();
            caretaker.saveMemento(layers);
            console.log(caretaker)
        })

        //methods
        const boxActivate = (e) => {
            box.setBoxSelection(e);
            pubsub.publish("boxselected", null);
        }

        const brushActivate = (e) => {
            brush.setBrushSelection(e);
            pubsub.publish("brushselected", null);
        }

        const activate = (e,state) => {
            switch(e) {
                case "box":
                    boxActivate(state)
                    break;
                case "brush":
                    brushActivate(state)
                    break;
            }
        }

        const addImage = async (image) => {
            const a = await loadImage(image);
            layers.add("image", {
                blendingMode: "normal"
            }, a);
            renderer.render();
            caretaker.saveMemento(layers);
        }

        const addAdjustment = (a, ...args) => {
            layers.add(a, ...args)
            renderer.render();
            caretaker.saveMemento(layers);
        }

        const urdo = (a) => {
            caretaker.restoreMemento(a);
            renderer.render();
        }

        return {
            canvas,
            isBoxSelected,
            isBrushSelected,
            listLayers,
            mementos,
            tab,
            //methods
            activate,
            addImage,
            addAdjustment,
            urdo
        }
    }
})

app.use(vuetify).mount('#app')