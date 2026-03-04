"use client";
import FeatureCard from "@/components/FeatureCard";
import MainPageTitle from "@/components/MainPageTitle";

export default function Home() {

  return (
    <div className="flex flex-col items-center">
      <MainPageTitle title={"Lorem Ipsum"} subtitle={"Lorem ipsum dolor sit amet, consectetur adipiscing elit"} />

      <div className="gap-x-10 gap-y-7 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 2xl:gap-20 my-5 2xl:my-10">
        <FeatureCard
          name={"Bases numéricas"}
          imgPath="/images/bases-numericas.png"
          alt={"A imagem possui um fundo azul e o desenho de uma tabela com quatro colunas e duas linhas, exibindo na linha superior os digitos em binário e na inferior o valor em potência de dois de cada posição."}
          href="/bases-numericas/parametros"
        />

        <FeatureCard
          name={"Aritmética binária"}
          imgPath="/images/aritmetica-binaria.png"
          alt={"A imagem possui um fundo verde e o desenho de dois números binários de quatro dígitos sendo somados, no sistema de soma convencional onde os números são dispostos um acima do outro, de forma alinhada. Na linha do resultado, são exibidos quatro letras 'X'."}
          href="/aritmetica-binaria/parametros"
        />

        <FeatureCard
          name={"Compressão de imagens"}
          imgPath="/images/compressao-imagens.png"
          alt={"A imagem possui um fundo laranja e o desenho de uma matriz 4x4, com alguns quadrados pintados em laranja claro e outros em marrom."}
          href="/compressao-imagens/parametros"
        />

        <div className="col-start-1 sm:col-start-2 2xl:col-start-4">
          <FeatureCard
            name={"Criptografia"}
            imgPath="/images/criptografia.png"
            alt={"A imagem possui um fundo rosa e o desenho de um cadeado branco no centro, com uma linha de dígitos aleatórios por trás."}
            href="/criptografia/parametros"
          />
        </div>
      </div>
    </div>
  );
}
