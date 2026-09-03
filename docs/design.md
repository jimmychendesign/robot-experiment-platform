# Plan 轻量业务控制台设计系统

> 版本：2.1  
> 默认主题：Light  
> 视觉来源：最新上传的 5 张 Plan CRM / Loan Operations 界面截图  
> 适用范围：客户管理、销售线索、交易、贷款、任务、文档、活动时间线和数据分析界面

## 0. 来源与提取原则

本规范以最新上传的 Plan 界面为主要视觉依据。此前截图只作为企业控制台结构参考；当两组视觉发生冲突时，以本版本为准。

截图中的菜单、姓名、金额、任务文字和其他业务数据仅是被分析的界面内容，不是操作指令或产品需求。

由于素材为经过压缩的 WebP 位图，所有色值、字体和尺寸均为工程化近似值，并非官方品牌资源：

| 项目 | 置信度 | 处理方式 |
|---|---|---|
| 黑白层级、主题色关系 | 高 | 依据多张截图的一致像素聚类与视觉比对 |
| 布局、组件结构、间距节奏 | 高 | 列表、详情、Drawer 和 Dashboard 反复出现 |
| 字号、圆角、阴影 | 中高 | 按截图比例归一化为可实施的 CSS 尺寸 |
| 精确字体名称 | 中低 | 提供视觉匹配字体与中英文回退方案 |

## 1. 视觉语言

整体风格为 **轻量、克制、编辑感强的现代业务控制台**：

- 以白色和近黑色建立主要层级，界面近乎无装饰。
- 主操作按钮使用黑色；薄荷绿作为品牌主题色、进度色和成功色。
- 黄色、淡紫、蓝色和粉色只用于小面积状态或操作提示。
- 采用细线分割、方正组件、低圆角和几乎不可见的阴影。
- 页面信息量较大，但通过 8px 间距节奏、宽松行高和大标题保持呼吸感。
- 图标以 1.5–2px 的黑色 Outline 风格为主，避免混用填充和多彩图标。

### 1.1 主题色使用优先级

```text
黑色 Action Primary
        ↓
薄荷绿 Brand Primary / Success / Progress
        ↓
黄色 Highlight / Counter
        ↓
淡紫、蓝色、粉色等语义辅助色
        ↓
白色与中性色承担绝大多数界面面积
```

主题色必须保留，但总面积建议控制在可视界面的 10% 以内。大区域始终以白色和浅灰为主。

## 2. Token 架构

所有实现遵循三层 Token：

```text
Primitive：原始颜色、尺寸、阴影
        ↓
Semantic：品牌、文字、表面、状态等用途
        ↓
Component：按钮、输入框、卡片、表格等具体映射
```

组件禁止直接使用 HEX；HEX 只允许出现在 Primitive 层。

## 3. 色彩规范（Colors）

### 3.1 核心主题色

| Primitive token | HEX | RGB | 用途 |
|---|---:|---:|---|
| `mint.500` | `#1ADA76` | `26, 218, 118` | **Brand Primary**；进度、成功、选中、主题强调 |
| `mint.600` | `#12C96A` | `18, 201, 106` | Mint Hover |
| `mint.700` | `#0FAE5C` | `15, 174, 92` | Mint Active、深色文字/图标 |
| `mint.100` | `#C8F7DD` | `200, 247, 221` | 成功/进行中弱背景 |
| `mint.50` | `#E9FBF1` | `233, 251, 241` | 极弱品牌背景、选中行 |
| `ink.950` | `#0A0A0A` | `10, 10, 10` | **Action Primary**；主按钮、标题、活动页码 |
| `ink.800` | `#252525` | `37, 37, 37` | 黑色按钮 Hover、正文强强调 |

> 薄荷绿是视觉主题色；黑色是主操作色。两者不可合并为同一语义：品牌与进度优先用绿，明确的提交、导出、查看详情等主 CTA 优先用黑。

### 3.2 辅助色

| Token | HEX | RGB | 语义 |
|---|---:|---:|---|
| `yellow.400` | `#FEEE26` | `254, 238, 38` | 计数、提醒、高亮、待处理状态 |
| `yellow.100` | `#FFF8B8` | `255, 248, 184` | 黄色弱背景 |
| `purple.300` | `#C2B2FE` | `194, 178, 254` | New、新建或初始状态 |
| `purple.100` | `#EEE9FF` | `238, 233, 255` | 活动时间线图标背景 |
| `blue.500` | `#4E9AFE` | `78, 154, 254` | 邮件、信息型操作、帮助计数 |
| `blue.600` | `#2F76D2` | `47, 118, 210` | 键盘 Focus Ring；白底对比度约 4.5:1 |
| `blue.100` | `#DDEBFF` | `221, 235, 255` | 蓝色弱背景、Focus 外环 |
| `pink.100` | `#FEDEF2` | `254, 222, 242` | Important 等重要标签弱背景 |
| `red.500` | `#E5484D` | `229, 72, 77` | 错误、危险操作、负向状态 |
| `red.100` | `#FDE8E8` | `253, 232, 232` | 错误弱背景 |

辅助色仅用于小面积 Badge、状态方块、图表系列或局部操作。不可把整个卡片或页面铺成黄色、紫色、蓝色或粉色。

### 3.3 中性色与表面色

| Token | HEX | RGB | 用途 |
|---|---:|---:|---|
| `neutral.1000` | `#000000` | `0, 0, 0` | Logo、最强文字、纯黑按钮 |
| `neutral.900` | `#0A0A0A` | `10, 10, 10` | 标题、主要正文、主图标 |
| `neutral.800` | `#262626` | `38, 38, 38` | 强正文 |
| `neutral.600` | `#626262` | `98, 98, 98` | 次级正文、字段标签 |
| `neutral.500` | `#858585` | `133, 133, 133` | Caption、Placeholder |
| `neutral.400` | `#B8B8B8` | `184, 184, 184` | 禁用文字、浅图标 |
| `neutral.300` | `#D2D2D2` | `210, 210, 210` | 输入框强边框、禁用边框 |
| `neutral.200` | `#E5E5E5` | `229, 229, 229` | 默认边框、表格网格线 |
| `neutral.100` | `#F0F0F0` | `240, 240, 240` | Hover、分组背景 |
| `neutral.50` | `#F7F7F7` | `247, 247, 247` | 搜索框、选中导航、卡片弱背景 |
| `surface.base` | `#FFFFFF` | `255, 255, 255` | 应用、卡片、Drawer |
| `surface.canvas` | `#EFEFEF` | `239, 239, 239` | 应用外部展示画布 |
| `overlay.scrim` | `rgba(255,255,255,.86)` | — | 截图中的亮色失焦遮罩效果 |
| `overlay.dim` | `rgba(10,10,10,.32)` | — | 对比度更高的标准 Modal 遮罩 |

### 3.4 语义色映射

