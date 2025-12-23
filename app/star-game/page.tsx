'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

interface Star {
  id: number;
  x: number;
  y: number;
  color: string;
  message: string;
  speed: number;
  size: number;
  image: string;
}

interface CollectingStarAnimation {
  id: number;
  startX: number;
  startY: number;
  image: string;
}

const starTypes = [
  { 
    color: '#FFD700',
    image: '/10.png',
    name: '今天的成就',
    messages: [
      '我今天完成了一项挑战！',
      '我准时完成了工作任务！',
      '我今天早起成功了！',
      '我坚持锻炼了30分钟！',
      '我主动和朋友聊天了！',
      '我整理好了房间！'
    ]
  },
  { 
    color: '#4A90E2',
    image: '/11.png',
    name: '片刻的宁静',
    messages: [
      '我允许自己发了十分钟呆。',
      '我在阳台上看了会儿云。',
      '我泡了一杯热茶慢慢喝。',
      '我听了一首喜欢的歌。',
      '我深呼吸了几次，放松下来。',
      '我关掉手机，享受了片刻安静。'
    ]
  },
  { 
    color: '#FFB6C1',
    image: '/12.png',
    name: '对自己的善意',
    messages: [
      '我吃了一块喜欢的蛋糕。',
      '我买了心仪已久的小物件。',
      '我睡了一个舒服的午觉。',
      '我给自己点了喜欢的外卖。',
      '我敷了面膜好好护肤。',
      '我穿上了最喜欢的衣服。'
    ]
  },
  { 
    color: '#90EE90',
    image: '/13.png',
    name: '小小的成长',
    messages: [
      '我学会了一个新知识。',
      '我读完了一篇好文章。',
      '我尝试了一道新菜谱。',
      '我克服了一个小恐惧。',
      '我学会了一个新技能。',
      '我理解了一个新概念。'
    ]
  },
];

