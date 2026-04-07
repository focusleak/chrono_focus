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
  potatoTime: number
}

export interface PotatoActivity {
  id: string
  title: string
  duration: number
  createdAt: string
}

export type PomodoroType = 'pomodoro' | 'shortBreak' | 'longBreak'
