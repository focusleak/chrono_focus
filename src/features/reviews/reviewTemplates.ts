import type { ReviewTemplate } from '@/store/reviewStore'

/**
 * 预设复盘模板
 */
export const defaultReviewTemplates: Omit<ReviewTemplate, 'id' | 'createdAt'>[] = [
  {
    name: '标准周复盘',
    type: 'work',
    description: '适用于每周工作/学习复盘，包含目标完成情况、亮点与不足、改进措施等核心模块',
    sections: [
      { id: 's1', title: '一、目标完成情况', description: '对比计划与实际的完成情况', placeholder: '- 计划完成的任务：\n- 实际完成的任务：\n- 完成率：', order: 1 },
      { id: 's2', title: '二、亮点与成就', description: '本周做得好的地方', placeholder: '1.\n2.\n3.', order: 2 },
      { id: 's3', title: '三、问题与不足', description: '需要改进的方面', placeholder: '1.\n2.\n3.', order: 3 },
      { id: 's4', title: '四、改进措施', description: '下周的具体改进计划', placeholder: '1.\n2.\n3.', order: 4 },
      { id: 's5', title: '五、下周计划', description: '下周的重点任务和目标', placeholder: '1.\n2.\n3.', order: 5 },
    ],
  },
  {
    name: '月度复盘',
    type: 'work',
    description: '适用于每月工作总结和规划，更宏观地审视进展和方向',
    sections: [
      { id: 's1', title: '一、本月目标达成', description: '月度目标的完成情况', placeholder: '- 月初目标：\n- 实际结果：\n- 达成率：', order: 1 },
      { id: 's2', title: '二、关键成果', description: '本月最重要的产出和成果', placeholder: '1.\n2.\n3.', order: 2 },
      { id: 's3', title: '三、经验教训', description: '从成功和失败中获得的经验', placeholder: '成功经验：\n失败教训：', order: 3 },
      { id: 's4', title: '四、资源盘点', description: '时间、精力、资源的投入产出分析', placeholder: '- 时间投入：\n- 精力状态：\n- 资源利用：', order: 4 },
      { id: 's5', title: '五、下月规划', description: '下月的重点方向和计划', placeholder: '重点方向：\n1.\n2.\n3.', order: 5 },
    ],
  },
  {
    name: '项目复盘',
    type: 'project',
    description: '适用于项目结束后的全面复盘，总结项目经验和教训',
    sections: [
      { id: 's1', title: '一、项目概述', description: '项目背景、目标和范围', placeholder: '- 项目背景：\n- 项目目标：\n- 项目范围：', order: 1 },
      { id: 's2', title: '二、执行回顾', description: '项目计划与实际执行的对比', placeholder: '- 计划里程碑：\n- 实际完成情况：\n- 偏差分析：', order: 2 },
      { id: 's3', title: '三、成果展示', description: '项目的主要成果和交付物', placeholder: '1.\n2.\n3.', order: 3 },
      { id: 's4', title: '四、问题与挑战', description: '遇到的主要问题和解决方案', placeholder: '问题1：\n  解决方案：\n问题2：\n  解决方案：', order: 4 },
      { id: 's5', title: '五、经验沉淀', description: '可复用的经验和最佳实践', placeholder: '最佳实践：\n1.\n2.\n避免的坑：\n1.\n2.', order: 5 },
      { id: 's6', title: '六、改进建议', description: '对未来类似项目的建议', placeholder: '1.\n2.\n3.', order: 6 },
    ],
  },
  {
    name: '学习复盘',
    type: 'learning',
    description: '适用于学习阶段结束后的复盘，总结学习成果和下一步计划',
    sections: [
      { id: 's1', title: '一、学习目标', description: '学习前设定的目标', placeholder: '- 学习目标：\n- 期望成果：\n- 时间规划：', order: 1 },
      { id: 's2', title: '二、学习成果', description: '实际掌握的内容和技能', placeholder: '已掌握：\n1.\n2.\n部分掌握：\n1.\n2.', order: 2 },
      { id: 's3', title: '三、学习方法', description: '使用的学习方法和效果评估', placeholder: '有效方法：\n无效方法：\n改进方向：', order: 3 },
      { id: 's4', title: '四、困难与突破', description: '遇到的困难和如何克服', placeholder: '困难1：\n  突破方式：\n困难2：\n  突破方式：', order: 4 },
      { id: 's5', title: '五、下一步计划', description: '后续学习规划和目标', placeholder: '短期计划：\n1.\n2.\n长期规划：\n1.\n2.', order: 5 },
    ],
  },
  {
    name: '健康复盘',
    type: 'health',
    description: '适用于健康管理周期结束后的复盘，包括运动、饮食、睡眠等',
    sections: [
      { id: 's1', title: '一、健康目标', description: '周期开始设定的健康目标', placeholder: '- 体重目标：\n- 运动目标：\n- 饮食目标：', order: 1 },
      { id: 's2', title: '二、执行情况', description: '实际执行情况', placeholder: '- 运动频率：\n- 饮食习惯：\n- 睡眠质量：', order: 2 },
      { id: 's3', title: '三、身体变化', description: '身体和精神状态的改善', placeholder: '- 体重变化：\n- 体能变化：\n- 精神状态：', order: 3 },
      { id: 's4', title: '四、坚持与放弃', description: '哪些习惯坚持下来了，哪些放弃了', placeholder: '坚持的习惯：\n1.\n2.\n放弃的习惯：\n1.\n2.', order: 4 },
      { id: 's5', title: '五、下阶段计划', description: '下一阶段的健康计划', placeholder: '1.\n2.\n3.', order: 5 },
    ],
  },
]

/**
 * 复盘周期配置
 */
export const PERIOD_CONFIG = {
  weekly: { label: '周复盘', days: 7, icon: '📅' },
  monthly: { label: '月复盘', days: 30, icon: '📆' },
  quarterly: { label: '季复盘', days: 90, icon: '📊' },
  yearly: { label: '年复盘', days: 365, icon: '🎯' },
  custom: { label: '自定义', days: 0, icon: '⚙️' },
}

/**
 * 复盘类型配置
 */
export const TYPE_CONFIG = {
  goal: { label: '目标复盘', color: 'bg-blue-500', icon: '🎯' },
  project: { label: '项目复盘', color: 'bg-purple-500', icon: '📦' },
  learning: { label: '学习复盘', color: 'bg-green-500', icon: '📚' },
  work: { label: '工作复盘', color: 'bg-orange-500', icon: '💼' },
  health: { label: '健康复盘', color: 'bg-red-500', icon: '❤️' },
  custom: { label: '自定义', color: 'bg-gray-500', icon: '⚙️' },
}