| Semantic token | Primitive | 用途 |
|---|---|---|
| `color.background` | `surface.base` | 页面背景 |
| `color.canvas` | `surface.canvas` | 应用外部画布 |
| `color.surface` | `surface.base` | Card、Drawer、Popover |
| `color.surface.subtle` | `neutral.50` | 搜索框、弱卡片、选中导航 |
| `color.foreground` | `neutral.900` | 主要文字 |
| `color.foreground.muted` | `neutral.600` | 次级文字 |
| `color.foreground.subtle` | `neutral.500` | Caption、元数据 |
| `color.action.primary` | `ink.950` | 主 CTA |
| `color.brand.primary` | `mint.500` | 主题、进度、选中、成功 |
| `color.highlight` | `yellow.400` | 数量、提醒、高亮 |
| `color.info` | `blue.500` | 邮件/信息型操作 |
| `color.border` | `neutral.200` | 默认边框 |
| `color.focus` | `blue.600` | 键盘 Focus Ring |

## 4. 排版与字体（Typography）

### 4.1 字体族

截图使用现代 Grotesk / Neo-grotesk 无衬线字体，特点是中性、干净、较大的 x-height。视觉接近 `Neue Montreal`、`Suisse Intl` 或 `Inter`。

工程实现建议：

```css
font-family: "Inter", "Geist", "Noto Sans SC", "PingFang SC",
  "Microsoft YaHei", sans-serif;
```

- 英文与数字：`Inter` 或 `Geist`，字重 400/500/600。
- 简体中文：`Noto Sans SC`、`PingFang SC`、`Microsoft YaHei`。
- 金额、百分比、计数和日期使用 `font-variant-numeric: tabular-nums lining-nums;`。
- 不使用衬线、圆体、手写体或装饰性 Display 字体。

### 4.2 字体层级

| Style token | 字号 | 行高 | 字重 | 用途 |
|---|---:|---:|---:|---|
| `display` | 48px | 56px | 500 | 大型详情/Overview 标题，低频 |
| `h1` | 40px | 48px | 500–600 | 页面主标题，如 My Leads、Property Loan |
| `h2` | 30px | 38px | 500–600 | Drawer 标题、主要区块标题 |
| `h3` | 24px | 32px | 500–600 | Upcoming Tasks、Progress |
| `h4` | 20px | 28px | 500–600 | 卡片标题、用户姓名 |
| `body-lg` | 18px | 28px | 400 | 详情页主要正文 |
| `body` | 16px | 24px | 400 | 默认正文、导航、表格内容 |
| `body-sm` | 14px | 20px | 400 | 高密度元数据、表头、说明 |
| `label` | 14px | 20px | 500–600 | 按钮、Tab、字段标签 |
| `caption` | 12px | 16px | 400–500 | 日期、文件大小、辅助说明 |
| `metric` | 36px | 44px | 500–600 | 金额、统计数据 |

### 4.3 排版规则

- 页面主标题使用较轻的 500–600 字重，不采用超粗 700–900。
- 导航和正文使用 400；活动项、姓名和关键值使用 500–600。
- 英文标签使用 Sentence case，不强制全大写；确需全大写的表头使用 12px 并增加 `0.02em` 字距。
- 单行正文建议不超过 75 个英文字符；详情 Drawer 中长说明宽度控制在 60–70 字符。

## 5. 间距与布局（Spacing & Layout）

### 5.1 基础网格

采用 **4px 基础单位 + 8px 主节奏**。

| Token | 值 | 使用场景 |
|---|---:|---|
| `space.1` | 4px | 图标微调、紧凑状态 |
| `space.2` | 8px | 图标与文字、Badge 内间距 |
| `space.3` | 12px | 紧凑控件、表格单元格 |
| `space.4` | 16px | 控件组、卡片内部小间距 |
| `space.5` | 20px | 标准控件内边距 |
| `space.6` | 24px | 卡片、Section、页面内容 |
| `space.8` | 32px | 标题与内容、主要区块 |
| `space.10` | 40px | 大区块间距 |
| `space.12` | 48px | 页面横向内边距 |
| `space.16` | 64px | 大型详情页留白 |

### 5.2 桌面应用框架

| 区域 | 规范 | 行为 |
|---|---:|---|
| Sidebar | 224–232px | 固定；低于 1024px 折叠为 Drawer |
| Top Command Bar | 72px | 左侧搜索，右侧全局操作与头像 |
| Search | 360–440px × 48px | 浅灰填充，无明显边框 |
| Page Header | 128–176px 高 | 标题、摘要、主操作 |
| Page Tabs | 56–64px | 底部 2px 活动指示线 |
| Main Content | 左右 32–48px | 宽屏最大 1440px 或填充剩余空间 |
| Detail Split View | 左侧上下文 320–360px | 主内容占余下宽度 |
| Inspector Drawer | 640–760px | 桌面约 40% 宽；最大 820px |
| Table Row | 68–80px | 适合头像、双行联系人信息 |

### 5.3 典型布局

```text
列表页
┌─────────────┬───────────────────────────────────────────────┐
│ Sidebar 232 │ Command Bar 72                                │
│             ├───────────────────────────────────────────────┤
│             │ Page title / actions                          │
│             ├───────────────────────────────────────────────┤
│             │ Tabs → Search / Filters → Data Table          │
└─────────────┴───────────────────────────────────────────────┘

详情页
┌─────────────┬─────────────────┬─────────────────────────────┐
│ Sidebar 232 │ Context 320–360 │ Header / Tabs / Documents   │
│             │ Activity stream │ Main detail content         │
└─────────────┴─────────────────┴─────────────────────────────┘

Drawer
┌────────────────────────── Scrim ──────────────────┬─────────┐
│ 被遮罩的上下文页面                                 │ Detail  │
│                                                   │ Drawer  │
└───────────────────────────────────────────────────┴─────────┘
```

## 6. 圆角与阴影（Radius & Shadows）

### 6.1 圆角

| Token | 值 | 使用场景 |
|---|---:|---|
| `radius.none` | 0 | 表格、Drawer、主按钮、Section 分区 |
| `radius.xs` | 2px | Badge、进度轨道、方形状态 |
| `radius.sm` | 4px | 输入框、小按钮、工具控件 |
| `radius.md` | 6px | 搜索框、Popover、弱卡片 |
| `radius.lg` | 8px | 少量浮层或独立卡片 |
| `radius.full` | 999px | 头像、圆形 Icon Button、计数 Badge |

视觉整体偏方正。常规卡片和按钮不得使用 12–24px 大圆角；胶囊形仅用于头像、圆形操作和确有语义的 Pill。

### 6.2 阴影

| Token | CSS | 使用场景 |
|---|---|---|
| `shadow.none` | `none` | 页面分区、表格、默认卡片 |
| `shadow.subtle` | `0 1px 2px rgba(10,10,10,.05)` | 浮起的搜索框、小卡片 |
| `shadow.popover` | `0 8px 24px rgba(10,10,10,.10)` | Dropdown、Popover |
| `shadow.drawer` | `-12px 0 32px rgba(10,10,10,.06)` | 右侧 Drawer，可与 1px 边框并用 |
| `shadow.modal` | `0 20px 48px rgba(10,10,10,.14)` | Modal |

大部分层级依赖 1px `neutral.200` 边框和空间留白，避免给每个容器加阴影。

## 7. 核心组件（Components）

### 7.1 Buttons

#### 尺寸

