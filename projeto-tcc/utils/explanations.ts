export const explanations = {
  cryptography: {
    vigenere: `A Cifra de Vigenère é um método de criptografia que utiliza múltiplos deslocamentos no alfabeto, tornando-a mais segura do que cifras simples, como a de César. Seu funcionamento baseia-se em duas informações principais: a mensagem original (texto claro) e uma chave secreta.\n
Para iniciar o processo, a chave é repetida ou ajustada até possuir o mesmo comprimento da mensagem. Assim, cada caractere da mensagem terá um caractere correspondente da chave.\n
Em seguida, cada letra da mensagem e da chave é convertida para sua posição no alfabeto (por exemplo: A = 0, B = 1, C = 2, ..., Z = 25). Para criptografar, somam-se os valores numéricos da letra da mensagem e da letra da chave que estão na mesma posição. O resultado dessa soma é então reduzido usando a operação de módulo 26, garantindo que o valor permaneça dentro do intervalo do alfabeto.\n
O número obtido após o módulo 26 é convertido novamente para uma letra, gerando assim o caractere cifrado correspondente. Esse processo é repetido para todos os caracteres da mensagem, formando o texto criptografado.\n
Uma forma alternativa de visualizar esse processo é por meio da tabela de Vigenère. Nessa tabela, o alfabeto aparece tanto no topo quanto na lateral esquerda. Cada linha representa o alfabeto deslocado de acordo com a letra da chave.\n
Para encontrar o caractere cifrado utilizando a tabela, localiza-se a coluna correspondente à letra da mensagem e a linha correspondente à letra da chave. A letra na interseção entre essa linha e coluna será o resultado da criptografia para aquela posição.\n
Dessa forma, a Cifra de Vigenère consegue aplicar diferentes deslocamentos ao longo da mensagem, dificultando a análise de padrões e aumentando a segurança da criptografia.
`,

    substitution: `A cifra de substituição é um método de criptografia no qual cada caractere da mensagem original é substituído por outro caractere do alfabeto. Essa substituição segue uma regra fixa, garantindo que duas letras diferentes nunca sejam mapeadas para o mesmo caractere, mantendo uma correspondência única entre elas.\n
Na visualização apresentada, o alfabeto em sua ordem padrão é exibido na linha superior, enquanto uma versão embaralhada (uma permutação aleatória) aparece logo abaixo. Para criptografar a mensagem, cada letra do texto original é substituída pela letra correspondente na mesma posição da linha inferior, formando assim a mensagem cifrada.\n
Embora esse método esconda a mensagem original, ele não é considerado seguro. A cifra de substituição é vulnerável à análise de frequência, uma técnica que observa quais letras aparecem com maior frequência no texto cifrado e as compara com as letras mais comuns do idioma. Dessa forma, é possível identificar padrões e, eventualmente, descobrir a mensagem original.`,

    shift: `A cifra de deslocamento é um método de criptografia no qual cada letra da mensagem é substituída por outra, obtida ao se deslocar um número fixo de posições (X) no alfabeto.\n
Na visualização apresentada, há dois anéis contendo as letras do alfabeto: o anel interno representa as letras da mensagem original, enquanto o anel externo mostra os caracteres criptografados.\n
Ao rotacionar o anel interno em X posições, cada letra da mensagem original passa a se alinhar com uma nova letra no anel externo. A criptografia é realizada substituindo-se cada letra original pelo caractere correspondente alinhado no anel externo.`,
  },

  imageCompression: {
    rle: `O algoritmo Run-Length Encoding (RLE) é uma técnica de compressão de dados sem perdas que reduz o tamanho de uma imagem ao eliminar redundâncias. Redundância ocorre quando há repetições consecutivas de um mesmo valor, como pixels com a mesma cor.\n
O funcionamento do RLE é simples: ao percorrer a imagem (pixel a pixel, geralmente da esquerda para a direita e de cima para baixo), o algoritmo identifica sequências de pixels com o mesmo valor. Em vez de armazenar cada pixel individualmente, ele armazena apenas dois valores: a quantidade de repetições e o valor do pixel.\n
Por exemplo, uma sequência como: [azul, azul, azul, azul]\n
pode ser representada como: (4, azul)\n
Na visualização apresentada, o sistema percorre a imagem e agrupa pixels consecutivos iguais, formando pares (quantidade, valor). Cada par representa um trecho da imagem comprimida.\n
Ao final do processo, é possível calcular o tamanho da imagem comprimida considerando que cada par ocupa uma quantidade fixa de bytes (por exemplo, 1 byte para a quantidade e 1 byte para o valor, dependendo da implementação). Esse valor pode então ser comparado com o tamanho original da imagem, que normalmente considera 1 byte por pixel.\n
Com isso, também é possível calcular a porcentagem de redução obtida com a compressão.\n
É importante destacar que o RLE é mais eficiente em imagens com alta redundância, ou seja, com grandes áreas de cor uniforme. Em imagens com muita variação de cores (como fotografias), o algoritmo pode não ser eficaz e, em alguns casos, pode até aumentar o tamanho dos dados.`,
  },

  numberBases: {
    binary_decimal: `A conversão de um número binário para um decimal é baseada no uso das potências de 2.\n
    Cada dígito binário (bit) representa uma potência de 2, de acordo com sua posição. Conta-se essas posições da direita para a esquerda, começando do zero. Dessa forma, o bit mais à direita (bit menos significativo) corresponde a 2⁰, o próximo corresponde a 2¹, e assim por diante.\n
    Após definir todas as correspondências entre bits e potências, considera-se apenas as potências cujo bit assocido é 1, e depois soma-se esses valores.\n
    Por exemplo, para o número binário 1010:\n
    Bits:       1   0   1   0\n
    Posições:   3   2   1   0\n
    Potências:  2³  2²  2¹  2⁰\n
    Selecionando apenas os bits iguais a 1, temos: 2³ + 2¹ = 8 + 2 = 10`,
  },

  binaryArithmetic: {
    addition: `A soma de números binários funciona de forma muito semelhante à de números decimais. Primeiro, alinha-se os valores a serem somados um acima do outro, de forma que os últimos dígitos de ambos fiquem na mesma coluna.\n
    Em seguida, soma-se o valor na parte de cima da coluna com o da parte de baixo. Na aritmética binária, seguem-se as seguintes regras para definir o resultado da soma de bits:\n
    0 + 0 = 0\n
    1 + 0 = 1\n
    0 + 1 = 1\n
    1 + 1 = 10, que equivale ao 2 em decimal\n
    1 + 1 + 1 (carry da operação anterior) = 11, que equivale ao 3 em decimal\n
    Sabendo disso, calcula-se da mesma forma que em uma soma decimal: caso a soma dos dois valores ocupe mais que uma casa (ou seja, caso resulte em 10 ou 11), o bit menos significativo (valor mais à direita) fica como resultado dessa coluna, enquanto o outro é passado para a próxima coluna como carry.`,
    
    subtraction: `A subtração de dois números binários pode ser realizada de algumas formas diferentes, mas uma das mais comuns é a com complemento de 2.\n
    Esse processo é baseado na seguinte igualdade: A - B = A + (-B).\n
    O complemento de 2 permite representar valores negativos em binário (começam com 1). Logo, para poder realizar a subtração, soma-se A com o complemento de 2 de B (que significa -B).\n
    Primeiro, expande-se ambos os números de forma que seja adicionado pelo menos um 0 no início de cada um e ambos fiquem com o mesmo comprimento. Por exemplo, para a subtração de 100 - 1100:\n
    100 = 00100\n
    1100 = 01100\n
    Dessa forma, ambos receberam pelo menos um 0 (utilizado para lidar com um possível overflow) e ambos ficaram com o mesmo comprimento (5 bits). Em seguida, calcula-se o complemento de 2 do subtraendo (valor a ser subtraído). Para isso:\n
    1. Inverter todos os bits: 01100 -> 10011\n
    2. Somar 1: 10011 + 1 = 10100\n
    Após isso, soma-se o minuendo com o complemento de 2 do subtraendo:
    00100 + 10100 = 11000\n
    Entretando, ainda precisamos avaliar o resultado. Como os dois valores originais foram expandidos para 5 bits, o resultado final não pode passar disso. Caso passe, chama-se overflow, e o bit mais signitifcativo é descartado. Além disso, deve-se manter em mente que estamos trabalhando com números negativos, que são iniciados com 1 em complemento de 2. Sendo assim, resultados que iniciem em 1 (após o descarte do overflow, se necessário) são valores negativos. Nesse caso, para obter a magnitude do resultado (valor absoluto, desconsiderando sinais), repete-se o cálculo do complemento de 2.\n
    Como o resultado do exemplo foi 11000 (5 bits), não há overflow. Entretanto, o MSB é 1, ou seja, é um valor negativo. Seu valor absoluto é:\n
    1. 11000 -> 00111\n
    2. 00111 + 1 = 01000 = 8\n
    O valor resultante de 100 - 1100 é -8.\n
    Outro exemplo: 110 - 11 = 0110 - 0011 (4 bits cada) = 0110 + 1101 = 10011\n
    Nesse exemplo, o resultado final tem 5 bits, sendo que o minuendo e subtraendo possuem apenas 4 bits. Isso significa que houve overflow, então descarta-se o MSB:\n
    10011 -> 0011`,
  },
};