export default function StarGame() {
  const [stars, setStars] = useState<Star[]>([]);
  const [collectedCount, setCollectedCount] = useState(0);
  const [showMessage, setShowMessage] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [collectingStars, setCollectingStars] = useState<CollectingStarAnimation[]>([]);
  const [collectedStarsInJar, setCollectedStarsInJar] = useState<{id: number, image: string, x: number, y: number}[]>([]);
  const starIdRef = useRef(0);
  const collectingIdRef = useRef(0);

  // 生成星星
  useEffect(() => {
    const interval = setInterval(() => {
      if (collectedCount < 10) {
        const starType = starTypes[Math.floor(Math.random() * starTypes.length)];
        const randomMessage = starType.messages[Math.floor(Math.random() * starType.messages.length)];
        const newStar: Star = {
          id: starIdRef.current++,
          x: -50,
          y: Math.random() * (window.innerHeight - 200) + 50,
          color: starType.color,
          message: randomMessage,
          speed: Math.random() * 3 + 2,
          size: Math.random() * 20 + 40,
          image: starType.image,
        };
        setStars(prev => [...prev, newStar]);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [collectedCount]);

  // 移动星星
  useEffect(() => {
    const interval = setInterval(() => {
      setStars(prev => 
        prev
          .map(star => ({ ...star, x: star.x + star.speed }))
          .filter(star => star.x < window.innerWidth + 100)
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // 检查是否完成
  useEffect(() => {
    if (collectedCount >= 10 && !isComplete) {
      setIsComplete(true);
    }
  }, [collectedCount, isComplete]);

  const handleStarClick = (star: Star) => {
    // 添加收集动画
    const collectingId = collectingIdRef.current++;
    setCollectingStars(prev => [...prev, {
      id: collectingId,
      startX: star.x,
      startY: star.y,
      image: star.image,
    }]);
    
    // 移除星星
    setStars(prev => prev.filter(s => s.id !== star.id));
    
    // 显示消息
    setShowMessage(star.message);
    setTimeout(() => setShowMessage(null), 2000);
    
    // 动画结束后增加计数、移除动画、添加到罐子里
    setTimeout(() => {
      setCollectedCount(prev => prev + 1);
      setCollectingStars(prev => prev.filter(s => s.id !== collectingId));
      // 在罐子里随机位置添加星星
      setCollectedStarsInJar(prev => [...prev, {
        id: collectingId,
        image: star.image,
        x: Math.random() * 60 - 30,
        y: Math.random() * 80 - 40,
      }]);
    }, 800);
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-black">
      {/* 返回按钮 */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => window.history.back()}
        className="absolute top-4 left-4 w-12 h-12 bg-white/20 rounded-full border-2 border-white/30 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all z-50"
      >
        <ArrowLeft className="w-6 h-6 text-white" strokeWidth={3} />
      </motion.button>

      {/* 游戏标题 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-24 text-center"
        style={{ left: 'calc(50% - 70px)', transform: 'translateX(-50%)' }}
      >
        <h1 
          className="text-6xl font-black text-white mb-2"
          style={{
            textShadow: '0 0 20px rgba(255,255,255,0.5)'
          }}
        >
          摘星手记
        </h1>
        <p className="text-white/70 text-lg">
          收集属于你的星光时刻
        </p>
      </motion.div>

      {/* 星星 */}
      <AnimatePresence>
        {stars.map(star => (
          <motion.div
            key={star.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute cursor-pointer"
            style={{
              left: star.x,
              top: star.y,
              width: star.size,
              height: star.size,
            }}
            onClick={() => handleStarClick(star)}
          >
            <motion.div
              animate={{
                rotate: [0, 360],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear"
              }}
              className="w-full h-full"
              style={{
                filter: `drop-shadow(0 0 10px ${star.color})`,
              }}
            >
              <img src={star.image} alt="星星" className="w-full h-full" />
            </motion.div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* 收集星星飞向罐子的动画 */}
      <AnimatePresence>
        {collectingStars.map(collectingStar => (
          <motion.img
            key={collectingStar.id}
            src={collectingStar.image}
            alt="收集中的星星"
            className="absolute w-12 h-12 pointer-events-none z-40"
            initial={{
              x: collectingStar.startX,
              y: collectingStar.startY,
              scale: 1,
              opacity: 1,
            }}
            animate={{
              x: window.innerWidth / 2 - 24,
              y: window.innerHeight - 200,
              scale: 0.3,
              opacity: 0.8,
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{
              duration: 0.8,
              ease: "easeInOut"
            }}
          />
        ))}
      </AnimatePresence>

      {/* 消息提示 */}
      <AnimatePresence>
        {showMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-56 left-1/2 -translate-x-1/2 px-8 py-4 rounded-full border-2 bg-white/20 border-white/30 backdrop-blur-sm"
          >
            <p className="text-xl font-bold text-white">
              {showMessage}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 星罐和进度 */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
        {/* 进度文字 */}
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-2xl font-bold text-white"
        >
          {collectedCount} / 10
        </motion.div>

        {/* 星罐 */}
        <div className="relative w-96 h-128">
          <img src="/14.png" alt="星罐" className="w-full h-full object-contain" />
          
          {/* 罐子里收集的星星 */}
          <div className="absolute inset-0 flex items-center justify-center">
            {collectedStarsInJar.map(jarStar => (
              <motion.img
                key={jarStar.id}
                src={jarStar.image}
                alt="收集的星星"
                className="absolute w-8 h-8"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: 1, 
                  opacity: 1,
                  rotate: [0, 10, -10, 0]
                }}
                transition={{
                  duration: 0.5,
                  rotate: {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }}
                style={{
                  left: `calc(50% + ${jarStar.x}px)`,
                  top: `calc(50% + ${jarStar.y}px)`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 完成动画 */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-40"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", duration: 1 }}
              className="bg-white/20 backdrop-blur-md rounded-3xl border-2 border-white/30 p-12 text-center max-w-2xl"
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
                className="text-8xl mb-6"
              >
                ✨
              </motion.div>
              <h2 className="text-4xl font-black text-white mb-4">
                星罐已满！
              </h2>
              <p className="text-2xl text-white/90 leading-relaxed mb-8">
                看，你本就星光璀璨。<br />
                这些美好，都值得被你珍藏。
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setCollectedCount(0);
                    setIsComplete(false);
                    setStars([]);
                    setCollectedStarsInJar([]);
                  }}
                  className="bg-white/30 text-white text-xl font-black py-4 px-12 rounded-full border-2 border-white/50 backdrop-blur-sm hover:bg-white/40 transition-all"
                >
                  再次收集
                </button>
                <button
                  onClick={() => window.history.back()}
                  className="bg-white/30 text-white text-xl font-black py-4 px-12 rounded-full border-2 border-white/50 backdrop-blur-sm hover:bg-white/40 transition-all"
                >
                  收集成功
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
