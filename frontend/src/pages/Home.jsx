// import React, { useContext, useEffect, useRef, useState } from 'react'
// import { userDataContext } from '../context/UserContext'
// import { useNavigate } from 'react-router-dom'
// import axios from 'axios'
// import aiImg from "../assets/ai.gif"
// import { CgMenuRight } from "react-icons/cg";
// import { RxCross1 } from "react-icons/rx";
// import userImg from "../assets/user.gif"
// function Home() {
//   const {userData,serverUrl,setUserData,getGeminiResponse}=useContext(userDataContext)
//   const navigate=useNavigate()
//   const [listening,setListening]=useState(false)
//   const [userText,setUserText]=useState("")
//   const [aiText,setAiText]=useState("")
//   const isSpeakingRef=useRef(false)
//   const recognitionRef=useRef(null)
//   const [ham,setHam]=useState(false)
//   const isRecognizingRef=useRef(false)
//   const synth=window.speechSynthesis

//   const handleLogOut=async ()=>{
//     try {
//       const result=await axios.get(`${serverUrl}/api/auth/logout`,{withCredentials:true})
//       setUserData(null)
//       navigate("/signin")
//     } catch (error) {
//       setUserData(null)
//       console.log(error)
//     }
//   }

//   const startRecognition = () => {
    
//    if (!isSpeakingRef.current && !isRecognizingRef.current) {
//     try {
//       recognitionRef.current?.start();
//       console.log("Recognition requested to start");
//     } catch (error) {
//       if (error.name !== "InvalidStateError") {
//         console.error("Start error:", error);
//       }
//     }
//   }
    
//   }

//   const speak=(text)=>{
//     const utterence=new SpeechSynthesisUtterance(text)
//     utterence.lang = 'hi-IN';
//     const voices =window.speechSynthesis.getVoices()
//     const hindiVoice = voices.find(v => v.lang === 'hi-IN');
//     if (hindiVoice) {
//       utterence.voice = hindiVoice;
//     }


//     isSpeakingRef.current=true
//     utterence.onend=()=>{
//         setAiText("");
//   isSpeakingRef.current = false;
//   setTimeout(() => {
//     startRecognition(); // ⏳ Delay se race condition avoid hoti hai
//   }, 800);
//     }
//    synth.cancel(); // 🛑 pehle se koi speech ho to band karo
// synth.speak(utterence);
//   }

//   const handleCommand=(data)=>{
//     const {type,userInput,response}=data
//       speak(response);
    
//     if (type === 'google-search') {
//       const query = encodeURIComponent(userInput);
//       window.open(`https://www.google.com/search?q=${query}`, '_blank');
//     }
//      if (type === 'calculator-open') {
  
//       window.open(`https://www.google.com/search?q=calculator`, '_blank');
//     }
//      if (type === "instagram-open") {
//       window.open(`https://www.instagram.com/`, '_blank');
//     }
//     if (type ==="facebook-open") {
//       window.open(`https://www.facebook.com/`, '_blank');
//     }
//      if (type ==="weather-show") {
//       window.open(`https://www.google.com/search?q=weather`, '_blank');
//     }

//     if (type === 'youtube-search' || type === 'youtube-play') {
//       const query = encodeURIComponent(userInput);
//       window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank');
//     }

//   }

// useEffect(() => {
//   const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//   const recognition = new SpeechRecognition();

//   recognition.continuous = true;
//   recognition.lang = 'en-US';
//   recognition.interimResults = false;

//   recognitionRef.current = recognition;

//   let isMounted = true;  // flag to avoid setState on unmounted component

//   // Start recognition after 1 second delay only if component still mounted
//   const startTimeout = setTimeout(() => {
//     if (isMounted && !isSpeakingRef.current && !isRecognizingRef.current) {
//       try {
//         recognition.start();
//         console.log("Recognition requested to start");
//       } catch (e) {
//         if (e.name !== "InvalidStateError") {
//           console.error(e);
//         }
//       }
//     }
//   }, 1000);

//   recognition.onstart = () => {
//     isRecognizingRef.current = true;
//     setListening(true);
//   };

