export enum GPUPowerPreference {
    'economic' = 'low-power',
    'performace' = 'high-performance'
}

export enum GPUShaderStage {
    VERTEX = 0x1,
    FRAGMENT = 0x2,
    COMPUTE = 0x4
}

export enum GPUBufferBindingType {
    'uniform' = 'uniform',
    'storage' = 'storage',
    'read-only-storage' = 'read-only-storage'
}

export enum GPUCompilationMessageType {
    "error" = "error",
    "warning" = "warning",
    "info" = "info"
}

export enum GPUBufferUsage {
    MAP_READ = 0x0001,
    MAP_WRITE = 0x0002,
    COPY_SRC = 0x0004,
    COPY_DST = 0x0008,
    INDEX = 0x0010,
    VERTEX = 0x0020,
    UNIFORM = 0x0040,
    STORAGE = 0x0080,
    INDIRECT = 0x0100,
    QUERY_RESOLVE = 0x0200
}

export enum GPUMapMode {
    READ = 0x0001,
    WRITE = 0x0002
}