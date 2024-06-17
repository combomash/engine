import {StartParams, ResizeParams, UpdateParams, LateUpdateParams, ExecuteParams, DestroyParams} from './entity-manager-interface';

export interface Entity {
    isActive: boolean;
    start?: (params: StartParams) => void;
    resize?: (params: ResizeParams) => void;
    update?: (params: UpdateParams) => void;
    lateUpdate?: (params: LateUpdateParams) => void;
    execute?: (params: ExecuteParams) => void;
    destroy?: (params: DestroyParams) => void;
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

    public start(params: StartParams) {
        for (const entity of this.entities) {
            if (!entity.isActive) continue;
            entity.start?.(params);
        }
    }

    public resize(params: ResizeParams) {
        for (const entity of this.entities) {
            if (!entity.isActive) continue;
            entity.resize?.(params);
        }
    }

    public update(params: UpdateParams) {
        for (const entity of this.entities) {
            if (!entity.isActive) continue;
            entity.update?.(params);
        }
    }

    public lateUpdate(params: LateUpdateParams) {
        for (const entity of this.entities) {
            if (!entity.isActive) continue;
            entity.lateUpdate?.(params);
        }
    }

    public execute(params: ExecuteParams) {
        for (const entity of this.entities) {
            if (!entity.isActive) continue;
            entity.execute?.(params);
        }
    }

    public destroy(params: DestroyParams) {
        for (const entity of this.entities) {
            entity.isActive = false;
            entity.destroy?.(params);
        }
    }
}
