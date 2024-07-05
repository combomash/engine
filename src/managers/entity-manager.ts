import {Entity, StartParams, ResizeParams, UpdateParams, LateUpdateParams, ExecuteParams, DestroyParams, FinishParams} from '../core/engine.interface';

export class EntityManager {
    constructor() {}

    private entities: Array<Entity> = [];

    register(entity: Entity): boolean {
        if (this.entities.includes(entity)) {
            return false;
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

    start(params?: StartParams) {
        for (const entity of this.entities) {
            if (!entity.isActive) continue;
            entity.start?.(params);
        }
    }

    resize(params?: ResizeParams) {
        for (const entity of this.entities) {
            if (!entity.isActive) continue;
            entity.resize?.(params);
        }
    }

    update(params?: UpdateParams) {
        for (const entity of this.entities) {
            if (!entity.isActive) continue;
            entity.update?.(params);
        }
    }

    lateUpdate(params?: LateUpdateParams) {
        for (const entity of this.entities) {
            if (!entity.isActive) continue;
            entity.lateUpdate?.(params);
        }
    }

    execute(params?: ExecuteParams) {
        for (const entity of this.entities) {
            if (!entity.isActive) continue;
            entity.execute?.(params);
        }
    }

    finish(params?: FinishParams) {
        for (const entity of this.entities) {
            if (!entity.isActive) continue;
            entity.finish?.(params);
        }
    }

    destroy(params?: DestroyParams) {
        for (let i = this.entities.length - 1; i >= 0; i--) {
            this.entities[i].isActive = false;
            this.entities[i].destroy?.(params);
        }
    }
}
