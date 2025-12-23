'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Mic } from 'lucide-react';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
}

export default function VoicePost() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [emotion, setEmotion] = useState('');
  const [transcribedText, setTranscribedText] = useState('');
  const [emotionWords, setEmotionWords] = useState<string[]>([]);
  const [bgColor, setBgColor] = useState('#1a1a2e');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particleIdRef = useRef(0);

  // 情绪关键词到颜色和播放速率的映射
  const emotionColors: { [key: string]: { color: string, playbackRate: number } } = {
    '难过': { color: '#4A90E2', playbackRate: 0.8 },
    '悲伤': { color: '#4A90E2', playbackRate: 0.8 },
    '伤心': { color: '#4A90E2', playbackRate: 0.8 },
    '孤独': { color: '#4A90E2', playbackRate: 0.8 },
    '失落': { color: '#4A90E2', playbackRate: 0.8 },
    '开心': { color: '#FFB84D', playbackRate: 1.2 },
    '快乐': { color: '#FFB84D', playbackRate: 1.2 },
    '高兴': { color: '#FFB84D', playbackRate: 1.2 },
    '兴奋': { color: '#FFB84D', playbackRate: 1.2 },
    '喜悦': { color: '#FFB84D', playbackRate: 1.2 },
    '愤怒': { color: '#E74C3C', playbackRate: 1.0 },
    '生气': { color: '#E74C3C', playbackRate: 1.0 },
    '焦虑': { color: '#9B59B6', playbackRate: 1.0 },
    '紧张': { color: '#9B59B6', playbackRate: 1.0 },
    '担心': { color: '#9B59B6', playbackRate: 1.0 },
    '平静': { color: '#16A085', playbackRate: 0.8 },
    '放松': { color: '#16A085', playbackRate: 0.8 },
    '温暖': { color: '#FF6B6B', playbackRate: 0.8 },
    '感动': { color: '#FF6B6B', playbackRate: 0.8 },
  };

  // 绘制声波动画
  const drawWaveform = () => {
    if (!analyserRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 3;
      ctx.strokeStyle = '#ffffff';
      ctx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    draw();
  };

  // 开始录音
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // 创建音频上下文和分析器
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyserRef.current = analyser;
      
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      // 开始录音
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        
        // 停止声波动画
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        
        // 处理录音
        await processRecording(blob);
        
        // 停止所有音轨
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      
      // 开始绘制声波
      drawWaveform();
    } catch (err) {
      console.error('录音失败:', err);
      alert('无法访问麦克风，请检查权限设置');
    }
  };

  // 停止录音
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // 模拟语音转文字（实际应该使用Web Speech API或AI服务）
  const transcribeAudio = async (): Promise<string> => {
    // 模拟转录文本
    const sampleTexts = [
      '今天我感觉很开心，完成了很多工作',
      '有点难过，但是我会坚强面对',
      '心情很平静，享受这份宁静',
      '感觉有些焦虑，希望一切顺利',
      '今天真是太兴奋了，发生了好事',
      '感到温暖和感动，谢谢你们',
    ];
    return sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
  };

  // 识别文本中的情绪色彩词
  const detectEmotionWords = (text: string): string[] => {
    const detectedWords: string[] = [];
    Object.keys(emotionColors).forEach(word => {
      if (text.includes(word)) {
        detectedWords.push(word);
      }
    });
    return detectedWords;
  };

  // 创建粒子效果
  const createParticles = (emotionWord: string, count: number = 20) => {
    const emotionData = emotionColors[emotionWord];
    if (!emotionData) return;

    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: particleIdRef.current++,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        color: emotionData.color,
        size: Math.random() * 8 + 4,
        life: 1.0,
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  };

  // 处理录音（模拟AI处理）
  const processRecording = async (blob: Blob) => {
    setIsProcessing(true);
    
    // 模拟AI处理延迟
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 语音转文字
    const text = await transcribeAudio();
    setTranscribedText(text);
    
    // 识别情绪色彩词
    const detectedWords = detectEmotionWords(text);
    setEmotionWords(detectedWords);
    
    // 为每个情绪词创建粒子效果
    detectedWords.forEach(word => {
      createParticles(word, 15);
    });
    
    // 使用第一个检测到的情绪词作为主情绪
    const primaryEmotion = detectedWords[0] || '平静';
    setEmotion(primaryEmotion);
    
    // 根据情绪改变背景颜色和播放速率
    const emotionData = emotionColors[primaryEmotion] || { color: '#1a1a2e', playbackRate: 1.0 };
    setBgColor(emotionData.color);
    setPlaybackRate(emotionData.playbackRate);
    
    // 创建音频URL用于回放
    const url = URL.createObjectURL(blob);
    setAudioUrl(url);
    
    setIsProcessing(false);
    
    // 自动播放回声
    playEcho(url, emotionData.playbackRate);
  };

  // 播放回声（变声效果）
  const playEcho = (url: string, rate: number) => {
    setIsPlaying(true);
    
    const audio = new Audio(url);
    
    // 设置播放速率（0.8低沉温暖，1.2欢快调皮）
    audio.playbackRate = rate;
    
    // 创建音频上下文进行变声处理
    const audioContext = new AudioContext();
    const source = audioContext.createMediaElementSource(audio);
    
    // 添加音调变化效果
    const pitchShift = audioContext.createBiquadFilter();
    pitchShift.type = 'allpass';
    pitchShift.frequency.value = 1000;
    
    source.connect(pitchShift);
    pitchShift.connect(audioContext.destination);
    
    audio.play();
    
    audio.onended = () => {
      setIsPlaying(false);
    };
  };

  // 粒子动画更新
  useEffect(() => {
    if (particles.length === 0) return;

    const interval = setInterval(() => {
      setParticles(prev => 
        prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            life: p.life - 0.02,
          }))
          .filter(p => p.life > 0)
      );
    }, 50);

    return () => clearInterval(interval);
  }, [particles.length]);

  // 清理资源
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [audioUrl]);

  return (
    <motion.div 
      className="fixed inset-0 overflow-hidden flex items-center justify-center"
      animate={{ backgroundColor: bgColor }}
      transition={{ duration: 1 }}
    >
      {/* 背景图片 */}
      <img 
        src="/15.png" 
        alt="声音邮局背景" 
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* 半透明遮罩 */}
      <div className="absolute inset-0 bg-black/30" />

      {/* 返回按钮 */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => window.history.back()}
        className="absolute top-4 left-4 w-12 h-12 bg-white/20 rounded-full border-2 border-white/30 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all z-50"
      >
        <ArrowLeft className="w-6 h-6 text-white" strokeWidth={3} />
      </motion.button>

      {/* 粒子效果 */}
      <AnimatePresence>
        {particles.map(particle => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: particle.x,
              top: particle.y,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              opacity: particle.life,
              boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0, opacity: 0 }}
          />
        ))}
      </AnimatePresence>

      {/* 主内容区域 */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-8">
        {/* 标题 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-5xl font-black text-white mb-2" style={{
            textShadow: '0 0 20px rgba(255,255,255,0.5)'
          }}>
            声音邮局
          </h1>
          <p className="text-white/70 text-xl">与深谷里的自己对话</p>
        </motion.div>

        {/* 声波画布 */}
        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative"
            >
              <canvas
                ref={canvasRef}
                width={600}
                height={200}
                className="rounded-2xl border-2 border-white/30 backdrop-blur-sm bg-black/20"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* 麦克风按钮 */}
        <motion.button
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          onTouchStart={startRecording}
          onTouchEnd={stopRecording}
          animate={isRecording ? { scale: [1, 1.1, 1] } : {}}
          transition={{ repeat: isRecording ? Infinity : 0, duration: 1 }}
          className={`w-32 h-32 rounded-full border-4 border-white/50 shadow-lg flex items-center justify-center text-6xl backdrop-blur-sm transition-all ${
            isRecording ? 'bg-red-500/80' : 'bg-white/20 hover:bg-white/30'
          }`}
        >
          <Mic className="w-16 h-16 text-white" strokeWidth={2} />
        </motion.button>

        {/* 提示文字 */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-white/80 text-lg text-center"
        >
          {isRecording ? '正在录音中...' : '长按麦克风，说出你的悄悄话'}
        </motion.p>

        {/* 转录文本显示 */}
        <AnimatePresence>
          {transcribedText && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/20 backdrop-blur-sm px-8 py-4 rounded-2xl border-2 border-white/30 max-w-2xl"
            >
              <p className="text-white text-lg mb-2">
                {transcribedText}
              </p>
              {emotionWords.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {emotionWords.map((word, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-full text-sm font-bold"
                      style={{
                        backgroundColor: emotionColors[word]?.color || '#ffffff',
                        color: '#ffffff',
                      }}
                    >
                      {word}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 播放速率提示 */}
        <AnimatePresence>
          {isPlaying && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full border-2 border-white/30"
            >
              <p className="text-white text-lg font-bold">
                {playbackRate === 0.8 ? '🎵 低沉温暖的回声...' : 
                 playbackRate === 1.2 ? '🎶 欢快调皮的回声...' : 
                 '🎵 回声传递中...'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 底部滚动提示 */}
      <div className="absolute bottom-8 left-0 right-0 overflow-hidden">
        <motion.div
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          className="whitespace-nowrap"
        >
          <p className="text-white/60 text-lg font-medium">
            {isProcessing ? '正在接收来自老己的声波信号...' : 
             isPlaying ? '回声正在传递中...' : 
             '等待你的声音...'}
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
