/**
 * Timer Engine - 统一计时引擎
 * 
 * 提供精确的时间源，不受浏览器后台限流影响
 * 支持倒计时和正计时两种模式
 * 自动处理时间漂移和后台唤醒补偿
 */

export { timerEngine, type TimerConfig, type TimerState, type TimerMode } from './timerEngine'
export { usePrecisionTimer, type UsePrecisionTimerOptions } from '../hooks/common/usePrecisionTimer'
