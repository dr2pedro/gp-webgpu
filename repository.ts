export interface GPUCommandRepository {
    push(command: GPUCommandBuffer, name?: string): void;
    list(): string[];
    get(): GPUCommandEncoder[]
    delete(label: string): void;
    clear(): void
}

export class GPUCommandRepository {
    commandIndex = 0
    commandDB: GPUCommandBuffer[] = [];
    commandNames: string[] = [];
    
    push(command: GPUCommandEncoder, name?: string) {
        name ? this.commandNames.push(name) : this.commandNames.push(String(this.commandIndex));
        this.commandIndex++;
        this.commandDB.push(command);
    }

    list() {
        return this.commandNames
    }

    get() {
        return this.commandDB
    }

    delete(label: string) {
        throw new Error('Is not implemented yet.')
    }

    clear() {
        this.commandDB = [];
        this.commandIndex = 0;
        this.commandNames = [];
    }
}