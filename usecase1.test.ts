import { GPUDeviceAdapter } from "./adapter.ts";
import { GPUCommandRepository } from "./repository.ts";
import { Buffer, Command } from "./aggregates.ts";
import { GPUBufferUsage, GPUMapMode } from "./enums.ts";


const repository = new GPUCommandRepository();
const device = await GPUDeviceAdapter.init(repository);

const { buffer:writeBuffer } = new Buffer(device).create(4, GPUBufferUsage.MAP_WRITE | GPUBufferUsage.COPY_SRC, true, 'write-buffer');
const arrayBuffer = writeBuffer.getMappedRange();
new Uint8Array(arrayBuffer).set([0, 1, 2, 3]);
writeBuffer.unmap();

const { buffer: readBuffer } = new Buffer(device).create(4, GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ);
const command = new Command(device).bindArrays(writeBuffer, readBuffer, 4).end();

repository.push(command);
device.run();

await readBuffer.mapAsync(GPUMapMode.READ);
const copyArrayBuffer = readBuffer.getMappedRange();
console.log(new Uint8Array(copyArrayBuffer));