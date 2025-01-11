import Head from "next/head";
import { Geist, Geist_Mono } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { useEffect, useRef, useState } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


type Message = {
  text: string;
  isCurrentUser: boolean;
};

export default function Home() {
  const connection = useRef<WebSocket>(null)
  const scrollRef = useRef(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

  const handleNewMessageChange = (event: React.SyntheticEvent) => {
    const element = event.target as HTMLInputElement;
    setNewMessage(element.value);
  };

  const handleSend = () => {
    if (!newMessage) {
      return;
    }

    setMessages((messages) => [...messages, { text: newMessage, isCurrentUser: true }]);
    setTimeout(() => {
      if (scrollRef.current) {
        (scrollRef.current as HTMLInputElement)
          .scrollIntoView({ block: 'end', inline: 'end', behavior: 'smooth' });
      }
    }, 0);

    const webSocketMessage = {
      "action": "sendMessage",
      "message": newMessage,
    };
    connection.current?.send(JSON.stringify(webSocketMessage));

    setNewMessage('');
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.keyCode === 13) {
      handleSend();
    }
  };

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_WEBSOCKET_URL) {
      console.error('The NEXT_PUBLIC_WEBSOCKET_URL env var should be set')
      return;
    }
    const webSocket = new WebSocket(process.env.NEXT_PUBLIC_WEBSOCKET_URL);

    webSocket.onerror = (event) => {
      console.error('websocket error', event);
    };

    webSocket.onmessage = (event) => {
      setMessages((messages) => [...messages, { text: event.data, isCurrentUser: false }]);
      setTimeout(() => {
        if (scrollRef.current) {
          (scrollRef.current as HTMLInputElement)
            .scrollIntoView({ block: 'end', inline: 'end', behavior: 'smooth' });
        }
      }, 0);
    };

    connection.current = webSocket;

    return () => connection.current?.close();
  }, []);

  return (
    <>
      <Head>
        <title>WebSocket Chat App</title>
        <meta name="description" content="Chat with others using a WebSocket connection" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div
        className={`${styles.page} ${geistSans.variable} ${geistMono.variable}`}
      >
        <main className={styles.main}>
          <div className={styles.chat}>
            { messages.length > 0 &&
              messages.map((message, index) => (
                <div
                  key={index}
                  className={[
                    styles.message,
                    message.isCurrentUser ? styles.messageRight : styles.messageLeft
                  ].join(' ')}
                >
                  {message.text}
                </div>
              ))
            }
            {messages.length === 0 && (
              <div className={styles.messageCenter}>No messages</div>
            )}

            <div ref={scrollRef}></div>
          </div>

          <div className={styles.action}>
            <input
              className={styles.newMessage}
              placeholder="Message"
              value={newMessage}
              onChange={handleNewMessageChange}
              onKeyDown={handleKeyDown}
            />

            <button
              className={styles.sendButton}
              onClick={handleSend}
            >
              Send
            </button>
          </div>
        </main>
      </div>
    </>
  );
}
