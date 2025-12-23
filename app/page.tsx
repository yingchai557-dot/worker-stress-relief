'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, BookOpen, Calendar, Mic, Square, X, ArrowLeft } from 'lucide-react';

interface FlowerTrail {
  id: number;
  x: number;
  y: number;
}

type ModalType = 'diary' | 'calendar' | 'monster' | 'recorder' | null;

type DanmuMessage = {
  id: number;
  location: string;
  action: string;
  timeAgo: string;
  color: string;
  yPosition: number;
  duration: number;
  delay: number;
  x?: number;
  likes: number;
};

function DanmuItem({
  message,
  onLike,
}: {
  message: DanmuMessage;
  onLike: (messageId: number) => void;
}) {
  const [burstId, setBurstId] = useState<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);
  
  // 动画完成后的固定位置（随机分布在卡片内）
  const finalX = useRef(50 + Math.random() * 700); // 50-750px
  const finalY = useRef(20 + Math.random() * 420); // 20-440px

  const text = `${message.timeAgo} · ${message.location}的一位老己 · ${message.action}`;

  return (
    <motion.div
      initial={{ x: -550, opacity: 1 }}
      animate={isAnimationComplete ? {
        x: finalX.current,
        opacity: 1,
        scale: isHovered ? 1.08 : 1
      } : { 
        x: 1200,
        opacity: 1,
        scale: isHovered ? 1.08 : 1
      }}
      exit={{ opacity: 0 }}
      transition={isAnimationComplete ? {
        x: { duration: 0 },
        scale: { duration: 0.2 },
        opacity: { duration: 0.3 }
      } : { 
        x: { 
          duration: message.duration, 
          ease: "linear", 
          delay: message.delay,
          repeat: 1,
          repeatType: "loop"
        },
        scale: { duration: 0.2 },
        opacity: { duration: 0.3 }
      }}
      onAnimationComplete={() => {
        if (!isAnimationComplete) {
          setIsAnimationComplete(true);
        }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`absolute ${message.color} backdrop-blur-sm rounded-full px-6 py-3 border-2 border-gray-300 shadow-lg whitespace-nowrap cursor-pointer z-10`}
      style={{ top: isAnimationComplete ? `${finalY.current}px` : `${message.yPosition}px` }}
    >
      <span className="text-gray-800 text-base font-medium">{text}</span>

      {/* 点赞按钮 - 绝对定位，悬停时才显示 */}
      {isHovered && (
        <button
          type="button"
          className="absolute -right-2 top-1/2 -translate-y-1/2 translate-x-full flex items-center gap-1 bg-white/95 px-3 py-1.5 rounded-full shadow-md border border-gray-200 transition-all duration-150"
          onClick={(e) => {
            e.stopPropagation();
            onLike(message.id);
            setBurstId(Date.now());
          }}
        >
          <span className="text-lg">👍</span>
          <span className="text-xs text-gray-600 font-medium">老己点赞</span>
          {(message.likes ?? 0) > 0 && (
            <span className="text-xs text-gray-600 font-semibold">{message.likes}</span>
          )}
        </button>
      )}

      <AnimatePresence>
        {burstId !== null && (
          <motion.div
            key={burstId}
            initial={{ opacity: 0, y: 0, scale: 0.8 }}
            animate={{ opacity: 1, y: -18, scale: 1 }}
            exit={{ opacity: 0, y: -26, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="absolute -top-2 right-3 text-sm font-black text-[#2D3436]"
            onAnimationComplete={() => setBurstId(null)}
          >
            +1
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Home() {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [flowerTrails, setFlowerTrails] = useState<FlowerTrail[]>([]);
  const trailIdRef = useRef(0);
  
  // 日记本状态
  const [diaryInput, setDiaryInput] = useState('');
  const [diaryResult, setDiaryResult] = useState('');
  const [isTransforming, setIsTransforming] = useState(false);
  
  // 日历抽签状态
  const [fortuneData, setFortuneData] = useState<{
    do: string;
    dont: string;
    quote: string;
    luckyColor: string;
  } | null>(null);
  const [isShaking, setIsShaking] = useState(false); // 签筒晃动状态
  const [isStickEjecting, setIsStickEjecting] = useState(false); // 签弹射状态
  const [fortuneStage, setFortuneStage] = useState<'idle' | 'shaking' | 'ejecting' | 'showing'>('idle'); // 抽签阶段
  
  // 小怪兽状态
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [monsterImage, setMonsterImage] = useState('');
  const [monsterPower, setMonsterPower] = useState(0);
  
  // 录音状态
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [emotion, setEmotion] = useState('');
  
  // 星星收集状态
  const [collectedStars, setCollectedStars] = useState<Array<{id: number, x: number, y: number, size: number}>>([]);
  const [isTextHidden, setIsTextHidden] = useState(false);
  const [showStarGame, setShowStarGame] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // 信号灯留言状态
  const [signalMessages, setSignalMessages] = useState<Array<DanmuMessage>>([]);
  const messageIdRef = useRef(0);
  const [userInput, setUserInput] = useState('');
  const [showInputModal, setShowInputModal] = useState(false);

  // 烦恼粉碎机状态
  const [worryText, setWorryText] = useState('');
  const [isShredding, setIsShredding] = useState(false);
  const [particles, setParticles] = useState<Array<{
    id: number;
    char: string;
    x: number;
    y: number;
    rotation: number;
    scale: number;
    delay: number;
  }>>([]);
  const [butterflies, setButterflies] = useState<Array<{
    id: number;
    x: number;
    y: number;
    emoji: string;
    delay: number;
  }>>([]);
  // 使用Web Audio API生成碎纸声效
  const playShredSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      
      // 创建多个短促的噪音脉冲模拟碎纸声
      for (let i = 0; i < 8; i++) {
        setTimeout(() => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          const filter = audioContext.createBiquadFilter();
          
          // 使用白噪音效果
          oscillator.type = 'sawtooth';
          oscillator.frequency.setValueAtTime(200 + Math.random() * 300, audioContext.currentTime);
          
          // 高通滤波器让声音更清脆
          filter.type = 'highpass';
          filter.frequency.setValueAtTime(1000, audioContext.currentTime);
          
          // 快速衰减
          gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
          
          oscillator.connect(filter);
          filter.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.1);
        }, i * 80);
      }
    } catch (e) {
      // 静默处理音频错误
    }
  };

  // 粉碎烦恼的处理函数
  const handleShredWorry = () => {
    if (!worryText.trim() || isShredding) return;
    
    setIsShredding(true);
    
    // 播放碎纸声
    playShredSound();
    
    // 将文字拆解为粒子
    const chars = worryText.split('');
    const newParticles = chars.map((char, index) => ({
      id: index,
      char,
      x: (index % 10) * 30 + Math.random() * 20,
      y: Math.floor(index / 10) * 40 + Math.random() * 20,
      rotation: Math.random() * 360,
      scale: 0.5 + Math.random() * 0.5,
      delay: index * 0.02,
    }));
    setParticles(newParticles);
    
    // 1秒后生成蝴蝶/花瓣
    setTimeout(() => {
      const butterflyEmojis = ['🦋', '🌸', '🌺', '💮', '🪻', '🌷'];
      const newButterflies = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        emoji: butterflyEmojis[Math.floor(Math.random() * butterflyEmojis.length)],
        delay: i * 0.05,
      }));
      setButterflies(newButterflies);
    }, 800);
    
    // 3秒后重置状态
    setTimeout(() => {
      setIsShredding(false);
      setParticles([]);
      setButterflies([]);
      setWorryText('');
    }, 3500);
  };

  const handleDanmuLike = (messageId: number) => {
    setSignalMessages(prev =>
      prev.map(m => (m.id === messageId ? { ...m, likes: (m.likes ?? 0) + 1 } : m))
    );
  };

  const hotspots = [
    {
      id: 'diary',
      title: '精神状态转换器',
      subtitle: '碎碎念变金句',
      icon: BookOpen,
      color: 'bg-[#FFE66D]',
      position: 'top-[35%] left-[20%]',
      content: '在这里记录你的碎碎念，让AI帮你转化成金句✨'
    },
    {
      id: 'calendar',
      title: '赛博抽签',
      subtitle: '问问老己的意见',
      icon: Calendar,
      color: 'bg-[#FF6B6B]',
      position: 'top-[30%] right-[25%]',
      content: '每日一签，让老己给你一些建议和启发🎲'
    },
    {
      id: 'recorder',
      title: '声音邮局',
      subtitle: '与深谷里的自己对话',
      icon: Mic,
      color: 'bg-[#4ECDC4]',
      position: 'bottom-[35%] left-[25%]',
      content: '录下你的声音，寄给未来的自己📮'
    },
    {
      id: 'window',
      title: '悦己物种进化',
      subtitle: '行为变异小怪兽',
      icon: Square,
      color: 'bg-[#95E1D3]',
      position: 'bottom-[30%] right-[20%]',
      content: '记录你的行为变化，看看你进化成了什么小怪兽🦄'
    }
  ];

  const scrollToContent = () => {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  };

  // 信号灯：生成留言数据
  const cities = ['上海', '北京', '广州', '深圳', '杭州', '成都', '重庆', '武汉', '西安', '南京', '苏州', '天津', '长沙', '郑州', '济南', '青岛', '厦门', '福州', '昆明', '大连', '沈阳', '哈尔滨', '台北', '香港'];
  const actions = ['喝了一杯全糖奶茶', '决定提前下班', '买了一束花送给自己', '看了一场电影', '睡了一个午觉', '吃了一顿大餐', '拒绝了不想参加的聚会', '关掉了工作群的消息', '去公园散步了一小时', '听了最喜欢的歌单', '给自己买了件新衣服', '泡了一个热水澡', '点了最爱的外卖', '删除了让自己不开心的联系人', '放下手机看了会儿书', '做了一次瑜伽', '画了一幅画', '写了一段日记', '给自己做了顿早餐', '整理了房间', '关掉了闹钟睡到自然醒', '拒绝了加班', '给自己放了一天假', '去咖啡店坐了一下午', '买了一本心仪已久的书'];
  const timeDescriptions = ['刚刚', '1分钟前', '2分钟前', '3分钟前', '5分钟前', '10分钟前', '15分钟前', '30分钟前', '1小时前'];
  const colors = ['bg-pink-100/80', 'bg-blue-100/80', 'bg-purple-100/80', 'bg-green-100/80', 'bg-yellow-100/80', 'bg-indigo-100/80', 'bg-teal-100/80', 'bg-rose-100/80'];

  const generateSignalMessage = () => {
    return {
      id: messageIdRef.current++,
      location: cities[Math.floor(Math.random() * cities.length)],
      action: actions[Math.floor(Math.random() * actions.length)],
      timeAgo: timeDescriptions[Math.floor(Math.random() * timeDescriptions.length)],
      color: colors[Math.floor(Math.random() * colors.length)],
      yPosition: Math.random() * 440, // 随机高度 0-440px
      duration: 12 + Math.random() * 8, // 随机速度 12-20秒
      delay: Math.random() * 3, // 随机延迟 0-3秒
    };
  };

  // 初始化信号灯留言 - 30条预设弹幕
  useEffect(() => {
    const presetMessages = [
      { location: '上海', action: '喝了一杯全糖奶茶', timeAgo: '刚刚' },
      { location: '北京', action: '决定提前下班', timeAgo: '1分钟前' },
      { location: '广州', action: '买了一束花送给自己', timeAgo: '2分钟前' },
      { location: '深圳', action: '看了一场电影', timeAgo: '3分钟前' },
      { location: '杭州', action: '睡了一个午觉', timeAgo: '5分钟前' },
      { location: '成都', action: '吃了一顿大餐', timeAgo: '10分钟前' },
      { location: '重庆', action: '拒绝了不想参加的聚会', timeAgo: '15分钟前' },
      { location: '武汉', action: '关掉了工作群的消息', timeAgo: '30分钟前' },
      { location: '西安', action: '去公园散步了一小时', timeAgo: '1小时前' },
      { location: '南京', action: '听了最喜欢的歌单', timeAgo: '刚刚' },
      { location: '苏州', action: '给自己买了件新衣服', timeAgo: '1分钟前' },
      { location: '天津', action: '泡了一个热水澡', timeAgo: '2分钟前' },
      { location: '长沙', action: '点了最爱的外卖', timeAgo: '3分钟前' },
      { location: '郑州', action: '删除了让自己不开心的联系人', timeAgo: '5分钟前' },
      { location: '济南', action: '放下手机看了会儿书', timeAgo: '10分钟前' },
      { location: '青岛', action: '做了一次瑜伽', timeAgo: '15分钟前' },
      { location: '厦门', action: '画了一幅画', timeAgo: '30分钟前' },
      { location: '福州', action: '写了一段日记', timeAgo: '1小时前' },
      { location: '昆明', action: '给自己做了顿早餐', timeAgo: '刚刚' },
      { location: '大连', action: '整理了房间', timeAgo: '1分钟前' },
      { location: '沈阳', action: '关掉了闹钟睡到自然醒', timeAgo: '2分钟前' },
      { location: '哈尔滨', action: '拒绝了加班', timeAgo: '3分钟前' },
      { location: '台北', action: '给自己放了一天假', timeAgo: '5分钟前' },
      { location: '香港', action: '去咖啡店坐了一下午', timeAgo: '10分钟前' },
      { location: '上海', action: '买了一本心仪已久的书', timeAgo: '15分钟前' },
      { location: '北京', action: '听了一场音乐会', timeAgo: '30分钟前' },
      { location: '广州', action: '给自己买了束鲜花', timeAgo: '1小时前' },
      { location: '深圳', action: '关掉手机享受安静', timeAgo: '刚刚' },
      { location: '杭州', action: '去海边吹了吹风', timeAgo: '1分钟前' },
      { location: '成都', action: '吃了一顿火锅', timeAgo: '2分钟前' },
      { location: '重庆', action: '看了一场日落', timeAgo: '3分钟前' },
      { location: '武汉', action: '买了一件喜欢的衣服', timeAgo: '5分钟前' },
      { location: '西安', action: '在家做了一顿美食', timeAgo: '10分钟前' },
      { location: '南京', action: '关掉了所有通知', timeAgo: '15分钟前' },
      { location: '苏州', action: '去美术馆看了展览', timeAgo: '30分钟前' },
      { location: '天津', action: '买了一束向日葵', timeAgo: '1小时前' },
      { location: '长沙', action: '睡了一个长长的午觉', timeAgo: '刚刚' },
      { location: '郑州', action: '删除了不喜欢的照片', timeAgo: '1分钟前' },
      { location: '济南', action: '去书店待了一下午', timeAgo: '2分钟前' },
      { location: '青岛', action: '在海边散步', timeAgo: '3分钟前' },
      { location: '厦门', action: '给自己买了新鞋', timeAgo: '5分钟前' },
      { location: '福州', action: '听了一整张专辑', timeAgo: '10分钟前' },
      { location: '昆明', action: '拒绝了不想做的事', timeAgo: '15分钟前' },
      { location: '大连', action: '看了一部喜欢的电影', timeAgo: '30分钟前' },
      { location: '沈阳', action: '给自己做了早餐', timeAgo: '1小时前' },
      { location: '哈尔滨', action: '整理了衣柜', timeAgo: '刚刚' },
      { location: '台北', action: '去咖啡店发呆', timeAgo: '1分钟前' },
      { location: '香港', action: '买了心仪的香水', timeAgo: '2分钟前' },
      { location: '上海', action: '关掉了朋友圈', timeAgo: '3分钟前' },
    ];

    // 弹幕防遮挡逻辑：使用轨道系统
    const trackCount = 8; // 8条轨道
    const trackHeight = 60; // 每条轨道高度60px
    const tracks: number[] = new Array(trackCount).fill(0); // 记录每条轨道最后一条弹幕的结束时间
    
    const allMessages = presetMessages.map((preset, index) => {
      const groupIndex = Math.floor(index / 3); // 第几组 (0-9)
      const groupDelay = groupIndex * 3; // 组延迟: 0s, 3s, 6s, 9s, 12s, 15s, 18s, 21s, 24s, 27s
      const indexInGroup = index % 3; // 组内索引 (0-2)
      const duration = 8 + Math.random() * 8; // 随机速度 8-16秒
      const delay = groupDelay + indexInGroup * 1 + Math.random() * 0.5; // 组延迟 + 组内错位1秒 + 随机0-0.5秒
      const startTime = delay; // 弹幕开始时间
      const endTime = startTime + duration; // 弹幕结束时间
      
      // 找到最早可用的轨道（该轨道上最后一条弹幕已经结束）
      let selectedTrack = 0;
      let earliestAvailableTime = tracks[0];
      for (let i = 1; i < trackCount; i++) {
        if (tracks[i] < earliestAvailableTime) {
          earliestAvailableTime = tracks[i];
          selectedTrack = i;
        }
      }
      
      // 更新该轨道的结束时间
      tracks[selectedTrack] = endTime;
      
      // 计算弹幕的垂直位置（轨道位置 + 随机偏移）
      const yPosition = selectedTrack * trackHeight + Math.random() * 20;
      
      return {
        id: messageIdRef.current++,
        location: preset.location,
        action: preset.action,
        timeAgo: preset.timeAgo,
        color: colors[index % colors.length],
        yPosition: yPosition, // 基于轨道的位置，避免遮挡
        duration: duration,
        delay: delay,
        likes: 0,
      };
    });

    setSignalMessages(allMessages);

    return () => {};
  }, []);

  // 提交用户输入
  const handleUserSubmit = () => {
    if (!userInput.trim()) return;
    
    // 找到最早可用的轨道
    const trackCount = 8;
    const trackHeight = 60;
    const currentTime = Date.now() / 1000; // 当前时间（秒）
    
    // 简化处理：随机选择一个轨道
    const selectedTrack = Math.floor(Math.random() * trackCount);
    const yPosition = selectedTrack * trackHeight + Math.random() * 20;
    
    const newMessage = {
      id: messageIdRef.current++,
      location: '你',
      action: userInput,
      timeAgo: '刚刚',
      color: colors[Math.floor(Math.random() * colors.length)],
      yPosition: yPosition,
      duration: 8 + Math.random() * 8,
      delay: 0,
      likes: 0,
    };
    
    setSignalMessages(prev => [...prev, newMessage]);
    setUserInput('');
    setShowInputModal(false);
  };

  // 弹幕循环播放，不需要销毁

  // 弹幕内容直接在JSX中渲染，不使用内联函数组件避免重新创建

  // 日记本：AI转化功能
  const handleDiaryTransform = async () => {
    if (!diaryInput.trim()) return;
    
    setIsTransforming(true);
    
    try {
      // 添加时间戳确保每次请求都是新的，AI会生成不同的回复
      const response = await fetch('/api/transform', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          input: diaryInput,
          timestamp: Date.now() // 添加时间戳，确保每次都是新请求
        }),
      });

      if (!response.ok) {
        throw new Error('转化失败');
      }

      const data = await response.json();
      setDiaryResult(data.result);
    } catch (error) {
      console.error('AI转化错误:', error);
      setDiaryResult('老己今天有点累，改天再聊吧。—— 爱你，老己。');
    } finally {
      setIsTransforming(false);
    }
  };

  // 关闭弹窗时清空日记本内容
  const handleCloseModal = () => {
    setActiveModal(null);
    // 清空日记本相关状态
    setDiaryInput('');
    setDiaryResult('');
    // 清空抽签相关状态
    setFortuneStage('idle');
    setFortuneData(null);
    // 清空星星收集状态
    setCollectedStars([]);
    setIsTextHidden(false);
    setShowStarGame(false);
    setIsShaking(false);
    setIsStickEjecting(false);
  };

  // 日历：赛博抽签完整流程
  const handleDrawFortune = () => {
    // 阶段1: 签筒晃动 (1.5秒)
    setFortuneStage('shaking');
    setIsShaking(true);
    
    setTimeout(() => {
      setIsShaking(false);
      
      // 阶段2: 签弹射出来 (0.8秒)
      setFortuneStage('ejecting');
      setIsStickEjecting(true);
      
      setTimeout(() => {
        setIsStickEjecting(false);
        
        // 阶段3: 显示解签结果
        setFortuneStage('showing');
        
        // 生成签语数据
        const doList = ['大口吃肉', '放空发呆', '买点小东西', '睡到自然醒', '听喜欢的歌', '给自己买束花', '晒晒太阳'];
        const dontList = ['自我反省', '看体重秤', '回复工作消息', '想明天的事', '假装努力', '熬夜刷手机', '委屈自己'];
        const quotes = [
          '人间清醒不如人间偷懒，老己今天也要好好爱自己',
          '所有的焦虑都会过去，但奶茶要趁热喝',
          '你不是不够好，只是还没遇到懂你的人（包括你自己）',
          '今天的你，值得被温柔以待',
          '别着急，慢慢来，比较快',
          '世界很大，你要去看看；心情很小，你要去哄哄',
          '老己说：今天也要开心鸭，不开心就来找我'
        ];
        const colors = ['#FFB6C1', '#FFE4E1', '#E0BBE4', '#FFDAB9', '#B0E0E6', '#FFD700', '#FF69B4'];
        
        setFortuneData({
          do: doList[Math.floor(Math.random() * doList.length)],
          dont: dontList[Math.floor(Math.random() * dontList.length)],
          quote: quotes[Math.floor(Math.random() * quotes.length)],
          luckyColor: colors[Math.floor(Math.random() * colors.length)]
        });
      }, 800);
    }, 1500);
  };
  
  // 重置抽签状态
  const resetFortune = () => {
    setFortuneStage('idle');
    setFortuneData(null);
    setIsShaking(false);
    setIsStickEjecting(false);
  };

  // 小怪兽：生成进化结果
  const handleMonsterEvolve = () => {
    if (selectedActions.length === 0) return;
    
    // 模拟AI生成（实际应调用AI绘图API）
    const power = selectedActions.length * 33;
    setMonsterPower(power);
    // 这里应该调用AI绘图API，暂时使用占位符
    setMonsterImage('https://via.placeholder.com/200x200/FFB6C1/FFFFFF?text=🦄');
  };

  // 录音机：开始/停止录音
  const handleRecording = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        
        const chunks: BlobPart[] = [];
        mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/webm' });
          setAudioBlob(blob);
          // 模拟情绪识别
          const emotions = ['开心', '难过', '平静', '兴奋'];
          setEmotion(emotions[Math.floor(Math.random() * emotions.length)]);
        };
        
        mediaRecorder.start();
        setIsRecording(true);
      } catch (err) {
        console.error('录音失败:', err);
      }
    } else {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // 只在Hero Section（首屏）触发花朵划痕
      // 使用更严格的检测：只有当页面滚动位置在首屏范围内时才触发
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      
      // 如果页面已经滚动超过首屏的一半，完全停止花朵划痕
      if (scrollY > viewportHeight * 0.5) {
        return;
      }
      
      const newFlower: FlowerTrail = {
        id: trailIdRef.current++,
        x: e.clientX,
        y: e.clientY
      };
      
      setFlowerTrails(prev => [...prev, newFlower]);
      
      // 自动移除花朵（1.5秒后淡出）
      setTimeout(() => {
        setFlowerTrails(prev => prev.filter(f => f.id !== newFlower.id));
      }, 1500);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <main className="min-h-screen w-full relative overflow-x-hidden bg-white">
      {/* 花朵划痕层 */}
      <div className="fixed inset-0 pointer-events-none z-50">
        <AnimatePresence>
          {flowerTrails.map((flower) => (
            <motion.img
              key={flower.id}
              src="/2.png"
              alt="flower"
              initial={{ opacity: 0, scale: 0.5, rotate: 0 }}
              animate={{ 
                opacity: [0, 1, 1, 0],
                scale: [0.5, 1, 1, 0.8],
                rotate: [0, 360]
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{
                duration: 1.5,
                ease: "easeOut"
              }}
              className="absolute w-12 h-12"
              style={{
                left: flower.x - 24,
                top: flower.y - 24,
              }}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Hero Section - 全屏巨幕 */}
      <section className="h-screen w-full relative flex items-center justify-center overflow-hidden">

        {/* 巨幕标题 - 居中 */}
        <div className="relative z-10 text-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              y: [0, -10, 0]
            }}
            transition={{
              opacity: { duration: 1 },
              scale: { duration: 1 },
              y: {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
            className="w-full max-w-6xl mx-auto"
            style={{
              filter: 'drop-shadow(12px 12px 0px rgba(0,0,0,0.15))'
            }}
          >
            <img 
              src="/1.png" 
              alt="爱你老己"
              className="w-full h-auto"
            />
          </motion.div>
        </div>

        {/* 角色图片 - 右侧，底部固定，头顶碰到标题 */}
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.8 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            scale: 1
          }}
          transition={{
            opacity: { duration: 1, delay: 0.5 },
            y: { duration: 1, delay: 0.5, type: "spring", stiffness: 100 },
            scale: { duration: 1, delay: 0.5 }
          }}
          className="absolute top-[calc(35%-100px)] right-8 z-20"
          style={{
            filter: 'drop-shadow(4px 4px 12px rgba(255,182,193,0.3))'
          }}
        >
          <motion.img 
            src="/character.png"
            alt="可爱角色"
            className="w-[650px] h-[867px] md:w-[750px] md:h-[1000px] lg:w-[850px] lg:h-[1133px] object-contain"
            animate={{
              y: [0, -10, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>

        {/* 向下探索图标 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 15, 0] }}
          transition={{
            opacity: { delay: 1, duration: 0.5 },
            y: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 cursor-pointer"
          onClick={scrollToContent}
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-[#636E72] text-sm font-medium">向下探索</span>
            <ChevronDown className="w-8 h-8 text-[#636E72]" strokeWidth={3} />
          </div>
        </motion.div>
      </section>

      {/* 核心功能区 - 等轴测像素房间 */}
      <section 
        className="min-h-screen w-full py-20 px-4 flex items-center justify-center"
        style={{ marginTop: '200px' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative w-full max-w-5xl"
        >
          {/* 模块标题 */}
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black text-[#2D3436] text-center mb-12"
          >
            老己的赛博精神乐园
          </motion.h2>

          {/* 浅灰色大圆角容器 */}
          <div className="relative bg-[#F5F5F5] rounded-[60px] p-8 md:p-16 shadow-2xl">
            {/* 插画图片区域 */}
            <div className="relative rounded-[40px] border-6 border-[#2D3436] overflow-hidden">
              <img 
                src="/4.png" 
                alt="老己的秘密基地"
                className="w-full h-auto object-contain"
              />
              
              {/* 可点击热区 */}
              {/* 日记本热区 - 左侧 */}
              <button
                onClick={() => setActiveModal('diary')}
                className="absolute top-[35%] left-[10%] w-[15%] h-[20%] cursor-pointer"
                aria-label="打开日记本"
              />
              
              {/* 日历热区 - 中上 */}
              <button
                onClick={() => setActiveModal('calendar')}
                className="absolute top-[35%] left-[35%] w-[15%] h-[20%] cursor-pointer"
                aria-label="打开日历"
              />
              
              {/* 兔子星星头热区 - 中央 */}
              <button
                onClick={() => setActiveModal('monster')}
                className="absolute top-[40%] left-[45%] w-[20%] h-[25%] cursor-pointer"
                aria-label="打开物种进化"
              />
              
              {/* 录音机热区 - 右侧 */}
              <button
                onClick={() => window.location.href = '/voice-post'}
                className="absolute top-[35%] right-[10%] w-[15%] h-[20%] cursor-pointer"
                aria-label="打开声音邮局"
              />
              
              {/* 信号灯热区 - 窗户位置（右上） */}
              <button
                onClick={() => {
                  const signalSection = document.getElementById('signal-light-section');
                  signalSection?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="absolute top-[15%] right-[15%] w-[10%] h-[15%] cursor-pointer"
                aria-label="打开老己的信号灯"
              />
            </div>
            
            {/* 提示文字 */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-center mt-8 text-[#636E72] text-lg font-medium"
            >
              点击画中的物品，开始你的探索之旅 ✨
            </motion.p>
          </div>
        </motion.div>
      </section>

      {/* 烦恼粉碎机模块 */}
      <section id="shredder-section" className="min-h-screen w-full py-20 px-4 bg-white relative overflow-hidden" style={{ marginTop: '50px' }}>
        
        <div className="mx-auto max-w-5xl">
          {/* 浅灰色卡片背景 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-[#F5F5F5] rounded-[60px] p-8 md:p-16 shadow-2xl"
            style={{ paddingBottom: 'calc(3rem + 100px)' }}
          >
            {/* 标题 */}
            <div className="text-center mb-8">
              <h2 className="text-4xl md:text-5xl font-black text-[#2D3436] mb-3">
                烦恼粉碎机
              </h2>
              <p className="text-[#636E72] text-lg">
                有些话不适合变成金句，只适合消失。把烦恼发泄出来，让它化作蝴蝶飞走 🦋
              </p>
            </div>
            
            {/* 粉碎机插图 - 点击跳转到心理卸载中心 */}
            <a href="/shredder" className="block cursor-pointer" style={{ marginTop: '106px' }}>
              <motion.img
                src="/16.png"
                alt="烦恼粉碎机"
                initial={{ opacity: 0, y: 20, scale: 1.5 }}
                whileInView={{ opacity: 1, y: 0, scale: 1.5 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.55 }}
                className="mx-auto origin-center transition-transform drop-shadow-2xl"
              />
            </a>
          </motion.div>
        </div>
      </section>

      {/* 老己的信号灯 - 第三屏 */}
      <section 
        id="signal-light-section"
        className="min-h-screen w-full py-20 px-4 bg-white relative overflow-hidden"
      >
        <div className="relative z-10 h-full flex flex-col items-center justify-center max-w-5xl mx-auto">
          {/* 标题 */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            whileInView={{ 
              opacity: 1, 
              y: 0,
              transition: { duration: 0.6 }
            }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-black text-[#2D3436] mb-3">
              老己的信号灯
            </h2>
            <p className="text-[#636E72] text-lg">
              此时此刻，全球的老己们正在...
            </p>
          </motion.div>

          {/* 弹幕容器 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="w-full mx-auto bg-gray-50/50 backdrop-blur-sm rounded-[40px] p-8 border-6 border-[#2D3436] shadow-xl"
            style={{ maxWidth: 'calc(56rem + 110px)' }}
          >
            {/* 弹幕内容直接渲染 */}
            <div className="relative h-[500px] w-full overflow-hidden bg-gradient-to-r from-gray-50 to-gray-100 rounded-3xl">
              {signalMessages.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-lg">
                  等待弹幕加载中...
                </div>
              )}
              <AnimatePresence mode="sync">
                {signalMessages.map((message) => {
                  return (
                    <DanmuItem 
                      key={message.id} 
                      message={message} 
                      onLike={handleDanmuLike}
                    />
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* 互动按钮 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex flex-col items-center gap-4"
          >
            <button
              onClick={() => setShowInputModal(true)}
              className="bg-[#2D3436] text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-[#636E72] transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              📡 发送你的信号
            </button>
            <p className="text-[#636E72] text-sm">
              每一个信号，都是一次对自己的温柔 💫
            </p>
          </motion.div>
        </div>
      </section>

      {/* 底部寄语模块 */}
      <section className="w-full py-20 px-4 bg-[#F5F5F5] relative overflow-hidden">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <p className="text-lg md:text-xl font-light text-[#636E72] leading-relaxed mb-4">
              我与我和解，爱全部模样。
            </p>
            <p className="text-lg md:text-xl font-light text-[#636E72] leading-relaxed">
              敢求所想，因我生来就值得丰盛。
            </p>
          </motion.div>
        </div>
      </section>

      {/* 输入弹窗 */}
      <AnimatePresence>
        {showInputModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowInputModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 max-w-lg w-full border-4 border-[#2D3436] shadow-2xl"
            >
              <h3 className="text-2xl font-black text-[#2D3436] mb-4">
                分享你的悦己时刻 ✨
              </h3>
              <p className="text-[#636E72] mb-6">
                告诉大家，你刚刚为自己做了什么？
              </p>
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleUserSubmit()}
                placeholder="例如：喝了一杯全糖奶茶"
                className="w-full px-4 py-3 border-2 border-[#2D3436] rounded-xl text-[#2D3436] placeholder-[#636E72] focus:outline-none focus:ring-2 focus:ring-[#636E72] mb-6"
                autoFocus
              />
              <div className="flex gap-4">
                <button
                  onClick={handleUserSubmit}
                  className="flex-1 bg-[#2D3436] text-white py-3 rounded-xl font-bold hover:bg-[#636E72] transition-all"
                >
                  发送信号
                </button>
                <button
                  onClick={() => setShowInputModal(false)}
                  className="px-6 py-3 border-2 border-[#2D3436] text-[#2D3436] rounded-xl font-bold hover:bg-gray-100 transition-all"
                >
                  取消
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Neo-Brutalism 风格弹窗 */}
      <AnimatePresence>
        {activeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.8, rotate: -5, y: 50 }}
              animate={{ 
                scale: 1, 
                rotate: 0, 
                y: 0,
              }}
              exit={{ scale: 0.8, rotate: 5, y: 50, opacity: 0 }}
              transition={{
                type: "spring",
                damping: 20,
                stiffness: 300
              }}
              className={`relative w-full ${activeModal === 'diary' ? 'max-w-5xl' : activeModal === 'calendar' ? 'max-w-4xl' : activeModal === 'monster' ? 'w-screen h-screen max-w-none' : 'max-w-lg'} ${activeModal === 'diary' || activeModal === 'calendar' || activeModal === 'monster' ? '' : hotspots.find(h => h.id === activeModal)?.color + ' rounded-[40px] border-8 border-[#2D3436] shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] p-8'}`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* 关闭按钮 */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: activeModal === 'monster' ? -10 : 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleCloseModal}
                className={`absolute ${activeModal === 'monster' ? 'top-4 left-4' : '-top-4 -right-4'} w-12 h-12 bg-[#2D3436] rounded-full border-4 border-[#2D3436] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all z-50`}
              >
                {activeModal === 'monster' ? (
                  <ArrowLeft className="w-6 h-6 text-white" strokeWidth={3} />
                ) : (
                  <X className="w-6 h-6 text-white" strokeWidth={3} />
                )}
              </motion.button>

              {/* 图标 - 仅非日记本、非日历和非星星兔子头模块显示 */}
              {activeModal !== 'diary' && activeModal !== 'calendar' && activeModal !== 'monster' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="flex justify-center mb-6"
                >
                  {(() => {
                    const hotspot = hotspots.find(h => h.id === activeModal);
                    const IconComponent = hotspot?.icon;
                    return IconComponent ? (
                      <div className="w-20 h-20 bg-[#2D3436] rounded-3xl border-4 border-[#2D3436] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center">
                        <IconComponent className="w-12 h-12 text-white" strokeWidth={2.5} />
                      </div>
                    ) : null;
                  })()}
                </motion.div>
              )}

              {/* 标题和副标题 - 仅非日记本、非日历和非星星兔子头模块显示 */}
              {activeModal !== 'diary' && activeModal !== 'calendar' && activeModal !== 'monster' && (
                <>
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl md:text-4xl font-black text-[#2D3436] text-center mb-2"
                  >
                    {hotspots.find(h => h.id === activeModal)?.title}
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-lg text-[#636E72] text-center mb-6 font-medium"
                  >
                    {hotspots.find(h => h.id === activeModal)?.subtitle}
                  </motion.p>
                </>
              )}

              {/* 功能内容区 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                {/* 日记本功能 - 笔记本背景 */}
                {activeModal === 'diary' && (
                  <div className="relative w-full h-[800px]">
                    {/* 笔记本背景图片 */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <img 
                        src="/6.png" 
                        alt="笔记本"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    
                    {/* 左右分栏内容 */}
                    <div className="absolute inset-0 flex items-center justify-center px-20 py-20">
                      <div className="w-full max-w-6xl h-full flex gap-12">
                        {/* 左侧：标题区 */}
                        <div className="flex-1 flex items-center justify-center pl-8">
                          <div className="text-center ml-5">
                            <h2 className="text-5xl font-black text-[#2D3436] mb-3 tracking-wider">
                              精神状态
                            </h2>
                            <h2 className="text-5xl font-black text-[#2D3436] tracking-wider">
                              —转化器
                            </h2>
                          </div>
                        </div>
                        
                        {/* 右侧：功能区 */}
                        <div className="flex-1 flex flex-col justify-center space-y-5 pr-12">
                          {/* 标题 */}
                          <h3 className="text-3xl font-black text-[#2D3436] text-center mb-3 ml-2.5">
                            碎碎念变金句
                          </h3>
                          
                          {/* 输入区 */}
                          <div className="bg-white/50 rounded-2xl p-5 backdrop-blur-sm border-2 border-[#2D3436]/20" style={{ width: 'calc(100% - 20px)' }}>
                            <label className="block text-[#2D3436] font-bold mb-3 text-lg">
                              不开心接收区 📝
                            </label>
                            <textarea
                              value={diaryInput}
                              onChange={(e) => setDiaryInput(e.target.value)}
                              placeholder="说出你的烦恼..."
                              className="w-full h-32 p-4 rounded-xl border-2 border-[#2D3436] resize-none focus:outline-none focus:ring-2 focus:ring-[#FFB6C1] bg-white/90 text-base"
                            />
                          </div>
                          
                          {/* 魔法转化按钮 */}
                          <button
                            onClick={handleDiaryTransform}
                            disabled={isTransforming}
                            className="bg-[#2D3436] text-white text-xl font-black py-4 rounded-2xl border-3 border-[#2D3436] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50"
                            style={{ width: 'calc(100% - 20px)' }}
                          >
                            {isTransforming ? '魔法转化中...' : '✨ 魔法转化'}
                          </button>
                          
                          {/* 转化结果 */}
                          {diaryResult && (
                            <motion.div
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="bg-black/40 rounded-2xl border-2 border-white/30 p-5 shadow-lg backdrop-blur-sm"
                              style={{ width: 'calc(100% - 20px)' }}
                            >
                              <p className="text-white text-lg leading-relaxed font-medium">{diaryResult}</p>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 日历功能 - 赛博抽签 */}
                {activeModal === 'calendar' && (
                  <div className="space-y-6">
                    {/* 签筒容器 */}
                    <div className="flex flex-col items-center justify-center py-8">
                      {/* 签筒图片 - 7.png */}
                      <motion.div
                        animate={isShaking ? {
                          rotate: [0, -8, 8, -8, 8, -5, 5, -3, 3, 0],
                          x: [0, -5, 5, -5, 5, -3, 3, -2, 2, 0],
                        } : {}}
                        transition={{
                          duration: 1.5,
                          ease: "easeInOut"
                        }}
                        className="relative cursor-pointer"
                        onClick={fortuneStage === 'idle' ? handleDrawFortune : undefined}
                      >
                        <img 
                          src="/7.png" 
                          alt="签筒"
                          className="w-full max-w-2xl h-auto select-none relative z-10"
                        />
                        
                        {/* 签条 - 8.png */}
                        <AnimatePresence>
                          {fortuneStage === 'idle' && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="absolute top-0 left-1/2 -translate-x-1/2 w-80 z-0"
                              style={{ y: 50, x: -150 }}
                            >
                              <img src="/8.png" alt="签条" className="w-full h-auto" />
                            </motion.div>
                          )}
                          
                          {isStickEjecting && (
                            <motion.div
                              initial={{ y: 50, x: -150, opacity: 1, scale: 1 }}
                              animate={{ 
                                y: -120,
                                x: -150,
                                opacity: 1, 
                                scale: 1
                              }}
                              exit={{ opacity: 0 }}
                              transition={{
                                type: "spring",
                                stiffness: 180,
                                damping: 10,
                                duration: 0.8
                              }}
                              className="absolute top-0 left-1/2 -translate-x-1/2 w-80 z-0"
                            >
                              <img src="/8.png" alt="签条" className="w-full h-auto" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                      
                      {/* 提示文字 */}
                      {fortuneStage === 'idle' && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="mt-6 text-[#2D3436] text-lg font-medium"
                        >
                          点击签筒，请教老己
                        </motion.p>
                      )}
                      
                      {fortuneStage === 'shaking' && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="mt-6 text-[#2D3436] text-lg font-bold"
                        >
                          签筒晃动中...
                        </motion.p>
                      )}
                      
                      {fortuneStage === 'ejecting' && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="mt-6 text-[#2D3436] text-lg font-bold"
                        >
                          签正在飞出来...
                        </motion.p>
                      )}
                    </div>
                    
                    {/* 签条翻转显示内容 */}
                    <AnimatePresence>
                      {fortuneData && fortuneStage === 'showing' && (
                        <motion.div
                          initial={{ rotateY: 0 }}
                          animate={{ rotateY: 180 }}
                          transition={{
                            duration: 0.8,
                            ease: "easeInOut"
                          }}
                          className="relative mx-auto"
                          style={{
                            perspective: '1000px',
                            transformStyle: 'preserve-3d'
                          }}
                        >
                          {/* 签条背面 - 8.png */}
                          <motion.div
                            className="absolute inset-0"
                            style={{
                              backfaceVisibility: 'hidden',
                              transform: 'rotateY(0deg)'
                            }}
                          >
                            <img src="/8.png" alt="签条" className="w-32 mx-auto" />
                          </motion.div>
                          
                          {/* 签条正面 - 内容 */}
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="bg-black/40 rounded-3xl border-2 border-white/30 p-6 shadow-xl backdrop-blur-sm"
                            style={{
                              backfaceVisibility: 'hidden',
                              transform: 'rotateY(180deg)'
                            }}
                          >
                            <div className="space-y-4">
                              <div className="text-center">
                                <h3 className="text-3xl font-black text-white mb-2">上上签</h3>
                                <p className="text-lg text-white/80 font-medium">老己解签</p>
                              </div>
                              
                              <div className="flex items-center gap-2 bg-white/20 p-3 rounded-2xl border-2 border-white/30 backdrop-blur-sm">
                                <span className="text-2xl">✅</span>
                                <span className="text-white font-bold">今日宜：</span>
                                <span className="text-white text-lg font-medium">{fortuneData.do}</span>
                              </div>
                              
                              <div className="flex items-center gap-2 bg-white/20 p-3 rounded-2xl border-2 border-white/30 backdrop-blur-sm">
                                <span className="text-2xl">❌</span>
                                <span className="text-white font-bold">今日忌：</span>
                                <span className="text-white text-lg font-medium">{fortuneData.dont}</span>
                              </div>
                              
                              <div className="mt-4 p-4 bg-white/20 rounded-2xl border-2 border-white/30 backdrop-blur-sm">
                                <p className="text-white text-center font-medium leading-relaxed">{fortuneData.quote}</p>
                              </div>
                              
                              <div className="flex items-center justify-center gap-3 mt-4">
                                <span className="text-white font-bold">幸运色：</span>
                                <motion.div 
                                  animate={{ scale: [1, 1.1, 1] }}
                                  transition={{ repeat: Infinity, duration: 2 }}
                                  className="w-10 h-10 rounded-full border-4 border-white/50 shadow-lg" 
                                  style={{ backgroundColor: fortuneData.luckyColor }} 
                                />
                              </div>
                              
                              <button
                                onClick={resetFortune}
                                className="w-full mt-4 bg-white/30 text-white text-lg font-black py-3 rounded-2xl border-2 border-white/50 backdrop-blur-sm hover:bg-white/40 transition-all"
                              >
                                再抽一次
                              </button>
                            </div>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* 星星兔子头功能 - 全屏展示9.png */}
                {activeModal === 'monster' && !showStarGame && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="w-full h-full relative overflow-hidden"
                    onClick={(e) => {
                      if (!isTextHidden) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;
                        const size = Math.random() * 48 + 32;
                        setCollectedStars([...collectedStars, { id: Date.now(), x, y, size }]);
                      }
                    }}
                    onMouseMove={(e) => {
                      if (!isTextHidden && Math.random() > 0.95) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;
                        const size = Math.random() * 48 + 32;
                        setCollectedStars([...collectedStars, { id: Date.now(), x, y, size }]);
                      }
                    }}
                  >
                    {/* 背景星空图 */}
                    <img 
                      src="/9.png" 
                      alt="星空兔子"
                      className="w-full h-full object-contain"
                    />
                    
                    {/* 收集的星星 */}
                    <AnimatePresence>
                      {collectedStars.map((star) => (
                        <motion.img
                          key={star.id}
                          src="/10.png"
                          alt="星星"
                          initial={{ scale: 0, rotate: 0, opacity: 0 }}
                          animate={{ 
                            scale: 1, 
                            rotate: [0, 10, -10, 0],
                            opacity: 1 
                          }}
                          transition={{
                            duration: 0.5,
                            ease: "easeOut"
                          }}
                          className="absolute pointer-events-none"
                          style={{
                            left: star.x - star.size / 2,
                            top: star.y - star.size / 2,
                            width: star.size,
                            height: star.size,
                          }}
                        />
                      ))}
                    </AnimatePresence>
                    
                    {/* 底部文字提示 */}
                    <AnimatePresence>
                      {!isTextHidden && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0 }}
                          transition={{ delay: 0.5, duration: 0.8 }}
                          className="absolute bottom-36 left-0 right-0 text-center pointer-events-none"
                        >
                          <p 
                            className="text-white text-3xl font-black tracking-widest pointer-events-auto cursor-pointer inline-block px-8 py-4 bg-black/40 rounded-full backdrop-blur-sm border-2 border-white/30"
                            style={{
                              textShadow: '0 0 20px rgba(255,255,255,0.8), 0 0 40px rgba(255,255,255,0.5), 0 4px 8px rgba(0,0,0,0.8)'
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              // 直接跳转到游戏页面
                              window.location.href = '/star-game';
                            }}
                          >
                            把摘下的星星留给自己
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}

                {/* 录音机功能 */}
                {activeModal === 'recorder' && (
                  <div className="space-y-4">
                    <div className="bg-white/70 rounded-3xl border-4 border-[#2D3436] p-8 flex flex-col items-center">
                      <motion.button
                        onClick={handleRecording}
                        animate={isRecording ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ repeat: Infinity, duration: 1 }}
                        className={`w-24 h-24 rounded-full border-4 border-[#2D3436] shadow-lg flex items-center justify-center text-4xl ${
                          isRecording ? 'bg-red-500' : 'bg-[#FFB6C1]'
                        }`}
                      >
                        🎤
                      </motion.button>
                      <p className="mt-4 text-[#2D3436] font-bold">
                        {isRecording ? '录音中...' : '长按开始录音'}
                      </p>
                    </div>
                    
                    {emotion && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/90 rounded-3xl border-4 border-[#2D3436] p-6 text-center"
                      >
                        <p className="text-[#2D3436] text-lg">检测到情绪：<span className="font-black text-2xl">{emotion}</span></p>
                        <p className="text-[#636E72] mt-2">正在接收来自老己的声波信号...</p>
                      </motion.div>
                    )}
                  </div>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </main>
  );
}
