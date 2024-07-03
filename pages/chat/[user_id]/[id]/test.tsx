"use client";

import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useRouter } from 'next/router'; // Import useRouter

const socket = io({ path: '/api/socket' });
const Home = () => {
  const [message, setMessage] = useState('');
  const [imagePrompt, setImagePrompt] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const router = useRouter();

  const [{ chatId, userId }, setIds] = useState({ chatId: '', userId: "" });

  useEffect(() => {
    // Destructure and check if the values are present
    let { id: chatId, user_id: userId } = router.query as { id: string, user_id: string };
    if (chatId && userId) {
      socket.emit('joinRoom', { chatId, userId });
      setIds({ chatId, userId });

      socket.on('allMessages', (msgs) => {
        setMessages(msgs);
      });

      socket.on('responseMessage', (msg) => {
        console.log("message", msg)
      });
    }
  }, [router.query]);

  const sendMessage = () => {
    messages.push({ role: "user", content: message });
    socket.emit('newMessage', { messages, chatId, userId });
    setMessage('');
  };
  const requestImage = () => {
    messages.push({ role: "user", content: imagePrompt });
    socket.emit('requestImage', { messages, chatId, userId });
    setImagePrompt('');
  };

  return (
    <div >
      <input
        type="text"
        className='bg-black'
        placeholder="Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={sendMessage}>Send Message</button>
      <input
        type="text"
        className='bg-black'
        placeholder="Prompt"
        value={imagePrompt}
        onChange={(e) => setImagePrompt(e.target.value)}
      />
      <button onClick={requestImage}>Request Image</button>
      <div>
        {messages.map(({ role, content }, index) => (
          <div key={index}>{role == "user" ? "👨: " : '🤖: '}{content}</div>
        ))}
      </div>
    </div>
  );
};

export default Home;
