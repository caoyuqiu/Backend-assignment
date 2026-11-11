/* ============================================================
   云枢智学 · 原型模拟数据
   说明：全部为前端假数据，仅用于交互演示，不代表真实业务数据
   ============================================================ */
window.DB = (function () {
  "use strict";

  /* ---------- 能力维度（全局 6 个） ---------- */
  const dimensions = [
    { id: "d1", name: "基础概念", desc: "对核心概念、术语与原理的掌握程度", color: "#6366f1" },
    { id: "d2", name: "技术深度", desc: "对技术细节、实现机制与边界的理解深度", color: "#8b5cf6" },
    { id: "d3", name: "工程实践", desc: "把知识落到可运行、可维护方案的能力", color: "#0891b2" },
    { id: "d4", name: "问题分析", desc: "定位问题、拆解问题与权衡取舍的能力", color: "#059669" },
    { id: "d5", name: "表达逻辑", desc: "结构化表达、条理清晰与重点突出", color: "#d97706" },
    { id: "d6", name: "项目经验", desc: "真实项目中的落地经验与复盘能力", color: "#dc2626" }
  ];
  const dimById = Object.fromEntries(dimensions.map(d => [d.id, d]));

  /* ---------- 学科与阶段 ---------- */
  const subjects = [
    {
      id: "s1", name: "AI 应用与智能体开发", short: "智能体", icon: "🤖", color: "#4f46e5",
      desc: "从 Prompt 工程到 Agent 编排，把大模型能力变成可上线的产品。",
      stages: [
        {
          id: "s1-st1", name: "Prompt 与上下文工程", desc: "掌握提示词设计、上下文组织与输出约束。", level: "入门",
          questions: [
            {
              id: "q101", type: "single", difficulty: "简单", dim: "d1", score: 10,
              stem: "以下哪种做法最能降低大模型在专业问答中的“幻觉”？",
              options: ["提高 temperature 让回答更发散", "在提示词中提供可靠参考资料，并要求标注引用来源", "要求模型输出更长的答案", "把问题改得更口语化"],
              answer: [1],
              explanation: "提供可靠上下文并要求引用，可以让模型基于给定材料作答，显著降低编造概率。提高 temperature 反而会增加随机性。"
            },
            {
              id: "q102", type: "multiple", difficulty: "中等", dim: "d3", score: 10,
              stem: "关于 Few-shot 提示，下列说法正确的有？",
              options: ["示例格式应与目标任务保持一致", "示例数量越多，效果一定越好", "示例中可以包含边界情况与反例", "示例的排列顺序完全不会影响结果"],
              answer: [0, 2],
              explanation: "示例要与任务同构，并覆盖边界情况；数量存在收益递减，顺序也可能带来位置偏差。"
            },
            {
              id: "q103", type: "judge", difficulty: "简单", dim: "d1", score: 10,
              stem: "temperature 越高，模型输出越确定、越可复现。",
              options: ["正确", "错误"],
              answer: [1],
              explanation: "temperature 越高，采样随机性越强，输出越发散；接近 0 时才更确定。"
            },
            {
              id: "q104", type: "short", difficulty: "中等", dim: "d2", score: 10, pass: 0.6,
              stem: "简述系统提示词（System Prompt）与用户提示词的区别，并各举一个使用场景。",
              points: [
                { text: "指出 System Prompt 用于设定角色、边界与全局规则", score: 4 },
                { text: "指出用户提示词描述当次具体任务", score: 3 },
                { text: "各给出一个合理的使用场景", score: 3 }
              ],
              reference: "System Prompt 用于定义模型的身份、行为边界、输出规范，例如“你是某机构的课程顾问，只回答课程相关问题”；用户提示词是当次任务输入，例如“帮我对比这两门课程的适合人群”。"
            },
            {
              id: "q105", type: "single", difficulty: "中等", dim: "d4", score: 10,
              stem: "模型总是忽略你要求的 JSON 输出格式，最优先的排查方向是？",
              options: ["直接更换一个更大的模型", "检查指令之间是否冲突、是否过长，并给出明确的格式示例", "提高 temperature", "把问题缩短到一句话"],
              answer: [1],
              explanation: "格式失效通常来自指令冲突、约束过多或缺少示例；应先做提示词层面的排查，再考虑模型能力。"
            }
          ]
        },
        {
          id: "s1-st2", name: "RAG 与知识库", desc: "检索增强生成的全链路：切块、召回、重排与评估。", level: "进阶",
          questions: [
            {
              id: "q111", type: "single", difficulty: "简单", dim: "d1", score: 10,
              stem: "RAG 的核心流程是？",
              options: ["微调 → 蒸馏 → 部署", "检索 → 增强 → 生成", "标注 → 训练 → 评测", "压缩 → 量化 → 推理"],
              answer: [1],
              explanation: "RAG = Retrieval-Augmented Generation，先检索相关知识，再把它作为上下文交给模型生成。"
            },
            {
              id: "q112", type: "multiple", difficulty: "中等", dim: "d3", score: 10,
              stem: "以下哪些措施有助于提升 RAG 的召回质量？",
              options: ["优化文档切块策略，保留语义完整性", "使用向量检索与关键词检索的混合召回", "引入重排模型对候选结果排序", "提高生成阶段的 temperature"],
              answer: [0, 1, 2],
              explanation: "切块、混合召回、重排都作用于召回链路；temperature 影响生成随机性，与召回无关。"
            },
            {
              id: "q113", type: "short", difficulty: "困难", dim: "d2", score: 10, pass: 0.6,
              stem: "说明向量检索与关键词检索的差异，以及混合检索的价值。",
              points: [
                { text: "说明向量检索擅长语义相似、弱化字面匹配", score: 3 },
                { text: "说明关键词检索擅长精确术语、编号、专有名词", score: 3 },
                { text: "说明混合检索可互补召回，并通过融合排序提升覆盖率", score: 4 }
              ],
              reference: "向量检索基于语义相似度，能召回同义表达，但对精确术语不敏感；关键词检索（如 BM25）对专有名词、编号更可靠。混合检索将两路候选融合排序，兼顾语义与精确匹配。"
            },
            {
              id: "q114", type: "judge", difficulty: "中等", dim: "d4", score: 10,
              stem: "接入 RAG 之后，大模型的幻觉可以被完全消除。",
              options: ["正确", "错误"],
              answer: [1],
              explanation: "RAG 能显著降低幻觉，但检索缺失、上下文冲突、模型误读仍会导致错误，需要评估与兜底。"
            },
            {
              id: "q115", type: "single", difficulty: "困难", dim: "d6", score: 10,
              stem: "线上 RAG 回答不准确，最应优先查看的一组指标是？",
              options: ["QPS 与 CPU 使用率", "召回率、命中率与答案忠实度", "用户注册数与日活", "模型参数量与显存占用"],
              answer: [1],
              explanation: "先判断是“没检索到”还是“检索到但答错”，召回率/命中率/忠实度能定位链路问题。"
            }
          ]
        },
        {
          id: "s1-st3", name: "Agent 与工具调用", desc: "让模型规划任务、调用工具并在多轮中保持状态。", level: "进阶",
          questions: [
            {
              id: "q121", type: "single", difficulty: "中等", dim: "d1", score: 10,
              stem: "Function Calling 的核心作用是？",
              options: ["让模型直接执行任意代码", "让模型按约定结构输出工具调用意图与参数", "替代数据库查询", "压缩上下文长度"],
              answer: [1],
              explanation: "模型只负责产出结构化的调用意图与参数，真正执行由应用侧完成，便于校验与控权。"
            },
            {
              id: "q122", type: "multiple", difficulty: "困难", dim: "d3", score: 10,
              stem: "设计 Agent 可调用工具时，应遵循哪些原则？",
              options: ["工具描述清晰，说明适用场景与参数含义", "写操作尽量具备幂等性或可回滚", "遵循最小权限，敏感操作单独审批", "把数据库原始数据整表返回给模型"],
              answer: [0, 1, 2],
              explanation: "工具描述、幂等与最小权限是可维护与安全的基础；整表返回既浪费上下文又带来泄露风险。"
            },
            {
              id: "q123", type: "short", difficulty: "困难", dim: "d4", score: 10, pass: 0.6,
              stem: "用户通过自然语言要求 Agent“删除生产数据库”，你会如何设计防护？",
              points: [
                { text: "识别高危操作并设置权限边界与白名单", score: 3 },
                { text: "增加二次确认或人工审批环节", score: 3 },
                { text: "提供可回滚/备份机制与操作审计", score: 2 },
                { text: "对模型输出做结构化校验，禁止拼接任意语句", score: 2 }
              ],
              reference: "高危工具默认不可用；需要显式授权、二次确认与人工审批；所有调用留痕审计，并保证可回滚。模型只输出结构化意图，执行层做参数校验与权限判断。"
            },
            {
              id: "q124", type: "judge", difficulty: "简单", dim: "d5", score: 10,
              stem: "多轮对话中，把所有历史消息原样拼进上下文是最稳妥的做法。",
              options: ["正确", "错误"],
              answer: [1],
              explanation: "上下文有长度与成本限制，且无关历史会干扰模型，应做摘要、裁剪与重要信息抽取。"
            }
          ]
        }
      ],
      courses: [
        { id: "c101", title: "Prompt 工程实战：从写提示词到做产品", up: "云枢教研", duration: "2 小时 10 分", views: "2.4 万", url: "#" },
        { id: "c102", title: "RAG 从入门到上线：切块、召回与评估", up: "云枢教研", duration: "3 小时 05 分", views: "1.8 万", url: "#" },
        { id: "c103", title: "LangGraph 多智能体编排实战", up: "云枢教研", duration: "2 小时 40 分", views: "1.1 万", url: "#" },
        { id: "c104", title: "大模型应用评估与线上监控", up: "云枢教研", duration: "1 小时 35 分", views: "8600", url: "#" }
      ],
      routes: [
        { id: "r1", name: "AI 应用开发入门路线", desc: "从提示词到 RAG，再到 Agent 编排，完成一个可演示的问答应用。", level: "入门", courseIds: ["c101", "c102", "c103"] },
        { id: "r2", name: "RAG 工程师进阶路线", desc: "聚焦检索质量、评估体系与线上稳定性。", level: "进阶", courseIds: ["c102", "c104"] }
      ]
    },
    {
      id: "s2", name: "AI 大模型开发", short: "大模型", icon: "🧠", color: "#7c3aed",
      desc: "微调、对齐、推理优化与模型评估的系统训练。",
      stages: [], courses: [], routes: []
    },
    {
      id: "s3", name: "AI 具身智能机器人开发", short: "具身智能", icon: "🦾", color: "#0891b2",
      desc: "让模型拥有身体：感知、决策与运动控制的协同。",
      stages: [], courses: [], routes: []
    },
    {
      id: "s4", name: "AI 嵌入式 / 机器人开发", short: "嵌入式", icon: "🔧", color: "#059669",
      desc: "面向机器人场景的嵌入式系统、驱动与实时控制。",
      stages: [], courses: [], routes: []
    },
    {
      id: "s5", name: "AI 测试", short: "AI 测试", icon: "🧪", color: "#d97706",
      desc: "用 AI 提升测试效率，也测试 AI 系统本身。",
      stages: [], courses: [], routes: []
    },
    {
      id: "s6", name: "AI 运维", short: "AI 运维", icon: "🛠️", color: "#dc2626",
      desc: "AIOps、容器编排与智能告警的工程实践。",
      stages: [], courses: [], routes: []
    },
    {
      id: "s7", name: "AI 视觉设计", short: "视觉设计", icon: "🎨", color: "#db2777",
      desc: "AIGC 视觉工作流、品牌一致性与设计表达。",
      stages: [], courses: [], routes: []
    },
    {
      id: "s8", name: "AI 视频与短剧创作", short: "视频短剧", icon: "🎬", color: "#ea580c",
      desc: "从脚本到成片：AI 视频生成与短剧工业化流程。",
      stages: [], courses: [], routes: []
    }
  ];

  /* ---------- 为其余学科生成阶段、题目、课程、路线 ---------- */
  const topicSeeds = {
    s2: [["模型微调基础", "理解 SFT、LoRA 与数据构造"], ["推理与部署优化", "量化、批处理与显存优化"], ["模型评估与对齐", "评测集、偏好对齐与安全"]],
    s3: [["具身感知基础", "多模态感知与场景理解"], ["运动控制与规划", "从轨迹规划到强化学习控制"], ["仿真与真机迁移", "仿真训练与 Sim2Real"]],
    s4: [["嵌入式系统基础", "实时系统、总线与外设"], ["机器人操作系统", "ROS2 通信与节点编排"], ["传感器融合", "多传感器标定与融合"]],
    s5: [["测试用例设计", "等价类、边界值与场景法"], ["自动化测试", "接口自动化与持续集成"], ["AI 系统测试", "模型效果、鲁棒性与安全测试"]],
    s6: [["Linux 与网络基础", "排障必备的系统与网络知识"], ["容器与编排", "Docker 与 Kubernetes 运维"], ["监控与智能告警", "指标、日志、链路与 AIOps"]],
    s7: [["视觉设计基础", "版式、色彩与层级"], ["AIGC 视觉工作流", "文生图、图生图与风格控制"], ["品牌一致性", "视觉规范与落地交付"]],
    s8: [["短剧脚本与分镜", "节奏、冲突与镜头语言"], ["AI 视频生成", "文生视频、图生视频与一致性"], ["剪辑与分发", "成片节奏、字幕与平台适配"]]
  };

  const genericOptions = {
    single: [
      "先明确目标与约束，再选择合适的方法并验证",
      "直接套用网上最复杂的方案",
      "跳过验证，先上线再看效果",
      "只关注工具版本，不关注业务目标"
    ]
  };

  subjects.slice(1).forEach(subject => {
    const seeds = topicSeeds[subject.id] || [];
    subject.stages = seeds.map((seed, si) => {
      const [name, desc] = seed;
      const stageId = `${subject.id}-st${si + 1}`;
      const qs = [
        {
          id: `${stageId}-q1`, type: "single", difficulty: si === 0 ? "简单" : "中等", dim: "d3", score: 10,
          stem: `在「${name}」中，下列哪种做法最符合工程实践？`,
          options: genericOptions.single,
          answer: [0],
          explanation: "先厘清目标与约束，再选型并做小步验证，是通用且可复用的工程方法。"
        },
        {
          id: `${stageId}-q2`, type: "judge", difficulty: "简单", dim: "d1", score: 10,
          stem: `「${name}」只需要关注功能实现，不需要考虑可维护性与可观测性。`,
          options: ["正确", "错误"],
          answer: [1],
          explanation: `可维护性与可观测性是「${name}」长期稳定运行的基础，不能只关注功能。`
        },
        {
          id: `${stageId}-q3`, type: "short", difficulty: "中等", dim: "d4", score: 10, pass: 0.6,
          stem: `请简述你在「${name}」实践中会如何拆解任务并验证结果。`,
          points: [
            { text: "说明任务拆解思路与优先级", score: 4 },
            { text: "说明验证方式与判断标准", score: 3 },
            { text: "说明失败后的排查与回退方案", score: 3 }
          ],
          reference: `围绕「${name}」，先拆分目标、输入、输出与约束，再设计可验证的小步实验；用明确的指标判断结果，并保留回退路径。`
        }
      ];
      return { id: stageId, name, desc, level: si === 0 ? "入门" : "进阶", questions: qs };
    });

    subject.courses = seeds.map((seed, i) => ({
      id: `${subject.id}-c${i + 1}`,
      title: `${seed[0]} · 系统课`,
      up: "云枢教研",
      duration: `${1 + i} 小时 ${20 + i * 10} 分`,
      views: `${(1.2 - i * 0.2).toFixed(1)} 万`,
      url: "#"
    }));
    subject.routes = [{
      id: `${subject.id}-r1`,
      name: `${subject.name}入门路线`,
      desc: `按顺序完成 ${seeds.map(s => "「" + s[0] + "」").join("、")}，建立完整知识框架。`,
      level: "入门",
      courseIds: subject.courses.map(c => c.id)
    }];
  });

  /* ---------- 课程封面（本地生成 SVG，避免依赖外部图片） ---------- */
  const coverFont = "PingFang SC, Hiragino Sans GB, Microsoft YaHei, sans-serif";
  subjects.forEach(subject => {
    subject.courses.forEach((course, i) => {
      const no = String(i + 1).padStart(2, "0");
      // 同一学科内按课程序号交替渐变方向，让封面有变化但不脱离学科色
      const [x1, y1, x2, y2] = i % 2 === 0 ? [0, 0, 1, 1] : [1, 0, 0, 1];
      const color = subject.color;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180">
        <defs>
          <linearGradient id="bg" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">
            <stop offset="0" stop-color="#14162b"/>
            <stop offset="0.6" stop-color="${color}"/>
            <stop offset="1" stop-color="${color}"/>
          </linearGradient>
          <linearGradient id="fade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stop-color="#0b0d1a" stop-opacity="0.30"/>
            <stop offset="1" stop-color="#0b0d1a" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <rect width="320" height="180" fill="url(#bg)"/>
        <circle cx="286" cy="16" r="96" fill="#ffffff" opacity="0.10"/>
        <circle cx="26" cy="184" r="80" fill="#ffffff" opacity="0.08"/>
        <path d="M0 148 L320 102" stroke="#ffffff" stroke-opacity="0.10" stroke-width="1.5"/>
        <path d="M0 166 L320 120" stroke="#ffffff" stroke-opacity="0.07" stroke-width="1.5"/>
        <rect width="320" height="180" fill="url(#fade)"/>
        <text x="22" y="42" font-family="${coverFont}" font-size="24" fill="#ffffff" fill-opacity="0.85">${subject.short}</text>
        <text x="18" y="142" font-family="${coverFont}" font-size="72" font-weight="700" fill="#ffffff" fill-opacity="0.96">${no}</text>
        <circle cx="258" cy="126" r="28" fill="#ffffff" fill-opacity="0.92"/>
        <path d="M251 114 L271 126 L251 138 Z" fill="${color}"/>
      </svg>`;
      course.cover = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
    });
  });

  /* ---------- 展平题目 ---------- */
  const allQuestions = [];
  subjects.forEach(s => s.stages.forEach(st => st.questions.forEach(q => {
    q.subjectId = s.id; q.stageId = st.id; q.stageName = st.name; q.subjectName = s.name;
    allQuestions.push(q);
  })));
  const qById = Object.fromEntries(allQuestions.map(q => [q.id, q]));

  /* ---------- 面试题库（按学科 × 难度 × 维度生成） ---------- */
  const difficulties = ["简单", "中等", "困难"];
  const interviewBank = {};
  subjects.forEach(s => {
    difficulties.forEach(diff => {
      const pool = [];
      dimensions.forEach((d, di) => {
        for (let k = 0; k < 2; k++) {
          pool.push({
            id: `iq-${s.id}-${diff}-${d.id}-${k}`,
            subjectId: s.id,
            difficulty: diff,
            dim: d.id,
            text: k === 0
              ? `请谈谈「${s.name}」中与「${d.name}」相关的核心要点。`
              : `结合一个实际场景，说明你在「${d.name}」方面是如何做的。`,
            reference: `围绕「${d.name}」展开，结合「${s.name}」的具体实践，说明背景、做法与结果。`
          });
        }
      });
      interviewBank[`${s.id}|${diff}`] = pool;
    });
  });

  /* ---------- 种子数据 ---------- */
  const seedWrong = [
    { qid: "q102", count: 3, streak: 1, status: "review" },
    { qid: "q105", count: 2, streak: 0, status: "review" },
    { qid: "q113", count: 1, streak: 2, status: "review" },
    { qid: "q122", count: 4, streak: 0, status: "review" },
    { qid: "q103", count: 1, streak: 3, status: "mastered" }
  ];

  const seedInterviews = [
    {
      id: "iv-1001", subjectId: "s1", subjectName: "AI 应用与智能体开发", difficulty: "中等",
      date: "2026-10-28 20:14", duration: "18 分 32 秒", count: 10, score: 68,
      dims: { d1: 74, d2: 66, d3: 70, d4: 62, d5: 68, d6: 60 },
      strengths: ["基础概念掌握较扎实，能准确解释 RAG 与 Prompt 的核心机制", "回答结构完整，能主动补充例子"],
      weaknesses: ["技术深度不足，回答多停留在“是什么”", "项目经验描述缺少量化结果"],
      suggestions: ["针对薄弱维度补充 2–3 个真实项目案例，并用指标说明结果", "回答技术细节时，补充实现机制与边界条件"],
      improvement: [
        { type: "题目", title: "RAG 召回质量提升专项练习", meta: "12 道 · 中等", icon: "📝" },
        { type: "课程", title: "RAG 从入门到上线：切块、召回与评估", meta: "3 小时 05 分", icon: "▶️" },
        { type: "面试", title: "再来一次同方向中等难度面试", meta: "预计 20 分钟", icon: "🎙️" }
      ]
    },
    {
      id: "iv-1002", subjectId: "s1", subjectName: "AI 应用与智能体开发", difficulty: "中等",
      date: "2026-11-04 21:02", duration: "21 分 08 秒", count: 10, score: 76,
      dims: { d1: 82, d2: 74, d3: 78, d4: 70, d5: 76, d6: 72 },
      strengths: ["知识面覆盖完整，六个维度均有作答", "表达逻辑清晰，分点作答"],
      weaknesses: ["少数问题缺少取舍分析", "项目经验仍可进一步量化"],
      suggestions: ["继续保持结构化表达", "补充项目中的失败复盘与改进"],
      improvement: [
        { type: "题目", title: "Agent 工具设计专项练习", meta: "8 道 · 困难", icon: "📝" },
        { type: "课程", title: "LangGraph 多智能体编排实战", meta: "2 小时 40 分", icon: "▶️" },
        { type: "面试", title: "挑战困难难度面试", meta: "预计 25 分钟", icon: "🎙️" }
      ]
    }
  ];

  const students = [
    { id: "u1", name: "林晓", phone: "138****2043", status: "正常", learnDays: 18, questions: 236, interviews: 7, registered: "2026-08-12", lastActive: "2026-11-11" },
    { id: "u2", name: "陈屿", phone: "139****8821", status: "正常", learnDays: 12, questions: 158, interviews: 4, registered: "2026-09-02", lastActive: "2026-11-10" },
    { id: "u3", name: "周可", phone: "137****5510", status: "正常", learnDays: 26, questions: 402, interviews: 12, registered: "2026-07-19", lastActive: "2026-11-11" },
    { id: "u4", name: "许知", phone: "186****0932", status: "禁用", learnDays: 3, questions: 21, interviews: 0, registered: "2026-10-28", lastActive: "2026-10-30" },
    { id: "u5", name: "何一", phone: "135****7788", status: "正常", learnDays: 9, questions: 96, interviews: 2, registered: "2026-09-21", lastActive: "2026-11-09" },
    { id: "u6", name: "沈舟", phone: "188****3321", status: "正常", learnDays: 31, questions: 511, interviews: 15, registered: "2026-06-30", lastActive: "2026-11-11" },
    { id: "u7", name: "吴桐", phone: "150****6642", status: "正常", learnDays: 6, questions: 44, interviews: 1, registered: "2026-10-15", lastActive: "2026-11-06" },
    { id: "u8", name: "郑南", phone: "133****9901", status: "正常", learnDays: 14, questions: 187, interviews: 5, registered: "2026-08-25", lastActive: "2026-11-10" },
    { id: "u9", name: "苏禾", phone: "156****1123", status: "正常", learnDays: 21, questions: 268, interviews: 8, registered: "2026-07-11", lastActive: "2026-11-08" },
    { id: "u10", name: "梁辰", phone: "187****4456", status: "正常", learnDays: 5, questions: 32, interviews: 0, registered: "2026-10-30", lastActive: "2026-11-05" },
    { id: "u11", name: "孟秋", phone: "182****7789", status: "正常", learnDays: 17, questions: 214, interviews: 6, registered: "2026-08-08", lastActive: "2026-11-11" },
    { id: "u12", name: "顾言", phone: "131****2200", status: "正常", learnDays: 11, questions: 131, interviews: 3, registered: "2026-09-18", lastActive: "2026-11-07" }
  ];

  const adminUsers = [
    { id: "a1", name: "超级管理员", account: "admin", role: "超级管理员", status: "启用", lastLogin: "2026-11-11 09:12" },
    { id: "a2", name: "李审核", account: "lireview", role: "内容审核", status: "启用", lastLogin: "2026-11-11 08:45" },
    { id: "a3", name: "王运营", account: "wangops", role: "运营人员", status: "启用", lastLogin: "2026-11-10 18:22" },
    { id: "a4", name: "赵运营", account: "zhaoops", role: "运营人员", status: "停用", lastLogin: "2026-10-21 14:03" }
  ];

  const roles = [
    { id: "role1", name: "超级管理员", count: 3, perms: 25, desc: "拥有全部权限，可管理用户、角色与系统设置" },
    { id: "role2", name: "内容审核", count: 5, perms: 9, desc: "审核题库与面试题库，可上架、下架、驳回" },
    { id: "role3", name: "运营人员", count: 8, perms: 12, desc: "维护课程、路线、题库与学员信息" }
  ];

  const permissionGroups = [
    { group: "看板", perms: ["查看数据看板"] },
    { group: "内容", perms: ["学科管理", "课程库管理", "题库管理", "面试题库", "知识库管理", "学习路线", "能力维度", "维度映射"] },
    { group: "学员", perms: ["学员列表", "学员详情", "导出学员", "禁用账号"] },
    { group: "复核", perms: ["查看申诉", "人工改分"] },
    { group: "系统", perms: ["用户管理", "角色管理", "操作日志", "系统设置", "明文导出"] }
  ];

  const logs = [
    { id: "l1", time: "2026-11-11 09:42:18", user: "王运营", action: "新增题目", target: "q105 · RAG 与知识库", ip: "10.12.3.44" },
    { id: "l2", time: "2026-11-11 09:15:02", user: "李审核", action: "审核通过", target: "q121 · Agent 与工具调用", ip: "10.12.3.51" },
    { id: "l3", time: "2026-11-11 08:58:37", user: "李审核", action: "驳回题目", target: "q099 · 大模型微调基础", ip: "10.12.3.51" },
    { id: "l4", time: "2026-11-10 18:22:11", user: "王运营", action: "导入课程", target: "AI 测试 · 12 门课程", ip: "10.12.3.44" },
    { id: "l5", time: "2026-11-10 17:06:49", user: "超级管理员", action: "修改角色", target: "内容审核 · 新增权限 2 项", ip: "10.12.3.10" },
    { id: "l6", time: "2026-11-10 15:31:20", user: "王运营", action: "下架题目", target: "q078 · Prompt 与上下文工程", ip: "10.12.3.44" },
    { id: "l7", time: "2026-11-10 11:12:05", user: "超级管理员", action: "导出学员", target: "学员列表 · 共 12 条（已脱敏）", ip: "10.12.3.10" },
    { id: "l8", time: "2026-11-09 20:47:33", user: "李审核", action: "上架题目", target: "q112 · RAG 与知识库", ip: "10.12.3.51" }
  ];

  const appeals = [
    { id: "ap1", student: "林晓", question: "q113", score: 6, studentScore: 8, reason: "采分点 2 与 3 已作答，但 AI 未识别同义表述，申请复核。", time: "2026-11-10 21:03", status: "待复核" },
    { id: "ap2", student: "陈屿", question: "q123", score: 4, studentScore: 7, reason: "回答中已包含审批与回滚方案，希望人工确认。", time: "2026-11-10 19:40", status: "待复核" },
    { id: "ap3", student: "周可", question: "q104", score: 7, studentScore: 9, reason: "系统提示词与用户提示词的区别已说明完整。", time: "2026-11-09 16:22", status: "已通过" }
  ];

  const messages = [
    { id: "m1", type: "复核", title: "简答题复核结果", body: "你对题目「简述系统提示词与用户提示词的区别」的申诉已通过，分数由 7 分调整为 9 分。", time: "2026-11-09 16:25", unread: true },
    { id: "m2", type: "系统", title: "面试报告已生成", body: "你在「AI 应用与智能体开发 · 中等」的模拟面试已完成，综合得分 76 分，点击查看报告。", time: "2026-11-04 21:24", unread: true },
    { id: "m3", type: "提醒", title: "连续学习 7 天", body: "你已经连续学习 7 天，继续保持！今日推荐完成 1 次 AI 面试。", time: "2026-11-02 09:00", unread: false },
    { id: "m4", type: "系统", title: "隐私政策更新", body: "我们更新了隐私政策，补充了学习足迹与 AI 面试录音的处理说明。", time: "2026-10-28 10:00", unread: false }
  ];

  const knowledgeBases = [
    { id: "kb1", name: "智能体开发知识库", subjectId: "s1", docs: 18, questions: 96, updated: "2026-11-10 14:20", status: "启用" },
    { id: "kb2", name: "大模型训练与微调", subjectId: "s2", docs: 12, questions: 64, updated: "2026-11-08 10:05", status: "启用" },
    { id: "kb3", name: "机器人系统知识库", subjectId: "s3", docs: 9, questions: 41, updated: "2026-11-05 16:40", status: "启用" },
    { id: "kb4", name: "AI 测试题库草稿", subjectId: "s5", docs: 3, questions: 12, updated: "2026-11-11 09:30", status: "草稿" }
  ];

  const dashboard = {
    users: { total: 1284, today: 23, active7: 412, retention: 46 },
    learn: { visits: 3862, learned: 726, courses: 41 },
    practice: { count: 12480, accuracy: 73, wrong: 3186 },
    interview: { count: 486, avg: 71, pass: 62 }
  };

  return {
    dimensions, dimById, subjects, allQuestions, qById, interviewBank,
    difficulties, seedWrong, seedInterviews, students, adminUsers, roles,
    permissionGroups, logs, appeals, messages, knowledgeBases, dashboard,
    stageById: Object.fromEntries(subjects.flatMap(s => s.stages.map(st => [st.id, st]))),
    subjectById: Object.fromEntries(subjects.map(s => [s.id, s])),
    courseById: Object.fromEntries(subjects.flatMap(s => s.courses.map(c => [c.id, c]))),
    routeById: Object.fromEntries(subjects.flatMap(s => s.routes.map(r => [r.id, r])))
  };
})();
