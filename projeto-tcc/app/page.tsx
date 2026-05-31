"use client";
import FeatureCard from "@/components/FeatureCard";
import MainPageTitle from "@/components/MainPageTitle";

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      <MainPageTitle
        title={"Insight"}
        subtitle={"Explorando computação através de representações visuais"}
      />

      <div className="gap-x-10 gap-y-7 grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 2xl:gap-20 my-5 2xl:my-10">
        <FeatureCard
          name={"Bases numéricas"}
          imgPath="/images/number-bases.png"
          alt={
            "A imagem possui um fundo azul e o desenho de uma tabela com quatro colunas e duas linhas, exibindo na linha superior os digitos em binário e na inferior o valor em potência de dois de cada posição."
          }
          href="/number-bases/params"
        />

        <FeatureCard
          name={"Aritmética binária"}
          imgPath="/images/binary-arithmetic.png"
          alt={
            "A imagem possui um fundo verde e o desenho de dois números binários de quatro dígitos sendo somados, no sistema de soma convencional onde os números são dispostos um acima do outro, de forma alinhada. Na linha do resultado, são exibidos quatro letras 'X'."
          }
          href="/binary-arithmetic/params"
        />

        <FeatureCard
          name={"Compressão de imagens"}
          imgPath="/images/image-compression.png"
          alt={
            "A imagem possui um fundo laranja e o desenho de uma matriz 4x4, com alguns quadrados pintados em laranja claro e outros em marrom."
          }
          href="/image-compression/params"
        />

        <div className="col-start-1 sm:col-start-2 2xl:col-start-4">
          <FeatureCard
            name={"Criptografia"}
            imgPath="/images/cryptography.png"
            alt={
              "A imagem possui um fundo rosa e o desenho de um cadeado branco no centro, com uma linha de dígitos aleatórios por trás."
            }
            href="/cryptography/params"
          />
        </div>
      </div>
    </div>
  );
}
