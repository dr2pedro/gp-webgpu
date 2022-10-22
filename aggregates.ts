import { GPUDeviceAdapter } from "./adapter.ts";
import { GPUBufferUsage, GPUBufferBindingType, GPUShaderStage } from "./enums.ts";
import { GPUBuffer, JobSize, BufferBind, GPUBindGroupLayoutEntry } from "./types.d.ts";

export interface Buffer {
    create(size: number, usage: GPUBufferUsage, mappedAtCreation: boolean, label: string): { buffer: GPUBuffer, layout: GPUBindGroupLayoutEntry }
}

export class Buffer {
    static index = 0;
    layout!:GPUBindGroupLayoutEntry;
    
    constructor(readonly adapter: GPUDeviceAdapter, readonly type?: GPUBufferBindingType) {
        this.layout = {
            binding: Buffer.index,
            visibility: GPUShaderStage.COMPUTE,
            buffer: {
                type
            }
        }
    }

    create(size: number, usage: GPUBufferUsage, mappedAtCreation = false, label?: string) {
        Buffer.index++;
        const buffer: GPUBuffer = this.adapter.device.createBuffer({ label, mappedAtCreation, size, usage });
        const layout = this.layout
        return {
            buffer,
            layout
        }
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

    pipeline(pipeline: GPUComputePipeline) {
        this.computation.setPipeline(pipeline);
        this.#hasPipeline = true;
        return this
    }

    group(bindgroup: GPUBindGroup, index: number) {
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
        if(this.#hasPipeline && this.#hasAnyBindGroup) {
            this.computation
            this.binds.map((i: BufferBind) => {
                this.encoder.copyBufferToBuffer(i.buffer1, i.offsets[0], i.buffer2, i.offsets[1], i.size)
            })
        }
        return this.encoder.finish()
    }

}

export interface Group {
    create(): { layout: GPUBindGroupLayout, bind: GPUBindGroup }
}

export class Group {
    layout: GPUBindGroupLayoutEntry[] = [];
    bindEntries: { binding: number, resource: { buffer: GPUBuffer}}[] = [];

    constructor(readonly adapter: GPUDeviceAdapter, readonly bufferArray: { buffer: GPUBuffer, layout: GPUBindGroupLayoutEntry }[]) {
        bufferArray.map((i: { buffer: GPUBuffer, layout: GPUBindGroupLayoutEntry }) => {
            this.layout.push(i.layout);
            this.bindEntries.push({
                binding: i.layout.binding,
                resource: {
                    buffer: i.buffer
                }
            })
        })
    }

    create(label?: string){
        const layout = this.adapter.device.createBindGroupLayout({ entries: this.layout });
        const bind = this.adapter.device.createBindGroup({ layout, entries: this.bindEntries });
        if(label) {
            bind.label = label;
        }
        return {
            layout,
            bind
        }
    }
}

export class Pipeline {
    groups!: GPUBindGroupLayout[];
    constructor(readonly adapter: GPUDeviceAdapter, readonly bindgroupslayouts: GPUBindGroupLayout[], readonly shader: any, readonly entrypoint: string) {
        this.groups = bindgroupslayouts;
    }

    create() {
        const pipeline = this.adapter.device.createComputePipeline({
            layout: this.adapter.device.createPipelineLayout({
                bindGroupLayouts: this.groups
            }),
            compute: {
                module: this.shader,
                entryPoint: this.entrypoint
            }
        })
        return pipeline
    }
}