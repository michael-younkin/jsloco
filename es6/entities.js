/* @flow */
/*global Class*/

import 'babel-polyfill';
import {GameService} from './game.js';
import * as util from './util.js';

/**
 * Stores entities and the components associated with them.
 *
 * Entities are stored in RDBS format.
 */
export class EntityManager extends GameService {
    _componentGroups: {[key: string]: {[key: number]: Component}};
    _entities: {[key: number]: boolean};
    _entityIdCounter: number;

    constructor() {
        super();
        this._componentGroups = {};
        this._entityIdCounter = 0;
        this._entities = {};
    }

    _getComponentGroup(name: string): {[key: number]: any} {
        let group = this._componentGroups[name];
        if (group == null) {
            group = {};
            this._componentGroups[name] = group;
        }
        return group;
    }

    makeEntity(components: ?Array<{type: any, args: Object}>): number {
        this._entityIdCounter += 1;
        this._entities[this._entityIdCounter] = true;

        // Create all requested components
        if (components != null) {
            for (let i = 0; i < components.length; i++) {
                let {type: type, args: args} = components[i];
                this.addComponent(this._entityIdCounter, type, args);
            }
        }

        return this._entityIdCounter;
    }

    getComponentsByType<T: Component>(type: Class<T>): Array<T> {
        let values = util.mapValues(this._getComponentGroup(type.name));
        for (let i = 0; i < values.length; i++) {
            if (!(values[i] instanceof type)) {
                throw new Error(`Component associated with ${type.name} is not of that type.`);
            }
        }
        return values;
    }

    addComponent<T: Component>(entity: number, type: Class<T>, args: Object) {
        if (!this._entities[entity]) {
            throw new Error(`Entity ${entity} doesn't exist.`);
        }

        let group = this._getComponentGroup(type.name);

        if (group[entity] != null) {
            throw new Error(`Entity ${entity} already has a ${type.name} component.`);
        }

        let component = new type(entity, this, args);
        group[entity] = component;
    }

    getComponent<T: Component>(entity: number, type: Class<T>): ?T {
        if (!this._entities[entity]) {
            throw new Error(`Entity ${entity} doesn't exist.`);
        }

        let group = this._getComponentGroup(type.name);
        return group[entity];
    }
}

export class Component {
    _entity: number;
    _entityManager: EntityManager;

    constructor(entity: number, entityManager: EntityManager) {
        this._entity = entity;
        this._entityManager = entityManager;
    }

    getEntity(): number {
        return this._entity;
    }

    getOtherComponent<T: Component>(type: Class<T>): ?T {
        return this._entityManager.getComponent(this._entity, type);
    }
}