| Size | 高度 | 水平内边距 | 字号 | 图标 |
|---|---:|---:|---:|---:|
| Small | 36px | 12px | 14px | 16px |
| Default | 48px | 20px | 16px | 18px |
| Large | 56px | 24px | 18px | 20px |
| Icon | 48×48px | — | — | 20px |

#### 变体

| Variant | Default | Hover | Active | 推荐用途 |
|---|---|---|---|---|
| Action Primary | 黑底 `ink.950`、白字 | `ink.800` | 纯黑 | Export、View Details、提交 |
| Brand Primary | `mint.500`、黑字 | `mint.600` | `mint.700`、白字 | 创建、完成、推进流程 |
| Outline | 白底、黑字、1px `ink.950` | `neutral.50` | `neutral.100` | Settings、Mail、Call |
| Soft | `neutral.100`、黑字 | `neutral.200` | `neutral.300` | More、低优先操作 |
| Ghost | 透明、黑字 | `neutral.50` | `neutral.100` | 工具栏、文字操作 |
| Destructive | `red.500`、白字 | 深 8% | 深 14% | 删除、撤销不可恢复操作 |

按钮默认 0–4px 圆角、字重 500。Focus 使用 2px `blue.600` 外环与 2px 白色间隔。Disabled 使用 `neutral.100` 背景、`neutral.400` 文字，并保留 `disabled` 语义。

### 7.2 Input / Search / Select

| 属性 | 规范 |
|---|---|
| 高度 | 48px 默认；40px 紧凑；56px 大型 |
| 背景 | Search 用 `neutral.50`；标准输入用白色 |
| 边框 | Search 可无边框；标准输入 1px `neutral.300` |
| 圆角 | 4–6px |
| 内边距 | 水平 16px；图标与文字间隔 12px |
| 文字 | 16px / 24px，`neutral.900` |
| Placeholder | `neutral.500` |
| Hover | 边框 `neutral.600` 或背景略深一级 |
| Focus | 边框 `blue.600` + 2px `blue.100` Ring |
| Error | `red.500` 边框、图标和相邻错误说明 |
| Disabled | `neutral.100` 背景、`neutral.400` 文字 |

字段必须有 Label；全局 Command Search 可使用“图标 + Placeholder”模式，但需提供可访问名称和快捷键提示。

### 7.3 Cards / Task Items / Document Rows

| 属性 | 规范 |
|---|---|
| 背景 | 白色或 `neutral.50` |
| 边框 | 1px `neutral.200` |
| 圆角 | 0–4px |
| 内边距 | 20–24px；复杂卡片 24–32px |
| 内部间距 | 8 / 12 / 16 / 24px |
| 阴影 | 默认无；浮起状态可用 `shadow.subtle` |
| Hover | `neutral.50`，不得改变尺寸 |
| Selected | `mint.50` + 左边框/复选框等额外指示 |

Task Item 建议结构：完成控件 → 标题与描述 → 创建人 → 截止日期 → 标签/快捷操作。Document Row 建议结构：文件图标 → 文件名与元数据 → 接受/拒绝 → Overflow。

### 7.4 Sidebar Navigation

| 属性 | 规范 |
|---|---|
| 宽度 | 224–232px |
| 背景 | 白色 |
| Logo 区 | 高 96–112px；左右 32px |
| 一级菜单 | 48–56px 高，左右 24–32px |
| 二级菜单 | 44–48px 高，左缩进 48–64px |
| Active Group | `neutral.50` 背景、500 字重、展开 Chevron |
| Active Child | 白色或 `neutral.50`、600 字重、细线层级指示 |
| 底部菜单 | Settings、Help 固定在底部；上方 1px 分隔线 |

关键导航项使用 Outline 图标 + 文本。当前项必须通过字重、背景或层级线条表达，不能只依赖颜色。

### 7.5 Tabs

- 高度 56–64px；Tab 间距 28–40px。
- 默认 16px `neutral.600`；Hover 使用 `neutral.900`。
- Active 使用 `neutral.900`、500–600 字重和 2px 黑色底线。
- 数量使用 22–24px 黑色圆形 Badge；黄色圆形 Badge 用于更强的提醒计数。
- Tab 切换不应造成页面高度或 Header 位置跳动。

### 7.6 Data Table

| 元素 | 规范 |
|---|---|
| Header | 12–13px、500、可轻微大写，行高 20px |
| Row | 68–80px，白底，1px `neutral.200` 网格线 |
| Cell | 水平 16–20px；垂直 16px |
| Name Cell | 32px 头像 + 16px 500 字重姓名 |
| Two-line Cell | 主信息 16px；次信息 13–14px `neutral.600` |
| Numeric Cell | 右对齐或按表格列规范统一；使用 `tabular-nums` |
| Hover | `neutral.50` |
| Selected | `mint.50` + 已选 Checkbox |
| Progress | 80–112px 轨道 + 百分比文本 |
| Pagination | 48px 控件；当前页黑底白字 |

表格排序需提供图标和 `aria-sort`；Checkbox 命中区至少 40×40px；列布局切换、过滤器和 Options 放在表格上方工具栏。

### 7.7 Badges / Status

| 状态 | 背景 | 文字 | 形状 |
|---|---|---|---|
| New | `purple.300` | `neutral.900` | 2–4px 圆角 |
| In progress | `mint.100` 或 `mint.500` | 深绿或黑色 | 2–4px 圆角 |
| Granted / Highlight | `yellow.400` | `neutral.900` | 2–4px 圆角 |
| Important | `pink.100` | `neutral.900` + 红点 | 方形弱背景 |
| Accepted | `mint.500` 方形勾选图标 | 黑色标签 | 图标 + 文字 |
| Count | 黑色或黄色 | 反色/黑色文字 | 圆形 |

Badge 高 22–28px，左右内边距 8px，字号 12–14px。状态必须配合文字或图标，不能只依赖颜色。

### 7.8 Progress

- 默认轨道高 6–8px，背景 `neutral.100` 或 `mint.50`。
- 完成段使用 `mint.500`；预测/缓冲段使用薄荷绿斜线纹理。
- 大型详情进度可加入 16–20px 黑色滑块，滑块带 2–3px 白色描边。
- 列表型进度同时显示百分比；详情型进度在 Header 右侧显示“76% completed”等文本。
- 进度变化应通过 `aria-valuenow` 等语义暴露给辅助技术。

### 7.9 Activity Timeline

| 属性 | 规范 |
|---|---|
| 轴线 | 1px `neutral.200`，垂直贯穿事件 |
| 节点 | 40–48px 圆形；白色或 `purple.100` 背景 |
| 标题 | 16px / 24px；姓名或关键动作 500–600 |
| 时间 | 13–14px `neutral.600` |
| 事件间距 | 24–32px |
| 状态变化 | Badge → 箭头 → Badge |

最新事件位于顶部；图标、文字和状态组合表达事件类型，避免仅靠节点颜色。

### 7.10 Drawer / Lead Detail

