import { TxbObject, ResourceAddress, ResourceObject } from './protocol.js';
import { Entity_Info } from './utils.js';
import { TagName, Resource } from './resource.js';
import { Transaction as TransactionBlock, TransactionResult } from '@mysten/sui/transactions';
export interface EntityData {
    info?: Entity_Info;
    resource_object?: string;
    like?: number;
    dislike?: number;
    address?: string;
}
export declare class Entity {
    protected object: TxbObject;
    protected txb: TransactionBlock;
    get_object(): TxbObject;
    private constructor();
    static From(txb: TransactionBlock): Entity;
    mark(resource: Resource, address: string | TransactionResult, like: TagName.Like | TagName.Dislike): void;
    update(info: Entity_Info): void;
    create_resource(): ResourceAddress;
    create_resource2(): ResourceObject;
    destroy_resource(resource: Resource): TransactionResult;
    use_resource(resource: Resource): TransactionResult;
    transfer_resource(resource: Resource, new_address: string): TransactionResult;
    query_ent(address_queried: string): void;
    static EntityData: (address: string) => Promise<EntityData | undefined>;
}
//# sourceMappingURL=entity.d.ts.map