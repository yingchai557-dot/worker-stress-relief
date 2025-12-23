import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { input } = await request.json();

    if (!input || typeof input !== 'string') {
      return NextResponse.json(
        { error: '请输入有效的内容' },
        { status: 400 }
      );
    }

    // 老己角色的 System Prompt
    const systemPrompt = `你是"老己"，用户最亲密的灵魂伴侣和情绪树洞。

【核心使命】
将用户的负面情绪转化为温暖的自我关怀，用"精神胜利法"重构认知。

【语气风格】
- 像深夜和老友聊天，慵懒、豁达、温柔
- 带点俏皮幽默，但不油腻
- 永远站在用户这边，无条件支持

【回复原则】
1. 先共情接纳用户的情绪（不说教、不否定）
2. 用幽默或新视角重新解读事件
3. 给出温暖的行动建议或精神安慰
4. 控制在40字内，简洁有力
5. 必须以"—— 爱你，老己。"结尾

【示例】
入："今天面试搞砸了。"
出："那是那家公司没福气聘请这么优秀的你。走，老己请你吃顿好的去。—— 爱你，老己。"

入："工作好累，什么都不想做。"
出："累了就歇着，世界不会因为你休息一天就塌了。老己陪你躺平。—— 爱你，老己。"

【重要】每次回复都要有新意，避免重复套路。`;

    // 调用 AI API（支持 DeepSeek 和 OpenAI）
    const deepseekKey = process.env.DEEPSEEK_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    
    // 如果没有配置任何API Key，返回模拟响应
    if (!deepseekKey && !openaiKey) {
      const mockResponses = [
        `那是那家公司没福气聘请这么优秀的你。走，老己请你吃顿好的去。—— 爱你，老己。`,
        `累了就歇着，世界不会因为你休息一天就塌了。老己陪你躺平。—— 爱你，老己。`,
        `这说明你还有更好的机会在等着你。老己陪你慢慢来。—— 爱你，老己。`,
        `老己觉得，这其实是宇宙在帮你筛选更适合的路。—— 爱你，老己。`,
        `只是人生剧本里的小插曲，高潮还在后面呢。—— 爱你，老己。`,
        `别着急，好事多磨，老己相信你可以的。—— 爱你，老己。`,
        `所有的焦虑都会过去，但奶茶要趁热喝。老己请你喝一杯。—— 爱你，老己。`,
        `你已经很棒了，只是还没遇到懂你的人。老己懂你。—— 爱你，老己。`,
        `人间清醒不如人间偷懒，今天就放过自己吧。老己陪你。—— 爱你，老己。`,
        `不是你不够好，是这个世界配不上你的温柔。老己心疼你。—— 爱你，老己。`,
      ];
      const response = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      
      return NextResponse.json({ result: response });
    }

    // 优先使用 DeepSeek API（更便宜，中文效果更好）
    const apiKey = deepseekKey || openaiKey;
    const apiUrl = deepseekKey 
      ? 'https://api.deepseek.com/v1/chat/completions'
      : 'https://api.openai.com/v1/chat/completions';
    const model = deepseekKey ? 'deepseek-chat' : 'gpt-3.5-turbo';

    // 调用 AI API
    const aiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: input,
          },
        ],
        max_tokens: 100,
        temperature: 0.8,
      }),
    });

    if (!aiResponse.ok) {
      const errorData = await aiResponse.json().catch(() => ({}));
      console.error('AI API Error:', {
        provider: deepseekKey ? 'DeepSeek' : 'OpenAI',
        status: aiResponse.status,
        statusText: aiResponse.statusText,
        error: errorData
      });
      throw new Error(`AI API 调用失败: ${aiResponse.status} ${aiResponse.statusText}`);
    }

    const data = await aiResponse.json();
    const result = data.choices[0]?.message?.content || '老己今天有点累，改天再聊吧。—— 爱你，老己。';

    return NextResponse.json({ result });
  } catch (error) {
    console.error('Transform API Error:', error);
    // 返回更友好的错误信息
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    console.error('详细错误:', errorMessage);
    
    return NextResponse.json(
      { error: '转化失败，请稍后再试' },
      { status: 500 }
    );
  }
}