| 属性 | 规范 |
|---|---|
| 宽度 | 640–760px；最大 820px |
| 背景 | 白色 |
| 左边框 | 1px `neutral.200` |
| Header | 88–104px；Close、标题与状态；业务主操作不放在 Header |
| Body | 唯一纵向滚动区域；必须为固定 Header/Footer 预留空间，内容不得被遮挡 |
| Footer | 仅在存在可执行操作时显示；固定在抽屉底部，次要操作在左、主操作在右，移动端按钮满宽 |
| Section 内边距 | 32–48px |
| Profile Header | 64px 头像、姓名、邮箱、圆形 Icon Actions |
| 数据摘要 | 4 列网格；每格 1px 边框，24px 内边距 |
| Scrim | 优先 `overlay.dim`；若沿用截图亮遮罩，需验证焦点可见性 |
| Motion | 240ms，从右侧进入；退出约 180ms |

Drawer 打开后焦点移至标题或首个控件，并限制在面板内；关闭后返回触发按钮。按 `Escape` 可关闭，存在未保存数据时必须确认。业务操作统一收敛到固定 Footer；只读抽屉不渲染空 Footer，返回与关闭等导航操作仍保留在 Header。

### 7.11 Icon Buttons / Avatars

- Icon Button 默认 48×48px；圆形变体使用 `radius.full`，边框 `neutral.200`。
- 图标 18–22px、Outline、1.5–2px 笔画；同一层级不混用 Filled 图标。
- Avatar 常用 32、40、48、64px；群组头像重叠 8–12px，并提供文本替代。
- `+2` 计数头像使用黄色圆形背景和黑字。

## 8. 交互状态与动效

### 8.1 状态优先级

```text
Disabled → Loading → Active → Focus → Hover → Default
```

| State | 视觉与行为 |
|---|---|
| Default | 使用组件基础 Token |
| Hover | 背景或边框移动一个中性色阶，不改变布局尺寸 |
| Active | 明度加深，保持边界稳定 |
| Focus | 2px `blue.600` Ring + 2px 白色间隔 |
| Disabled | 文字/图标 `neutral.400`，背景 `neutral.100`，禁止交互 |
| Loading | 保留原宽度；显示 Spinner；设置 `aria-busy="true"` |
| Error | 红色边框/图标 + 明确错误文字 + 恢复方式 |

### 8.2 Motion tokens

| Token | 时长 | Easing | 用途 |
|---|---:|---|---|
| `motion.fast` | 120ms | `ease-in-out` | Hover、颜色、边框 |
| `motion.base` | 180ms | `ease-out` | Dropdown、Tabs、Tooltip |
| `motion.slow` | 240ms | `cubic-bezier(.2,0,0,1)` | Drawer、Modal、Section 展开 |

动画仅使用 `transform` 与 `opacity`，并支持 `prefers-reduced-motion`。动画不得阻断操作或成为状态完成的唯一依据。

## 9. 页面结构（Page Structure）

### 9.1 全局层级

五张截图反映的是同一套应用骨架，而不是五个互不相关的页面。全局层级应建模为：

```text
AppShell
├── SidebarNavigation
└── Workspace
    ├── CommandHeader
    └── RouteContent
        ├── PageHeader / RecordHeader
        ├── PageTabs（可选）
        ├── ContentToolbar（可选）
        └── ContentRegion
            ├── DataTable
            ├── SplitDetailWorkspace
            └── DrawerOverlay
```

| 区域 | 层级 | 责任 | 是否进入 Design System |
|---|---|---|---|
| `AppShell` | Page shell | 管理 Sidebar 与工作区的尺寸和响应式关系 | 是，作为 Layout primitive/pattern |
| `CommandHeader` | Global pattern | 全局搜索、快捷操作、通知、用户菜单 | 是 |
| `SidebarNavigation` | Global pattern | 一级/二级导航、折叠、底部帮助入口 | 是 |
| `PageHeader` | Page pattern | 页面标题、计数、说明和主要操作 | 是 |
| `RecordHeader` | Page pattern | 头像、记录标题、元数据、成员和快捷操作 | 是 |
| `PageTabs` | Navigation pattern | 切换同一实体或页面内的内容视图 | 是 |
| `ContentToolbar` | Content pattern | 搜索、筛选、视图切换、更多选项 | 是 |
| `ContentRegion` | Layout slot | 承载表格、列表、详情、文档或任务 | 只定义容器，不固化业务内容 |
| `TablePagination` | Local footer | 表格翻页，不是全局 Footer | 是，归属于 DataTable |
| 全局 Footer | Global region | 截图中未出现 | 暂不创建 |

### 9.2 Leads 列表页

```text
LeadsListPage
├── AppShell
│   ├── SidebarNavigation
│   └── Workspace
│       ├── CommandHeader
│       ├── PageHeader
│       │   ├── Eyebrow
│       │   ├── Title + CountBadge
│       │   └── ActionGroup
│       ├── Tabs
│       └── DataTableModule
│           ├── TableToolbar
│           │   ├── SearchField
│           │   ├── FilterButton + CountBadge
│           │   ├── ViewToggle
│           │   └── OptionsMenu
│           ├── DataTable
│           │   ├── SelectAllCheckbox
│           │   ├── TableHeader
│           │   └── LeadTableRow × n
│           └── Pagination
```

### 9.3 Deal / Loan 详情工作台

```text
DealWorkspacePage
├── AppShell
├── ContextPanel
│   ├── UserSummary
│   ├── QuickActionGroup
│   ├── LastActivityIndicator
│   ├── ContextTabs
│   ├── ActivityTimeline
│   └── KeyValueList
└── RecordWorkspace
    ├── Breadcrumb
    ├── RecordHeader
    ├── EntityTabs
    └── ActiveModule
        ├── MetricSummary
        ├── TaskList
        ├── DocumentList
        ├── NotesList
        └── ChartSection
```

### 9.4 Lead Detail Drawer

```text
DrawerOverlay
├── Scrim
└── DetailDrawer
    ├── DrawerHeader
    │   ├── CloseButton
    │   ├── Title
    │   └── PrimaryAction
    ├── ProfileSummary
    │   ├── Avatar + Identity
    │   └── CircularActionGroup
    ├── SummaryGrid
    ├── ProgressCard
    ├── ActivityTimeline
    └── NotesSection
```

Drawer 是 Overlay pattern，不是一个新页面；它应复用页面中的 `ProfileSummary`、`SummaryField`、`Progress`、`ActivityTimeline` 和 `NoteCard`。

## 10. 组件层级（Component Hierarchy）

### 10.1 依赖方向

```text
Foundation
│  Color / Typography / Spacing / Radius / Border / Shadow / Motion
↓
Primitive Components
│  Icon / Text / Button / IconButton / Input / Checkbox / Badge / Avatar / Divider
↓
Composite Components
│  SearchField / FormField / AvatarGroup / NavigationItem / Tab / TableRow / Progress
↓
Pattern / Module
│  Header / Sidebar / TableToolbar / DataTable / Timeline / TaskList / Drawer
↓
Page
   LeadsListPage / DealWorkspacePage / OverviewPage
```

上层可以组合下层；下层不得引用具体 Page 或业务实体。例如 `Button` 不知道“Mail”或“Call”，`Badge` 不知道“Loan Granted”，这些只由 props 与业务映射决定。

### 10.2 分层清单

