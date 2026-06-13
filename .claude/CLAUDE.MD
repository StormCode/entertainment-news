## gstack 虛擬團隊設定

使用 gstack 技能進行所有開發流程：

**可用技能：**
- `/office-hours` - 專案概述與目標說明
- `/plan-ceo-review` - 商業策略審查
- `/plan-eng-review` - 工程架構審查
- `/plan-design-review` - 設計審查
- `/review` - 程式碼審查
- `/qa` - 品質測試
- `/cso` - 安全審查
- `/ship` - 發版部署
- `/browse` - 瀏覽器測試（使用 gstack 的持久化瀏覽器）

## Skill routing

When the user's request matches an available skill, invoke it via the Skill tool. When in doubt, invoke the skill.

Key routing rules:
- Product ideas/brainstorming → invoke /office-hours
- Strategy/scope → invoke /plan-ceo-review
- Architecture → invoke /plan-eng-review
- Design system/plan review → invoke /design-consultation or /plan-design-review
- Full review pipeline → invoke /autoplan
- Bugs/errors → invoke /investigate
- QA/testing site behavior → invoke /qa or /qa-only
- Code review/diff check → invoke /review
- Visual polish → invoke /design-review
- Ship/deploy/PR → invoke /ship or /land-and-deploy
- Save progress → invoke /context-save
- Resume context → invoke /context-restore

## 對話規則
- 使用繁體中文回答