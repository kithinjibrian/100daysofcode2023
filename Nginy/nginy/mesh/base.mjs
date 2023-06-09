import Vector from "../math/vector.mjs";
import Pubsub from "../utils/pubsub/pubsub.mjs";
import uuid from "../utils/uuid/uuid.mjs";

class Base {
    constructor(opts) {
        const def = {
            pos: { x: 0, y: 0 },
            vel: { x: 0, y: 0 },
            acc: { x: 0, y: 0 },
            name: "base",
            id: uuid(8)
        };

        Object.assign(def, opts);

        this.name = def.name;
        this.id = def.id;
        this.pos = new Vector(def.pos);
        this.vel = new Vector(def.vel);
        this.acc = new Vector(def.acc);
        this.pubsub = Pubsub.get()
    }

    subscribe(event,cb) {
        this.pubsub.subscribe(event,(a,...args)=>{
            if(a.target.id===this.id) {
                cb(...args)
            }
        })
        return this;
    }

    update() {
        const nvel = this.vel.add(this.acc)
        const npos = this.pos.add(nvel);

        this.pos = new Vector(npos)
        this.acc.multiply(0);
    }
}

export default Base;