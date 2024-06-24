export class Registrar {
    protected constructor() {}

    #records: Array<any> = [];
    get records() {
        return this.#records;
    }

    register(record: any): boolean {
        if (this.#records.includes(record)) return false;
        this.#records.push(record);
        return true;
    }

    delist(record: any): boolean {
        if (!this.#records.includes(record)) return false;
        const index = this.#records.indexOf(record);
        this.#records.splice(index, 1);
        return true;
    }
}