| Layer | 建议组件 |
|---|---|
| Foundation | Color、Typography、Spacing、Radius、Border、Shadow、Motion、Z-index、Icon size |
| Primitive | `Text`、`Icon`、`Button`、`IconButton`、`Input`、`Checkbox`、`Badge`、`Avatar`、`Divider`、`Spinner` |
| Composite | `SearchField`、`FormField`、`SelectTrigger`、`DropdownMenu`、`AvatarGroup`、`Breadcrumb`、`NavigationItem`、`Tabs`、`StatusBadge`、`CountBadge`、`Progress`、`SummaryField`、`TableCell`、`Pagination` |
| Pattern / Module | `CommandHeader`、`SidebarNavigation`、`PageHeader`、`RecordHeader`、`TableToolbar`、`DataTable`、`TaskList`、`DocumentList`、`ActivityTimeline`、`MetricSummary`、`Drawer`、`NotesSection` |
| Page | `LeadsListPage`、`DealWorkspacePage`、`OverviewPage`；只负责数据装配和布局 |

## 11. 组件清单与属性矩阵

以下尺寸均为 **Estimated**，由截图视觉比例归一化而来。

### 11.1 Primitive Components

| Component Name | Type | Variants | States | Size (Estimated) | Icon / Label / Supporting Text | Interaction |
|---|---|---|---|---|---|---|
| `Text` | Primitive | display / h1–h4 / body / label / caption / metric | default / muted / disabled / inverse | 12–48px | 文本内容；可选 `as` 语义标签 | 文本本身不交互 |
| `Icon` | Primitive | outline / filled；优先 outline | default / muted / disabled / inverse | 16 / 20 / 24px | 无 Label；由父组件提供语义 | 装饰图标隐藏，语义图标需文本替代 |
| `Button` | Primitive | action / brand / outline / soft / ghost / destructive | default / hover / pressed / focus / disabled / loading | 36 / 48 / 56px 高 | Label 必需；Icon none / leading / trailing | click；loading 阻止重复提交 |
| `IconButton` | Primitive | ghost / outline / circular / destructive | 同 Button；可含 selected | 36 / 48px；触控 44px+ | 单一 Icon；accessible label 必需 | click；Tooltip 解释陌生图标 |
| `Input` | Primitive | text / email / number / search-base | default / hover / focus / filled / error / disabled / read-only | 40 / 48 / 56px 高 | 可含 leading/trailing icon；无内置 Label | input / change / blur / clear |
| `Checkbox` | Primitive | unchecked / checked / indeterminate | default / hover / focus / disabled / error | 18px 视觉框；40px 命中区 | 可选可见 Label | toggle；支持 Space |
| `Badge` | Primitive | neutral / mint / yellow / purple / blue / pink / error | default / muted / removable | 22 / 24 / 28px 高 | Label 必需；可选 leading dot/icon | 非交互或点击移除 |
| `Avatar` | Primitive | image / initials / fallback | default / loading / unavailable | 24 / 32 / 40 / 48 / 64px | 图片 + alt/姓名 | 可选打开 Profile；默认非交互 |
| `Divider` | Primitive | horizontal / vertical | default | 1px | 无内容 | 无交互 |
| `Spinner` | Primitive | inline / contained | active / reduced-motion | 16 / 20 / 24 / 40px | 可见或 SR-only loading label | 不接受点击 |
| `Scrim` | Primitive | dim / light | visible / hidden | 覆盖 viewport | 无内容 | 点击是否关闭由父 Overlay 决定 |

### 11.2 Composite Components

| Component Name | Type | Variants | States | Size (Estimated) | Content slots | Interaction |
|---|---|---|---|---|---|---|
| `SearchField` | Input composite | command / table / compact | idle / focus / typing / has-value / loading / disabled | 40 / 48px 高；240–440px 宽 | Search Icon、Input、Clear、Shortcut Hint | 输入、清除、提交、键盘快捷键 |
| `FormField` | Form composite | vertical / horizontal | default / focus-within / error / disabled / read-only | 随内容 | Label、Control、Helper、Error、Optional marker | 将 Label/Error 与控件语义关联 |
| `SelectTrigger` | Control composite | default / compact | closed / open / focus / disabled / error | 40 / 48px 高 | Value、Placeholder、Chevron | click/Enter/Space 打开 Menu |
| `DropdownMenu` | Overlay composite | action / selection / account | closed / open / item-hover / item-focus / item-disabled | 最小 180px 宽 | MenuItem、Separator、Submenu | 箭头键、Enter、Escape、类型搜索 |
| `Tooltip` | Overlay composite | label / rich | closed / delayed-open / open | 最大 280px | 简短 Label；可选 Supporting Text | Hover + Focus；不承载关键操作 |
| `AvatarGroup` | Identity composite | stacked / inline | default / overflow | 24–40px Avatar | Avatar × n、OverflowCount | 点击成员或打开成员列表 |
| `Breadcrumb` | Navigation composite | back-link / multi-level | default / hover / current | 40–48px 高 | Back Icon、Item、Separator | 返回或跳转上级；当前项不交互 |
| `NavigationItem` | Navigation composite | top-level / nested / utility | default / hover / active / expanded / disabled | 44 / 48 / 56px 高 | Leading Icon、Label、Badge、Chevron | 导航；父项展开/折叠 |
| `Tab` | Navigation composite | text / text-with-count | default / hover / active / focus / disabled | 48–64px 高 | Label、可选 CountBadge | 方向键切换；激活对应 Panel |
| `Tabs` | Navigation composite | page / entity / segmented | default | 随 Tab 数量 | TabList、TabPanel | 管理 roving tabindex 与选中态 |
| `StatusBadge` | Badge composite | new / in-progress / granted / accepted / important | default / muted | 22–28px 高 | Badge Label、可选 Icon/Dot | 默认非交互；可选触发筛选 |
| `CountBadge` | Badge composite | black / yellow / blue / neutral | default / overflow | 20–28px 圆形/方形 | 数值或 `99+` | 默认非交互；需有上下文名称 |
| `Progress` | Data display composite | linear / forecast / slider-like / compact | determinate / indeterminate / complete / error | 6–8px 轨道；大号 20px | Track、Fill、Pattern、Thumb、Value Label | 只读默认；可编辑变体另设语义 |
| `SummaryField` | Data display composite | plain / bordered / icon-leading | default / empty / loading | 最小 96px 高 | Label、Value、Icon、Supporting Text | 默认非交互；可选链接 |
| `MetricCard` | Data display composite | default / subtle / interactive | default / hover / loading / empty / error | 160px+ 宽；120px+ 高 | Label、Metric、Suffix、Trend、Icon | 可选 drill-down；否则无 click |
| `TableCell` | Data composite | text / numeric / contact / avatar-group / progress / status / actions | default / truncated | 随列宽 | Main、Supporting、Tooltip | 按内容决定；数字右对齐 |
| `Pagination` | Navigation composite | numbered / simple | default / hover / current / disabled | 48px 控件 | Previous、Page、Ellipsis、Next | 翻页并保留过滤/排序状态 |

### 11.3 Pattern / Module Components

