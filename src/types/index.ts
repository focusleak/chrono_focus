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
