export type ActivityType = 'task' | 'entertainment'

export interface SubTask {
  id: string
  title: string
  completed: boolean
}

export interface Task {
  id: string
  title: string
  description: string
  type: ActivityType
  subtasks: SubTask[]
  completedPomodoros: number
  createdAt: string
  completedAt?: string
  isCompleted: boolean
  isRecurring: boolean
  isSimple: boolean
  order: number
}

export interface DailyStats {
  date: string
  pomodoros: number
  focusTime: number
  waterCount: number
  tasksCompleted: number
  patataTime: number
}

export interface PatataActivity {
  id: string
  title: string
  duration: number
  createdAt: string
}

export enum PomodoroStatus {
  Pomodoro = 'pomodoro',
  ShortBreak = 'shortBreak',
  LongBreak = 'longBreak',
}

// ========== PlanFlow 目标管理类型 ==========

/** 目标优先级 */
export type GoalPriority = 'p0' | 'p1' | 'p2' | 'p3'

/** 目标状态 */
export type GoalStatus = 'active' | 'completed' | 'cancelled' | 'paused'

/** 目标难度 */
export type GoalDifficulty = 1 | 2 | 3 | 4 | 5

/** SMART 评分 */
export interface SmartScore {
  specific: number // 1-10
  measurable: number // 1-10
  achievable: number // 1-10
  relevant: number // 1-10
  timeBound: number // 1-10
  total: number // 1-100
}

/** 衡量指标 */
export interface MetricType {
  type: 'percentage' | 'number' | 'boolean'
  target: number
  current: number
  unit?: string
}

/** 行动项 */
export interface Action {
  id: string
  title: string
  description?: string
  completed: boolean
  dueDate?: string
  createdAt: string
  updatedAt: string
}

/** 任务 */
export interface PlanTask {
  id: string
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'completed' | 'cancelled'
  priority: GoalPriority
  dueDate?: string
  estimatedHours?: number
  actualHours?: number
  tags?: string[]
  actions: Action[]
  dependencies?: string[] // 依赖的其他任务 ID
  progress: number // 0-100
  createdAt: string
  updatedAt: string
}

/** 子目标 */
export interface SubGoal {
  id: string
  title: string
  description?: string
  tasks: PlanTask[]
  progress: number // 0-100
  createdAt: string
  updatedAt: string
}

/** 目标模板分类 */
export type GoalTemplateCategory = 'work' | 'learning' | 'health' | 'finance' | 'personal'

/** 目标 */
export interface Goal {
  id: string
  title: string
  description: string
  metric: MetricType
  smartScore?: SmartScore
  difficulty: GoalDifficulty
  priority: GoalPriority
  status: GoalStatus
  tags?: string[]
  startDate: string
  dueDate: string
  parentGoalId?: string // 关联上级目标
  subGoals: SubGoal[]
  progress: number // 0-100
  templateId?: string // 使用的模板 ID
  createdAt: string
  updatedAt: string
  completedAt?: string
}

/** 目标模板 */
export interface GoalTemplate {
  id: string
  name: string
  category: GoalTemplateCategory
  description: string
  goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'progress' | 'completedAt'>
}

/** OKR 视图配置 */
export interface OKRView {
  objectiveId: string
  keyResults: string[]
  progress: number
}
