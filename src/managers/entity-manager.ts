import {Entity, Resolution, FrameData} from '../core/engine.interface';

export class EntityManager {
    constructor() {}

    private entities: Array<Entity> = [];

    register(entity: Entity): boolean {
        if (this.entities.includes(entity)) {
            return false;
        }

        if (!Object.hasOwn(entity, 'isActive')) {
            entity.isActive = true;
        }

        this.entities.push(entity);
        return true;
    }

    delist(entity: Entity): boolean {
        if (this.entities.includes(entity)) {
            const index = this.entities.indexOf(entity);
            this.entities.splice(index, 1);
            return true;
        }
        return false;
    }

    start() {
        for (const entity of this.entities) {
            if (!entity.isActive) continue;
            entity.start?.();
        }
    }

    resize(resolution: Resolution) {
        for (const entity of this.entities) {
            if (!entity.isActive) continue;
            entity.resize?.(resolution);
        }
    }

    update(frameData: FrameData) {
        for (const entity of this.entities) {
            if (!entity.isActive) continue;
            entity.update?.(frameData);
        }
    }

    lateUpdate(frameData: FrameData) {
        for (const entity of this.entities) {
            if (!entity.isActive) continue;
            entity.lateUpdate?.(frameData);
        }
    }

    execute(frameData: FrameData) {
        for (const entity of this.entities) {
            if (!entity.isActive) continue;
            entity.execute?.(frameData);
        }
    }

    finish() {
        for (const entity of this.entities) {
            if (!entity.isActive) continue;
            entity.finish?.();
        }
    }

    destroy() {
        for (let i = this.entities.length - 1; i >= 0; i--) {
            this.entities[i].isActive = false;
            this.entities[i].destroy?.();
        }
    }
}
