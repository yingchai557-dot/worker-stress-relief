'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Radio } from 'lucide-react';

interface Message {
  id: number;
  location: string;
  action: string;
  timeAgo: string;
  color: string;
}

export default function SignalLight() {
  const [messages, setMessages] = useState<Message[]>([]);
  const messageIdRef = useRef(0);

  // 城市列表
  const cities = [
    '上海', '北京', '广州', '深圳', '杭州', '成都', '重庆', '武汉',
    '西安', '南京', '苏州', '天津', '长沙', '郑州', '济南', '青岛',
    '厦门', '福州', '昆明', '大连', '沈阳', '哈尔滨', '台北', '香港'
  ];

  // 悦己行为列表
  const actions = [
    '喝了一杯全糖奶茶',
    '决定提前下班',
    '买了一束花送给自己',
    '看了一场电影',
    '睡了一个午觉',
    '吃了一顿大餐',
    '拒绝了不想参加的聚会',
    '关掉了工作群的消息',
    '去公园散步了一小时',
    '听了最喜欢的歌单',
    '给自己买了件新衣服',
    '泡了一个热水澡',
    '点了最爱的外卖',
    '删除了让自己不开心的联系人',
    '放下手机看了会儿书',
    '做了一次瑜伽',
    '画了一幅画',
    '写了一段日记',
    '给自己做了顿早餐',
    '整理了房间',
    '关掉了闹钟睡到自然醒',
    '拒绝了加班',
    '给自己放了一天假',
    '去咖啡店坐了一下午',
    '买了一本心仪已久的书',
    '预约了一次按摩',
    '换了新的手机壁纸',
    '删除了社交媒体上的负能量',
    '给自己写了一封信',
    '学会了说"不"',
  ];

  // 时间描述
  const timeDescriptions = [
    '刚刚',
    '1分钟前',
    '2分钟前',
    '3分钟前',
    '5分钟前',
    '10分钟前',
    '15分钟前',
    '30分钟前',
    '1小时前',
  ];

  // 颜色列表（柔和的渐变色）
  const colors = [
    'from-pink-400/80 to-rose-400/80',
    'from-blue-400/80 to-cyan-400/80',
    'from-purple-400/80 to-pink-400/80',
    'from-green-400/80 to-emerald-400/80',
    'from-yellow-400/80 to-orange-400/80',
    'from-indigo-400/80 to-purple-400/80',
    'from-teal-400/80 to-green-400/80',
    'from-red-400/80 to-pink-400/80',
  ];

  // 生成随机消息
  const generateMessage = (): Message => {
    const city = cities[Math.floor(Math.random() * cities.length)];
    const action = actions[Math.floor(Math.random() * actions.length)];
    const timeAgo = timeDescriptions[Math.floor(Math.random() * timeDescriptions.length)];
    const color = colors[Math.floor(Math.random() * colors.length)];

    return {
      id: messageIdRef.current++,
      location: city,
      action: action,
      timeAgo: timeAgo,
      color: color,
    };
  };

  // 初始化消息
  useEffect(() => {
    const initialMessages: Message[] = [];
    for (let i = 0; i < 15; i++) {
      initialMessages.push(generateMessage());
    }
    setMessages(initialMessages);
  }, []);

  // 定时添加新消息
  useEffect(() => {
    const interval = setInterval(() => {
      const newMessage = generateMessage();
      setMessages(prev => [newMessage, ...prev].slice(0, 30)); // 保持最多30条消息
    }, 3000); // 每3秒添加一条新消息

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 overflow-hidden">
      {/* 背景动画效果 */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/5"
            style={{
              width: Math.random() * 300 + 100,
              height: Math.random() * 300 + 100,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* 返回按钮 */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => window.history.back()}
        className="absolute top-4 left-4 w-12 h-12 bg-white/20 rounded-full border-2 border-white/30 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all z-50"
      >
        <ArrowLeft className="w-6 h-6 text-white" strokeWidth={3} />
      </motion.button>

      {/* 主内容区域 */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-8 py-16">
        {/* 标题和信号灯图标 */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="inline-block mb-4"
          >
            <Radio className="w-20 h-20 text-yellow-300" strokeWidth={2} />
          </motion.div>
          <h1 className="text-5xl font-black text-white mb-3" style={{
            textShadow: '0 0 30px rgba(255,255,255,0.5)'
          }}>
            "老己"的信号灯
          </h1>
          <p className="text-white/80 text-xl">
            此时此刻，全球的"老己"们正在...
          </p>
        </motion.div>

        {/* 流动的留言墙 */}
        <div className="w-full max-w-6xl h-[600px] overflow-hidden relative">
          {/* 顶部渐变遮罩 */}
          <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-indigo-900 to-transparent z-10 pointer-events-none" />
          
          {/* 底部渐变遮罩 */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-indigo-900 to-transparent z-10 pointer-events-none" />

          {/* 消息列表 */}
          <div className="h-full overflow-y-auto scrollbar-hide space-y-4 px-4 py-8">
            <AnimatePresence mode="popLayout">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, x: -50, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 50, scale: 0.9 }}
                  transition={{ duration: 0.5 }}
                  className={`bg-gradient-to-r ${message.color} backdrop-blur-sm rounded-2xl p-6 border-2 border-white/20 shadow-lg`}
                >
                  <div className="flex items-center gap-4">
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="w-3 h-3 rounded-full bg-white shadow-lg"
                    />
                    <p className="text-white text-lg font-medium flex-1">
                      <span className="font-bold">{message.timeAgo}</span>
                      <span className="mx-2">·</span>
                      <span className="font-bold">{message.location}</span>
                      的一位老己
                      <span className="mx-2">·</span>
                      {message.action}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* 底部提示 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <p className="text-white/60 text-sm">
            每一个信号，都是一次对自己的温柔 💫
          </p>
          <p className="text-white/60 text-sm mt-2">
            实时更新中... 已有 <span className="text-yellow-300 font-bold">{messages.length}</span> 条信号
          </p>
        </motion.div>
      </div>

      {/* 添加自定义滚动条样式 */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
