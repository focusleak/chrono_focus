/**
 * @see https://prettier.io/docs/en/configuration.html
 * @type {import("prettier").Config}
 */
export default {
  // 每行最大字符数
  printWidth: 100,
  // 缩进空格数
  tabWidth: 2,
  // 使用空格而不是制表符
  useTabs: false,
  // 语句末尾不加分号
  semi: false,
  // 使用单引号
  singleQuote: true,
  // 对象属性引号：仅在需要时添加
  quoteProps: 'as-needed',
  // JSX 中使用单引号
  jsxSingleQuote: false,
  // 尾随逗号：ES5 风格（对象和数组）
  trailingComma: 'all',
  // 对象字面量的大括号间添加空格
  bracketSpacing: true,
  // JSX 尖括号不另起一行
  bracketSameLine: false,
  // 箭头函数单个参数不加括号
  arrowParens: 'avoid',
  // 每个文件格式化的范围是整个文件
  rangeStart: 0,
  rangeEnd: Infinity,
  // 不需要 @prettier 注释
  requirePragma: false,
  // 不在文件顶部插入 @format 注释
  insertPragma: false,
  // markdown 文本换行
  proseWrap: 'preserve',
  // HTML 空格敏感性
  htmlWhitespaceSensitivity: 'css',
  // Vue 文件脚本和样式标签缩进
  vueIndentScriptAndStyle: false,
  // 换行符：lf（macOS/Linux 风格）
  endOfLine: 'lf',
  // 格式化嵌入内容
  embeddedLanguageFormatting: 'auto',
  // HTML/CSS/JSX 中每个属性独占一行
  singleAttributePerLine: false,
  // Tailwind CSS 类名排序插件
  plugins: ['prettier-plugin-tailwindcss'],
  // Tailwind 插件配置
  tailwindFunctions: ['cn', 'clsx', 'cva', 'twMerge'],
}