//   recognition.onend = () => {
//     isRecognizingRef.current = false;
//     setListening(false);
//     if (isMounted && !isSpeakingRef.current) {
//       setTimeout(() => {
//         if (isMounted) {
//           try {
//             recognition.start();
//             console.log("Recognition restarted");
//           } catch (e) {
//             if (e.name !== "InvalidStateError") console.error(e);
//           }
//         }
//       }, 1000);
//     }
//   };

//   recognition.onerror = (event) => {
//     console.warn("Recognition error:", event.error);
//     isRecognizingRef.current = false;
//     setListening(false);
//     if (event.error !== "aborted" && isMounted && !isSpeakingRef.current) {
//       setTimeout(() => {
//         if (isMounted) {
//           try {
//             recognition.start();
//             console.log("Recognition restarted after error");
//           } catch (e) {
//             if (e.name !== "InvalidStateError") console.error(e);
//           }
//         }
//       }, 1000);
//     }
//   };

//   recognition.onresult = async (e) => {
//     const transcript = e.results[e.results.length - 1][0].transcript.trim();
//     if (transcript.toLowerCase().includes(userData.assistantName.toLowerCase())) {
//       setAiText("");
//       setUserText(transcript);
//       recognition.stop();
//       isRecognizingRef.current = false;
//       setListening(false);
//       const data = await getGeminiResponse(transcript);
//       console.log("Gemini data:", data);

//       handleCommand(data);
//       setAiText(data.response);
//       setUserText("");
//     }
//   };


//     const greeting = new SpeechSynthesisUtterance(`Hello ${userData.name}, what can I help you with?`);
//     greeting.lang = 'hi-IN';
   
//     window.speechSynthesis.speak(greeting);
 

//   return () => {
//     isMounted = false;
//     clearTimeout(startTimeout);
//     recognition.stop();
//     setListening(false);
//     isRecognizingRef.current = false;
//   };
// }, []);




//   return (
//     <div className='w-full h-[100vh] bg-gradient-to-t from-[black] to-[#02023d] flex justify-center items-center flex-col gap-[15px] overflow-hidden'>
//       <CgMenuRight className='lg:hidden text-white absolute top-[20px] right-[20px] w-[25px] h-[25px]' onClick={()=>setHam(true)}/>
//       <div className={`absolute lg:hidden top-0 w-full h-full bg-[#00000053] backdrop-blur-lg p-[20px] flex flex-col gap-[20px] items-start ${ham?"translate-x-0":"translate-x-full"} transition-transform`}>
//  <RxCross1 className=' text-white absolute top-[20px] right-[20px] w-[25px] h-[25px]' onClick={()=>setHam(false)}/>
//  <button className='min-w-[150px] h-[60px]  text-black font-semibold   bg-white rounded-full cursor-pointer text-[19px] ' onClick={handleLogOut}>Log Out</button>
//       <button className='min-w-[150px] h-[60px]  text-black font-semibold  bg-white  rounded-full cursor-pointer text-[19px] px-[20px] py-[10px] ' onClick={()=>navigate("/customize")}>Customize your Assistant</button>

// <div className='w-full h-[2px] bg-gray-400'></div>
// <h1 className='text-white font-semibold text-[19px]'>History</h1>

// <div className='w-full h-[400px] gap-[20px] overflow-y-auto flex flex-col truncate'>
//   {userData.history?.map((his,idx)=>(
//     <div key={idx} className='text-gray-200 text-[18px] w-full h-[30px]  '>{his}</div>
//   ))}

// </div>

//       </div>
//       <button className='min-w-[150px] h-[60px] mt-[30px] text-black font-semibold absolute hidden lg:block top-[20px] right-[20px]  bg-white rounded-full cursor-pointer text-[19px] ' onClick={handleLogOut}>Log Out</button>
//       <button className='min-w-[150px] h-[60px] mt-[30px] text-black font-semibold  bg-white absolute top-[100px] right-[20px] rounded-full cursor-pointer text-[19px] px-[20px] py-[10px] hidden lg:block ' onClick={()=>navigate("/customize")}>Customize your Assistant</button>
//       <div className='w-[300px] h-[400px] flex justify-center items-center overflow-hidden rounded-4xl shadow-lg'>
// <img src={userData?.assistantImage} alt="" className='h-full object-cover'/>
//       </div>
//       <h1 className='text-white text-[18px] font-semibold'>I'm {userData?.assistantName}</h1>
//       {!aiText && <img src={userImg} alt="" className='w-[200px]'/>}
//       {aiText && <img src={aiImg} alt="" className='w-[200px]'/>}


    
//     <h1 className='text-white text-[18px] font-semibold text-wrap'>{userText?userText:aiText?aiText:null}</h1>
      