| Component Name | Type | Variants | States | Size (Estimated) | 组成 | Interaction |
|---|---|---|---|---|---|---|
| `CommandHeader` | Global pattern | desktop / compact | default / scrolled | 72px 高 | SearchField、QuickActions、Notification、AccountMenu | 全局搜索、快捷动作、用户菜单 |
| `SidebarNavigation` | Global pattern | expanded / collapsed / drawer | default / nested-open | 224–232px 宽 | Logo、NavGroup、NavigationItem、UtilityNav | 导航、展开、折叠、响应式 Drawer |
| `PageHeader` | Page pattern | list / dashboard | default | 128–176px 高 | Eyebrow、Title、Count、Description、Actions | 承载页面级操作 |
| `RecordHeader` | Page pattern | full / compact / split-panel | default | 136–208px 高 | Breadcrumb、Identity、Metadata、AvatarGroup、Actions | 导航、记录操作、成员管理 |
| `TableToolbar` | Content pattern | simple / advanced | default / filtered | 56–72px 高 | SearchField、Filter、ViewToggle、Options | 搜索、过滤、切换视图、批量操作 |
| `DataTable` | Data module | selectable / sortable / paginated | loading / empty / error / ready / selection | 100% 宽 | Header、Row、Cell、Checkbox、Pagination | 排序、选择、行导航、批量操作 |
| `TaskItem` | Work item composite | pending / complete / important | default / hover / selected / editing | 144–184px 高 | Checkbox、Title、Description、Owner、DueDate、Actions | 完成、编辑优先级、提醒、打开详情 |
| `TaskList` | Work module | upcoming / history | loading / empty / error / ready | 随条目 | SectionHeader、TaskItem × n | 创建任务、分组、展开历史 |
| `DocumentRow` | File composite | default / accepted / rejected | default / hover / loading / disabled | 72–88px 高 | FileIcon、Name、Metadata、Approve、Reject、More | 预览、下载、批准、拒绝、更多 |
| `DocumentList` | File module | default / grouped | loading / empty / error / ready | 随条目 | Toolbar、Tabs、DocumentRow × n | 上传/模板/下载/转换/筛选 |
| `ActivityItem` | Timeline composite | comment / status-change / assignment / system | default / loading | 72px+ 高 | Node、Actor、Action、Time、Status delta | 可选跳转相关对象 |
| `ActivityTimeline` | Activity module | recent / full / compact | loading / empty / error / ready | 随条目 | Axis、ActivityItem × n、ViewAll | 浏览、分页或加载更多 |
| `SummaryGrid` | Data module | 2 / 3 / 4 columns | loading / partial / ready | 单格 96–128px 高 | SummaryField × n | 响应式重排；字段可选链接 |
| `Drawer` | Overlay pattern | detail / form / inspector | closed / entering / open / exiting / blocked | 640–760px；移动端全屏 | Scrim、Header、Body、Footer、Close | 焦点锁定、Escape、关闭确认 |
| `NotesSection` | Content module | list / editable | loading / empty / editing / saving / error | 随内容 | Header、CountBadge、NoteCard、AddNote | 新增、编辑、保存、删除 |

### 11.4 截图未充分证明的组件

| Component | 结论 |
|---|---|
| `Radio` | 截图未出现明确实例；Foundation 可预留，但不要只为“组件齐全”立即实现 |
| `Switch` | 截图未出现明确实例；需要布尔设置场景时再加入 |
| `DatePicker` | 只出现 Calendar 图标/日期文本，未出现 Picker 面板；暂不推断交互结构 |
| `Modal/Dialog` | 出现 Drawer 与 Scrim，但未出现居中 Dialog；可复用 Overlay foundation，实际需求出现时再实现 |
| `Toast` | 未观察到；不要从截图虚构视觉规范 |

## 12. 推荐组件 API

以下 API 只表达组件边界，不限定具体框架实现。

### 12.1 Button 与 IconButton

```ts
type ButtonProps = {
  variant?: "action" | "brand" | "outline" | "soft" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  leadingIcon?: IconName;
  trailingIcon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
};

type IconButtonProps = {
  variant?: "ghost" | "outline" | "circular" | "destructive";
  size?: "sm" | "md";
  icon: IconName;
  label: string; // accessible name，必需
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
};
```

`Mail`、`Call`、`More`、`Settings`、`Export All` 不应各自成为 Button 组件；它们都是 `Button`/`IconButton` 的内容与 Variant。

### 12.2 SearchField 与 FormField

```ts
type SearchFieldProps = {
  variant?: "command" | "table" | "compact";
  size?: "sm" | "md";
  value: string;
  placeholder?: string;
  shortcutHint?: string;
  loading?: boolean;
  disabled?: boolean;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  onClear?: () => void;
};

type FormFieldProps = {
  label: string;
  htmlFor: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  optional?: boolean;
  children: React.ReactNode;
};
```

### 12.3 Badge 与 AvatarGroup

```ts
type BadgeProps = {
  tone?: "neutral" | "mint" | "yellow" | "purple" | "blue" | "pink" | "error";
  size?: "sm" | "md" | "lg";
  icon?: IconName;
  dot?: boolean;
  removable?: boolean;
  children: React.ReactNode;
};

type AvatarGroupProps = {
  people: Person[];
  max?: number;
  size?: 24 | 32 | 40;
  onPersonClick?: (person: Person) => void;
  onOverflowClick?: () => void;
};
```

`New`、`In progress`、`Loan Granted`、`Important` 应通过业务状态映射到一个 `Badge`，不要创建四种独立组件。

### 12.4 NavigationItem 与 Tabs

```ts
type NavigationItemProps = {
  level?: 1 | 2;
  label: string;
  icon?: IconName;
  badge?: React.ReactNode;
  active?: boolean;
  expanded?: boolean;
  disabled?: boolean;
  href?: string;
  onToggle?: () => void;
};

type TabItem = {
  id: string;
  label: string;
  count?: number;
  disabled?: boolean;
};

type TabsProps = {
  variant?: "page" | "entity" | "segmented";
  items: TabItem[];
  value: string;
  onValueChange: (id: string) => void;
};
```

### 12.5 DataTable

```ts
type ColumnDef<Row> = {
  id: string;
  header: string;
  width?: number | string;
  align?: "start" | "center" | "end";
  sortable?: boolean;
  cell: (row: Row) => React.ReactNode;
};

type DataTableProps<Row> = {
  rows: Row[];
  columns: ColumnDef<Row>[];
  rowKey: (row: Row) => string;
  selectable?: boolean;
  selectedKeys?: string[];
  loading?: boolean;
  error?: string;
  emptyState?: React.ReactNode;
  sort?: { column: string; direction: "asc" | "desc" };
  pagination?: PaginationState;
  onSelectionChange?: (keys: string[]) => void;
  onSortChange?: (sort: SortState) => void;
  onRowActivate?: (row: Row) => void;
};
```

列名、列宽和 Lead 数据属于 Page 配置；选择、排序、Loading、Empty、Error 和 Pagination 属于 `DataTable` 的公共能力。

### 12.6 Activity、Progress 与 Drawer

