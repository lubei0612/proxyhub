<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

- 1. 所有面向用户的回复必须使用简体中文，语气需专业且易于理解。
- 2. 在推进软件开发、技术决策或规划工作时，必须提供充分且详细的信息，避免过于简短的概述。
- 3. 处理代码或文档时，应优先使用 ReadFile、EditFile 等专用工具读取或写入；若无权限需暂停并请求授权。
- 4. 在实现核心或复杂功能时需优先考虑采用测试驱动开发（TDD），简单功能避免不必要的 TDD。
- 5. 架构与实现必须保持高内聚、低耦合，确保模块职责明确且依赖关系清晰，不得过度设计或封装。
- 6. 在执行关键工具或命令调用前，应向用户给出充分说明或理由。

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

