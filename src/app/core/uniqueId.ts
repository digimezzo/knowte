import { create } from "domain";

export class UniqueId {
    public static create() {
        return Date.now() + Math.random().toString().slice(2);
    }
}