```ts
type ActivityItemProps = {
  type: "comment" | "status-change" | "assignment" | "system";
  actor?: Person;
  title: React.ReactNode;
  timestamp: string;
  fromStatus?: Status;
  toStatus?: Status;
  icon?: IconName;
  onActivate?: () => void;
};

type ProgressProps = {
  value?: number;
  max?: number;
  variant?: "linear" | "forecast" | "compact";
  label?: string;
  showValue?: boolean;
  status?: "default" | "complete" | "error";
};

type DrawerProps = {
  open: boolean;
  size?: "md" | "lg" | "xl" | "full";
  title: string;
  description?: string;
  primaryAction?: React.ReactNode;
  footer?: React.ReactNode;
  dismissible?: boolean;
  hasUnsavedChanges?: boolean;
  children: React.ReactNode;
  onOpenChange: (open: boolean) => void;
};
```

## 13. Pattern 与 Page 组合规范

### 13.1 可复用 Pattern

| Pattern | 复用场景 | 不应包含的业务细节 |
|---|---|---|
| `CommandHeader` | 所有主工作区页面 | 固定搜索文案、具体快捷动作 |
| `SidebarNavigation` | 全局导航 | 硬编码 Contacts、Deals 等菜单 |
| `PageHeader` | 列表、Dashboard、设置页 | 硬编码 My Leads、计数 29 |
| `RecordHeader` | Lead、Deal、Loan、Contact 详情 | 具体姓名、贷款标题、固定 Tabs |
| `TableToolbar` | Leads、Documents、Tasks 等列表 | 特定过滤字段与 Options 内容 |
| `DataTable` | 任意结构化数据列表 | Lead 专属列或业务格式化规则 |
| `ActivityTimeline` | Lead、Deal、Loan、Task 记录 | 固定事件文案或人物 |
| `SummaryGrid` | 记录摘要、指标摘要 | Lead owner、Annual Income 等固定字段 |
| `Drawer` | 详情、表单、Inspector | Lead Detail 的内部业务布局 |

### 13.2 Page 只做装配

```ts
function LeadsListPage() {
  return (
    <AppShell sidebar={<SidebarNavigation items={navigation} />}>
      <CommandHeader />
      <PageHeader title="My Leads" actions={<LeadPageActions />} />
      <Tabs items={leadTabs} value={activeTab} />
      <DataTableModule
        toolbar={<TableToolbar filters={leadFilters} />}
        table={<DataTable rows={leads} columns={leadColumns} />}
      />
    </AppShell>
  );
}
```

Page 层负责：

- 选择组件并组织布局。
- 连接路由、权限、查询和业务状态。
- 定义列、字段、Tab 文案和具体动作。
- 将业务状态映射为 Design System 的语义 Variant。

Page 层不应：

- 重新实现 Button、Badge、Table Row、Drawer 或 Focus 行为。
- 绕过 Token 直接写颜色、间距和阴影。
- 将一次性业务名称变成通用组件名称。

## 14. 复用边界与避免过度组件化

### 14.1 应该使用 Variant，而不是新组件

| 截图元素 | 正确建模 | 避免 |
|---|---|---|
| Mail / Call / More | `Button` 的 icon、variant、label 组合 | `MailButton`、`CallButton`、`MoreButton` |
| Export All / View Lead Details | `Button variant="action"` | 为每个 CTA 建组件 |
| New / In progress / Loan Granted | `StatusBadge` 的 status/tone 映射 | 三个独立 Badge 组件 |
| 黑色/黄色/蓝色计数 | `CountBadge tone` | `TaskCount`、`HelpCount`、`MemberCount` |
| 一级/二级/底部导航 | `NavigationItem level/variant` | 每层单独建 Nav 组件 |
| Comment / Status change 活动 | `ActivityItem type` | 每种事件一个组件 |
| Lead / Deal / Loan 详情头 | `RecordHeader` slots + density | `LeadHeader`、`DealHeader`、`LoanHeader` 重复实现 |
| 详情/表单/检查器侧栏 | `Drawer variant/size` | 多套 Drawer Shell |

### 14.2 应该成为独立组件的判断标准

满足任一条件即可进入组件库：

1. 在两个或更多页面重复出现。
2. 有至少两个清晰 Variant 或多个交互 State。
3. 包含必须统一处理的可访问性或键盘交互。
4. 具有稳定的视觉 Anatomy 和 Slot。
5. 需要统一 Token、响应式或 Loading/Empty/Error 行为。

### 14.3 保留在 Page 内的内容

以下内容只是当前页面的 Layout 或业务配置，不应进入通用 Design System：

- Leads 表格的具体列顺序、联系人字段、金额格式和 Stage 数据。
- Property Loan 页面的固定 Tabs、文档名称和贷款摘要字段。
- Drawer 中 Lead owner、Location、Referral Partner、Annual Income 的固定四列组合。
- Sidebar 中 Contacts、Deals、Integration、Tasks 的产品信息架构。
- 截图展示稿的外部灰色画布、倾斜拼贴和营销构图。
- 特定姓名、头像、日期、金额、数量和业务文案。
- 某个页面独有且无状态的一次性 Wrapper。

### 14.4 避免过度组件化

- 不为只有一个 `<div>` 和固定间距的局部结构创建公共组件。
- 不把 Card 的 Header、Title、Description 全部强制拆成独立导出组件；优先使用清晰 Slot。
- 不为了减少一行 JSX 创建语义不明确的组件。
- 不让通用组件接受数十个布尔参数；互斥外观使用 `variant`，内容差异使用 Slot。
- 同一模式出现前，先保留为 Page-local composition；第二次稳定复用时再提升到 Pattern。
- 业务名与视觉组件分离：`LeadStageBadge` 可以是业务 Adapter，但底层仍渲染 `StatusBadge`。

### 14.5 推荐目录结构

```text
design-system/
├── tokens/
│   ├── primitives.css
│   ├── semantic.css
│   └── components.css
├── primitives/
│   ├── Button
│   ├── IconButton
│   ├── Input
│   ├── Checkbox
│   ├── Badge
│   └── Avatar
├── composites/
│   ├── SearchField
│   ├── FormField
│   ├── NavigationItem
│   ├── Tabs
│   ├── Progress
│   └── Pagination
└── patterns/
    ├── CommandHeader
    ├── SidebarNavigation
    ├── PageHeader
    ├── DataTable
    ├── ActivityTimeline
    └── Drawer

features/
├── leads/
│   ├── LeadStageBadgeAdapter
│   ├── leadColumns.tsx
│   └── LeadsListPage.tsx
└── deals/
    ├── dealTabs.ts
    └── DealWorkspacePage.tsx
```

## 15. CSS Token 示例

