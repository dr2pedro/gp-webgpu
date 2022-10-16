import { GPUDeviceAdapter } from "./adapter.ts";
import { GPUBufferUsage } from "./enums.ts";
import { GPUBuffer, JobSize, BufferBind } from "./types.d.ts";

export interface Buffer {
    create(size: number, usage: GPUBufferUsage, mappedAtCreation?: boolean, label?: string): GPUBuffer;
}

export class Buffer {
    constructor(readonly adapter: GPUDeviceAdapter) {
    }

    create(size: number, usage: GPUBufferUsage, mappedAtCreation?: boolean, label?: string) {
        return this.adapter.device.createBuffer({ label, mappedAtCreation, size, usage })
    }
}

export class Command {
    encoder;
    computation;
    binds: Array<BufferBind> = [];
    #hasPipeline = false;
    #hasAnyBindGroup = false;
    
    constructor(readonly adapter: GPUDeviceAdapter, readonly name?: string) {
        this.encoder = this.adapter.device.createCommandEncoder();
        this.computation = this.encoder.beginComputePass();
    }

    pipeline(pipeline: any) {
        this.computation.setPipeline(pipeline);
        this.#hasPipeline = true;
        return this
    }

    group(bindgroup: any, index: number) {
        this.computation.setBindGroup(index, bindgroup);
        this.#hasAnyBindGroup = true;
        return this
    }

    size(jobSize: JobSize){
        this.computation.dispatch(jobSize.x, jobSize.y, jobSize.z);
        return this
    }

    bindArrays(buffer1: GPUBuffer, buffer2: GPUBuffer, size: number, offsets: [number, number] = [0,0]) {
        this.binds.push({ buffer1, buffer2, size, offsets } as BufferBind);
        return this
    }

    end() {
        this.#hasPipeline && this.#hasAnyBindGroup ? this.computation.endPass() : undefined;
        this.binds.map((i: BufferBind) => {
            this.encoder.copyBufferToBuffer(i.buffer1, i.offsets[0], i.buffer2, i.offsets[1], i.size)
        })
        return this.encoder.finish()
    }

}

export class Group {

}

export class Pipeline {

}