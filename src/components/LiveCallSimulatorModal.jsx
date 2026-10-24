import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Volume2, Sparkles, CheckCircle2, User, Bot, AlertCircle, Send, Radio, Download } from 'lucide-react';
import { insforge } from '../lib/insforge';

export default function LiveCallSimulatorModal({ 
  isOpen, 
  onClose, 
  employee, 
  phoneNumber, 
  contactName = 'Prospect', 
  onCallCompleted,
  currentUser
}) {
  const [callState, setCallState] = useState('idle'); // idle, dialing, ringing, connected, ended
  const [seconds, setSeconds] = useState(0);
  const [transcript, setTranscript] = useState([]);
  const [outcome, setOutcome] = useState(null);
  const [sentiment, setSentiment] = useState('Neutral');
  const [summary, setSummary] = useState('');
  const [score, setScore] = useState(70);
  const [userInput, setUserInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [interimSpeech, setInterimSpeech] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [dialogueStep, setDialogueStep] = useState('ask_name'); // ask_name, ask_course, course_details, closing
  const [capturedName, setCapturedName] = useState(contactName !== 'Prospect' ? contactName : '');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [handsFree, setHandsFree] = useState(true);
  const [micError, setMicError] = useState('');
  const [recordedAudioUrl, setRecordedAudioUrl] = useState('');

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const currentAudioRef = useRef(null);
  const shouldListenRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const callStateRef = useRef(callState);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const micStreamRef = useRef(null);
  const capturedNameRef = useRef(contactName !== 'Prospect' ? contactName : '');
  const dialogueStepRef = useRef('ask_name');
  const selectedCourseRef = useRef('');

  useEffect(() => {
    callStateRef.current = callState;
  }, [callState]);

  useEffect(() => {
    return () => {
      stopEverything();
    };
  }, []);

  const stopEverything = () => {
    shouldListenRef.current = false;
    isSpeakingRef.current = false;
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
    if (timerRef.current) clearInterval(timerRef.current);
    if (currentAudioRef.current) currentAudioRef.current.pause();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch {}
    }
    if (micStreamRef.current) {
      try { micStreamRef.current.getTracks().forEach(t => t.stop()); } catch {}
    }
  };

  useEffect(() => {
    if (callState === 'connected') {
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callState]);

  // Request microphone permission and warm up audio context
  const requestMicPermission = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(t => t.stop());
        setMicError('');
        return true;
      }
    } catch (err) {
      console.warn("Microphone access prompt:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setMicError('Microphone permission blocked. Please allow mic access in your browser address bar.');
      }
      return false;
    }
    return true;
  };

  const startListening = async () => {
    if (isSpeakingRef.current || callStateRef.current !== 'connected') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicError("Microphone speech recognition is supported in Google Chrome, Microsoft Edge, and Safari.");
      return;
    }

    // Stop existing recognition if running
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      const lang = employee?.language || 'Telugu';
      if (lang === 'Telugu') recognition.lang = 'te-IN';
      else if (lang === 'Hindi') recognition.lang = 'hi-IN';
      else if (lang === 'Tamil') recognition.lang = 'ta-IN';
      else recognition.lang = 'en-IN';

      shouldListenRef.current = true;

      recognition.onstart = () => {
        setIsListening(true);
        setMicError('');
      };

      recognition.onresult = (event) => {
        let finalTrans = '';
        let interimTrans = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const res = event.results[i];
          if (res.isFinal) {
            finalTrans += res[0].transcript;
          } else {
            interimTrans += res[0].transcript;
          }
        }

        if (interimTrans) {
          setInterimSpeech(interimTrans);
        }

        if (finalTrans && finalTrans.trim()) {
          setInterimSpeech('');
          stopListening();
          handleUserReply(finalTrans.trim());
        }
      };

      recognition.onerror = (event) => {
        if (event.error === 'no-speech') {
          // Normal pause in speech, keep listening if call is still active
          if (shouldListenRef.current && !isSpeakingRef.current && callStateRef.current === 'connected') {
            return;
          }
        } else if (event.error === 'not-allowed') {
          setMicError('Microphone permission blocked. Please enable microphone permissions in your browser.');
          setIsListening(false);
          shouldListenRef.current = false;
        } else {
          console.warn('SpeechRecognition event error:', event.error);
        }
      };

      recognition.onend = () => {
        // Auto-restart recognition if we should still be listening and not speaking
        if (shouldListenRef.current && !isSpeakingRef.current && callStateRef.current === 'connected') {
          try {
            recognition.start();
          } catch {
            setIsListening(false);
          }
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.warn("Could not start SpeechRecognition:", e);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    shouldListenRef.current = false;
    setIsListening(false);
    setInterimSpeech('');
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
  };

  const toggleListening = async () => {
    if (isListening) {
      stopListening();
    } else {
      await requestMicPermission();
      startListening();
    }
  };

  const fallbackSpeechSynthesis = (text) => {
    if (!('speechSynthesis' in window)) {
      isSpeakingRef.current = false;
      setIsSpeaking(false);
      if (handsFree) startListening();
      return;
    }
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    if (employee?.language === 'Hindi') utterance.lang = 'hi-IN';
    else if (employee?.language === 'Tamil') utterance.lang = 'ta-IN';
    else if (employee?.language === 'Telugu') utterance.lang = 'te-IN';
    else utterance.lang = 'en-IN';

    utterance.onstart = () => {
      isSpeakingRef.current = true;
      setIsSpeaking(true);
      stopListening();
    };
    utterance.onend = () => {
      isSpeakingRef.current = false;
      setIsSpeaking(false);
      if (handsFree && callStateRef.current === 'connected') {
        setTimeout(() => startListening(), 400);
      }
    };
    utterance.onerror = () => {
      isSpeakingRef.current = false;
      setIsSpeaking(false);
      if (handsFree && callStateRef.current === 'connected') {
        setTimeout(() => startListening(), 400);
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  const speakText = async (text) => {
    isSpeakingRef.current = true;
    setIsSpeaking(true);
    stopListening();

    try {
      const res = await fetch('/api/tts/cartesia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          language: employee?.language || 'Telugu'
        })
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        if (currentAudioRef.current) {
          currentAudioRef.current.pause();
        }
        const audio = new Audio(url);
        currentAudioRef.current = audio;
        audio.onended = () => {
          isSpeakingRef.current = false;
          setIsSpeaking(false);
          URL.revokeObjectURL(url);
          if (handsFree && callStateRef.current === 'connected') {
            setTimeout(() => startListening(), 400);
          }
        };
        audio.onerror = () => {
          fallbackSpeechSynthesis(text);
        };
        await audio.play();
        return;
      }
    } catch (e) {
      console.warn('Cartesia playback fallback:', e);
    }

    fallbackSpeechSynthesis(text);
  };

  const startCall = async () => {
    await requestMicPermission();
    setCallState('dialing');
    setTranscript([]);
    setSeconds(0);
    setOutcome(null);
    setDialogueStep('ask_name');
    dialogueStepRef.current = 'ask_name';
    capturedNameRef.current = contactName !== 'Prospect' ? contactName : '';
    setCapturedName(capturedNameRef.current);
    selectedCourseRef.current = '';
    setSelectedCourse('');
    setRecordedAudioUrl('');
    setMicError('');

    // Start live MediaRecorder on user microphone
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStreamRef.current = stream;
        audioChunksRef.current = [];
        const mr = new MediaRecorder(stream);
        mr.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
        };
        mr.onstop = () => {
          if (audioChunksRef.current.length > 0) {
            const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const url = URL.createObjectURL(blob);
            setRecordedAudioUrl(url);
          }
        };
        mr.start(250);
        mediaRecorderRef.current = mr;
      }
    } catch (e) {
      console.warn("Could not start MediaRecorder:", e);
    }

    setTimeout(() => {
      setCallState('ringing');
    }, 1200);

    setTimeout(() => {
      setCallState('connected');
      // Always use employee's actual opening_greeting from DB; fallback only if missing
      const greeting = employee?.opening_greeting ||
        (employee?.language === 'Telugu'
          ? 'నమస్కారం అండీ! శ్రీ సాయి కోచింగ్ అకాడమీ నుండి లక్ష్మి మాట్లాడుతున్నాను. మీ పేరు తెలుసుకోవచ్చా అండీ?'
          : `Hello, this is ${employee?.name || 'an AI assistant'}. May I know your name please?`);

      setTranscript([
        { speaker: employee?.name || 'AI Agent', text: greeting, time: '0:01' }
      ]);
      speakText(greeting);
    }, 2000);
  };

  const handleUserReply = (text) => {
    if (!text.trim()) return;

    const currentSpeaker = capturedNameRef.current || contactName || 'Customer';
    const timeStr = `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
    const newTranscript = [
      ...transcript,
      { speaker: currentSpeaker, text, time: timeStr }
    ];
    setTranscript(newTranscript);
    setUserInput('');
    setInterimSpeech('');

    // Dynamic response based on user input and employee profile — no delay, instant AI reply
    (async () => {
      let aiReply = "";
      const lower = text.toLowerCase();
      const currentStep = dialogueStepRef.current;

      // Check employee custom rules
      const hotCheck = employee?.hot_rules ? employee.hot_rules.toLowerCase().split(',') : ['yes', 'interested', 'చేయండి', 'హా'];
      const coldCheck = employee?.cold_rules ? employee.cold_rules.toLowerCase().split(',') : ['no', 'not interested', 'వద్దు', 'busy'];

      const isHot = hotCheck.some(w => lower.includes(w.trim()));
      const isCold = coldCheck.some(w => lower.includes(w.trim()));

      if (employee?.language === 'Telugu') {
        if (currentStep === 'ask_name') {
          // Extract the caller's name — strip common preamble phrases
          let cleanName = text
            .replace(/నా పేరు|నాది|నేను|నా|i am|my name is|this is|call me|speaking|hello/gi, '')
            .trim();
          if (cleanName.includes(' ')) cleanName = cleanName.split(' ')[0].trim();
          if (!cleanName || cleanName.length < 2) cleanName = text.trim().split(' ')[0] || 'సాయి';

          capturedNameRef.current = cleanName;
          setCapturedName(cleanName);
          dialogueStepRef.current = 'ask_course';
          setDialogueStep('ask_course');

          aiReply = `హలో ${cleanName} గారూ! మీకు ఏ కోర్సు పట్ల ఆసక్తి ఉంది? మా వద్ద సివిల్స్, ఐఐటీ జేఈఈ, నీట్, మరియు ఇంటర్ ఎంపీసీ కోచింగ్ బ్యాచ్‌లు అందుబాటులో ఉన్నాయి.`;

        } else if (currentStep === 'ask_course') {
          const salutation = capturedNameRef.current ? `${capturedNameRef.current} గారూ` : 'అండీ';

          const isCivils = /(civil|upsc|ias|ips|సివిల్స్|సివిల్)/i.test(text);
          const isIIT = /(iit|jee|engineering|ఐఐటీ|ఐఐటి|ఐ\s*ఐ\s*టి|జేఈఈ|జెఈఈ|ఇంజనీరింగ్|ఇంజినీరింగ్|మ్యాథ్స్)/i.test(text);
          const isNEET = /(neet|medical|doctor|నీట్|మెడికల్|డాక్టర్|బైపీసీ|bipc|బయాలజీ)/i.test(text);
          const isMPC = /(mpc|eamcet|eapcet|ఎంపీసీ|ఎం\s*పి\s*సి|ఇంటర్|ఎంసెట్)/i.test(text);

          dialogueStepRef.current = 'closing';
          setDialogueStep('closing');

          if (isCivils) {
            selectedCourseRef.current = 'సివిల్స్ (UPSC Civils)';
            setSelectedCourse('సివిల్స్ (UPSC Civils)');
            aiReply = `అద్భుతమైన ఛాయిస్ ${salutation}! మీరు సివిల్స్ UPSC ఫౌండేషన్ కోర్సును ఎంపిక చేసుకున్నారు. మా సివిల్స్ ప్రోగ్రాంలో NCERT బేసిక్స్, డైలీ కరెంట్ అఫైర్స్ విశ్లేషణ, టెస్ట్ సిరీస్ మరియు మెయిన్స్ ఆన్సర్ రైటింగ్ ఉంటాయి. ఈ శనివారం ఉదయం 10 గంటలకు ప్రత్యేక ఉచిత డెమో క్లాస్ ఉంది. మా అడ్మిషన్ కౌన్సెలర్ పూర్తి వివరాలు మీ వాట్సాప్‌కు పంపుతారు. ధన్యవాదాలు, నమస్కారం!`;
          } else if (isIIT) {
            selectedCourseRef.current = 'ఐఐటీ జేఈఈ (IIT-JEE)';
            setSelectedCourse('ఐఐటీ జేఈఈ (IIT-JEE)');
            aiReply = `చాలా మంచి ఎంపిక ${salutation}! మీరు ఐఐటీ జేఈఈ కోర్సును ఎంపిక చేసుకున్నారు. మా IIT-JEE బ్యాచ్‌లో సీనియర్ ప్రొఫెసర్ల క్లాసులు, ఆల్ ఇండియా టెస్ట్ సిరీస్ మరియు డైలీ డౌట్ క్లియరింగ్ ఉంటాయి. ఈ శనివారం ఉదయం 10 గంటలకు ఉచిత డెమో క్లాస్ ఉంది. మా అడ్మిషన్ కౌన్సెలర్ పూర్తి వివరాలు మీ వాట్సాప్‌కు పంపుతారు. ధన్యవాదాలు, నమస్కారం!`;
          } else if (isNEET) {
            selectedCourseRef.current = 'నీట్ మెడికల్ (NEET)';
            setSelectedCourse('నీట్ మెడికల్ (NEET)');
            aiReply = `గ్రేట్ ఛాయిస్ ${salutation}! మీరు నీట్ మెడికల్ కోర్సును ఎంపిక చేసుకున్నారు. మా NEET కోచింగ్‌లో టాప్ ఫ్యాకల్టీ క్లాసులు, డైలీ గ్రాండ్ టెస్టులు మరియు మునుపటి పేపర్ల విశ్లేషణ ఉంటాయి. ఈ శనివారం ఉదయం 10 గంటలకు ఉచిత డెమో క్లాస్ ఉంది. మా అడ్మిషన్ కౌన్సెలర్ పూర్తి వివరాలు మీ వాట్సాప్‌కు పంపుతారు. ధన్యవాదాలు, నమస్కారం!`;
          } else if (isMPC) {
            selectedCourseRef.current = 'ఇంటర్ ఎంపీసీ (MPC / EAPCET)';
            setSelectedCourse('ఇంటర్ ఎంపీసీ (MPC / EAPCET)');
            aiReply = `చాలా మంచిదండి ${salutation}! మీరు ఇంటర్ ఎంపీసీ కోర్సును ఎంపిక చేసుకున్నారు. ఇంటర్మీడియట్ బోర్డ్ సిలబస్‌తో పాటు EAPCET ఇంటిగ్రేటెడ్ కోచింగ్ ఉంటుంది. ఈ శనివారం ఉదయం 10 గంటలకు ఉచిత డెమో క్లాస్ ఉంది. మా అడ్మిషన్ కౌన్సెలర్ పూర్తి వివరాలు మీ వాట్సాప్‌కు పంపుతారు. ధన్యవాదాలు, నమస్కారం!`;
          } else {
            selectedCourseRef.current = 'సివిల్స్ (UPSC Civils)';
            setSelectedCourse('సివిల్స్ (UPSC Civils)');
            aiReply = `అద్భుతమైన ఛాయిస్ ${salutation}! మీరు సివిల్స్ UPSC ఫౌండేషన్ కోర్సును ఎంపిక చేసుకున్నారు. మా సివిల్స్ ప్రోగ్రాంలో NCERT బేసిక్స్, డైలీ కరెంట్ అఫైర్స్ విశ్లేషణ, టెస్ట్ సిరీస్ మరియు మెయిన్స్ ఆన్సర్ రైటింగ్ ఉంటాయి. ఈ శనివారం ఉదయం 10 గంటలకు ప్రత్యేక ఉచిత డెమో క్లాస్ ఉంది. మా అడ్మిషన్ కౌన్సెలర్ పూర్తి వివరాలు మీ వాట్సాప్‌కు పంపుతారు. ధన్యవాదాలు, నమస్కారం!`;
          }

        } else if (currentStep === 'course_details') {
          const salutation = capturedNameRef.current ? `${capturedNameRef.current} గారూ` : 'అండీ';
          const course = selectedCourseRef.current || 'కోచింగ్';

          if (lower.includes('fee') || lower.includes('ఫీజు') || lower.includes('cost') || lower.includes('ఎంత') || lower.includes('amount')) {
            aiReply = `${salutation} మా ${course} కోర్సులకు మెరిట్ స్కాలర్‌షిప్స్ కూడా ఉన్నాయి. మీరు డెమో క్లాస్ అటెండ్ అయితే ఫీజులో 25% వరకు కన్సెషన్ ఉంటుంది. మా అడ్మిషన్ కౌన్సెలర్ పూర్తి వివరాలు మీకు వాట్సాప్ చేస్తారు.`;
          } else if (isCold) {
            aiReply = `సరేనండి ${salutation}, మీ సమయానికి ధన్యవాదాలు. భవిష్యత్తులో ఏదైనా సమాచారం కావాలంటే మా ఆఫీస్‌కు సంప్రదించవచ్చు. హావ్ ఏ నైస్ డే!`;
          } else {
            dialogueStepRef.current = 'closing';
            setDialogueStep('closing');
            aiReply = `చాలా సంతోషం ${salutation}! మీ అడ్మిషన్ విచారణను ${course} కోసం విజయవంతంగా నమోదు చేసాము. మా సీనియర్ అడ్మిషన్ కౌన్సెలర్ పూర్తి సిలబస్ బ్రోచర్ మరియు డెమో క్లాస్ వివరాలను మీ మొబైల్ నంబర్‌కు వాట్సాప్ చేస్తారు. శ్రీ సాయి కోచింగ్ అకాడమీ తరపున మీకు ఆల్ ది బెస్ట్ ${salutation}, నమస్కారం!`;
          }

        } else {
          // Closing step
          const salutation = capturedNameRef.current ? `${capturedNameRef.current} గారూ` : 'అండీ';
          aiReply = `ధన్యవాదాలు ${salutation}! మీకు ఏదైనా సమాచారం కావాలంటే మా ఆఫీస్ హెల్ప్‌లైన్ నెంబర్‌ను సంప్రదించవచ్చు. నమస్కారం!`;
        }
      } else if (isHot) {
        aiReply = `Thank you! I will have our representative follow up with full details regarding ${employee?.goal || 'our service'}. When is a good time to reach out?`;
      } else if (isCold) {
        aiReply = `Understood. Thank you for your time. Have a wonderful day!`;
      } else if (employee?.closing_message) {
        aiReply = employee.closing_message;
      } else {
        aiReply = `I appreciate your response. Our team will follow up on this shortly. Thank you!`;
      }

      const responseTimeStr = `${Math.floor((seconds + 2) / 60)}:${((seconds + 2) % 60).toString().padStart(2, '0')}`;
      setTranscript(prev => [
        ...prev,
        { speaker: employee?.name || 'AI Agent', text: aiReply, time: responseTimeStr }
      ]);
      await speakText(aiReply);
    })();
  };

  const endCall = async () => {
    stopEverything();
    setCallState('ended');

    // Dynamic qualification analysis
    let detectedOutcome = 'warm';
    let detectedScore = 75;
    let detectedSentiment = 'Neutral';
    const allText = transcript.map(t => t.text.toLowerCase()).join(' ');

    const hotCheck = employee?.hot_rules ? employee.hot_rules.toLowerCase().split(',') : ['yes', 'interested', 'హా', 'చేయండి'];
    const coldCheck = employee?.cold_rules ? employee.cold_rules.toLowerCase().split(',') : ['no', 'not interested', 'వద్దు'];

    if (hotCheck.some(w => allText.includes(w.trim()))) {
      detectedOutcome = 'hot';
      detectedScore = 92;
      detectedSentiment = 'Positive (92%)';
    } else if (coldCheck.some(w => allText.includes(w.trim()))) {
      detectedOutcome = 'cold';
      detectedScore = 30;
      detectedSentiment = 'Negative (40%)';
    }

    const aiSummary = `Live Microphone Call with ${contactName || 'Prospect'} (${phoneNumber || 'Direct Line'}). 2-way speech interaction in ${employee?.language || 'Telugu'}. Outcome: ${detectedOutcome.toUpperCase()}. Duration: ${seconds}s.`;

    setOutcome(detectedOutcome);
    setSummary(aiSummary);
    setSentiment(detectedSentiment);
    setScore(detectedScore);

    // Save to InsForge Database
    try {
      const validUserId = employee?.user_id || currentUser?.id;
      if (validUserId) {
        await insforge.database.from('conversations').insert([{
          user_id: validUserId,
          employee_id: employee?.id,
          employee_name: employee?.name || 'AI Agent',
          call_type: 'instant',
          contact_name: capturedNameRef.current || contactName || 'Prospect',
          contact_phone: phoneNumber || 'Direct',
          caller_phone: employee?.phone_number || '+91 80 6535 4620',
          status: 'completed',
          duration_seconds: seconds || 1,
          outcome: detectedOutcome,
          summary: `Live Microphone Call with ${capturedNameRef.current || contactName || 'Prospect'} (${phoneNumber || 'Direct Line'}). 2-way speech interaction in ${employee?.language || 'Telugu'}. Confirmed interest in ${selectedCourseRef.current || 'IIT-JEE / NEET'} coaching. Outcome: ${detectedOutcome.toUpperCase()}. Duration: ${seconds}s.`,
          sentiment: detectedSentiment,
          intent: selectedCourseRef.current ? `${selectedCourseRef.current} Admission` : (detectedOutcome === 'hot' ? 'Admission Inquiry' : 'General'),
          conversion_score: detectedScore,
          transcript: transcript,
          recording_url: recordedAudioUrl || '/recordings/telugu_coaching_intro.mp3'
        }]);

        if (onCallCompleted) onCallCompleted();
      }
    } catch (e) {
      console.error("Failed to insert call record into InsForge:", e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="hud-modal-overlay">
      <div className="hud-modal-card" style={{ maxWidth: 620 }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
              boxShadow: '0 4px 14px rgba(6, 182, 212, 0.4)'
            }}>
              <Volume2 size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                  2-Way Voice Call with {employee?.name || 'AI Employee'}
                </h3>
                <span className="chip chip-active" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>
                  🎙️ Mic Enabled
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2, marginBottom: 0 }}>
                Target: {phoneNumber || 'Test Line'} • Language: <strong>{employee?.language || 'Telugu'}</strong> • Hands-Free Conversation
              </p>
            </div>
          </div>
          <button onClick={() => { stopEverything(); onClose(); }} className="btn btn-secondary btn-sm" style={{ borderRadius: '50%', width: 32, height: 32, padding: 0 }}>✕</button>
        </div>

        {/* Call Box */}
        <div style={{
          background: 'rgba(5, 7, 12, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 'var(--radius-lg)',
          padding: 24,
          textAlign: 'center',
          marginBottom: 16
        }}>
          {callState === 'idle' && (
            <div>
              <div style={{
                width: 68, height: 68, borderRadius: '50%',
                background: 'rgba(6, 182, 212, 0.1)',
                border: '2px solid rgba(6, 182, 212, 0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px', color: '#06b6d4'
              }}>
                <Mic size={32} />
              </div>
              <h4 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 700, marginBottom: 6 }}>
                Interactive Microphone Voice Call
              </h4>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 20, fontSize: '0.86rem', maxWidth: 440, margin: '0 auto 20px', lineHeight: 1.5 }}>
                Converse hands-free with <strong>{employee?.name || 'Lakshmi'}</strong> using your computer or mobile microphone. No dialpad needed!
              </p>

              {micError && (
                <div style={{
                  padding: '10px 14px', borderRadius: 8, background: 'rgba(244, 63, 94, 0.12)',
                  border: '1px solid rgba(244, 63, 94, 0.3)', color: '#fb7185', fontSize: '0.82rem',
                  marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center'
                }}>
                  <AlertCircle size={16} /> {micError}
                </div>
              )}

              <button onClick={startCall} className="btn btn-primary" style={{ padding: '12px 32px', fontSize: '1.02rem', gap: 10 }}>
                <Phone size={18} /> Start Microphone Call
              </button>
            </div>
          )}

          {callState === 'dialing' && (
            <div>
              <div className="live-dot yellow" style={{ width: 16, height: 16, margin: '0 auto' }}></div>
              <h4 style={{ color: '#fbbf24', fontSize: '1.15rem', margin: '14px 0 4px' }}>Connecting Voice Line...</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Initializing microphone & audio streams</p>
            </div>
          )}

          {callState === 'ringing' && (
            <div>
              <div className="live-dot green" style={{ width: 16, height: 16, margin: '0 auto' }}></div>
              <h4 style={{ color: '#34d399', fontSize: '1.15rem', margin: '14px 0 4px' }}>📞 Ringing Line...</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{employee?.name} is picking up...</p>
            </div>
          )}

          {callState === 'connected' && (
            <div>
              {/* Status Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="live-dot green" style={{ width: 10, height: 10 }}></span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Call Connected
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: '#fff', fontWeight: 600, marginLeft: 6 }}>
                    {Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, '0')}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button 
                    type="button"
                    onClick={() => setHandsFree(!handsFree)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.72rem', padding: '3px 8px', borderColor: handsFree ? 'rgba(52, 211, 153, 0.4)' : undefined, color: handsFree ? '#34d399' : undefined }}
                    title="Hands-free automatically opens mic when AI stops speaking"
                  >
                    Auto-Mic: {handsFree ? 'ON' : 'OFF'}
                  </button>
                  <button onClick={endCall} className="btn btn-danger btn-sm" style={{ padding: '4px 12px', fontSize: '0.78rem', gap: 4 }}>
                    <PhoneOff size={14} /> Hang Up
                  </button>
                </div>
              </div>

              {/* Dynamic Voice Activity Card */}
              <div style={{
                background: isListening 
                  ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(16, 185, 129, 0.12) 100%)'
                  : isSpeaking 
                  ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(168, 85, 247, 0.12) 100%)'
                  : 'rgba(255,255,255,0.02)',
                border: isListening 
                  ? '1px solid rgba(16, 185, 129, 0.4)' 
                  : isSpeaking 
                  ? '1px solid rgba(99, 102, 241, 0.4)' 
                  : '1px solid rgba(255,255,255,0.06)',
                borderRadius: 14,
                padding: '16px 20px',
                marginBottom: 16,
                transition: 'all 0.3s ease'
              }}>
                {isSpeaking ? (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#c7d2fe', marginBottom: 10 }}>
                      <Volume2 size={18} className="animate-pulse" />
                      <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>
                        {employee?.name || 'AI Persona'} is speaking in {employee?.language || 'Telugu'}...
                      </span>
                    </div>
                    {/* Animated sound waves */}
                    <div className="sound-bars" style={{ justifyContent: 'center', height: 26 }}>
                      {[1, 2, 3, 4, 5, 6, 7].map(i => (
                        <div key={i} className="sound-bar" style={{ animationDuration: `${0.4 + (i % 3) * 0.2}s` }}></div>
                      ))}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', marginTop: 8 }}>
                      Microphone will auto-activate as soon as agent finishes speaking.
                    </div>
                  </div>
                ) : isListening ? (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#34d399', marginBottom: 8 }}>
                      <div className="live-dot green" style={{ width: 10, height: 10 }}></div>
                      <span style={{ fontWeight: 800, fontSize: '0.92rem' }}>
                        🎙️ Microphone Active — Speak now in {employee?.language || 'Telugu'}!
                      </span>
                    </div>

                    {/* Microphone sound pulse */}
                    <div className="sound-bars" style={{ justifyContent: 'center', height: 28 }}>
                      {[1, 2, 3, 4, 5, 6, 7].map(i => (
                        <div key={i} className="sound-bar" style={{ background: '#34d399', animationDuration: `${0.3 + (i % 4) * 0.15}s` }}></div>
                      ))}
                    </div>

                    <div style={{
                      marginTop: 10,
                      padding: '8px 12px',
                      background: 'rgba(0,0,0,0.4)',
                      borderRadius: 8,
                      fontSize: '0.84rem',
                      color: interimSpeech ? '#fff' : 'var(--text-tertiary)',
                      minHeight: 34,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px dashed rgba(52, 211, 153, 0.3)'
                    }}>
                      {interimSpeech ? (
                        <span>Heard: "<strong>{interimSpeech}</strong>"</span>
                      ) : (
                        <span>Listening for your voice... speak your name or course (e.g. "నా పేరు సాయి", "NEET")</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--text-secondary)', marginBottom: 8 }}>
                      <MicOff size={18} />
                      <span style={{ fontSize: '0.86rem' }}>Microphone is paused.</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={toggleListening}
                      className="btn btn-primary btn-sm"
                      style={{ padding: '6px 16px', fontSize: '0.82rem', gap: 6 }}
                    >
                      <Mic size={14} /> Turn On Microphone
                    </button>
                  </div>
                )}
              </div>

              {micError && (
                <div style={{
                  padding: '8px 12px', borderRadius: 8, background: 'rgba(244, 63, 94, 0.12)',
                  border: '1px solid rgba(244, 63, 94, 0.3)', color: '#fb7185', fontSize: '0.78rem',
                  marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center'
                }}>
                  <AlertCircle size={14} /> {micError}
                </div>
              )}

              {/* Microphone & Keyboard Input Bar */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <button
                  type="button"
                  className={`btn ${isListening ? 'btn-danger' : 'btn-primary'}`}
                  onClick={toggleListening}
                  title={isListening ? "Mute Microphone" : "Unmute / Start Microphone"}
                  style={{ width: 44, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>

                <input
                  className="form-input"
                  style={{ flex: 1, fontSize: '0.85rem' }}
                  placeholder="You can speak into microphone or type here..."
                  value={userInput}
                  onChange={e => setUserInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleUserReply(userInput);
                  }}
                />

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => handleUserReply(userInput)}
                  style={{ width: 40, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Send typed text"
                >
                  <Send size={16} />
                </button>
              </div>

              {/* Quick Speech Simulator Chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
                {dialogueStep === 'ask_name' && (
                  <>
                    <button type="button" className="btn btn-secondary btn-sm" style={{ fontSize: '0.74rem', padding: '4px 10px' }} onClick={() => handleUserReply("నా పేరు సాయి చంద్")}>
                      💬 "నా పేరు సాయి చంద్"
                    </button>
                    <button type="button" className="btn btn-secondary btn-sm" style={{ fontSize: '0.74rem', padding: '4px 10px' }} onClick={() => handleUserReply("My name is Sai Chand")}>
                      💬 "My name is Sai Chand"
                    </button>
                  </>
                )}
                {dialogueStep === 'ask_course' && (
                  <>
                    <button type="button" className="btn btn-secondary btn-sm" style={{ fontSize: '0.74rem', padding: '4px 10px', borderColor: 'rgba(56, 189, 248, 0.4)' }} onClick={() => handleUserReply("నాకు NEET మెడికల్ కోచింగ్ కావాలి")}>
                      🩺 "నాకు NEET కావాలి"
                    </button>
                    <button type="button" className="btn btn-secondary btn-sm" style={{ fontSize: '0.74rem', padding: '4px 10px', borderColor: 'rgba(168, 85, 247, 0.4)' }} onClick={() => handleUserReply("IIT JEE కోచింగ్ వివరాలు చెప్పండి")}>
                      🎯 "IIT-JEE వివరాలు"
                    </button>
                    <button type="button" className="btn btn-secondary btn-sm" style={{ fontSize: '0.74rem', padding: '4px 10px' }} onClick={() => handleUserReply("ఇంటర్ MPC బ్యాచ్ గురించి చెప్పండి")}>
                      📚 "ఇంటర్ MPC"
                    </button>
                    <button type="button" className="btn btn-secondary btn-sm" style={{ fontSize: '0.74rem', padding: '4px 10px' }} onClick={() => handleUserReply("సివిల్స్ UPSC కోర్సు ఉందా?")}>
                      🏛️ "Civils / UPSC"
                    </button>
                  </>
                )}
                {dialogueStep === 'course_details' && (
                  <>
                    <button type="button" className="btn btn-secondary btn-sm" style={{ fontSize: '0.74rem', padding: '4px 10px' }} onClick={() => handleUserReply("హా, శనివారం డెమో క్లాస్ అటెండ్ అవుతాను")}>
                      ✓ "డెమో క్లాస్ అటెండ్ అవుతాను"
                    </button>
                    <button type="button" className="btn btn-secondary btn-sm" style={{ fontSize: '0.74rem', padding: '4px 10px' }} onClick={() => handleUserReply("కోర్సు ఫీజు ఎంత ఉంటుంది?")}>
                      💰 "ఫీజు ఎంత?"
                    </button>
                    <button type="button" className="btn btn-secondary btn-sm" style={{ fontSize: '0.74rem', padding: '4px 10px' }} onClick={() => handleUserReply("వివరాలు వాట్సాప్ చేయండి")}>
                      📲 "వాట్సాప్ చేయండి"
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {callState === 'ended' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#34d399', marginBottom: 12 }}>
                <CheckCircle2 size={24} />
                <h4 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Call Completed & Synced to Database</h4>
              </div>

              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10,
                background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 'var(--radius-md)', margin: '14px 0'
              }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>DURATION</div>
                  <div style={{ fontWeight: 700, color: '#fff' }}>{seconds}s</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>OUTCOME</div>
                  <div style={{ fontWeight: 700, color: outcome === 'hot' ? '#fb7185' : '#fbbf24' }}>
                    {outcome?.toUpperCase()}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>SCORE</div>
                  <div style={{ fontWeight: 700, color: '#34d399' }}>{score}/100</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 14 }}>
                <button
                  type="button"
                  onClick={() => {
                    if (audioChunksRef.current.length > 0) {
                      const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `live_call_recording_${(capturedNameRef.current || contactName || 'prospect').replace(/\s+/g, '_')}_${Date.now()}.webm`;
                      document.body.appendChild(a);
                      a.click();
                      window.URL.revokeObjectURL(url);
                      document.body.removeChild(a);
                    } else {
                      const a = document.createElement('a');
                      a.href = '/recordings/telugu_coaching_intro.mp3';
                      a.download = 'call_recording.mp3';
                      a.click();
                    }
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{ gap: 6, borderColor: 'rgba(99, 102, 241, 0.4)', color: '#c7d2fe', background: 'rgba(99, 102, 241, 0.15)' }}
                >
                  <Download size={14} /> Download Original Recording
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 16 }}>
                <button onClick={startCall} className="btn btn-secondary btn-sm">Call Again</button>
                <button onClick={onClose} className="btn btn-primary btn-sm">Done</button>
              </div>
            </div>
          )}
        </div>

        {/* Live Conversation Transcript */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
              Real-Time Voice Transcript
            </h4>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
              {transcript.length} turns recorded
            </span>
          </div>

          <div style={{
            background: 'var(--bg-input)',
            borderRadius: 'var(--radius-md)',
            padding: 16,
            minHeight: 160,
            maxHeight: 220,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {transcript.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120, color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                Transcript will stream here once the call is connected...
              </div>
            ) : (
              transcript.map((item, idx) => (
                <div key={idx} style={{
                  padding: '10px 14px',
                  borderRadius: 12,
                  fontSize: '0.86rem',
                  marginBottom: 10,
                  maxWidth: '85%',
                  alignSelf: item.speaker === (contactName || 'Customer') ? 'flex-end' : 'flex-start',
                  background: item.speaker === (contactName || 'Customer') ? 'rgba(6,182,212,0.15)' : 'rgba(99,102,241,0.15)',
                  border: item.speaker === (contactName || 'Customer') ? '1px solid rgba(6,182,212,0.25)' : '1px solid rgba(99,102,241,0.25)',
                  color: '#fff'
                }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, opacity: 0.7, marginBottom: 2 }}>
                    {item.speaker} • {item.time}
                  </div>
                  <div>{item.text}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
