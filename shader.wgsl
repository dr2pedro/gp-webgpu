struct Matrix { 
    size : vec2<f32>, 
    numbers: array<f32> 
    }
// Essas são as identificações do Array. Como todos estão dentro de um mesmo Grupo então são inicializados
// com o decorador @group(0). Em seguida dentro do grupo cada Array recebeu uma posição de índice que deve 
// ser indicada com o decorador @binding(<índice do Array no grupo>). Agora é o momento de intanciar a variável
// para isso basta declarar var<slot-1, slot-2>, nos quais o slot-1 identifica qual será o uso dessa memória
// segundo o referido no GPUBufferUsage e o slot-2 identifica a autorização de uso do buffer que pode ser:
// read, read_write e storage, lembrando que do lado da GPU.

@group(0) @binding(0) var<storage, read> firstMatrix : Matrix;
@group(0) @binding(1) var<storage, read> secondMatrix : Matrix;
@group(0) @binding(2) var<storage, read_write> resultMatrix : Matrix;

// O decorador @compute identifica o uso para computação do shader, invés de vertíces ou fragmentos.
// O decorador @workgroup_size é o tamanho reservado na GPU para rodar Workload. 
@compute @workgroup_size(8, 8)

// Aqui a função recebe um parâmetro que é o ID um vetor de tamanho 3 (x,y,z) de Unsigned 32bits que é buscado
// na varíavel @builtin(global_invocation_id).
fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
    // Guard against out-of-bounds work group sizes
    // Uma função de guarda que libera todo workgroup que não se encontrar nos tamanhos das varíaveis trabalhadas.
    if (global_id.x >= u32(firstMatrix.size.x) || global_id.y >= u32(secondMatrix.size.y)) {
        return;
    }

    // aqui ele calcula o tamanho da matriz de resultado (já feita no código de teste .ts)
    resultMatrix.size = vec2(firstMatrix.size.x, secondMatrix.size.y);

    // multiplicação das matrizes.
    let resultCell = vec2(global_id.x, global_id.y);
    var result = 0.0;
    for (var i = 0u; i < u32(firstMatrix.size.y); i = i + 1u) {
        let a = i + resultCell.x * u32(firstMatrix.size.y);
        let b = resultCell.y + i * u32(secondMatrix.size.y);
        result = result + firstMatrix.numbers[a] * 2u;
    }

    let index = resultCell.y + resultCell.x * u32(secondMatrix.size.y);
    resultMatrix.numbers[index] = result;
}
