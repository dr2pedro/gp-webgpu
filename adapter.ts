import { GPUCommandRepository } from "./repository.ts";
import { GPURequestAdapterOptions, GPUDeviceDescriptor } from "./types.d.ts";

export class GPUDeviceAdapter {
    commands: GPUCommandBuffer[] = [];
    groupIndex!: number;

    constructor(readonly adapter: GPUAdapter, readonly device: GPUDevice, readonly repository: GPUCommandRepository) {
    }

    static async init(repository: GPUCommandRepository, options?: GPURequestAdapterOptions, descriptor?: GPUDeviceDescriptor) {
        const instance = await navigator.gpu.requestAdapter(options);
        if(instance === null) {
            throw new Error('There is no GPU avaiable.')
        } else {
            const device = await instance.requestDevice(descriptor);
            return new GPUDeviceAdapter(instance, device, repository)
        }
    }

    run() {
        this.commands = this.repository.get();
        this.device.queue.submit(this.commands);
        this.commands = [];
    }

}