import React, { useContext, useEffect, useRef, useState } from 'react';
import { userDataContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import aiImg from "../assets/ai.gif";
import userImg from "../assets/user.gif";
import { CgMenuRight } from "react-icons/cg";
import { RxCross1 } from "react-icons/rx";

function Home() {
  const { userData, serverUrl, setUserData, getGeminiResponse } = useContext(userDataContext);
  const navigate = useNavigate();

  const [userText, setUserText] = useState("");
  const [aiText, setAiText] = useState("");
  const [ham, setHam] = useState(false);

  const synth = window.speechSynthesis;
  const isSpeakingRef = useRef(false);
  const isRecognizingRef = useRef(false);
  const recognitionRef = useRef(null);

  const speak = (text) => {
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'hi-IN';
    const voices = synth.getVoices();
    const hindiVoice = voices.find(v => v.lang === 'hi-IN');
    if (hindiVoice) utterance.voice = hindiVoice;

    synth.cancel();
    recognitionRef.current?.stop();
    isRecognizingRef.current = false;
    isSpeakingRef.current = true;

    const fallback = setTimeout(() => {
      if (isSpeakingRef.current) {
        isSpeakingRef.current = false;
        startRecognition();
      }
    }, Math.max(3000, text.length * 100));

    utterance.onend = () => {
      clearTimeout(fallback);
      isSpeakingRef.current = false;
      setAiText("");
      startRecognition();
    };

    synth.speak(utterance);
  };

  const startRecognition = () => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    let retries = 0;
    const tryStart = () => {
      if (isSpeakingRef.current) {
        if (retries++ >= 30) isSpeakingRef.current = false;
        else return setTimeout(tryStart, 500);
      }

      if (isRecognizingRef.current) return;

      try {
        recognition.stop();
        setTimeout(() => {
          try {
            recognition.start();
            isRecognizingRef.current = true;
          } catch (e) {
            console.error("Recognition start error:", e);
          }
        }, 300);
      } catch (e) {
        console.error("Recognition stop error:", e);
      }
    };

    tryStart();
  };

  const handleCommand = async (data) => {
    const { type, userInput, response } = data;
    speak(response);

    const open = (url) => window.open(url, '_blank');
    if (type === 'google-search') open(`https://www.google.com/search?q=${encodeURIComponent(userInput)}`);
    else if (type === 'calculator-open') open(`https://www.google.com/search?q=calculator`);
    else if (type === 'instagram-open') open(`https://www.instagram.com/`);
    else if (type === 'facebook-open') open(`https://www.facebook.com/`);
    else if (type === 'weather-show') open(`https://www.google.com/search?q=weather`);
    else if (type === 'youtube-search' || type === 'youtube-play') open(`https://www.youtube.com/results?search_query=${encodeURIComponent(userInput)}`);

    try {
      const res = await axios.get(`${serverUrl}/api/user/current`, { withCredentials: true });
      setUserData(res.data);
    } catch (err) {
      console.error("Failed to refresh user after command:", err);
    }
  };

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognitionRef.current = recognition;

    let mounted = true;

    (async () => {
      try {
        const res = await axios.get(`${serverUrl}/api/user/current`, { withCredentials: true });
        setUserData(res.data);
      } catch (err) {
        console.error("Failed to fetch current user:", err);
      }
    })();

    setTimeout(() => {
      if (mounted && !isSpeakingRef.current && !isRecognizingRef.current) {
        try {
          recognition.start();
        } catch (e) {
          if (e.name !== "InvalidStateError") console.error(e);
        }
      }
    }, 1000);

    recognition.onstart = () => (isRecognizingRef.current = true);
    recognition.onend = () => {
      isRecognizingRef.current = false;
      if (mounted && !isSpeakingRef.current) {
        setTimeout(() => {
          try {
            recognition.start();
          } catch (e) {
            if (e.name !== "InvalidStateError") console.error(e);
          }
        }, 1000);
      }
    };

    recognition.onerror = (e) => {
      isRecognizingRef.current = false;
      if (e.error !== "aborted" && mounted && !isSpeakingRef.current) {
        setTimeout(() => {
          try {
            recognition.start();
          } catch (e) {
            if (e.name !== "InvalidStateError") console.error(e);
          }
        }, 1000);
      }
    };

    recognition.onresult = async (e) => {
      const transcript = e.results[e.results.length - 1][0].transcript.trim();
      if (transcript.toLowerCase().includes(userData.assistantName.toLowerCase())) {
        setUserText(transcript);
        recognition.stop();
        isRecognizingRef.current = false;

        const data = await getGeminiResponse(transcript);
        setAiText(data.response);
        setUserText("");
        handleCommand(data);
      }
    };

    const greeting = new SpeechSynthesisUtterance(`Hello ${userData.name}, what can I help you with?`);
    greeting.lang = 'hi-IN';
    synth.speak(greeting);

    return () => {
      mounted = false;
      recognition.stop();
      isRecognizingRef.current = false;
    };
  }, []);

  const handleLogOut = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true });
    } catch {}
    setUserData(null);
    navigate("/signin");
  };

  return (
    <div className='w-full min-h-screen bg-gradient-to-t from-black to-[#02023d] flex flex-col items-center justify-center gap-6 p-6 pt-24 relative lg:pl-[320px]'>
      {/* Sidebar on Desktop */}
      <div className='hidden lg:flex flex-col gap-3 text-white absolute left-5 top-5 bottom-5 w-[300px] bg-white/10 backdrop-blur-lg rounded-xl p-4 overflow-y-auto z-20'>
        <h2 className='text-lg font-semibold'>History</h2>
        <button
          className='bg-red-600 text-white rounded-full text-sm px-3 py-1 self-start'
          onClick={async () => {
            try {
              await axios.delete(`${serverUrl}/api/user/history`, { withCredentials: true });
              const res = await axios.get(`${serverUrl}/api/user/current`, { withCredentials: true });
              setUserData(res.data);
            } catch (err) {
              console.error("Failed to clear history:", err);
            }
          }}
        >
          Clear History
        </button>
        <div className='flex flex-col gap-2'>
          {userData?.history?.length > 0 ? (
            userData.history.map((his, idx) => (
              <div key={idx} className='bg-white/10 p-2 rounded'>
                <p>🗣️ {his}</p>
              </div>
            ))
          ) : (
            <p className='text-gray-300 italic'>No history yet</p>
          )}
        </div>
      </div>

      {/* Hamburger Menu on Mobile */}
      <CgMenuRight className='lg:hidden text-white absolute top-5 right-5 w-6 h-6' onClick={() => setHam(true)} />
      <div className={`absolute lg:hidden top-0 w-full h-full bg-[#00000053] backdrop-blur-lg p-5 flex flex-col gap-4 ${ham ? "translate-x-0" : "translate-x-full"} transition-transform`}>
        <RxCross1 className='text-white absolute top-5 right-5 w-6 h-6' onClick={() => setHam(false)} />
        <button className='bg-white text-black rounded-full font-semibold text-lg px-5 py-2' onClick={handleLogOut}>Log Out</button>
        <button className='bg-white text-black rounded-full font-semibold text-lg px-5 py-2' onClick={() => navigate("/customize")}>Customize</button>
        <div className='h-[2px] bg-gray-400 w-full'></div>
        <h1 className='text-white font-semibold text-lg'>History</h1>
        <button
          className='bg-red-600 text-white rounded-full font-semibold text-sm px-3 py-1 self-start'
          onClick={async () => {
            try {
              await axios.delete(`${serverUrl}/api/user/history`, { withCredentials: true });
              const res = await axios.get(`${serverUrl}/api/user/current`, { withCredentials: true });
              setUserData(res.data);
            } catch (err) {
              console.error("Failed to clear history:", err);
            }
          }}
        >
          Clear History
        </button>
        <div className='overflow-y-auto h-[400px] text-gray-200 text-base flex flex-col gap-2'>
          {userData?.history?.length > 0 ? (
            userData.history.map((his, idx) => (
              <div key={idx} className='bg-white/10 p-2 rounded'>
                <p className='text-white'>🗣️ {his}</p>
              </div>
            ))
          ) : (
            <p className='text-gray-400 italic'>No history yet</p>
          )}
        </div>
      </div>

      {/* Top Right Buttons */}
      <div className='absolute top-5 right-5 hidden lg:flex gap-4'>
        <button className='bg-white text-black rounded-full font-semibold px-5 py-2' onClick={handleLogOut}>Log Out</button>
        <button className='bg-white text-black rounded-full font-semibold px-5 py-2' onClick={() => navigate("/customize")}>Customize</button>
      </div>

      {/* Assistant Image */}
      <div className='w-[240px] h-[320px] sm:w-[300px] sm:h-[400px] overflow-hidden rounded-2xl shadow-xl'>
        <img src={userData?.assistantImage} alt="Assistant" className='h-full object-cover w-full' />
      </div>

      {/* Avatar and Text */}
      <img src={aiText ? aiImg : userImg} alt="avatar" className='w-[120px] sm:w-[200px]' />
      <h1 className='text-white text-lg font-semibold text-center max-w-xs sm:max-w-md px-4'>{userText || aiText}</h1>
    </div>
  );
}

export default Home;