```css
:root {
  /* Primitive: color */
  --mint-50: #e9fbf1;
  --mint-100: #c8f7dd;
  --mint-500: #1ada76;
  --mint-600: #12c96a;
  --mint-700: #0fae5c;
  --yellow-400: #feee26;
  --purple-300: #c2b2fe;
  --purple-100: #eee9ff;
  --blue-500: #4e9afe;
  --blue-600: #2f76d2;
  --blue-100: #ddebff;
  --pink-100: #fedef2;
  --red-500: #e5484d;

  --neutral-1000: #000;
  --neutral-900: #0a0a0a;
  --neutral-800: #262626;
  --neutral-600: #626262;
  --neutral-500: #858585;
  --neutral-400: #b8b8b8;
  --neutral-300: #d2d2d2;
  --neutral-200: #e5e5e5;
  --neutral-100: #f0f0f0;
  --neutral-50: #f7f7f7;
  --white: #fff;

  /* Primitive: spacing and shape */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --radius-xs: 2px;
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;

  /* Semantic */
  --color-background: var(--white);
  --color-surface: var(--white);
  --color-surface-subtle: var(--neutral-50);
  --color-foreground: var(--neutral-900);
  --color-muted-foreground: var(--neutral-600);
  --color-border: var(--neutral-200);
  --color-action-primary: var(--neutral-900);
  --color-brand-primary: var(--mint-500);
  --color-brand-hover: var(--mint-600);
  --color-highlight: var(--yellow-400);
  --color-focus: var(--blue-600);

  /* Component */
  --button-primary-bg: var(--color-action-primary);
  --button-primary-fg: var(--white);
  --button-brand-bg: var(--color-brand-primary);
  --button-brand-fg: var(--neutral-900);
  --button-height: 48px;
  --button-radius: var(--radius-xs);

  --input-bg: var(--color-surface);
  --input-border: var(--neutral-300);
  --input-focus: var(--color-focus);
  --input-height: 48px;
  --input-radius: var(--radius-sm);

  --card-bg: var(--color-surface);
  --card-border: var(--color-border);
  --card-padding: var(--space-6);
  --card-radius: var(--radius-xs);
  --card-shadow: none;
}
```

## 16. 响应式规则

| Breakpoint | 行为 |
|---|---|
| `≥1440px` | Sidebar 常驻；详情页三栏；Drawer 640–760px |
| `1024–1439px` | Sidebar 可折叠；上下文栏缩至 280–320px；Drawer 50–60vw |
| `768–1023px` | Sidebar 使用覆盖式 Drawer；详情改两栏；表格允许局部横向滚动 |
| `<768px` | 单栏；Header 操作进入 Overflow；Detail Drawer 全屏；表格转卡片列表 |

- 页面整体禁止横向滚动；只有数据表容器可在小屏局部滚动。
- 移动端主正文至少 16px，输入框至少 44px 高。
- 固定 Header、Sidebar 和 Drawer 必须预留内容空间，不得遮挡键盘焦点。

## 17. 可访问性

### Robot 管理卡片与设置层级

- Robot 管理不使用包裹标题与卡片的大型 Panel；Section Header 和卡片网格直接排列在页面内容画布上。宽屏使用每行四张等宽卡片，卡片展示状态、已排/容量、利用率、当前实验、下次可用与生效时间规则；工作时间和停用时间统一位于 Robot 名称下方，不展示“使用全局设置/单机配置”标签；中等宽度降为两列，移动端降为单列。
- Robot 卡片的“当前实验”行顶部使用 8px 内边距和一条标准 Border token 分割线，与利用率信息形成稳定分组。
- Robot 卡片名称前的设备图标使用 40px 容器与 32px 图标本体，使其视觉高度覆盖名称和时间规则两行文字。
- 每张 Robot 卡片在名称前提供复选框；Section Header 提供“全选”复选框，仅作用于当前筛选结果。选中卡片使用 Brand Active 边界提示，但不能只依赖颜色表达选择状态。
- 批量设置使用 Section Header 右侧的 Settings 图标按钮，按钮必须具备可访问名称、Tooltip 和可见 Focus Ring；未选择 Robot 时禁用，选择后 Tooltip 和辅助文案展示数量。“全选”、状态筛选和 Settings 按钮统一使用 40px 控件高度并垂直居中；“全选”和状态筛选统一使用 Caption 字号与 600 字重。
- 批量设置 Modal 与单机详情使用相同的每日工作时间、停用时间和平均实验时长字段；Modal 明确列出已选 Robot，应用只影响已选项；单机设置需明确展示平台默认配置与“单机覆盖”层级。
- 弹窗与抽屉不展示额外的顶部说明 Callout；字段含义通过标题、标签和必要的结构化基准信息表达，Robot 在线状态下不重复展示排期派生说明。
- 所有详情抽屉的小节标题使用语义化 `h3`，并统一应用设计系统的 `--font-size-heading-3` 字号与对应字重。
- 单机设置不提供额外不可排时段编辑器，停用时间统一由共享时间字段表达。

- 普通文字对比度至少 4.5:1；大文字与关键 UI 边界至少 3:1。
- 薄荷绿和黄色背景默认搭配黑字，不搭配白字。
- Focus Ring 必须清晰可见，不得使用 `outline: none` 后无替代样式。
- 图标按钮提供 accessible name；装饰图标设置 `aria-hidden="true"`。
- Tabs、Drawer、Table、Progress 和 Pagination 使用正确语义与状态属性。
- Badge、进度和任务状态不能只靠颜色，需同时提供文字、图标或纹理。
- 支持键盘导航、200% 文本缩放、Reduced Motion 和高对比度模式。
- Drawer 与 Modal 实现焦点管理；关闭后焦点返回触发控件。

## 18. 禁止事项

- 不把主题色改成大面积绿色背景；薄荷绿只承担品牌、成功、进度和局部选中。
- 不取消黄色、淡紫、蓝色、粉色等辅助色，但必须限制其面积和语义。
- 不使用玻璃拟态、霓虹发光、重渐变或高饱和大色块。
- 不给所有卡片增加明显阴影或 12px 以上圆角。
- 不使用全粗体正文，不把页面标题设置为 700–900 超粗字重。
- 不在组件中直接硬编码 HEX，必须通过 Semantic 或 Component token。
- 不用 Placeholder 代替字段 Label，不用颜色作为状态的唯一表达。
- 不把截图中的姓名、金额、业务阶段或贷款数据写成产品硬编码需求。

## 19. 交付检查清单

- [ ] 视觉以黑白为骨架，同时保留薄荷绿主题色和受控辅助色。
- [ ] 主 CTA 使用黑色，品牌/进度/成功使用薄荷绿，语义不混淆。
- [ ] 所有颜色经过 Primitive → Semantic → Component 三层映射。
- [ ] 字体为现代 Grotesk 无衬线体，并配置中文回退。
- [ ] 间距遵循 4px 基础单位和 8px 主节奏。
- [ ] 组件保持 0–8px 低圆角与近无阴影风格。
- [ ] Button、Input、Card、Table、Drawer 状态完整。
- [ ] 组件依赖严格遵循 Foundation → Primitive → Composite → Pattern → Page。
- [ ] Mail/Call、状态 Badge、导航层级等差异通过 Variant 或 Slot 实现，没有重复组件。
- [ ] DataTable、Drawer、Timeline 等复杂组件覆盖 Loading / Empty / Error / Ready 状态。
- [ ] 业务字段、列定义、Tab 文案和页面比例保留在 Feature/Page 层。
- [ ] 未从截图虚构 Radio、Switch、DatePicker、Toast 等尚无明确证据的组件样式。
- [ ] Badge 和进度同时使用文字/图标/纹理，不只依赖颜色。
- [ ] 桌面、平板和移动端布局均有明确降级方案。
- [ ] 键盘、焦点、对比度、文本缩放和 Reduced Motion 已验证。
