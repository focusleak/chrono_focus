// 模板数据类型（不包含自动生成的字段）
interface TemplateTask {
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'p0' | 'p1' | 'p2' | 'p3'
  estimatedHours?: number
  actions: Array<{ title: string; completed: boolean }>
}

interface TemplateSubGoal {
  title: string
  description?: string
  tasks: TemplateTask[]
}

interface TemplateGoal {
  title: string
  description: string
  metric: {
    type: 'percentage' | 'number' | 'boolean'
    target: number
    current: number
    unit?: string
  }
  priority: 'p0' | 'p1' | 'p2' | 'p3'
  difficulty: 1 | 2 | 3 | 4 | 5
  status: 'active' | 'completed' | 'cancelled' | 'paused'
  tags?: string[]
  subGoals: TemplateSubGoal[]
}

interface TemplateData {
  name: string
  category: 'work' | 'learning' | 'health' | 'finance' | 'personal'
  description: string
  goal: TemplateGoal
}

/**
 * 预设目标模板库
 * 包含工作、学习、健康、财务、个人等分类的常见目标模板
 */
export const defaultGoalTemplates: TemplateData[] = [
  // ========== 工作类 ==========
  {
    name: '季度业绩目标',
    category: 'work',
    description: '制定并完成本季度的业绩目标',
    goal: {
      title: 'Q1 季度业绩目标',
      description: '制定具体的季度业绩目标，包括销售额、客户数量、项目完成率等关键指标。',
      metric: {
        type: 'percentage',
        target: 100,
        current: 0,
        unit: '%',
      },
      priority: 'p1',
      difficulty: 3,
      status: 'active',
      subGoals: [
        {
          title: '销售额目标',
          description: '完成季度销售额目标',
          tasks: [
            {
              title: '制定销售计划',
              description: '根据历史数据和市场分析制定详细的销售计划',
              status: 'todo',
              priority: 'p1',
              estimatedHours: 8,
              actions: [],
            },
            {
              title: '拓展新客户',
              description: '每季度新增至少 10 个新客户',
              status: 'todo',
              priority: 'p1',
              actions: [],
            },
          ],
        },
        {
          title: '客户满意度提升',
          description: '提升客户满意度到 90% 以上',
          tasks: [
            {
              title: '客户反馈调研',
              description: '完成至少 20 份客户满意度调研',
              status: 'todo',
              priority: 'p2',
              actions: [],
            },
          ],
        },
      ],
      tags: ['工作', '季度目标'],
    },
  },
  {
    name: '产品上线计划',
    category: 'work',
    description: '完成产品从开发到上线的完整流程',
    goal: {
      title: '产品 v2.0 上线计划',
      description: '完成产品 v2.0 版本的所有开发、测试和上线工作',
      metric: {
        type: 'boolean',
        target: 1,
        current: 0,
      },
      priority: 'p0',
      difficulty: 4,
      status: 'active',
      subGoals: [
        {
          title: '需求分析和设计',
          description: '完成产品需求文档和设计方案',
          tasks: [
            {
              title: '撰写 PRD 文档',
              description: '详细的产品需求文档',
              status: 'todo',
              priority: 'p0',
              actions: [],
            },
            {
              title: 'UI/UX 设计',
              description: '完成所有界面的设计稿',
              status: 'todo',
              priority: 'p1',
              actions: [],
            },
          ],
        },
        {
          title: '开发阶段',
          description: '完成所有功能开发',
          tasks: [
            {
              title: '前端开发',
              status: 'todo',
              priority: 'p0',
              actions: [],
            },
            {
              title: '后端开发',
              status: 'todo',
              priority: 'p0',
              actions: [],
            },
          ],
        },
        {
          title: '测试和上线',
          description: '完成测试并上线发布',
          tasks: [
            {
              title: '功能测试',
              status: 'todo',
              priority: 'p1',
              actions: [],
            },
            {
              title: '生产环境部署',
              status: 'todo',
              priority: 'p0',
              actions: [],
            },
          ],
        },
      ],
      tags: ['工作', '产品'],
    },
  },

  // ========== 学习类 ==========
  {
    name: '考试通过计划',
    category: 'learning',
    description: '制定并执行考试复习计划，确保通过考试',
    goal: {
      title: 'PMP 认证考试通过计划',
      description: '系统学习 PMP 知识体系，通过认证考试',
      metric: {
        type: 'boolean',
        target: 1,
        current: 0,
      },
      priority: 'p1',
      difficulty: 4,
      status: 'active',
      subGoals: [
        {
          title: '知识体系学习',
          description: '完成 PMBOK 所有章节的学习',
          tasks: [
            {
              title: '学习第 1-5 章',
              status: 'todo',
              priority: 'p1',
              estimatedHours: 20,
              actions: [],
            },
            {
              title: '学习第 6-10 章',
              status: 'todo',
              priority: 'p1',
              estimatedHours: 20,
              actions: [],
            },
            {
              title: '学习第 11-15 章',
              status: 'todo',
              priority: 'p1',
              estimatedHours: 20,
              actions: [],
            },
          ],
        },
        {
          title: '模拟考试练习',
          description: '完成至少 5 套模拟试卷',
          tasks: [
            {
              title: '模拟考试 1-3',
              status: 'todo',
              priority: 'p2',
              estimatedHours: 12,
              actions: [],
            },
            {
              title: '模拟考试 4-5',
              status: 'todo',
              priority: 'p2',
              estimatedHours: 8,
              actions: [],
            },
          ],
        },
      ],
      tags: ['学习', '认证'],
    },
  },
  {
    name: '技能提升计划',
    category: 'learning',
    description: '系统学习和提升某项专业技能',
    goal: {
      title: '前端开发技能提升',
      description: '深入学习 React、TypeScript 等前端技术栈',
      metric: {
        type: 'number',
        target: 10,
        current: 0,
        unit: '个',
      },
      priority: 'p2',
      difficulty: 3,
      status: 'active',
      subGoals: [
        {
          title: 'React 进阶学习',
          description: '掌握 React Hooks、Context、性能优化等',
          tasks: [
            {
              title: '学习 React Hooks',
              status: 'todo',
              priority: 'p1',
              actions: [],
            },
            {
              title: '完成一个完整项目',
              status: 'todo',
              priority: 'p1',
              actions: [],
            },
          ],
        },
        {
          title: 'TypeScript 深入学习',
          description: '掌握泛型、工具类型、类型守卫等高级特性',
          tasks: [
            {
              title: '学习高级类型',
              status: 'todo',
              priority: 'p2',
              actions: [],
            },
          ],
        },
      ],
      tags: ['学习', '技术'],
    },
  },

  // ========== 健康类 ==========
  {
    name: '减肥计划',
    category: 'health',
    description: '通过科学的方法达到理想体重',
    goal: {
      title: '3 个月减重 5kg',
      description: '通过合理饮食控制和规律运动，健康减重',
      metric: {
        type: 'number',
        target: 5,
        current: 0,
        unit: 'kg',
      },
      priority: 'p2',
      difficulty: 3,
      status: 'active',
      subGoals: [
        {
          title: '饮食控制',
          description: '控制每日热量摄入',
          tasks: [
            {
              title: '制定饮食计划',
              status: 'todo',
              priority: 'p1',
              estimatedHours: 2,
              actions: [
                { title: '计算每日所需热量', completed: false },
                { title: '制定一周食谱', completed: false },
              ],
            },
            {
              title: '每日记录饮食',
              status: 'todo',
              priority: 'p2',
              actions: [],
            },
          ],
        },
        {
          title: '运动计划',
          description: '每周至少运动 4 次',
          tasks: [
            {
              title: '有氧运动',
              description: '每周至少 3 次，每次 30 分钟',
              status: 'todo',
              priority: 'p1',
              actions: [],
            },
            {
              title: '力量训练',
              description: '每周至少 2 次',
              status: 'todo',
              priority: 'p2',
              actions: [],
            },
          ],
        },
      ],
      tags: ['健康', '减重'],
    },
  },
  {
    name: '运动习惯养成',
    category: 'health',
    description: '培养规律运动的习惯',
    goal: {
      title: '养成每日运动习惯',
      description: '连续 30 天保持每日运动，培养习惯',
      metric: {
        type: 'number',
        target: 30,
        current: 0,
        unit: '天',
      },
      priority: 'p2',
      difficulty: 2,
      status: 'active',
      subGoals: [
        {
          title: '第一周适应期',
          description: '每天运动 15-20 分钟，适应运动节奏',
          tasks: [
            {
              title: '第 1-7 天运动打卡',
              status: 'todo',
              priority: 'p1',
              actions: [],
            },
          ],
        },
        {
          title: '第二至四周提升期',
          description: '逐渐增加运动强度到 30 分钟',
          tasks: [
            {
              title: '第 8-30 天运动打卡',
              status: 'todo',
              priority: 'p1',
              actions: [],
            },
          ],
        },
      ],
      tags: ['健康', '习惯'],
    },
  },

  // ========== 财务类 ==========
  {
    name: '储蓄目标',
    category: 'finance',
    description: '在指定期限内完成储蓄目标',
    goal: {
      title: '年度储蓄 10 万元',
      description: '通过合理理财和节约开支，完成年度储蓄目标',
      metric: {
        type: 'number',
        target: 100000,
        current: 0,
        unit: '元',
      },
      priority: 'p1',
      difficulty: 3,
      status: 'active',
      subGoals: [
        {
          title: '季度储蓄目标',
          description: '每季度储蓄 2.5 万元',
          tasks: [
            {
              title: 'Q1 储蓄目标',
              status: 'todo',
              priority: 'p1',
              actions: [],
            },
            {
              title: 'Q2 储蓄目标',
              status: 'todo',
              priority: 'p1',
              actions: [],
            },
          ],
        },
        {
          title: '理财规划',
          description: '学习并实施稳健的理财策略',
          tasks: [
            {
              title: '学习理财知识',
              status: 'todo',
              priority: 'p2',
              actions: [],
            },
          ],
        },
      ],
      tags: ['财务', '储蓄'],
    },
  },
  {
    name: '投资计划',
    category: 'finance',
    description: '制定并执行投资计划',
    goal: {
      title: '基金投资年化收益 15%',
      description: '通过基金定投和价值投资，实现年化收益 15% 的目标',
      metric: {
        type: 'percentage',
        target: 15,
        current: 0,
        unit: '%',
      },
      priority: 'p2',
      difficulty: 4,
      status: 'active',
      subGoals: [
        {
          title: '基金筛选和研究',
          description: '研究并筛选出优质基金',
          tasks: [
            {
              title: '学习基金投资知识',
              status: 'todo',
              priority: 'p1',
              actions: [],
            },
            {
              title: '筛选 10 只备选基金',
              status: 'todo',
              priority: 'p2',
              actions: [],
            },
          ],
        },
        {
          title: '定投执行',
          description: '按计划执行基金定投',
          tasks: [
            {
              title: '设置每月定投计划',
              status: 'todo',
              priority: 'p1',
              actions: [],
            },
          ],
        },
      ],
      tags: ['财务', '投资'],
    },
  },

  // ========== 个人类 ==========
  {
    name: '阅读计划',
    category: 'personal',
    description: '完成一定数量的书籍阅读',
    goal: {
      title: '年度阅读 50 本书',
      description: '保持每月阅读 4-5 本书的习惯，涵盖不同领域',
      metric: {
        type: 'number',
        target: 50,
        current: 0,
        unit: '本',
      },
      priority: 'p2',
      difficulty: 2,
      status: 'active',
      subGoals: [
        {
          title: '专业类书籍',
          description: '阅读 15 本专业相关书籍',
          tasks: [
            {
              title: '列出专业书单',
              status: 'todo',
              priority: 'p2',
              actions: [],
            },
            {
              title: '每月阅读 1-2 本',
              status: 'todo',
              priority: 'p1',
              actions: [],
            },
          ],
        },
        {
          title: '人文类书籍',
          description: '阅读 20 本历史、哲学、文学等人文类书籍',
          tasks: [
            {
              title: '列人文书单',
              status: 'todo',
              priority: 'p3',
              actions: [],
            },
          ],
        },
        {
          title: '其他类书籍',
          description: '阅读 15 本其他类型书籍',
          tasks: [],
        },
      ],
      tags: ['个人', '阅读'],
    },
  },
  {
    name: '旅行计划',
    category: 'personal',
    description: '规划和执行一次期待的旅行',
    goal: {
      title: '日本 7 日深度游',
      description: '规划并完成一次日本深度旅行，体验不同文化',
      metric: {
        type: 'boolean',
        target: 1,
        current: 0,
      },
      priority: 'p3',
      difficulty: 2,
      status: 'active',
      subGoals: [
        {
          title: '行程规划',
          description: '详细规划旅行行程',
          tasks: [
            {
              title: '确定目的地和景点',
              status: 'todo',
              priority: 'p2',
              actions: [],
            },
            {
              title: '预订机票和酒店',
              status: 'todo',
              priority: 'p1',
              actions: [],
            },
          ],
        },
        {
          title: '旅行准备',
          description: '做好出行前的各项准备',
          tasks: [
            {
              title: '办理签证',
              status: 'todo',
              priority: 'p0',
              actions: [],
            },
            {
              title: '准备行李',
              status: 'todo',
              priority: 'p2',
              actions: [],
            },
          ],
        },
      ],
      tags: ['个人', '旅行'],
    },
  },
]