//     </div>
//   )
// }

// export default Home

// import React, { useContext, useEffect, useRef, useState } from 'react';
// import { userDataContext } from '../context/UserContext';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import aiImg from "../assets/ai.gif";
// import { CgMenuRight } from "react-icons/cg";
// import { RxCross1 } from "react-icons/rx";
// import userImg from "../assets/user.gif";

// function Home() {
//   const { userData, serverUrl, setUserData, getGeminiResponse } = useContext(userDataContext);
//   const navigate = useNavigate();
//   const [listening, setListening] = useState(false);
//   const [userText, setUserText] = useState("");
//   const [aiText, setAiText] = useState("");
//   const [ham, setHam] = useState(false);

//   const isSpeakingRef = useRef(false);
//   const isRecognizingRef = useRef(false);
//   const recognitionRef = useRef(null);
//   const synth = window.speechSynthesis;

//   const handleLogOut = async () => {
//     try {
//       await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true });
//       setUserData(null);
//       navigate("/signin");
//     } catch (error) {
//       console.log(error);
//       setUserData(null);
//     }
//   };

//   const startRecognition = () => {
//     const recognition = recognitionRef.current;
//     if (!recognition) return;

//     let retries = 0;

//     const tryStart = () => {
//       if (isSpeakingRef.current) {
//         if (retries >= 30) {
//           console.warn("Too many retries. Forcing recognition.");
//           isSpeakingRef.current = false;
//         } else {
//           retries++;
//           setTimeout(tryStart, 500);
//           return;
//         }
//       }

//       if (isRecognizingRef.current) return;

//       try {
//         recognition.stop();
//         setTimeout(() => {
//           try {
//             recognition.start();
//             isRecognizingRef.current = true;
//             console.log("Recognition forcefully restarted.");
//           } catch (e) {
//             console.error("Recognition start error:", e);
//           }
//         }, 300);
//       } catch (e) {
//         console.error("Recognition stop error:", e);
//       }
//     };

//     tryStart();
//   };

//   const speak = (text) => {
//     if (!text) return;

//     const utterance = new SpeechSynthesisUtterance(text);
//     utterance.lang = 'hi-IN';

//     const voices = synth.getVoices();
//     const hindiVoice = voices.find(v => v.lang === 'hi-IN');
//     if (hindiVoice) {
//       utterance.voice = hindiVoice;
//     }

//     synth.cancel();
//     recognitionRef.current?.stop();
//     isRecognizingRef.current = false;
//     isSpeakingRef.current = true;

//     const maxSpeakTime = Math.max(3000, text.length * 100);
//     const fallbackTimeout = setTimeout(() => {
//       if (isSpeakingRef.current) {
//         console.warn("Speech fallback triggered");
//         isSpeakingRef.current = false;
//         startRecognition();
//       }
//     }, maxSpeakTime);

//     utterance.onend = () => {
//       clearTimeout(fallbackTimeout);
//       isSpeakingRef.current = false;
//       setAiText("");
//       startRecognition();
//     };

//     synth.speak(utterance);
//   };

//   const handleCommand = (data) => {
//     const { type, userInput, response } = data;
//     speak(response);

//     if (type === 'google-search') {
//       window.open(`https://www.google.com/search?q=${encodeURIComponent(userInput)}`, '_blank');
//     } else if (type === 'calculator-open') {
//       window.open(`https://www.google.com/search?q=calculator`, '_blank');
//     } else if (type === 'instagram-open') {
//       window.open(`https://www.instagram.com/`, '_blank');
//     } else if (type === 'facebook-open') {
//       window.open(`https://www.facebook.com/`, '_blank');
//     } else if (type === 'weather-show') {
//       window.open(`https://www.google.com/search?q=weather`, '_blank');
//     } else if (type === 'youtube-search' || type === 'youtube-play') {
//       window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(userInput)}`, '_blank');
//     }
//   };

//   useEffect(() => {
//     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//     const recognition = new SpeechRecognition();

