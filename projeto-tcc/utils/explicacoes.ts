export const explanations = {
  criptografia: {
    vigenere: `A Cifra de Vigenère é um método de criptografia que utiliza múltiplos deslocamentos no alfabeto, tornando-a mais segura do que cifras simples, como a de César. Seu funcionamento baseia-se em duas informações principais: a mensagem original (texto claro) e uma chave secreta.\n
Para iniciar o processo, a chave é repetida ou ajustada até possuir o mesmo comprimento da mensagem. Assim, cada caractere da mensagem terá um caractere correspondente da chave.\n
Em seguida, cada letra da mensagem e da chave é convertida para sua posição no alfabeto (por exemplo: A = 0, B = 1, C = 2, ..., Z = 25). Para criptografar, somam-se os valores numéricos da letra da mensagem e da letra da chave que estão na mesma posição. O resultado dessa soma é então reduzido usando a operação de módulo 26, garantindo que o valor permaneça dentro do intervalo do alfabeto.\n
O número obtido após o módulo 26 é convertido novamente para uma letra, gerando assim o caractere cifrado correspondente. Esse processo é repetido para todos os caracteres da mensagem, formando o texto criptografado.\n
Uma forma alternativa de visualizar esse processo é por meio da tabela de Vigenère. Nessa tabela, o alfabeto aparece tanto no topo quanto na lateral esquerda. Cada linha representa o alfabeto deslocado de acordo com a letra da chave.\n
Para encontrar o caractere cifrado utilizando a tabela, localiza-se a coluna correspondente à letra da mensagem e a linha correspondente à letra da chave. A letra na interseção entre essa linha e coluna será o resultado da criptografia para aquela posição.\n
Dessa forma, a Cifra de Vigenère consegue aplicar diferentes deslocamentos ao longo da mensagem, dificultando a análise de padrões e aumentando a segurança da criptografia.
`,
    substituicao: `A cifra de substituição é um método de criptografia no qual cada caractere da mensagem original é substituído por outro caractere do alfabeto. Essa substituição segue uma regra fixa, garantindo que duas letras diferentes nunca sejam mapeadas para o mesmo caractere, mantendo uma correspondência única entre elas.\n
Na visualização apresentada, o alfabeto em sua ordem padrão é exibido na linha superior, enquanto uma versão embaralhada (uma permutação aleatória) aparece logo abaixo. Para criptografar a mensagem, cada letra do texto original é substituída pela letra correspondente na mesma posição da linha inferior, formando assim a mensagem cifrada.\n
Embora esse método esconda a mensagem original, ele não é considerado seguro. A cifra de substituição é vulnerável à análise de frequência, uma técnica que observa quais letras aparecem com maior frequência no texto cifrado e as compara com as letras mais comuns do idioma. Dessa forma, é possível identificar padrões e, eventualmente, descobrir a mensagem original.`,

    deslocamento: `A cifra de deslocamento é um método de criptografia no qual cada letra da mensagem é substituída por outra, obtida ao se deslocar um número fixo de posições (X) no alfabeto.\n
Na visualização apresentada, há dois anéis contendo as letras do alfabeto: o anel interno representa as letras da mensagem original, enquanto o anel externo mostra os caracteres criptografados.\n
Ao rotacionar o anel interno em X posições, cada letra da mensagem original passa a se alinhar com uma nova letra no anel externo. A criptografia é realizada substituindo-se cada letra original pelo caractere correspondente alinhado no anel externo.`,
  },
  compressaoImagens: {
    rle: `O algoritmo Run-Length Encoding (RLE) é uma técnica de compressão de dados sem perdas que reduz o tamanho de uma imagem ao eliminar redundâncias. Redundância ocorre quando há repetições consecutivas de um mesmo valor, como pixels com a mesma cor.\n
O funcionamento do RLE é simples: ao percorrer a imagem (pixel a pixel, geralmente da esquerda para a direita e de cima para baixo), o algoritmo identifica sequências de pixels com o mesmo valor. Em vez de armazenar cada pixel individualmente, ele armazena apenas dois valores: a quantidade de repetições e o valor do pixel.\n
Por exemplo, uma sequência como: [azul, azul, azul, azul]\n
pode ser representada como: (4, azul)\n
Na visualização apresentada, o sistema percorre a imagem e agrupa pixels consecutivos iguais, formando pares (quantidade, valor). Cada par representa um trecho da imagem comprimida.\n
Ao final do processo, é possível calcular o tamanho da imagem comprimida considerando que cada par ocupa uma quantidade fixa de bytes (por exemplo, 1 byte para a quantidade e 1 byte para o valor, dependendo da implementação). Esse valor pode então ser comparado com o tamanho original da imagem, que normalmente considera 1 byte por pixel.\n
Com isso, também é possível calcular a porcentagem de redução obtida com a compressão.\n
É importante destacar que o RLE é mais eficiente em imagens com alta redundância, ou seja, com grandes áreas de cor uniforme. Em imagens com muita variação de cores (como fotografias), o algoritmo pode não ser eficaz e, em alguns casos, pode até aumentar o tamanho dos dados.`
  }
};
