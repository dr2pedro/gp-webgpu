import { GPUPowerPreference, GPUShaderStage, GPUBufferBindingType, GPUCompilationMessageType, GPUBufferUsage } from "./enums.ts";

export type GPURequestAdapterOptions = {
    powerPreference?: GPUPowerPreference;
    forceFallbackAdapter?: boolean;
}

export type GPUSupportedLimits = {
    maxTextureDimension1D?: number;
    maxTextureDimension2D?: number;
    maxTextureDimension3D?: number;
    maxTextureArrayLayers?: number;
    maxBindGroups?: number;
    maxDynamicUniformBuffersPerPipelineLayout?: number;
    maxDynamicStorageBuffersPerPipelineLayout?: number;
    maxSampledTexturesPerShaderStage?: number;
    maxSamplersPerShaderStage?: number;
    maxStorageBuffersPerShaderStage?: number;
    maxStorageTexturesPerShaderStage?: number;
    maxUniformBuffersPerShaderStage?: number;
    maxUniformBufferBindingSize?: number;
    maxStorageBufferBindingSize?: number;
    minUniformBufferOffsetAlignment?: number;
    minStorageBufferOffsetAlignment?: number;
    maxVertexBuffers?: number;
    maxVertexAttributes?: number;
    maxVertexBufferArrayStride?: number;
    maxInterStageShaderComponents?: number;
    maxComputeWorkgroupStorageSize?: number;
    maxComputeInvocationsPerWorkgroup?: number;
    maxComputeWorkgroupSizeX?: number;
    maxComputeWorkgroupSizeY?: number;
    maxComputeWorkgroupSizeZ?: number;
    maxComputeWorkgroupsPerDimension?: number;
}

export type GPUFeatureName ="depth-clip-control" | "depth24unorm-stencil8" | "depth32float-stencil8" | "pipeline-statistics-query" | 
                    "texture-compression-bc" | "texture-compression-etc2" | "texture-compression-astc" | "timestamp-query" |
                    "indirect-first-instance" | "mappable-primary-buffers" | "sampled-texture-binding-array"| 
                    "sampled-texture-array-dynamic-indexing" | "sampled-texture-array-non-uniform-indexing" | 
                    "unsized-binding-array" | "multi-draw-indirect" | "multi-draw-indirect-count" | "push-constants" | 
                    "address-mode-clamp-to-border" | "texture-adapter-specific-format-features" | "shader-float64" | 
                    "vertex-attribute-64bit"


export type GPUDeviceDescriptor = {
    requiredFeatures?: GPUFeatureName[];
    requiredLimits?: Record<string, number>;
}

export type GPUBufferBindingLayout = {
    type?: GPUBufferBindingType;
    hasDynamicOffset?: boolean;
    minBindingSize?: number;
}

export type GPUBindGroupLayoutEntry = {
    binding: number;
    visibility: GPUShaderStage;
    buffer?: GPUBufferBindingLayout;
}

export type GPUBindGroupLayoutDescriptor = {
    entries: GPUBindGroupLayoutEntry[]
    label?: string
}

export type GPUCompilationMessage = {
    readonly message: string;
    readonly type: GPUCompilationMessageType;
    readonly lineNum: number;
    readonly linePos: number;
}

export type GPUCompilationInfo = {
    readonly messages: ReadonlyArray<GPUCompilationMessage>;
}

export type GPUShaderModule = {
    label: string | null;
    compilationInfo(): Promise<GPUCompilationInfo>;
}

export type GPUComputePipelineDescriptor = {
    compute: {
        module: GPUShaderModule;
        entryPoint: string;
    }
}

export type GPUShaderModuleDescriptor = {
    code: string;
    sourceMap?: any;
}

export type GPUBufferDescriptor = {
    size: number;
    usage: GPUBufferUsage;
    label?: string;
    mappedAtCreation?: boolean;
}

export class GPUBuffer {
    label: string | null;
    mapAsync( mode: GPUMapModeFlags, offset?: number, size?: number ): Promise<undefined>;
    getMappedRange(offset?: number, size?: number): ArrayBuffer;
    unmap(): undefined;
    destroy(): undefined;
}

export type GPUBindGroupEntry = {
    binding: number,
    resource: {
      buffer: GPUBuffer,
    }
}

export type GPUBindGroupDescriptor = {
    layout: GPUBindGroupLayout,
    entries: GPUBindGroupEntry[],
    label?: string
}

export type JobSize = {
    x: number,
    y?: number,
    z?: number
}

export type BufferBind = {
    buffer1: GPUBuffer,
    buffer2: GPUBuffer,
    size: number,
    offsets: [number, number]
}