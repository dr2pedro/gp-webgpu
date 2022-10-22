import { GPUDeviceAdapter } from "./adapter.ts";
import { GPUCommandRepository } from "./repository.ts";
import { Buffer, Group, Command, Pipeline } from "./aggregates.ts";
import { GPUBufferUsage, GPUBufferBindingType } from "./enums.ts";

const repository = new GPUCommandRepository();
const adapter = await GPUDeviceAdapter.init(repository);

/** Setting the first buffer. */
const firstMatrix = new Float32Array([
    2, 4,
    1, 2, 3, 4,
    5, 6, 7, 8
])
// 1 - first create a buffer
const { buffer: firstMatrixBuffer, layout: firstLayout } = new Buffer(adapter, GPUBufferBindingType["read-only-storage"]).create(firstMatrix.byteLength, GPUBufferUsage.STORAGE, true, 'firstMatrix');
// 2 - turn it in array
const  firstMatrixArrayBuffer = firstMatrixBuffer.getMappedRange();
// 3 - connect in some cpu array and set the original matrix
new Float32Array(firstMatrixArrayBuffer).set(firstMatrix);
// 4 - free the buffer to gpu use only itself.
firstMatrixBuffer.unmap();


/** Second buffer. */
const secondMatrix = new Float32Array([
    4, 2,
    1, 2,
    3, 4,
    5, 6,
    7, 8
])
const { buffer: secondMatrixBuffer, layout: secondLayout } = new Buffer(adapter, GPUBufferBindingType["read-only-storage"]).create(secondMatrix.byteLength, GPUBufferUsage.STORAGE, true, 'secondMatrix');
const secondMatrixArrayBuffer = secondMatrixBuffer.getMappedRange();
new Float32Array(secondMatrixArrayBuffer).set(secondMatrix);
secondMatrixBuffer.unmap();

/** Result Buffer. This buffer store the results and is oppened to be coppied to another output buffer. */
const resultMatrixArraySize = Float32Array.BYTES_PER_ELEMENT * (2 + firstMatrix[0] * secondMatrix[1]);
const { buffer: resultMatrixBuffer, layout: resultLayout } = new Buffer(adapter, GPUBufferBindingType.storage).create(resultMatrixArraySize, GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC, false, 'resultMatrix');

const groupInstance = new Group(
    adapter,
    [
        {
            buffer: firstMatrixBuffer,
            layout: firstLayout
        },
        {
            buffer: secondMatrixBuffer,
            layout: secondLayout
        },
        {
            buffer: resultMatrixBuffer,
            layout: resultLayout
        }
    ]
);
const { layout, bind } = groupInstance.create('grupo-1');
const shader = adapter.device.createShaderModule({ code: Deno.readTextFileSync('./shader.wgsl')});
const pipeline = new Pipeline(adapter, [layout], shader, 'main').create();

/** Copy gpu buffer result */
const { buffer: gpuReadBuffer } = new Buffer(adapter).create(Float32Array.BYTES_PER_ELEMENT * (2 + firstMatrix[0] * secondMatrix[1]), GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ, false, "gpuReadBuffer")

const command = 
    new Command(adapter)
        .group(bind, 0)
        .pipeline(pipeline)
        .size({x: Math.ceil(firstMatrix[0]/8), y: Math.ceil(secondMatrix[1]/8)})
        .bindArrays(resultMatrixBuffer, gpuReadBuffer, Float32Array.BYTES_PER_ELEMENT * (2 + firstMatrix[0] * secondMatrix[1]),[0,0])
        .end();

repository.push(command);
adapter.run();

await gpuReadBuffer.mapAsync(GPUMapMode.READ);
const arrayBuffer = gpuReadBuffer.getMappedRange();
console.log(new Float32Array(arrayBuffer));

