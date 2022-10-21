export interface GPUCommandRepository {
    push(command: GPUCommandBuffer, name?: string): void;
    list(): string[];
    get(): GPUCommandEncoder[]
    delete(index: number): void;
    clear(): void
}

export class GPUCommandRepository {
    commandIndex = 0
    commandDB: GPUCommandBuffer[] = [];
    
    push(command: GPUCommandEncoder) {
        this.commandIndex++;
        this.commandDB.push(command);
    }

    get() {
        return this.commandDB
    }

    delete(index: number) {
        this.commandDB.splice(index, 1);
    }

    clear() {
        this.commandDB = [];
        this.commandIndex = 0;
    }
}