//     recognition.continuous = true;
//     recognition.lang = 'en-US';
//     recognition.interimResults = false;

//     recognitionRef.current = recognition;
//     let isMounted = true;

//     const startTimeout = setTimeout(() => {
//       if (isMounted && !isSpeakingRef.current && !isRecognizingRef.current) {
//         try {
//           recognition.start();
//           console.log("Recognition requested to start");
//         } catch (e) {
//           if (e.name !== "InvalidStateError") console.error(e);
//         }
//       }
//     }, 1000);

//     recognition.onstart = () => {
//       isRecognizingRef.current = true;
//       setListening(true);
//     };

//     recognition.onend = () => {
//       isRecognizingRef.current = false;
//       setListening(false);
//       if (isMounted && !isSpeakingRef.current) {
//         setTimeout(() => {
//           if (isMounted) {
//             try {
//               recognition.start();
//               console.log("Recognition restarted");
//             } catch (e) {
//               if (e.name !== "InvalidStateError") console.error(e);
//             }
//           }
//         }, 1000);
//       }
//     };

//     recognition.onerror = (event) => {
//       console.warn("Recognition error:", event.error);
//       isRecognizingRef.current = false;
//       setListening(false);
//       if (event.error !== "aborted" && isMounted && !isSpeakingRef.current) {
//         setTimeout(() => {
//           if (isMounted) {
//             try {
//               recognition.start();
//               console.log("Recognition restarted after error");
//             } catch (e) {
//               if (e.name !== "InvalidStateError") console.error(e);
//             }
//           }
//         }, 1000);
//       }
//     };

//     recognition.onresult = async (e) => {
//       const transcript = e.results[e.results.length - 1][0].transcript.trim();
//       if (transcript.toLowerCase().includes(userData.assistantName.toLowerCase())) {
//         setUserText(transcript);
//         recognition.stop();
//         isRecognizingRef.current = false;
//         setListening(false);
//         const data = await getGeminiResponse(transcript);
//         console.log("Gemini data:", data);

//         handleCommand(data);
//         setAiText(data.response);
//         setUserText("");
//       }
//     };

//     const greeting = new SpeechSynthesisUtterance(`Hello ${userData.name}, what can I help you with?`);
//     greeting.lang = 'hi-IN';
//     synth.speak(greeting);

//     return () => {
//       isMounted = false;
//       clearTimeout(startTimeout);
//       recognition.stop();
//       isRecognizingRef.current = false;
//       setListening(false);
//     };
//   }, []);

//   return (
//     <div className='w-full h-[100vh] bg-gradient-to-t from-black to-[#02023d] flex justify-center items-center flex-col gap-[15px] overflow-hidden'>
//       <CgMenuRight className='lg:hidden text-white absolute top-[20px] right-[20px] w-[25px] h-[25px]' onClick={() => setHam(true)} />
//       <div className={`absolute lg:hidden top-0 w-full h-full bg-[#00000053] backdrop-blur-lg p-[20px] flex flex-col gap-[20px] items-start ${ham ? "translate-x-0" : "translate-x-full"} transition-transform`}>
//         <RxCross1 className='text-white absolute top-[20px] right-[20px] w-[25px] h-[25px]' onClick={() => setHam(false)} />
//         <button className='min-w-[150px] h-[60px] bg-white rounded-full text-black font-semibold text-[19px]' onClick={handleLogOut}>Log Out</button>
//         <button className='min-w-[150px] h-[60px] bg-white rounded-full text-black font-semibold text-[19px] px-[20px] py-[10px]' onClick={() => navigate("/customize")}>Customize your Assistant</button>
//         <button onClick={startRecognition} className='bg-white text-black px-4 py-2 rounded-full text-[18px]'>Restart Listening</button>
//         <div className='w-full h-[2px] bg-gray-400'></div>
//         <h1 className='text-white font-semibold text-[19px]'>History</h1>
//         <div className='w-full h-[400px] gap-[20px] overflow-y-auto flex flex-col truncate'>
//           {userData.history?.map((his, idx) => (
//             <div key={idx} className='text-gray-200 text-[18px] w-full h-[30px]'>{his}</div>
//           ))}
//         </div>
//       </div>
//       <button className='min-w-[150px] h-[60px] mt-[30px] text-black font-semibold absolute hidden lg:block top-[20px] right-[20px] bg-white rounded-full' onClick={handleLogOut}>Log Out</button>
//       <button className='min-w-[150px] h-[60px] mt-[30px] text-black font-semibold bg-white absolute top-[100px] right-[20px] rounded-full hidden lg:block px-[20px] py-[10px]' onClick={() => navigate("/customize")}>Customize your Assistant</button>
//       <button onClick={startRecognition} className='absolute top-[180px] right-[20px] text-black bg-white px-4 py-2 rounded-full text-[16px] hidden lg:block'>Restart Listening</button>
//       <div className='w-[300px] h-[400px] flex justify-center items-center overflow-hidden rounded-4xl shadow-lg'>
//         <img src={userData?.assistantImage} alt="Assistant" className='h-full object-cover' />
//       </div>
//       <h1 className='text-white text-[18px] font-semibold'>I'm {userData?.assistantName}</h1>
//       {!aiText && <img src={userImg} alt="user" className='w-[200px]' />}
//       {aiText && <img src={aiImg} alt="ai" className='w-[200px]' />}
//       <h1 className='text-white text-[18px] font-semibold text-wrap'>{userText ? userText : aiText ? aiText : null}</h1>
//     </div>
//   );
// }

