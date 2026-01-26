"use client";
import FeatureCard from "@/components/FeatureCard";
import PageTitle from "@/components/PageTitle";
import { useSettings } from "@/contexts/SettingsContext";

export default function Home() {
  const { language } = useSettings();

  const translations = {
    pt: {
      title: "Lorem Ipsum",
      subtitle: "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
      numericalBases: "Bases numéricas",
      binaryArithmetic: "Aritmética binária",
      imageCompression: "Compressão de imagens",
      cryptography: "Criptografia",
      altNumericalBases: "Imagem com fundo azul e uma tabela contendo duas linhas, a primeira contento dígitos binários e a segunda, seus correspondentes em bases decimais.",
      altBinaryArithmetic: "Imagem com fundo verde contendo a representação de uma soma entre números binários",
      altImageCompression: "Imagem com fundo laranja e um quadrado no centro, subdividido em 16 quadrados menores",
      altCriptography: "Imagem com fundo rosa, uma sequência de caracteres aleatórios e um cadeado no centro"
    },
    en: {
      title: "Lorem Ipsum",
      subtitle: "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
      numericalBases: "Numerical bases",
      binaryArithmetic: "Binary arithmetic",
      imageCompression: "Image compression",
      cryptography: "Cryptography",
      altNumericalBases: "Image with a blue background and a table containing two rows, the first showing binary digits and the second showing their corresponding decimal values",
      altBinaryArithmetic: "Image with a green background showing a representation of a sum between binary numbers",
      altImageCompression: "Image with an orange background and a square in the center, subdivided into 16 smaller squares",
      altCriptography: "Image with a pink background, a sequence of random characters, and a padlock in the center",
    },
    es: {
      title: "Lorem Ipsum",
      subtitle: "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
      numericalBases: "Bases numéricas",
      binaryArithmetic: "Aritmética binaria",
      imageCompression: "Compresión de imágenes",
      cryptography: "Criptografía",
      altNumericalBases: "Imagen con fondo azul y una tabla que contiene dos filas: la primera muestra dígitos binarios y la segunda sus valores correspondientes en base decimal",
      altBinaryArithmetic: "Imagen con fondo verde que muestra la representación de una suma entre números binarios",
      altImageCompression: "Imagen con fondo naranja y un cuadrado en el centro, subdividido en 16 cuadrados más pequeños",
      altCriptography: "Imagen con fondo rosa, una secuencia de caracteres aleatorios y un candado en el centro",
    },
  } as const;

  const titulo = translations[language].title;
  const subtitulo = translations[language].subtitle;
  const basesNumericas = translations[language].numericalBases;
  const aritmeticaBinaria = translations[language].binaryArithmetic;
  const compressaoImagens = translations[language].imageCompression;
  const criptografia = translations[language].cryptography;
  const altBasesNumericas = translations[language].altNumericalBases;
  const altAritmeticaBinaria = translations[language].altBinaryArithmetic;
  const altCompressaoImagens = translations[language].altImageCompression;
  const altCriptografia = translations[language].altCriptography;

  return (
    <div className="flex flex-col items-center">
      <PageTitle title={titulo} subtitle={subtitulo} />

      <div className="gap-x-10 gap-y-7 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 2xl:gap-20 my-5 2xl:my-10">
        <FeatureCard
          name={basesNumericas}
          imgPath="/images/bases-numericas.png"
          alt={altBasesNumericas}
          href="/bases-numericas"
        />

        <FeatureCard
          name={aritmeticaBinaria}
          imgPath="/images/aritmetica-binaria.png"
          alt={altAritmeticaBinaria}
          href="/aritmetica-binaria"
        />

        <FeatureCard
          name={compressaoImagens}
          imgPath="/images/compressao-imagens.png"
          alt={altCompressaoImagens}
          href="/compressao-imagens"
        />

        <div className="col-start-1 sm:col-start-2 2xl:col-start-4">
          <FeatureCard
            name={criptografia}
            imgPath="/images/criptografia.png"
            alt={altCriptografia}
            href="/criptografia"
          />
        </div>
      </div>
    </div>
  );
}
