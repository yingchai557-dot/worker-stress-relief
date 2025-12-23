'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ShredderPage() {
  const [hitCount, setHitCount] = useState(0);
  const [isExploded, setIsExploded] = useState(false);
  const [floatingTexts, setFloatingTexts] = useState<Array<{
    id: number;
    text: string;
    x: number;
    y: number;
    rotation: number;
  }>>([]);
  const [particles, setParticles] = useState<Array<{
    id: number;
    char: string;
    x: number;
    y: number;
    rotation: number;
    scale: number;
  }>>([]);
  const [shake, setShake] = useState(false);

  const maxHits = 20;
  const ventTexts = [
    '拒绝！', '不干了！', '我要下班！', '够了！', '滚！',
    '放过我！', '别烦我！', '我累了！', '不加班！', '走人！',
    '受够了！', '要休息！', '不伺候！', '再见！', '解脱！'
  ];

  // 播放敲击音效
  const playHitSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(150 + Math.random() * 100, audioContext.currentTime);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
      // 静默处理
    }
  }, []);

  // 播放爆炸音效
  const playExplosionSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.type = 'sawtooth';
          oscillator.frequency.setValueAtTime(100 + Math.random() * 200, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.3);
          
          gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.3);
        }, i * 50);
      }
    } catch (e) {
      // 静默处理
    }
  }, []);

  // 处理键盘敲击
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (isExploded) return;
    
    playHitSound();
    setShake(true);
    setTimeout(() => setShake(false), 100);
    
    // 添加漂浮文字
    const newText = {
      id: Date.now(),
      text: ventTexts[Math.floor(Math.random() * ventTexts.length)],
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 80,
      rotation: (Math.random() - 0.5) * 60,
    };
    setFloatingTexts(prev => [...prev, newText]);
    
    // 3秒后移除漂浮文字
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== newText.id));
    }, 2000);
    
    // 增加敲击次数
    setHitCount(prev => {
      const newCount = prev + 1;
      if (newCount >= maxHits) {
        // 触发爆炸
        triggerExplosion();
      }
      return newCount;
    });
  }, [isExploded, playHitSound]);

  // 触发爆炸效果
  const triggerExplosion = () => {
    setIsExploded(true);
    playExplosionSound();
    
    // 生成粒子
    const chars = '烦恼'.split('');
    const newParticles: typeof particles = [];
    chars.forEach((char, charIndex) => {
      for (let i = 0; i < 20; i++) {
        newParticles.push({
          id: charIndex * 20 + i,
          char,
          x: 50 + (Math.random() - 0.5) * 100,
          y: 50 + (Math.random() - 0.5) * 100,
          rotation: Math.random() * 720 - 360,
          scale: 0.3 + Math.random() * 0.7,
        });
      }
    });
    setParticles(newParticles);
  };

  // 重置游戏
  const resetGame = () => {
    setHitCount(0);
    setIsExploded(false);
    setFloatingTexts([]);
    setParticles([]);
  };

  // 监听键盘事件
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const progress = (hitCount / maxHits) * 100;

  return (
    <main className="min-h-screen w-full bg-black py-12 px-4 overflow-hidden">
      {/* 返回按钮 */}
      <Link href="/#shredder-section" className="fixed top-6 left-6 z-50">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border-4 border-[#2D3436] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold text-[#2D3436] hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={20} />
          返回
        </motion.button>
      </Link>

      <div className="max-w-4xl mx-auto pt-16 h-[calc(100vh-6rem)] flex flex-col items-center justify-center relative">
        {/* 提示文字 */}
        {!isExploded && (
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-white/80 text-xl mb-8 text-center"
          >
            ⌨️ 疯狂敲击键盘，打碎它！
          </motion.p>
        )}

        {/* 进度条 */}
        {!isExploded && (
          <div className="w-full max-w-md mb-12">
            <div className="h-4 bg-white/20 rounded-full overflow-hidden border-2 border-white/30">
              <motion.div
                className="h-full bg-gradient-to-r from-[#E17055] to-[#D63031]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            </div>
            <p className="text-white/60 text-center mt-2">
              {hitCount} / {maxHits} 次
            </p>
          </div>
        )}

        {/* 主要文字区域 */}
        <div className="relative w-full flex items-center justify-center" style={{ minHeight: '300px' }}>
          {/* 漂浮的发泄文字 */}
          <AnimatePresence>
            {floatingTexts.map((item) => (
              <motion.span
                key={item.id}
                initial={{ opacity: 0, scale: 0, x: `${item.x}%`, y: `${item.y}%`, rotate: item.rotation }}
                animate={{ 
                  opacity: [0, 1, 1, 0],
                  scale: [0.5, 1.2, 1, 0.8],
                  y: [`${item.y}%`, `${item.y - 30}%`],
                  rotate: item.rotation
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2 }}
                className="absolute text-2xl md:text-3xl font-black text-[#E17055] drop-shadow-lg"
                style={{ left: `${item.x}%`, transform: `rotate(${item.rotation}deg)` }}
              >
                {item.text}
              </motion.span>
            ))}
          </AnimatePresence>

          {/* 加班文字 */}
          {!isExploded ? (
            <motion.h1
              animate={shake ? { x: [-5, 5, -5, 5, 0], rotate: [-2, 2, -2, 2, 0] } : {}}
              transition={{ duration: 0.1 }}
              className="text-9xl md:text-[17rem] font-black text-white select-none"
              style={{
                textShadow: `
                  0 0 20px rgba(225, 112, 85, 0.5),
                  0 0 40px rgba(225, 112, 85, 0.3),
                  0 0 60px rgba(225, 112, 85, 0.2)
                `,
                transform: `scale(${1 + hitCount * 0.02})`,
              }}
            >
              烦恼
            </motion.h1>
          ) : (
            <>
              {/* 爆炸粒子 */}
              <AnimatePresence>
                {particles.map((particle) => (
                  <motion.span
                    key={particle.id}
                    initial={{ 
                      opacity: 1, 
                      x: 0,
                      y: 0,
                      scale: 1,
                      rotate: 0
                    }}
                    animate={{ 
                      opacity: 0,
                      x: `${(particle.x - 50) * 10}px`,
                      y: `${(particle.y - 50) * 10 + 200}px`,
                      scale: particle.scale,
                      rotate: particle.rotation
                    }}
                    transition={{ 
                      duration: 2,
                      ease: "easeOut"
                    }}
                    className="absolute text-4xl md:text-6xl font-black text-white"
                  >
                    {particle.char}
                  </motion.span>
                ))}
              </AnimatePresence>

              {/* 成功提示 */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
                className="absolute inset-0 flex flex-col items-center justify-center text-center"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ 
                    duration: 0.5,
                    repeat: 3
                  }}
                  className="text-8xl mb-6"
                >
                  🎉
                </motion.div>
                <h2 className="text-4xl md:text-6xl font-black text-white mb-4 text-center">
                  粉碎成功！
                </h2>
                <p className="text-white/80 text-xl mb-8 text-center" style={{ marginLeft: '-4px' }}>
                  烦恼已被你打碎，轻松前行！
                </p>
                <motion.button
                  onClick={resetGame}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-[#2D3436] px-8 py-4 rounded-full font-bold text-xl border-4 border-[#2D3436] shadow-lg hover:bg-gray-100 transition-colors" style={{ marginLeft: '-6px' }}
                >
                  再来一次
                </motion.button>
              </motion.div>
            </>
          )}
        </div>

        {/* 底部提示 */}
        {!isExploded && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-white/50 text-center mt-12" style={{ marginTop: '50px' }}
          >
            💡 提示：按键盘上的任意键来发泄你的怒火
          </motion.p>
        )}
      </div>
    </main>
  );
}
