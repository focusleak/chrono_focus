# RULES

0. 先构建基础能力，然后在此基础上开发业务逻辑
1. 状态管理使用Zustand官网提供的用法，即：
    - `const someState = useSomeStore.use.someState()`
    - `const updateSomeState = useSomeStore.use.updateSomeState()`
2. 单一职责原则，一个组件、一个函数只做一件事
3. 规范命名
4. 奥卡姆剃刀原则：如果社区有成熟方案，不要自己造轮子
5. 性能优化
6. 类型安全，合理使用TypeScript的各类功能
7. 代码质量
    - 语义化 / 可访问性 / 无障碍
8. 健壮性
9. import语句顺序
    - 第三方库
        - react
        - react-router
        - dnd-kit
        - lucide-react
        - date-fns
    - @/lib
    - @/components/ui
    - @/components
    - @/hooks
    - @/store
    - @/features
    - @/types
    - ./
10. 最小知识原则