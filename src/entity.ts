import { Protocol, FnCallType, TxbObject, ResourceAddress, PermissionObject, ResourceObject} from './protocol';
import { IsValidDesription, IsValidAddress, IsValidName, isValidHttpUrl, Bcs, IsValidArray,  } from './utils';
import { ERROR, Errors } from './exception';
import { TagName, Resource } from './resource';
import { Transaction as TransactionBlock, TransactionResult } from '@mysten/sui/transactions';


export interface Entity_Info {
    name: string;
    description?: string;
    avatar?: string;
    twitter?: string;
    discord?: string;
    homepage?: string;
}

export class Entity {
    protected object:TxbObject;
    protected txb;

    get_object() { return this.object }
    private constructor(txb:TransactionBlock) {
        this.txb = txb;
        this.object = '';
    }

    static From(txb:TransactionBlock) : Entity {
        let r = new Entity(txb);
        r.object = Protocol.TXB_OBJECT(txb, Protocol.Instance().objectEntity());
        return r
    }

    mark(resource:Resource, address:string | TransactionResult, like:TagName.Like | TagName.Dislike) {
        if (typeof(address) === 'string' && !IsValidAddress(address)) {
            ERROR(Errors.IsValidAddress, like);
        }

        this.txb.moveCall({
            target:Protocol.Instance().entityFn(like) as FnCallType,
            arguments:[Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, resource.get_object()), 
                typeof(address) === 'string' ? this.txb.pure.address(address) : address]
        })
    }

    update(info: Entity_Info) {
        if (info?.name && !IsValidName(info.name)) ERROR(Errors.IsValidName, 'update');
        if (info?.description && !IsValidDesription(info.description)) ERROR(Errors.IsValidDesription, 'update');
        if (info?.avatar && !isValidHttpUrl(info.avatar)) ERROR(Errors.isValidHttpUrl, 'update:avatar');
        if (info?.twitter && !IsValidName(info.twitter)) ERROR(Errors.IsValidName, 'update:twitter');
        if (info?.homepage && !isValidHttpUrl(info.homepage)) ERROR(Errors.isValidHttpUrl, 'update:homepage');
        if (info?.discord && !IsValidName(info.discord)) ERROR(Errors.IsValidName, 'update:discord');
        
        const bytes = Bcs.getInstance().bcs.ser('PersonalInfo', {
            name:info.name ? new TextEncoder().encode(info.name) :'',
            description : info?.description ? new TextEncoder().encode(info.description) :  '',
            avatar : info?.avatar ?? '',
            twitter : info?.twitter ?? '',
            discord : info?.discord ?? '',
            homepage : info?.homepage ?? '',
        }).toBytes();    
        this.txb.moveCall({
            target:Protocol.Instance().entityFn('avatar_update') as FnCallType,
            arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('u8', [].slice.call(bytes))]
        })
    }

    create_resource() : ResourceAddress {
        return this.txb.moveCall({
            target:Protocol.Instance().entityFn('resource_create') as FnCallType,
            arguments:[Protocol.TXB_OBJECT(this.txb, this.object)]
        })
    }

    create_resource2(): ResourceObject {
        return this.txb.moveCall({
            target:Protocol.Instance().entityFn('resource_create2') as FnCallType,
            arguments:[Protocol.TXB_OBJECT(this.txb, this.object)]
        }) 
    }
    
    destroy_resource(resource:Resource) { // Resource must self-owned.
        return this.txb.moveCall({
            target:Protocol.Instance().entityFn('resource_destroy') as FnCallType,
            arguments:[Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, resource.get_object())]
        })
    }

    use_resource(resource:Resource) { // Resource must self-owned.
        return this.txb.moveCall({
            target:Protocol.Instance().entityFn('resource_use') as FnCallType,
            arguments:[Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, resource.get_object())]
        })
    }

    transfer_resource(resource:Resource, new_address:string) { // Resource must self-owned.
        if (!IsValidAddress(new_address)) ERROR(Errors.IsValidAddress, 'transfer_resource');
        
        return this.txb.moveCall({
            target:Protocol.Instance().entityFn('resource_transfer') as FnCallType,
            arguments:[Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, resource.get_object()), 
                this.txb.pure.address(new_address)]
        })   
    }

    query_ent(address_queried:string) {
        if (!IsValidAddress(address_queried)) {
            ERROR(Errors.InvalidParam, 'query_ent');    
        }

        this.txb.moveCall({
            target:Protocol.Instance().entityFn('QueryEnt') as FnCallType,
            arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.address(address_queried)]
        })   
    }
}