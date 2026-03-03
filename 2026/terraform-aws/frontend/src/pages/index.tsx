import { useEffect, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import styles from "@/styles/Home.module.css";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  const [word, setWord] = useState("To get started, click the Generate Word button");
  const [isSpinning, setIsSpinning] = useState(false);

  const fetchWord = async () => {
    setIsSpinning(true);
    const response = await fetch("https://mywhyaz7wn5467e6ypreusq3am0dwgoq.lambda-url.us-east-2.on.aws/");
    const body = await response.json();
    setWord(body['word']);
    setTimeout(() => setIsSpinning(false), 500);
  };

  return (
    <>
      <Head>
        <title>Random Word</title>
        <meta name="description" content="Generates random words" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div
        className={`${styles.page} ${geistSans.variable} ${geistMono.variable}`}
      >
        <main className={styles.main}>
          <Image
            className={`${styles.logo} ${isSpinning ? styles.spin : ""}`}
            src="/favicon.svg"
            alt="Random Word logo"
            width={100}
            height={100}
            priority
          />
          <div className={styles.text}>
            {word}
          </div>
          <button onClick={fetchWord} className={styles.cta}>Generate Word</button>
        </main>
      </div>
    </>
  );
}
