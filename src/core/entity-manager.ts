import {onStartParams, onResizeParams, onUpdateParams, onLateUpdateParams, onDestroyParams, onExecuteParams} from './engine.interface';

export interface Entity {
    isActive: boolean;
    start?: (params: onStartParams) => void;
    resize?: (params: onResizeParams) => void;
    update?: (params: onUpdateParams) => void;
    lateUpdate?: (params: onLateUpdateParams) => void;
    execute?: (params: onExecuteParams) => void;
    destroy?: (params: onDestroyParams) => void;
}

export class EntityManager {
    constructor() {}

    private entities: Array<Entity> = [];

    public register(entity: Entity): boolean {
        if (this.entities.includes(entity)) {
            return false;
        }
        this.entities.push(entity);
        return true;
    }

    public delist(entity: Entity): boolean {
        if (this.entities.includes(entity)) {
            const index = this.entities.indexOf(entity);
            this.entities.splice(index, 1);
            return true;
        }
        return false;
    }

    public start(params: onStartParams) {
        for (const entity of this.entities) {
            if (!entity.isActive) continue;
            entity.start?.(params);
        }
    }

    public resize(params: onResizeParams) {
        for (const entity of this.entities) {
            if (!entity.isActive) continue;
            entity.resize?.(params);
        }
    }

    public update(params: onUpdateParams) {
        for (const entity of this.entities) {
            if (!entity.isActive) continue;
            entity.update?.(params);
        }
    }

    public lateUpdate(params: onLateUpdateParams) {
        for (const entity of this.entities) {
            if (!entity.isActive) continue;
            entity.lateUpdate?.(params);
        }
    }

    public execute(params: onExecuteParams) {
        for (const entity of this.entities) {
            if (!entity.isActive) continue;
            entity.execute?.(params);
        }
    }

    public destroy(params: onDestroyParams) {
        for (const entity of this.entities) {
            entity.isActive = false;
            entity.destroy?.(params);
        }
    }
}
