/// <reference path="util.ts" />

class ServiceContainer {
    private services: StringMap<Service> = {};

    constructor(services: Array<{serviceType: ServiceType, args: any}>) {
        for (let serviceDesc of services) {
            let {serviceType, args} = serviceDesc;
            let name = serviceType.name;
            if (this.services[name] != null) {
                throw new Error(`Service ${name} is already present.`);
            }
            this.services[name] = new serviceType(this, args);
        }

        for (let serviceName of Object.keys(this.services)) {
            let service = this.services[serviceName];
            service.init();
        }
    }

    getService<T extends Service>(serviceType: ServiceType): T {
        let service = this.services[serviceType.name];
        return service as T;
    }
}

interface Service {
    /**
     * Called after all other services have been created. May be called more
     * than once.
     */
    init();
}

interface ServiceType {
    new (services: ServiceContainer, args: any): Service;
    // TODO add readonly when available
    name: string;
}

interface ComponentType<T extends Component> {
    new (entity: Entity, services: ServiceContainer, args: any): T;
    name: string;
}

class Component {
    constructor(
        protected entity: Entity,
        protected services: ServiceContainer,
        args: any) {
    }
}

class Entity {
    private static idCounter: number = 0;
    private static makeId() {
        Entity.idCounter += 1;
        return Entity.idCounter;
    }

    private components: StringMap<Component>;

    constructor(private services: ServiceContainer, private _id: number) {
        this._id = Entity.makeId();
        this.components = {};
    }

    addComponent<T extends Component>(
            componentType: ComponentType<T>,
            args: any) {
        let name = componentType.name;
        if (this.components[name] != null) {
            throw new Error(`Entity already has component of type ${name}.`);
        }
        this.components[name] = new componentType(this, this.services, args);
    }

    get id(): number {
        return this.id;
    }
}
