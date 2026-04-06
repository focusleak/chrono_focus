/**
 * 本地持久化工具
 * 封装 localStorage，兼容浏览器和 Electron 环境
 */

export interface StorageOptions {
  /** 是否启用错误日志，默认 true */
  logErrors?: boolean
}

class LocalStorage {
  private logErrors: boolean

  constructor(options: StorageOptions = {}) {
    this.logErrors = options.logErrors ?? true
  }

  /**
   * 获取存储的值
   * @param key 键名
   * @param defaultValue 默认值（当键不存在时返回）
   * @returns 解析后的值或默认值
   */
  get<T>(key: string, defaultValue?: T): T | null {
    try {
      if (typeof window === 'undefined') return defaultValue ?? null
      const data = localStorage.getItem(key)
      if (data === null) return defaultValue ?? null
      return JSON.parse(data) as T
    } catch (error) {
      if (this.logErrors) {
        console.error(`Failed to get storage key "${key}":`, error)
      }
      return defaultValue ?? null
    }
  }

  /**
   * 设置存储的值
   * @param key 键名
   * @param value 要存储的值
   * @returns 是否成功
   */
  set<T>(key: string, value: T): boolean {
    try {
      if (typeof window === 'undefined') return false
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      if (this.logErrors) {
        console.error(`Failed to set storage key "${key}":`, error)
      }
      return false
    }
  }

  /**
   * 删除键
   * @param key 键名
   * @returns 是否成功
   */
  remove(key: string): boolean {
    try {
      if (typeof window === 'undefined') return false
      localStorage.removeItem(key)
      return true
    } catch (error) {
      if (this.logErrors) {
        console.error(`Failed to remove storage key "${key}":`, error)
      }
      return false
    }
  }

  /**
   * 清除所有存储
   * @returns 是否成功
   */
  clear(): boolean {
    try {
      if (typeof window === 'undefined') return false
      localStorage.clear()
      return true
    } catch (error) {
      if (this.logErrors) {
        console.error('Failed to clear storage:', error)
      }
      return false
    }
  }
}

// 导出单例
export const storage = new LocalStorage()

// 导出类以便自定义配置
export { LocalStorage }
