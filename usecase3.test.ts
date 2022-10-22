import { GPUDeviceAdapter } from "./adapter.ts";
import { GPUCommandRepository } from "./repository.ts";
import { Buffer, Command, Group, Pipeline } from "./aggregates.ts";
import { GPUBufferUsage } from "./enums.ts";

const repository = new GPUCommandRepository();
const adapter = await GPUDeviceAdapter.init(repository);


const { buffer: output, layout: outputLayout } = new Buffer(adapter).create(1000, GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC, false, 'output');
const { buffer: staging } = new Buffer(adapter).create(1000, GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST, false, 'staging');

const { layout, bind } = new Group(adapter, [{ buffer: output, layout: outputLayout }]).create('group1');
const shader = adapter.device.createShaderModule({ code: Deno.readTextFileSync('./shader2.wgsl')});
const pipeline = new Pipeline(adapter, [ layout ], shader, "main").create();

const command = new Command(adapter)
                        .group(bind, 0)
                        .pipeline(pipeline)
                        .size({x: Math.ceil(1000 / 64)})
                        .bindArrays(output, staging, 1000, [0,0])
                        .end()

repository.push(command);
adapter.run();

await staging.mapAsync(GPUMapMode.READ, 0, 1000);
const copyArrayBuffer = staging.getMappedRange(0, 1000);

const data = copyArrayBuffer.slice(0);
staging.unmap();
console.log(new Float32Array(data));