// export default Home;


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

  const handleCommand = (data) => {
    const { type, userInput, response } = data;
    speak(response);

    const open = (url) => window.open(url, '_blank');
    if (type === 'google-search') open(`https://www.google.com/search?q=${encodeURIComponent(userInput)}`);
    else if (type === 'calculator-open') open(`https://www.google.com/search?q=calculator`);
    else if (type === 'instagram-open') open(`https://www.instagram.com/`);
    else if (type === 'facebook-open') open(`https://www.facebook.com/`);
    else if (type === 'weather-show') open(`https://www.google.com/search?q=weather`);
    else if (type === 'youtube-search' || type === 'youtube-play') open(`https://www.youtube.com/results?search_query=${encodeURIComponent(userInput)}`);
  };

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognitionRef.current = recognition;

    let mounted = true;

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
    <div className='w-full h-screen bg-gradient-to-t from-black to-[#02023d] flex flex-col items-center justify-center gap-4 relative overflow-hidden'>
      <CgMenuRight className='lg:hidden text-white absolute top-5 right-5 w-6 h-6' onClick={() => setHam(true)} />
      <div className={`absolute lg:hidden top-0 w-full h-full bg-[#00000053] backdrop-blur-lg p-5 flex flex-col gap-4 ${ham ? "translate-x-0" : "translate-x-full"} transition-transform`}>
        <RxCross1 className='text-white absolute top-5 right-5 w-6 h-6' onClick={() => setHam(false)} />
        <button className='bg-white text-black rounded-full font-semibold text-lg px-5 py-2' onClick={handleLogOut}>Log Out</button>
        <button className='bg-white text-black rounded-full font-semibold text-lg px-5 py-2' onClick={() => navigate("/customize")}>Customize</button>
        <div className='h-[2px] bg-gray-400 w-full'></div>
        <h1 className='text-white font-semibold text-lg'>History</h1>
        <div className='overflow-y-auto h-[400px] text-gray-200 text-base flex flex-col gap-2'>
          {userData.history?.map((his, idx) => <div key={idx}>{his}</div>)}
        </div>
      </div>

      <div className='absolute top-5 right-5 hidden lg:flex gap-4'>
        <button className='bg-white text-black rounded-full font-semibold px-5 py-2' onClick={handleLogOut}>Log Out</button>
        <button className='bg-white text-black rounded-full font-semibold px-5 py-2' onClick={() => navigate("/customize")}>Customize</button>
      </div>

      <div className='w-[300px] h-[400px] overflow-hidden rounded-4xl shadow-lg'>
        <img src={userData?.assistantImage} alt="Assistant" className='h-full object-cover w-full' />
      </div>
      <h1 className='text-white text-lg font-semibold'>I'm {userData?.assistantName}</h1>
      <img src={aiText ? aiImg : userImg} alt="avatar" className='w-[200px]' />
      <h1 className='text-white text-lg font-semibold text-center px-4'>{userText || aiText}</h1>
    </div>
  );
}

export default Home;
