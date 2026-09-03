"use client";

import { useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { AlertTriangle, ArrowLeft, Bell, Bot, CalendarDays, Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, ClipboardList, Download, FileSpreadsheet, FlaskConical, Gauge, Languages, Menu, Pause, Play, Plus, Search, Settings2, Upload, UsersRound, Wrench, X, type LucideIcon } from "lucide-react";
import readXlsxFile from "read-excel-file";
import { Badge, Button, DialogFrame, IconButton, MetricCard, Tabs, Tooltip } from "./design-system";
import { useLocalizedDom, type Locale } from "./i18n";

type RobotScheduleConfig = { workStart: string; workEnd: string; breakStart: string; breakEnd: string; averageDuration: number };

type Robot = {
  name: string; status: "运行中" | "空闲" | "已暂停" | "维护中"; tester: string;
  scheduled: number; capacity: number; utilization: number; current: string; next: string;
  defaultTester?: string; backupTesters?: string[];
  scheduleConfig?: RobotScheduleConfig;
};

type RobotStatusSetting = "在线" | "已暂停" | "维护中";

function getRobotStatusSetting(robot: Robot): RobotStatusSetting {
  return robot.status === "已暂停" || robot.status === "维护中" ? robot.status : "在线";
}

function getScheduledRobotStatus(robot: Robot): Extract<Robot["status"], "运行中" | "空闲"> {
  return robot.current !== "—" ? "运行中" : "空闲";
}

type Experiment = {
  id: string; name: string; robot: string; tester: string; duration: string; priority: "高" | "普通";
  object: string; background: string; policy: string; schedule: string; status: string;
  requestId?: string; requester?: string; requestDescription?: string;
};

type ConsoleRole = "manager" | "requester" | "tester";
type LeaveRequest = { id: number; tester: string; start: string; end: string; reason: string; status: "待审批" | "已批准" | "已拒绝" };
type TesterBreak = { id: number; tester: string; start: string; startedAt: number; reason: string; active: boolean; endedAt?: number; durationSeconds?: number };
type RobotBlock = { id: number; start: string; end: string; reason: string };
type RequirementNotificationEvent = "submitted" | "experiments-created" | "validation-passed" | "policy-issue" | "debug-issue" | "policy-repair-completed" | "debug-completed" | "revalidation-passed" | "test-started" | "review-pending" | "retest-required" | "delivery-pending" | "delivery-completed" | "cancelled";
type RequirementNotification = {
  id: string;
  event: RequirementNotificationEvent;
  title: string;
  message: string;
  recipients: string[];
  syncToFeishu: boolean;
  createdAt: string;
};
type SystemRequirementNotification = RequirementNotification & {
  requestId: string;
  requester: string;
};
type SharedRequest = {
  id: string; name: string; robot: string; object: string; background: string; policy: string;
  priority: "高" | "普通"; duration: string; expectedDate: string; requester: string; note: string;
  status: "待处理" | "处理中" | "已排期" | "进行中" | "已完成" | "已取消"; tester: string; scheduledTime: string;
  processingError?: string; validationState?: "待创建" | "待校验" | "校验通过";
  workflowStatus?: RequestWorkflowStatus;
  description?: string; policies?: string[]; robotChoices?: string[];
  objectGroups?: { objects: string[]; backgrounds: string[] }[]; combinationCount?: number;
  objectSets?: string[][]; backgroundSets?: string[][];
  objectMode?: "single" | "group"; backgroundMode?: "single" | "group";
  validationIssueType?: "Policy 问题" | "JSON 问题"; validationIssueNote?: string;
  cancelledFromWorkflowStatus?: Exclude<RequestWorkflowStatus, "已取消">;
  notifications?: RequirementNotification[];
  requesterAcknowledged?: boolean;
};

type ExcelCell = string | number | Date | boolean | null;

type RequestWorkflowStatus =
  | "待处理" | "待导出"
  | "待创建" | "创建中"
  | "待验证" | "验证中" | "Policy 修复中" | "DEBUG" | "DEBUG 中" | "待重新导出" | "重新导出" | "待重新验证" | "重新验证" | "重新验证中"
  | "待实验" | "实验中"
  | "待审核" | "审核中" | "驳回重测"
  | "待确认" | "已完成" | "已取消";

const requestWorkflowStages = [
  { name: "需求处理", statuses: ["待处理", "待导出"] },
  { name: "实验创建", statuses: ["待创建", "创建中"] },
  { name: "需求验证", statuses: ["待验证", "验证中", "Policy 修复中", "DEBUG", "DEBUG 中", "待重新导出", "重新导出", "待重新验证", "重新验证", "重新验证中"] },
  { name: "测试执行", statuses: ["待实验", "实验中"] },
  { name: "结果审核", statuses: ["待审核", "审核中", "驳回重测"] },
  { name: "完成交付", statuses: ["待确认", "已完成"] },
] as const satisfies ReadonlyArray<{ name: string; statuses: readonly RequestWorkflowStatus[] }>;

function getRequestWorkflowStatus(request: SharedRequest): RequestWorkflowStatus {
  if (request.workflowStatus) return request.workflowStatus;
  if (request.status === "已取消") return "已取消";
  if (request.status === "待处理") return "待处理";
  if (request.status === "处理中") {
    if (request.processingError) return "待创建";
    if (request.validationState === "校验通过") return "验证中";
    if (request.validationState === "待校验") return "待验证";
    return "待创建";
  }
  if (request.status === "已排期") return "待实验";
  if (request.status === "进行中") return "实验中";
  return "已完成";
}

function getRequestWorkflowStageIndex(status: RequestWorkflowStatus) {
  return requestWorkflowStages.findIndex(stage => stage.statuses.some(stageStatus => stageStatus === status));
}

type RequirementStatus = "待处理" | "处理中" | "实验中" | "待确认" | "已完成" | "已取消";
type RequirementStatusFilter = "全部" | RequirementStatus;

const requirementStatusFilters: readonly RequirementStatusFilter[] = ["全部", "待处理", "处理中", "实验中", "待确认", "已完成", "已取消"];

function getRequirementStatus(request: SharedRequest): RequirementStatus {
  const workflowStatus = getRequestWorkflowStatus(request);
  if (request.status === "已取消" || workflowStatus === "已取消") return "已取消";
  if (workflowStatus === "待确认") return "待确认";
  const stageIndex = getRequestWorkflowStageIndex(workflowStatus);
  if (stageIndex <= 1) return "待处理";
  if (stageIndex === 2) return "处理中";
  if (stageIndex <= 4) return "实验中";
  return "已完成";
}

function getRequestOwner(status: RequestWorkflowStatus) {
  if (status === "待处理" || status === "待创建" || status === "创建中") return "Freddy Fu / Niko Ni / Felix Yuan";
  if (status === "Policy 修复中") return "Zeyu Pan";
  if (status === "DEBUG" || status === "DEBUG 中") return "Victor Tao";
  if (status === "待验证" || status === "验证中" || status === "待重新验证" || status === "重新验证" || status === "重新验证中") return "Agumon Cui";
  if (status === "待实验" || status === "实验中" || status === "待审核" || status === "审核中") return "实验测试员";
  if (status === "驳回重测" || status === "待确认") return "Freddy Fu";
  return "—";
}

function getRequesterTask(status: RequestWorkflowStatus) {
  if (status === "待处理") return "完善需求信息，可修改或删除";
  if (status === "待创建") return "等待管理员创建 Experiment";
  if (status === "待验证") return "等待实验验证";
  if (status === "验证中" || status === "重新验证中") return "等待验证结果";
  if (status === "Policy 修复中") return "等待模型团队完成 Policy 修复";
  if (status === "DEBUG" || status === "DEBUG 中") return "等待实验团队完成 JSON / 配置 DEBUG";
  if (status === "待重新验证" || status === "重新验证") return "等待负责人回归验证";
  if (status === "待实验") return "等待正式测试，可查看关联实验与排期";
  if (status === "实验中") return "跟踪测试进度";
  if (status === "待审核") return "等待实验结果审核";
  if (status === "审核中") return "跟踪标注审核进度";
  if (status === "驳回重测") return "等待被驳回的 Experiment 完成重测";
  if (status === "待确认") return "等待管理员完成交付确认";
  if (status === "已完成") return "查看最终交付并确认已查看";
  if (status === "已取消") return "查看已保留的历史记录";
  return "查看需求进度";
}

function notificationTime() {
  return new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function buildRequirementNotification(request: SharedRequest, event: RequirementNotificationEvent, options: { issue?: string; recipients?: string[]; createdAt?: string; id?: string } = {}): RequirementNotification {
  const testerRecipients = request.tester && !request.tester.includes("待分配") ? request.tester : "对应实验测试员";
  const issue = options.issue || request.validationIssueNote || request.validationIssueType || "未填写补充说明";
  const templates: Record<RequirementNotificationEvent, Omit<RequirementNotification, "id" | "event" | "createdAt">> = {
    submitted: { title: "新实验需求待处理", message: `${request.requester} 提交了 ${request.id}，请查看需求并创建 Experiment。`, recipients: ["Freddy Fu", "Niko Ni", "Felix Yuan"], syncToFeishu: true },
    "experiments-created": { title: "实验待验证", message: `${request.id} 的 Experiment 已创建完成，请进行实验验证。`, recipients: ["Agumon Cui"], syncToFeishu: false },
    "validation-passed": { title: "实验验证通过", message: `${request.id} 已通过验证，可以进入正式测试。`, recipients: ["Freddy Fu", testerRecipients, request.requester], syncToFeishu: true },
    "policy-issue": { title: "Policy 需要修复", message: `${request.id} 验证未通过，发现 Policy 问题，请修复并重新导出。问题：${issue}`, recipients: ["Zeyu Pan"], syncToFeishu: false },
    "debug-issue": { title: "实验配置需要 DEBUG", message: `${request.id} 验证未通过，发现 JSON / 实验配置问题，请处理。问题：${issue}`, recipients: ["Victor Tao"], syncToFeishu: false },
    "policy-repair-completed": { title: "Policy 已更新，待重新验证", message: `${request.id} 的 Policy 已完成修复并更新，请重新验证。`, recipients: ["Agumon Cui"], syncToFeishu: false },
    "debug-completed": { title: "DEBUG 已完成，待重新验证", message: `${request.id} 的 JSON / 实验配置已更新，请重新验证。`, recipients: ["Agumon Cui"], syncToFeishu: false },
    "revalidation-passed": { title: "回归验证通过", message: `${request.id} 已完成回归验证，可以进入正式测试。`, recipients: ["Freddy Fu", testerRecipients, request.requester], syncToFeishu: true },
    "test-started": { title: "实验已开始", message: `${request.id} 已开始测试，可查看实验测试进度。`, recipients: ["Freddy Fu", request.requester], syncToFeishu: true },
    "review-pending": { title: "实验结果待审核", message: `${request.id} 已完成所有测试，审核实验结果中。`, recipients: ["Freddy Fu", request.requester], syncToFeishu: true },
    "retest-required": { title: "实验需要重测", message: `${request.id} 中存在未通过审核的 Experiment，测试员根据审核意见重新测试中。`, recipients: ["Freddy Fu", request.requester], syncToFeishu: true },
    "delivery-pending": { title: "测试已完成，待确认", message: `${request.id} 的全部实验已完成并通过审核，请查看及确认测试完成。`, recipients: ["Freddy Fu"], syncToFeishu: false },
    "delivery-completed": { title: "需求已完成", message: `${request.id} 的全部实验已完成，可查看最终测试结果。`, recipients: [request.requester], syncToFeishu: true },
    cancelled: { title: "需求已取消", message: `${request.id} 已由需求方取消，已有 Requirement 与 Experiment 记录继续保留。`, recipients: options.recipients || [getRequestOwner(getRequestWorkflowStatus(request))], syncToFeishu: false },
  };
  const template = templates[event];
  const createdAt = options.createdAt || notificationTime();
  return { ...template, recipients: options.recipients || template.recipients, event, createdAt, id: options.id || `${request.id}-${event}-${Date.now()}` };
}

function withRequirementNotification(request: SharedRequest, event: RequirementNotificationEvent, options?: Parameters<typeof buildRequirementNotification>[2]): SharedRequest {
  return { ...request, notifications: [buildRequirementNotification(request, event, options), ...(request.notifications || [])] };
}

function getRequirementNotifications(request: SharedRequest) {
  const seededEvents: RequirementNotificationEvent[] = ["submitted"];
  const workflowStatus = getRequestWorkflowStatus(request);
  const stageIndex = getRequestWorkflowStageIndex(workflowStatus);
  if (stageIndex >= 3) seededEvents.push("validation-passed");
  if (workflowStatus === "实验中" || stageIndex >= 4) seededEvents.push("test-started");
  if (workflowStatus === "待审核" || workflowStatus === "审核中" || workflowStatus === "驳回重测") seededEvents.push("review-pending");
  if (workflowStatus === "待确认") seededEvents.push("delivery-pending");
  if (workflowStatus === "已完成") seededEvents.push("delivery-completed");
  const existingEvents = new Set((request.notifications || []).map(notification => notification.event));
  const seeded = seededEvents.filter(event => !existingEvents.has(event)).map((event, index) => buildRequirementNotification(request, event, { createdAt: `8月18日 ${String(10 + index).padStart(2, "0")}:00`, id: `${request.id}-seed-${event}` }));
  return [...(request.notifications || []), ...seeded];
}

function notificationMatchesConsole(notification: SystemRequirementNotification, request: SharedRequest, role: ConsoleRole) {
  if (role === "requester") return notification.recipients.includes(request.requester);
  if (role === "tester") return notification.recipients.some(recipient => recipient === request.tester || recipient === "对应实验测试员");
  return notification.recipients.some(recipient => recipient !== request.requester && recipient !== request.tester && recipient !== "对应实验测试员");
}

const platformRobotNames = [
  "beta1.1-0095_upper_body",
  "beta1.1-0097_upper_body",
  "beta1.1-0013_upper_body",
  "beta1.1-0003_upper_body",
  "beta1.1-0010_upper_body",
  "beta1.1-0054_upper_body",
  "beta1.1-0076_upper_body",
  "beta1.1-0102_upper_body",
  "beta1.1-0096_upper_body",
  "beta1.1-0075_upper_body",
  "beta1.1-0068_upper_body",
  "beta1.1-0073_upper_body",
  "beta1.1-0041_upper_body",
  "beta1.1-0066_upper_body",
  "beta1.1-0053_upper_body",
  "beta1.1-0058_upper_body",
  "beta1.1-0035_upper_body",
  "beta1.1-0044_upper_body",
  "beta1.1-0046_upper_body",
  "beta1.1-0045_upper_body",
  "beta1.1-0021_upper_body",
  "beta1.1-0026_upper_body",
  "beta1.1-0030_upper_body",
  "beta1.1-0024_upper_body",
  "beta1.1-0001_upper_body",
  "beta1.1-0033_upper_body",
  "beta1.1-0034_upper_body",
  "beta1.1-0001_whole_body",
  "beta1.1-0006_upper_body",
  "beta1.1-0004_upper_body",
  "beta1.1-0012_upper_body",
  "beta1.1-0007_upper_body",
];

const initialRequests: SharedRequest[] = [
  { id: "REQ-2090", name: "抓取实验需求", robot: platformRobotNames[3], object: "透明水杯", background: "标准桌面", policy: "Grasp Policy v4.2", priority: "普通", duration: "30 分钟/实验", expectedDate: "尽快", requester: "许晨", note: "", status: "待处理", tester: "待分配", scheduledTime: "等待管理员处理", description: "验证透明水杯在标准桌面场景下的抓取稳定性。", policies: ["Grasp Policy v4.2"], robotChoices: [platformRobotNames[3]], objectSets: [["透明水杯"]], backgroundSets: [["标准桌面"]], objectMode: "single", backgroundMode: "single", combinationCount: 1, validationState: "待创建" },
  { id: "REQ-2088", name: "抓取实验需求", robot: platformRobotNames[0], object: "透明水杯、马克杯", background: "厨房台面", policy: "Grasp Policy v4.2", priority: "高", duration: "30 分钟/实验", expectedDate: "8月18日", requester: "许晨", note: "验证新 Policy 的透明物体抓取成功率", status: "已排期", tester: "陈哲", scheduledTime: "今天 17:30–18:00", description: "验证机械臂对透明及反光容器的稳定抓取能力，并记录不同物体下的成功率。", policies: ["Grasp Policy v4.2"], robotChoices: [platformRobotNames[0]], objectGroups: [{ objects: ["透明水杯", "马克杯"], backgrounds: ["厨房台面"] }], objectSets: [["透明水杯"], ["马克杯"]], backgroundSets: [["厨房台面"]], objectMode: "single", backgroundMode: "single", combinationCount: 2 },
  { id: "REQ-2083", name: "插电池实验需求", robot: platformRobotNames[1], object: "圆柱电池", background: "电池仓场景", policy: "Battery Insert Policy v1.8", priority: "普通", duration: "30 分钟", expectedDate: "8月18日", requester: "许晨", note: "", status: "已排期", tester: "李莎", scheduledTime: "今天 16:30–17:00", description: "验证机器人识别电池正负极并准确插入电池仓的稳定性。", policies: ["Battery Insert Policy v1.8"], robotChoices: [platformRobotNames[1]], objectSets: [["圆柱电池"]], backgroundSets: [["电池仓场景"]], objectMode: "single", backgroundMode: "single" },
  { id: "REQ-2076", name: "叠布实验需求", robot: platformRobotNames[2], object: "方巾、毛巾", background: "标准桌面", policy: "Fold Cloth Policy v2.1", priority: "普通", duration: "30 分钟", expectedDate: "8月17日", requester: "许晨", note: "", status: "进行中", tester: "林超", scheduledTime: "今天 14:00–14:30", description: "验证机器人对不同尺寸布料的对齐、折叠和堆放能力。", policies: ["Fold Cloth Policy v2.1"], robotChoices: [platformRobotNames[2]], objectSets: [["方巾"], ["毛巾"]], backgroundSets: [["标准桌面"]], objectMode: "single", backgroundMode: "single" },
  { id: "REQ-2061", name: "抓取实验需求", robot: platformRobotNames[4], object: "彩色积木", background: "标准桌面", policy: "Grasp Policy v4.2", priority: "普通", duration: "30 分钟", expectedDate: "8月16日", requester: "许晨", note: "", status: "已完成", tester: "王睿", scheduledTime: "8月16日 15:00–15:30", description: "验证机器人连续抓取不同形状积木并放入目标区域的稳定性。", policies: ["Grasp Policy v4.2"], robotChoices: [platformRobotNames[4]], objectSets: [["彩色积木"]], backgroundSets: [["标准桌面"]], objectMode: "single", backgroundMode: "single", workflowStatus: "待确认" },
];

const robots: Robot[] = [
  { name: platformRobotNames[0], status: "运行中", tester: "陈哲", scheduled: 15, capacity: 16, utilization: 94, current: "EXP-1042", next: "今天 18:30" },
  { name: platformRobotNames[1], status: "运行中", tester: "李莎", scheduled: 12, capacity: 16, utilization: 75, current: "EXP-1038", next: "今天 17:00" },
  { name: platformRobotNames[2], status: "运行中", tester: "林超", scheduled: 15, capacity: 16, utilization: 94, current: "EXP-1046", next: "今天 18:30" },
  { name: platformRobotNames[3], status: "运行中", tester: "吴明", scheduled: 12, capacity: 16, utilization: 75, current: "EXP-1084", next: "今天 17:00" },
  { name: platformRobotNames[4], status: "运行中", tester: "王睿", scheduled: 15, capacity: 16, utilization: 94, current: "EXP-1056", next: "今天 18:30" },
  { name: platformRobotNames[5], status: "运行中", tester: "周扬", scheduled: 12, capacity: 16, utilization: 75, current: "EXP-1061", next: "今天 17:00" },
  { name: platformRobotNames[6], status: "运行中", tester: "何琳", scheduled: 14, capacity: 16, utilization: 88, current: "EXP-1067", next: "今天 18:00" },
  { name: platformRobotNames[7], status: "运行中", tester: "赵静", scheduled: 16, capacity: 16, utilization: 100, current: "EXP-1073", next: "明天 10:00" },
  { name: platformRobotNames[8], status: "维护中", tester: "—", scheduled: 0, capacity: 0, utilization: 0, current: "—", next: "8月20日" },
  { name: platformRobotNames[9], status: "维护中", tester: "—", scheduled: 0, capacity: 0, utilization: 0, current: "—", next: "8月21日" },
  ...platformRobotNames.slice(10).map((name): Robot => ({ name, status: "空闲", tester: "待分配", scheduled: 0, capacity: 16, utilization: 0, current: "—", next: "今天 10:00" })),
];

const experiments: Experiment[] = [
  { id: "EXP-1088", name: "抓取实验", robot: "待分配", tester: "待分配", duration: "30 分钟", priority: "高", object: "透明水杯", background: "厨房台面", policy: "Grasp Policy v4.2", schedule: "尚未排期", status: "未排期" },
  { id: "EXP-1091", name: "叠布实验", robot: platformRobotNames[2], tester: "林超", duration: "30 分钟", priority: "高", object: "方巾", background: "标准桌面", policy: "Fold Cloth Policy v2.1", schedule: "今天 16:00", status: "进行中" },
  { id: "EXP-1094", name: "插电池实验", robot: platformRobotNames[6], tester: "何琳", duration: "30 分钟", priority: "普通", object: "圆柱电池", background: "电池仓场景", policy: "Battery Insert Policy v1.8", schedule: "今天 15:30", status: "可排期" },
  { id: "EXP-1097", name: "抓取实验", robot: platformRobotNames[3], tester: "吴明", duration: "30 分钟", priority: "普通", object: "马克杯", background: "厨房台面", policy: "Grasp Policy v4.2", schedule: "明天 10:00", status: "已排期" },
  { id: "EXP-1102", name: "叠布实验", robot: platformRobotNames[0], tester: "陈哲", duration: "30 分钟", priority: "普通", object: "毛巾", background: "标准桌面", policy: "Fold Cloth Policy v2.1", schedule: "明天 11:00", status: "可排期" },
];

const initialAssignedExperiments: Experiment[] = [
  { id: "EXP-3083", name: "插电池实验", robot: platformRobotNames[1], tester: "李莎", duration: "30 分钟", priority: "普通", object: "圆柱电池", background: "电池仓场景", policy: "Battery Insert Policy v1.8", schedule: "今天 16:30–17:00", status: "已排期", requestId: "REQ-2083", requester: "许晨" },
  { id: "EXP-3088", name: "抓取实验", robot: platformRobotNames[0], tester: "陈哲", duration: "30 分钟", priority: "高", object: "透明水杯", background: "厨房台面", policy: "Grasp Policy v4.2", schedule: "今天 17:30–18:00", status: "已排期", requestId: "REQ-2088", requester: "许晨" },
  { id: "EXP-3089", name: "抓取实验", robot: platformRobotNames[0], tester: "陈哲", duration: "30 分钟", priority: "高", object: "马克杯", background: "厨房台面", policy: "Grasp Policy v4.2", schedule: "今天 18:00–18:30", status: "已排期", requestId: "REQ-2088", requester: "许晨" },
];

const policyTests = ["抓取实验", "叠布实验", "插电池实验"];
const policyCatalog = ["Grasp Policy v4.2", "Fold Cloth Policy v2.1", "Battery Insert Policy v1.8"];
const scheduleHours = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];

function ScheduleTimeAxis() {
  return <div className="request-gantt-time-axis" aria-label="排期时间轴">{scheduleHours.map(time => <b key={time}>{time}</b>)}</div>;
}

const objectCatalog = ["透明水杯", "马克杯", "彩色积木", "方巾", "毛巾", "圆柱电池"];
const backgroundCatalog = ["标准桌面", "厨房台面", "电池仓场景"];
const scheduleResources = {
  robot: platformRobotNames.slice(0,5),
  tester: ["陈哲", "李莎", "林超", "吴明", "王睿"],
};

const sharedDailyCapacity = [
  [15, 12, 15, 12, 15, 12, 14, 16],
  [12, 15, 12, 15, 12, 15, 16, 13],
  [9, 14, 8, 16, 11, 13, 15, 12],
  [13, 10, 16, 12, 14, 11, 9, 15],
  [11, 16, 13, 9, 15, 12, 14, 10],
];
const sharedTesterNames = ["陈哲", "李莎", "林超", "吴明", "王睿", "周扬", "何琳", "赵静"];

function getRobotSchedule(robotName: string, dayIndex: number) {
  const rawRobotIndex = platformRobotNames.indexOf(robotName);
  const robotIndex = rawRobotIndex < 0 ? 0 : rawRobotIndex;
  const capacityRow = sharedDailyCapacity[Math.max(0, Math.min(dayIndex, sharedDailyCapacity.length - 1))];
  const occupied = capacityRow[robotIndex % capacityRow.length];
  return Array.from({ length: 18 }, (_, slotIndex) => {
    const lunchBreak = slotIndex === 4 || slotIndex === 5;
    const workIndex = slotIndex < 4 ? slotIndex : slotIndex - 2;
    const globalWorkIndex = dayIndex * 16 + Math.max(0, workIndex);
    const batchCycle = globalWorkIndex % 36;
    const batchIndex = batchCycle < 12 ? 0 : batchCycle < 22 ? 1 : 2;
    const policyIndex = (robotIndex + batchIndex) % policyTests.length;
    const batchRequestId = ["REQ-2088", "REQ-2076", "REQ-2083"][policyIndex];
    const experimentId = `EXP-${1200 + robotIndex * 18 + dayIndex * 200 + slotIndex}`;
    const available = !lunchBreak && workIndex >= occupied;
    return {
      id: experimentId,
      sub: lunchBreak ? "默认休息" : available ? "可申请" : experimentId,
      name: lunchBreak ? "Robot 休息" : available ? "可申请" : experimentId,
      experimentName: lunchBreak || available ? "—" : policyTests[policyIndex],
      policy: lunchBreak ? "停用时段" : available ? "—" : policyCatalog[policyIndex],
      tester: lunchBreak ? "—" : available ? "待分配" : sharedTesterNames[robotIndex % sharedTesterNames.length],
      robot: robotName,
      requestId: lunchBreak || available ? "—" : batchRequestId,
      requester: lunchBreak || available ? "—" : "许晨",
      batchIndex,
      available,
      blocked: lunchBreak,
      constraint: lunchBreak ? "12:00–13:00 默认停用休息" : "",
      status: lunchBreak ? "blocked" : available ? "available" : workIndex < 6 ? "done" : workIndex === 6 ? "progress" : "scheduled",
    };
  });
}

function getDispatchSchedule(robotName: string, dayIndex: number, robotPool: Robot[] = robots, robotBlocks: Record<string, RobotBlock[]> = {}) {
  const robot = robotPool.find(item => item.name === robotName);
  const robotDisabled = robot?.status === "维护中" || robot?.status === "已暂停";
  return getRobotSchedule(robotName, dayIndex).map((slot, index) => {
    if (robotDisabled) return { ...slot, available: false, blocked: true, name: "Robot 停用", sub: "不可排期", policy: "维护 / 停用", tester: "—", constraint: robot?.status || "停用", status: "conflict" };
    const slotMinutes = slotStartMinutes(index);
    const customBlock = (robotBlocks[robotName] || []).find(block => {
      const [startHour, startMinute] = block.start.split(":").map(Number);
      const [endHour, endMinute] = block.end.split(":").map(Number);
      return slotMinutes >= startHour * 60 + startMinute && slotMinutes < endHour * 60 + endMinute;
    });
    if (customBlock && !customBlock.reason.includes("默认")) return { ...slot, available: false, blocked: true, name: "Robot 停用", sub: "不可排期", policy: "停用时段", tester: "—", constraint: customBlock.reason, status: "conflict" };
    return slot;
  });
}

function isBookedSlot(slot: ReturnType<typeof getDispatchSchedule>[number]) {
  return !slot.available && !slot.blocked;
}

function slotStartMinutes(slotIndex: number) {
  return 10 * 60 + slotIndex * 30;
}

function timeValueMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function formatMinutes(minutes: number) {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

function slotTimeLabel(slotIndex: number) {
  return formatMinutes(slotStartMinutes(slotIndex));
}

function workIndexTimeLabel(workIndex: number) {
  return slotTimeLabel(workIndex < 4 ? workIndex : workIndex + 2);
}

function shiftScheduledTime(value: string, delayMinutes: number) {
  const match = value.match(/^(今天\s+)?(\d{1,2}):(\d{2})[–-](\d{1,2}):(\d{2})$/);
  if (!match) return value;
  const prefix = match[1] || "";
  const duration = Number(match[4]) * 60 + Number(match[5]) - (Number(match[2]) * 60 + Number(match[3]));
  let start = Number(match[2]) * 60 + Number(match[3]) + delayMinutes;
  if (start < 13 * 60 && start + duration > 12 * 60) start = 13 * 60;
  if (start + duration > 19 * 60) return `明天 10:00–${formatMinutes(10 * 60 + duration)}`;
  return `${prefix}${formatMinutes(start)}–${formatMinutes(start + duration)}`;
}

function scheduleSlotToExperiment(slot: ReturnType<typeof getRobotSchedule>[number], slotIndex: number): Experiment {
  const config = slot.policy.includes("Fold")
    ? { object: "方巾", background: "标准桌面" }
    : slot.policy.includes("Battery")
      ? { object: "圆柱电池", background: "电池仓场景" }
      : { object: "透明水杯", background: "厨房台面" };
  const startMinutes = slotStartMinutes(slotIndex);
  const status = slot.status === "done" ? "已完成" : slot.status === "progress" ? "进行中" : slot.status === "conflict" ? "冲突" : "待执行";
  return {
    id: slot.id,
    name: getExperimentName(slot.policy),
    robot: slot.robot,
    tester: slot.tester,
    duration: "30 分钟",
    priority: "普通",
    object: config.object,
    background: config.background,
    policy: slot.policy,
    requestId: slot.requestId,
    requester: slot.requester,
    requestDescription: slot.requestId === "REQ-2088" ? "验证透明及反光容器的稳定抓取能力" : slot.requestId === "REQ-2076" ? "验证不同尺寸布料的连续折叠能力" : "验证电池识别与插入的稳定性",
    schedule: `今天 ${formatMinutes(startMinutes)}–${formatMinutes(startMinutes + 30)}`,
    status,
  };
}

function buildScheduleRows(dimension: "robot" | "tester", robotPool: Robot[] = robots, testerBreaks: TesterBreak[] = [], robotBlocks: Record<string, RobotBlock[]> = {}) {
  return scheduleResources[dimension].map((name, rowIndex) => {
    const robotName = dimension === "robot" ? name : scheduleResources.robot[rowIndex];
    const slots = getDispatchSchedule(robotName, 0, robotPool, robotBlocks);
    if (dimension === "robot") return { name, slots };
    const activeBreak = testerBreaks.some(item => item.active && item.tester === name);
    return {
      name,
      slots: slots.map((slot, index) => activeBreak && index >= 7 && !slot.available && !slot.blocked
        ? { ...slot, constraint: `${name} Break，实验员排期顺延`, status: "conflict" }
        : slot),
    };
  });
}

const consoles: { id: ConsoleRole; label: string; icon: LucideIcon; hint: string }[] = [
  { id: "requester", label: "实验需求方控制台", icon: ClipboardList, hint: "提交与追踪需求" },
  { id: "manager", label: "实验管理员控制台", icon: Gauge, hint: "排期与资源管理" },
  { id: "tester", label: "实验员控制台", icon: FlaskConical, hint: "执行任务与请假" },
];

function StatusBadge({ value }: { value: string }) {
  const tone = ({
    "运行中": "info", "进行中": "info", "已分配": "info",
    "空闲": "success", "可用": "success", "可排期": "success", "可申请": "success",
    "已完成": "neutral", "已取消": "danger",
    "已暂停": "warning", "维护中": "warning", "未排期": "warning", "等待资源": "warning", "Break": "warning",
    "待处理": "warning", "处理中": "info", "待实验": "scheduled", "实验中": "scheduled", "测试中": "scheduled", "待确认": "warning", "已安排": "scheduled", "已排期": "scheduled", "待执行": "scheduled",
    "待验证": "warning", "验证中": "info", "Policy 修复中": "warning", "DEBUG 中": "warning", "待重新验证": "warning", "重新验证中": "info", "驳回重测": "danger",
    "冲突": "warning", "异常": "warning", "需处理": "warning", "待分配": "warning",
    "错误": "danger", "出错": "danger", "失败": "danger",
  } as const)[value] || "neutral";
  return <Badge tone={tone} dot>{value}</Badge>;
}

function keepFocusInActiveDialog(event: KeyboardEvent) {
  if (event.key !== "Tab") return;
  const roots = [...document.querySelectorAll<HTMLElement>('[role="dialog"], .overlay .drawer, .modal-backdrop .modal')].filter(element => element.offsetParent !== null);
  const root = roots.at(-1);
  if (!root) return;
  const focusable = [...root.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [href], [tabindex]:not([tabindex="-1"])')].filter(element => element.offsetParent !== null);
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable.at(-1)!;
  if (event.shiftKey && (document.activeElement === first || !root.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && (document.activeElement === last || !root.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
}

function focusActiveDialog() {
  window.requestAnimationFrame(() => {
    const roots = [...document.querySelectorAll<HTMLElement>('[role="dialog"], .overlay .drawer, .modal-backdrop .modal')].filter(element => element.offsetParent !== null);
    roots.at(-1)?.querySelector<HTMLElement>('button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [href], [tabindex]:not([tabindex="-1"])')?.focus();
  });
}

export default function Home() {
  const appRef = useRef<HTMLDivElement>(null);
  const dialogReturnFocusRef = useRef<HTMLElement | null>(null);
  const dialogWasOpenRef = useRef(false);
  const [activeConsole, setActiveConsole] = useState<ConsoleRole>("manager");
  const [managerPage, setManagerPage] = useState<"operations" | "requests" | "testers">("operations");
  const [requests, setRequests] = useState<SharedRequest[]>(initialRequests);
  const [assignedExperiments, setAssignedExperiments] = useState<Experiment[]>(initialAssignedExperiments);
  const [robotPool, setRobotPool] = useState<Robot[]>(robots);
  const [robotBlocks, setRobotBlocks] = useState<Record<string, RobotBlock[]>>(() => Object.fromEntries(platformRobotNames.map(name => [name, [{ id: 1, start: "12:00", end: "13:00", reason: "默认停用休息" }]])));
  const [globalRobotConfig] = useState<RobotScheduleConfig>({ workStart: "10:00", workEnd: "19:00", breakStart: "12:00", breakEnd: "13:00", averageDuration: 30 });
  const [globalSettingsDraft, setGlobalSettingsDraft] = useState<RobotScheduleConfig>(globalRobotConfig);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [testerBreaks, setTesterBreaks] = useState<TesterBreak[]>([]);
  const [runningTimers, setRunningTimers] = useState<Record<string, number>>({});
  const [dateOffset, setDateOffset] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("全部状态");
  const [selectedRobotNames, setSelectedRobotNames] = useState<string[]>([]);
  const [selectedRobot, setSelectedRobot] = useState<Robot | null>(null);
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null);
  const [drawerParentRobot, setDrawerParentRobot] = useState<Robot | null>(null);
  const [selectedManagerRequestId, setSelectedManagerRequestId] = useState<string | null>(null);
  const [globalSettingsOpen, setGlobalSettingsOpen] = useState(false);
  const [requestPriorityFilter, setRequestPriorityFilter] = useState<"全部" | "紧急">("全部");
  const [toast, setToast] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [locale, setLocale] = useState<Locale>("zh-CN");
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState<Set<string>>(() => new Set());
  const [requesterNotificationRequestId, setRequesterNotificationRequestId] = useState<string | null>(null);

  useLocalizedDom(appRef, locale);

  useEffect(() => {
    const savedLocale = window.localStorage.getItem("robotops-locale");
    if (savedLocale !== "en" && savedLocale !== "zh-CN") return;
    const frame = window.requestAnimationFrame(() => setLocale(savedLocale));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function changeLocale(nextLocale: Locale) {
    setLocale(nextLocale);
    window.localStorage.setItem("robotops-locale", nextLocale);
  }

  const dateLabel = dateOffset === 0 ? "今天 · 8月18日 周二" : dateOffset === -1 ? "昨天 · 8月17日 周一" : "明天 · 8月19日 周三";
  const filteredRobots = useMemo(() => robotPool.slice(0, 10).filter(r =>
    (statusFilter === "全部状态" || r.status === statusFilter) &&
    (r.name.toLowerCase().includes(search.toLowerCase()) || r.tester.includes(search) || r.current.toLowerCase().includes(search.toLowerCase()))
  ), [search, statusFilter, robotPool]);
  const scheduleRows = useMemo(() => buildScheduleRows("robot", robotPool, testerBreaks, robotBlocks), [robotPool, testerBreaks, robotBlocks]);
  const testerScheduleRows = useMemo(() => sharedTesterNames.slice(0, 5).map(tester => ({
    name: tester,
    initials: tester === "李莎" ? "LS" : tester === "吴明" ? "WM" : tester === "陈哲" ? "CZ" : tester === "周睿" ? "ZR" : tester === "赵静" ? "ZJ" : tester.slice(0, 1),
    slots: Array.from({ length: 18 }, (_, slotIndex) => {
      const sourceSlot = scheduleRows[0]?.slots[slotIndex];
      const bookings = scheduleRows.flatMap(row => {
        const slot = row.slots[slotIndex];
        return isBookedSlot(slot) && slot.tester === tester ? [{ ...slot, robot: row.name }] : [];
      });
      if (bookings.length > 1) return { ...bookings[0], id: `tester-${tester}-${slotIndex}-conflict`, name: "排期冲突", sub: "排期冲突", policy: `${bookings.length} 个实验重叠`, robot: bookings.map(slot => slot.robot).join(" / "), constraint: "同一时间分配了多个实验", status: "conflict", available: false, blocked: false };
      if (bookings.length === 1) return bookings[0];
      if (sourceSlot?.blocked) return { ...sourceSlot, id: `tester-${tester}-${slotIndex}-break`, tester, robot: "—" };
      return { ...sourceSlot, id: `tester-${tester}-${slotIndex}-available`, name: "可分配", sub: "可分配", experimentName: "—", policy: "—", tester, robot: "—", requestId: "—", requester: "—", available: true, blocked: false, constraint: "", status: "available" };
    }),
  })), [scheduleRows]);
  const selectedManagerRequest = requests.find(request => request.id === selectedManagerRequestId) || null;
  const filteredManagerRequests = useMemo(() => requestPriorityFilter === "紧急" ? requests.filter(request => request.priority === "高") : requests, [requestPriorityFilter, requests]);
  const systemNotifications = useMemo(() => requests.flatMap(request => getRequirementNotifications(request)
    .map(notification => ({ ...notification, requestId: request.id, requester: request.requester }))
    .filter(notification => notificationMatchesConsole(notification, request, activeConsole))).slice(0, 30), [requests, activeConsole]);
  const unreadNotificationCount = systemNotifications.filter(notification => !readNotificationIds.has(notification.id)).length;
  const dispatchStats = useMemo(() => {
    const slots = buildScheduleRows("robot", robotPool, testerBreaks, robotBlocks).flatMap(row => row.slots);
    const scheduled = slots.filter(isBookedSlot).length;
    const completed = slots.filter(slot => slot.status === "done").length;
    const running = slots.filter(slot => slot.status === "progress").length;
    const atRisk = slots.filter(slot => slot.status === "conflict" && !slot.blocked).length;
    const unassigned = requests.filter(request => {
      const requirementStatus = getRequirementStatus(request);
      return requirementStatus === "待处理" || requirementStatus === "处理中";
    }).reduce((sum, request) => sum + (request.combinationCount || 1), 0);
    return { scheduled, completed, running, atRisk, unassigned, utilization: Math.round(scheduled / (scheduleResources.robot.length * 16) * 100) };
  }, [requests, robotPool, testerBreaks, robotBlocks]);
  const pendingLeaveCount = leaves.filter(leave => leave.status === "待审批").length;
  const operationsAttentionCount = dispatchStats.atRisk;
  const managerAlertCount = requests.filter(request => {
    const requirementStatus = getRequirementStatus(request);
    return requirementStatus === "待处理" || requirementStatus === "处理中";
  }).length + pendingLeaveCount;
  const globalBreakMinutes = Math.max(0, timeValueMinutes(globalRobotConfig.breakEnd) - timeValueMinutes(globalRobotConfig.breakStart));
  const globalWorkMinutes = Math.max(0, timeValueMinutes(globalRobotConfig.workEnd) - timeValueMinutes(globalRobotConfig.workStart));
  const calculatedDailyLimit = Math.max(1, Math.floor((globalWorkMinutes - globalBreakMinutes) / globalRobotConfig.averageDuration));
  const draftBreakMinutes = Math.max(0, timeValueMinutes(globalSettingsDraft.breakEnd) - timeValueMinutes(globalSettingsDraft.breakStart));
  const draftWorkMinutes = Math.max(0, timeValueMinutes(globalSettingsDraft.workEnd) - timeValueMinutes(globalSettingsDraft.workStart));
  const draftDailyLimit = Math.max(1, Math.floor((draftWorkMinutes - draftBreakMinutes) / globalSettingsDraft.averageDuration));

  useEffect(() => {
    const hasDialog = Boolean(selectedRobot || selectedExperiment || selectedManagerRequest || globalSettingsOpen);
    if (!hasDialog) {
      if (dialogWasOpenRef.current) {
        dialogWasOpenRef.current = false;
        window.requestAnimationFrame(() => dialogReturnFocusRef.current?.focus());
      }
      return;
    }
    if (!dialogWasOpenRef.current) {
      dialogWasOpenRef.current = true;
      dialogReturnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      keepFocusInActiveDialog(event);
      if (event.key !== "Escape") return;
      setSelectedRobot(null);
      setSelectedExperiment(null);
      setDrawerParentRobot(null);
      setSelectedManagerRequestId(null);
      setGlobalSettingsOpen(false);
    };
    document.body.classList.add("modal-open");
    focusActiveDialog();
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.classList.remove("modal-open");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedRobot, selectedExperiment, selectedManagerRequest, globalSettingsOpen]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [activeConsole, managerPage]);

  const consoleMeta = {
    manager: ["实验管理员控制台", "管理 Robot Capacity、实验排期及设备异常调整。"],
    requester: ["实验需求方控制台", "提交实验需求、查看资源可用性并追踪排期进度。"],
    tester: ["实验员控制台", "查看个人任务、执行 Policy 实验并维护可用时间。"],
  }[activeConsole];

  function submitWorkOrder(request: SharedRequest) {
    const submitted = { ...request, status: "待处理" as const, tester: "待分配", scheduledTime: "等待管理员处理", validationState: "待创建" as const, processingError: undefined, workflowStatus: "待处理" as const };
    setRequests(items => [withRequirementNotification(submitted, "submitted"), ...items]);
    done(`${request.id} 需求已提交，状态为待处理`);
  }

  function importWorkOrders(importedRequests: SharedRequest[]) {
    setRequests(items => [...importedRequests.map(request => withRequirementNotification({ ...request, status: "待处理" as const, tester: "待分配", scheduledTime: "等待管理员处理", validationState: "待创建" as const, processingError: undefined, workflowStatus: "待处理" as const }, "submitted")), ...items]);
    done(`已通过 Excel 创建 ${importedRequests.length} 个实验需求`);
  }

  function beginWorkOrder(id: string) {
    setRequests(items => items.map(item => item.id === id ? { ...item, status: "处理中", validationState: "待创建", processingError: undefined, workflowStatus: "待创建" } : item));
    done(`${id} 已开始处理，需求内容现已锁定`);
  }

  function createAndLinkExperiments(request: SharedRequest) {
    const policies = request.policies?.length ? request.policies : [request.policy];
    const robotChoices = request.robotChoices?.length ? request.robotChoices : [request.robot];
    const objects = request.objectSets?.flat().length ? request.objectSets.flat() : request.object.split("、");
    const backgrounds = request.backgroundSets?.flat().length ? request.backgroundSets.flat() : request.background.split("、");
    const combinations = robotChoices.flatMap(robotName => policies.flatMap(policy => objects.flatMap(object => backgrounds.map(background => ({ robotName, policy, object, background })))))
    const requestNumber = Number(request.id.replace(/\D/g, "")) || Date.now();
    const robotSequence = new Map<string, number>();
    const existingReservations = new Map(robotChoices.map(robotName => [robotName, assignedExperiments.filter(experiment => experiment.robot === robotName && experiment.status !== "已完成").length]));
    const scheduledExperiments = combinations.slice(0, 60).map((combination, index): Experiment => {
      const preferredRobot = combination.robotName;
      const robot = robotPool.find(item => item.name === preferredRobot && item.status !== "维护中" && item.status !== "已暂停") || robotPool.find(item => robotChoices.includes(item.name) && (item.status === "运行中" || item.status === "空闲")) || robotPool[0];
      const requestSequence = robotSequence.get(robot.name) || 0;
      robotSequence.set(robot.name, requestSequence + 1);
      const sequenceIndex = (existingReservations.get(robot.name) || 0) + requestSequence;
      const tester = sharedTesterNames.find(name => !testerBreaks.some(item => item.active && item.tester === name) && !leaves.some(item => item.status === "已批准" && item.tester === name)) || "待分配";
      const availableIndices = getDispatchSchedule(robot.name, 0, robotPool, robotBlocks).map((slot, slotIndex) => ({ slot, slotIndex })).filter(item => item.slot.available).map(item => item.slotIndex);
      const todaySlot = availableIndices[sequenceIndex];
      const futureOffset = Math.max(0, sequenceIndex - availableIndices.length);
      const futureDay = Math.floor(futureOffset / 16) + 1;
      const futureWorkIndex = futureOffset % 16;
      const futureSlot = futureWorkIndex < 4 ? futureWorkIndex : futureWorkIndex + 2;
      const start = todaySlot !== undefined ? slotStartMinutes(todaySlot) : slotStartMinutes(futureSlot);
      const day = todaySlot !== undefined ? "今天" : futureDay === 1 ? "明天" : `${futureDay} 天后`;
      return { id: `EXP-${requestNumber + 1000 + index}`, name: getExperimentName(combination.policy), robot: robot.name, tester, duration: `${globalRobotConfig.averageDuration} 分钟`, priority: request.priority, object: combination.object, background: combination.background, policy: combination.policy, schedule: `${day} ${formatMinutes(start)}–${formatMinutes(start + globalRobotConfig.averageDuration)}`, status: tester === "待分配" ? "冲突" : "已排期", requestId: request.id, requester: request.requester, requestDescription: request.description };
    });
    const first = scheduledExperiments[0];
    const hasUnassignedTester = scheduledExperiments.some(experiment => experiment.tester === "待分配");
    setRequests(items => items.map(item => {
      if (item.id !== request.id) return item;
      const next = { ...item, combinationCount: scheduledExperiments.length, status: "处理中" as const, validationState: hasUnassignedTester ? "待创建" as const : "待校验" as const, processingError: hasUnassignedTester ? "部分实验未匹配到可用 Tester" : undefined, workflowStatus: hasUnassignedTester ? "待创建" as const : "待验证" as const, tester: hasUnassignedTester ? "部分待分配" : [...new Set(scheduledExperiments.map(entry => entry.tester))].join("、"), robot: [...new Set(scheduledExperiments.map(entry => entry.robot))].join("、"), scheduledTime: first?.schedule || "等待可用资源" };
      return hasUnassignedTester ? next : withRequirementNotification(next, "experiments-created");
    }));
    setAssignedExperiments(items => [...items.filter(item => item.requestId !== request.id), ...scheduledExperiments].sort((a, b) => {
      const executionOrder = (status: string) => status === "进行中" ? 0 : status === "已完成" ? 1 : 2;
      const stateDiff = executionOrder(a.status) - executionOrder(b.status);
      return stateDiff || (a.priority === b.priority ? 0 : a.priority === "高" ? -1 : 1);
    }));
    done(hasUnassignedTester ? `${request.id} 创建结果存在异常，请处理后重试` : `${request.id} 已创建并关联 ${scheduledExperiments.length} 个实验，校验通过`);
  }

  function startRequestValidation(id: string) {
    setRequests(items => items.map(item => {
      if (item.id !== id) return item;
      const nextStatus = item.workflowStatus === "待重新验证" ? "重新验证中" : "验证中";
      return { ...item, status: "处理中", workflowStatus: nextStatus, validationState: "待校验", processingError: undefined };
    }));
    done(`${id} 已开始验证`);
  }

  function passRequestValidation(id: string) {
    const request = requests.find(item => item.id === id);
    const linked = assignedExperiments.filter(experiment => experiment.requestId === id);
    if (!linked.length || linked.some(experiment => experiment.status === "冲突" || experiment.tester === "待分配")) {
      done("全部实验创建并完成资源匹配后，才能通过验证");
      return;
    }
    const event: RequirementNotificationEvent = request && ["待重新验证", "重新验证", "重新验证中"].includes(getRequestWorkflowStatus(request)) ? "revalidation-passed" : "validation-passed";
    setRequests(items => items.map(item => item.id === id ? withRequirementNotification({
      ...item,
      status: "已排期",
      workflowStatus: "待实验",
      validationState: "校验通过",
      validationIssueType: undefined,
      validationIssueNote: undefined,
      processingError: undefined,
    }, event) : item));
    done(`${id} 验证通过，进入测试执行`);
  }

  function failRequestValidation(id: string, issueType: "Policy 问题" | "JSON 问题", note: string) {
    setRequests(items => items.map(item => item.id === id ? withRequirementNotification({
      ...item,
      status: "处理中",
      workflowStatus: issueType === "Policy 问题" ? "Policy 修复中" : "DEBUG 中",
      validationIssueType: issueType,
      validationIssueNote: note.trim() || undefined,
      processingError: undefined,
    }, issueType === "Policy 问题" ? "policy-issue" : "debug-issue", { issue: note.trim() || issueType }) : item));
    done(`${id} 验证未通过，已进入${issueType === "Policy 问题" ? "Policy 修复" : "DEBUG"}流程`);
  }

  function completeRequestRepair(id: string) {
    setRequests(items => items.map(item => item.id === id ? withRequirementNotification({ ...item, status: "处理中", workflowStatus: "待重新验证" }, item.validationIssueType === "Policy 问题" ? "policy-repair-completed" : "debug-completed") : item));
    done(`${id} 修复完成，等待重新验证`);
  }

  function deletePendingWorkOrder(id: string) {
    const request = requests.find(item => item.id === id);
    if (!request || request.status !== "待处理") {
      done("管理员已开始处理，当前需求不可删除");
      return;
    }
    setRequests(items => items.filter(item => item.id !== id));
    setAssignedExperiments(items => items.filter(item => item.requestId !== id));
    done(`${id} 已删除`);
  }

  function cancelWorkOrder(id: string) {
    setRequests(items => items.map(item => {
      if (item.id !== id || item.status === "已取消") return item;
      const currentWorkflowStatus = getRequestWorkflowStatus(item);
      return withRequirementNotification({
        ...item,
        status: "已取消",
        workflowStatus: "已取消",
        cancelledFromWorkflowStatus: currentWorkflowStatus === "已取消" ? item.cancelledFromWorkflowStatus : currentWorkflowStatus,
      }, "cancelled", { recipients: [getRequestOwner(currentWorkflowStatus)] });
    }));
    done(`${id} 已取消；已有 Requirement 与 Experiment 记录继续保留`);
  }

  function updatePendingWorkOrder(id: string, updates: SharedRequest) {
    setRequests(items => items.map(item => item.id === id && item.status === "待处理" ? { ...item, ...updates, id, status: "待处理", validationState: "待创建", processingError: undefined, workflowStatus: "待处理" } : item));
    done(`${id} 已更新，状态仍为待处理`);
  }

  function capacityForConfig(config: RobotScheduleConfig) {
    const workMinutes = Math.max(0, timeValueMinutes(config.workEnd) - timeValueMinutes(config.workStart));
    const breakMinutes = Math.max(0, timeValueMinutes(config.breakEnd) - timeValueMinutes(config.breakStart));
    return Math.max(1, Math.floor((workMinutes - breakMinutes) / config.averageDuration));
  }

  function applyBatchRobotConfig(config: RobotScheduleConfig) {
    if (!selectedRobotNames.length) {
      done("请先选择需要批量设置的 Robot");
      return;
    }
    const maxExperiments = capacityForConfig(config);
    setRobotBlocks(items => {
      const next = { ...items };
      selectedRobotNames.forEach((name, index) => {
        next[name] = [{ id: Date.now() + index, start: config.breakStart, end: config.breakEnd, reason: "批量设置的停用时段" }];
      });
      return next;
    });
    setRobotPool(items => items.map(robot => {
      if (!selectedRobotNames.includes(robot.name)) return robot;
      const capacity = robot.status === "维护中" || robot.status === "已暂停" ? 0 : maxExperiments;
      const scheduled = Math.min(robot.scheduled, maxExperiments);
      return { ...robot, scheduleConfig: config, capacity, scheduled, utilization: capacity ? Math.round(scheduled / capacity * 100) : 0 };
    }));
    setSelectedRobot(current => current && selectedRobotNames.includes(current.name) ? { ...current, scheduleConfig: config, capacity: current.status === "维护中" || current.status === "已暂停" ? 0 : maxExperiments } : current);
    done(`批量设置已应用到 ${selectedRobotNames.length} 台 Robot：${config.workStart}–${config.workEnd}，停用 ${config.breakStart}–${config.breakEnd}，每日最多 ${maxExperiments} 个实验`);
  }

  function updateRequestStatus(id: string, status: SharedRequest["status"]) {
    setRequests(items => items.map(item => {
      if (item.id !== id) return item;
      const next = { ...item, status, workflowStatus: undefined };
      return { ...next, workflowStatus: getRequestWorkflowStatus(next) };
    }));
  }

  function addLeave(leave: { start: string; end: string; reason: string }) {
    setLeaves(items => [...items, { ...leave, id: Date.now(), tester: "李莎", status: "待审批" }]);
    done("请假申请已提交，等待实验管理员审批");
  }

  function reviewLeave(id: number, approved: boolean) {
    const leave = leaves.find(item => item.id === id);
    setLeaves(items => items.map(item => item.id === id ? { ...item, status: approved ? "已批准" : "已拒绝" } : item));
    if (approved && leave) {
      setRequests(items => items.map(item => item.tester === leave.tester && (item.status === "已排期" || item.status === "进行中") ? { ...item, tester: "林超", status: "已排期", workflowStatus: "待实验", scheduledTime: "今天 17:00–17:30" } : item));
      setAssignedExperiments(items => items.map(item => {
        if (item.tester !== leave.tester || item.status === "已完成" || item.status === "进行中") return item;
        const replacement = sharedTesterNames.find(tester => tester !== leave.tester && !testerBreaks.some(entry => entry.active && entry.tester === tester)) || "待分配";
        return { ...item, tester: replacement, status: replacement === "待分配" ? "冲突" : "已排期", schedule: shiftScheduledTime(item.schedule, 30) };
      }));
      done(`${leave.tester} 的请假已批准，未执行实验已在实验员排期中自动重新匹配`);
    } else done("请假申请已拒绝，原实验排期保持不变");
  }

  function saveRobotSettings(name: string, setting: RobotStatusSetting, config: RobotScheduleConfig) {
    const disabled = setting === "维护中" || setting === "已暂停";
    const maxExperiments = capacityForConfig(config);
    const update = (robot: Robot): Robot => {
      const status = setting === "在线" ? getScheduledRobotStatus(robot) : setting;
      const capacity = disabled ? 0 : maxExperiments;
      const scheduled = Math.min(robot.scheduled, maxExperiments);
      return { ...robot, scheduleConfig: config, status, capacity, scheduled, utilization: capacity ? Math.round(scheduled / capacity * 100) : 0, next: disabled ? "待管理员恢复" : scheduled >= capacity ? `明天 ${config.workStart}` : `今天 ${workIndexTimeLabel(scheduled)}` };
    };
    setRobotPool(items => items.map(robot => robot.name === name ? update(robot) : robot));
    setSelectedRobot(current => current?.name === name ? update(current) : current);
    setRobotBlocks(items => ({ ...items, [name]: [{ id: Date.now(), start: config.breakStart, end: config.breakEnd, reason: "单机设置的停用时段" }] }));
    if (disabled) {
      const fallbackRobot = robotPool.find(robot => robot.name !== name && (robot.status === "运行中" || robot.status === "空闲"));
      setAssignedExperiments(items => items.map(experiment => {
        if (experiment.robot !== name || (experiment.status !== "已排期" && experiment.status !== "冲突")) return experiment;
        if (!fallbackRobot) return { ...experiment, status: "冲突" };
        return { ...experiment, robot: fallbackRobot.name, status: "已排期", schedule: shiftScheduledTime(experiment.schedule, 30) };
      }));
    }
    if (setting === "在线") {
      const current = robotPool.find(robot => robot.name === name);
      done(`${name} 已设为在线并保存单机时间配置，当前根据排期显示为${current ? getScheduledRobotStatus(current) : "空闲"}`);
    } else {
      done(`${name} 已设置为${setting}并保存单机时间配置，受影响的未执行实验已重新排期`);
    }
  }

  function startTesterBreak(tester: string, reason = "临时休息") {
    const startedAt = Date.now();
    setTesterBreaks(items => [...items.filter(item => !(item.tester === tester && item.active)), { id: startedAt, tester, start: new Date(startedAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false }), startedAt, reason, active: true }]);
    setAssignedExperiments(items => items.map(item => item.tester === tester && item.status === "已排期" ? { ...item, status: "冲突" } : item));
    done(`${tester} 的临时休息已开始计时，系统正在动态校准后续实验开始时间`);
  }

  function endTesterBreak(tester: string) {
    const endedAt = Date.now();
    const activeBreak = testerBreaks.find(item => item.tester === tester && item.active);
    const durationSeconds = activeBreak ? Math.max(1, Math.floor((endedAt - activeBreak.startedAt) / 1000)) : 0;
    const delayMinutes = Math.max(1, Math.ceil(durationSeconds / 60));
    setTesterBreaks(items => items.map(item => item.tester === tester && item.active ? { ...item, active: false, endedAt, durationSeconds } : item));
    setAssignedExperiments(items => items.map(item => item.tester === tester && item.status === "冲突" ? { ...item, status: "已排期", schedule: shiftScheduledTime(item.schedule, delayMinutes) } : item));
    done(`${tester} 的临时休息已结束；后续实验已按实际休息 ${delayMinutes} 分钟重新排期`);
  }

  function startExperiment(id: string) {
    const requestId = assignedExperiments.find(item => item.id === id)?.requestId;
    setAssignedExperiments(items => items.map(item => item.id === id ? { ...item, status: "进行中" } : item));
    if (requestId) setRequests(items => items.map(item => {
      if (item.id !== requestId) return item;
      const next = { ...item, status: "进行中" as const, workflowStatus: "实验中" as const };
      return item.workflowStatus === "实验中" ? next : withRequirementNotification(next, "test-started");
    }));
    setRunningTimers(items => ({ ...items, [id]: Date.now() }));
  }

  function finishExperiment(id: string) {
    const finished = assignedExperiments.find(item => item.id === id);
    setAssignedExperiments(items => items.map(item => item.id === id ? { ...item, status: "已完成" } : item));
    if (finished?.requestId) {
      const allLinked = assignedExperiments.filter(item => item.requestId === finished.requestId);
      const allComplete = allLinked.length > 0 && allLinked.every(item => item.id === id || item.status === "已完成");
      setRequests(items => items.map(item => {
        if (item.id !== finished.requestId) return item;
        const next = { ...item, status: "进行中" as const, workflowStatus: allComplete ? "待审核" as const : "实验中" as const };
        return allComplete ? withRequirementNotification(next, "review-pending") : next;
      }));
    }
    setRunningTimers(items => { const next = { ...items }; delete next[id]; return next; });
    done(`${id} 已完成并停止计时，实验员保持可用状态`);
  }

  function done(message: string) { setToast(message); setTimeout(() => setToast(""), 2600); }

  function completeRequestDelivery(id: string) {
    setRequests(items => items.map(item => item.id === id ? withRequirementNotification({ ...item, status: "已完成", workflowStatus: "已完成" }, "delivery-completed") : item));
    done(`${id} 测试完成，已通知需求人查看最终结果`);
  }

  function acknowledgeRequestDelivery(id: string) {
    setRequests(items => items.map(item => item.id === id ? { ...item, requesterAcknowledged: true } : item));
    done(`${id} 已记录需求方查看完成`);
  }

  function openNotificationRequest(notification: SystemRequirementNotification) {
    setReadNotificationIds(current => new Set(current).add(notification.id));
    setNotificationOpen(false);
    if (activeConsole === "manager") {
      setManagerPage("requests");
      setSelectedManagerRequestId(notification.requestId);
    } else if (activeConsole === "requester") {
      setRequesterNotificationRequestId(notification.requestId);
    }
  }

  return (
    <div className="app-shell" ref={appRef}>
      <a className="skip-link" href="#main-content">跳到主要内容</a>
      {mobileNavOpen && <button className="mobile-nav-scrim" aria-label="关闭导航" onClick={() => setMobileNavOpen(false)} />}
      <aside className={`sidebar ${mobileNavOpen ? "mobile-open" : ""}`} aria-label="主导航">
        <div className="brand"><span className="brand-mark"><Bot aria-hidden="true" /></span><div><strong>RobotOps</strong><small>实验运营平台</small></div><IconButton className="mobile-nav-close" label="关闭导航" icon={<X aria-hidden="true" />} onClick={() => setMobileNavOpen(false)} /></div>
        <nav className="console-nav" aria-label="角色控制台">{consoles.map(item => { const ConsoleIcon = item.icon; return <button key={item.id} aria-current={activeConsole === item.id ? "page" : undefined} className={activeConsole === item.id ? "active" : ""} onClick={() => { setActiveConsole(item.id); setNotificationOpen(false); setMobileNavOpen(false); }}><span className="nav-icon role-icon"><ConsoleIcon aria-hidden="true" /></span><span className="nav-copy"><strong>{item.label}</strong><small>{item.hint}</small></span>{item.id === "manager" && managerAlertCount > 0 && <b aria-label={`${managerAlertCount} 个待处理事项`}>{managerAlertCount}</b>}</button>; })}</nav>
      </aside>

      <main id="main-content">
        <header className="topbar">
          <IconButton className="mobile-nav-trigger" label="打开导航" icon={<Menu aria-hidden="true" />} onClick={() => setMobileNavOpen(true)} />
          <div className="page-title"><h1>{consoleMeta[0]}</h1><p>{consoleMeta[1]}</p></div>
          <div className="top-actions">
            <div className="language-switcher" role="group" aria-label={locale === "zh-CN" ? "界面语言" : "Interface language"} data-i18n-ignore>
              <Languages aria-hidden="true" />
              <button type="button" aria-pressed={locale === "zh-CN"} onClick={() => changeLocale("zh-CN")}>{locale === "zh-CN" ? "中文" : "ZH"}</button>
              <button type="button" aria-pressed={locale === "en"} onClick={() => changeLocale("en")}>EN</button>
            </div>
            <div className="date-picker"><IconButton label="前一天" icon={<ChevronLeft aria-hidden="true" />} onClick={() => setDateOffset(-1)} /><span><CalendarDays aria-hidden="true" />{dateLabel}</span><IconButton label="后一天" icon={<ChevronRight aria-hidden="true" />} onClick={() => setDateOffset(1)} /></div>
            {dateOffset !== 0 && <Button variant="secondary" size="sm" onClick={() => setDateOffset(0)}>回到今天</Button>}
            {activeConsole === "manager" && <label className="search"><Search aria-hidden="true" /><input name="manager-search" autoComplete="off" aria-label="搜索 Robot、实验或 Tester" placeholder="搜索 Robot、实验、Tester…" value={search} onChange={e => setSearch(e.target.value)} /></label>}
            <SystemNotificationCenter notifications={systemNotifications} unreadCount={unreadNotificationCount} readIds={readNotificationIds} open={notificationOpen} onOpenChange={setNotificationOpen} onRead={notification => setReadNotificationIds(current => new Set(current).add(notification.id))} onReadAll={() => setReadNotificationIds(current => new Set([...current, ...systemNotifications.map(notification => notification.id)]))} onOpenRequest={openNotificationRequest} canOpenRequest={activeConsole !== "tester"} />
            <span className="avatar" aria-label="当前用户 JC">JC</span>
          </div>
        </header>

        <div className="content">
          {activeConsole === "manager" ? <>
          <div className="manager-subnav"><Tabs label="实验管理员页面" value={managerPage} onValueChange={value => { setManagerPage(value as "operations" | "requests" | "testers"); setNotificationOpen(false); }} items={[{ value: "operations", label: "运行与资源", icon: <Gauge aria-hidden="true" />, badge: operationsAttentionCount, badgeLabel: `${operationsAttentionCount} 个运行与资源待处理事项` }, { value: "requests", label: `实验需求管理 · ${requests.length}`, icon: <ClipboardList aria-hidden="true" /> }, { value: "testers", label: "实验员管理", icon: <UsersRound aria-hidden="true" />, badge: pendingLeaveCount, badgeLabel: `${pendingLeaveCount} 个待审批请假` }]} /></div>
          <div className={`manager-console-page ${managerPage}`}>
          {managerPage === "requests" && <section className="manager-request-page-head"><div><span>EXPERIMENT REQUEST MANAGEMENT</span><h2>实验需求管理</h2><p>集中查看需求内容、自动创建的实验，以及每个实验对应的 Robot、Tester 和排期。</p></div><div><strong>{requests.length}</strong><span>全部需求</span></div><div><strong>{requests.reduce((sum, request) => sum + estimateRequestExperimentCount(request), 0)}</strong><span>关联实验</span></div></section>}
          <section className="kpis" aria-label="今日关键指标">
            <MetricCard label="今日已排" value={dispatchStats.scheduled} description={`${dispatchStats.completed} 已完成 · ${dispatchStats.running} 进行中`} icon={<CalendarDays />} />
            <MetricCard label="Robot 可用" value="8 / 10" description="2 台暂停或维护中" icon={<Bot />} tone="info" />
            <MetricCard label="Robot 利用率" value={`${dispatchStats.utilization}%`} description={`${dispatchStats.scheduled} / ${scheduleResources.robot.length * 16} 个实验容量`} icon={<Gauge />} progress={dispatchStats.utilization} />
            <MetricCard label="需要处理" value={dispatchStats.atRisk + dispatchStats.unassigned} description="待处理需求或实验创建异常" icon={<AlertTriangle />} tone={dispatchStats.atRisk + dispatchStats.unassigned ? "warning" : "success"} />
          </section>

          <section className="capacity-panel robot-management-section">
              <div className="section-head"><div><h2>Robot 管理</h2><p>{selectedRobotNames.length ? `已选择 ${selectedRobotNames.length} 台 Robot，可进行批量设置。` : "勾选 Robot 后可批量修改时间配置。"}</p></div><div className="filters robot-header-actions"><label className="robot-select-all"><input type="checkbox" aria-label="全选当前 Robot 列表" checked={filteredRobots.length > 0 && filteredRobots.every(robot => selectedRobotNames.includes(robot.name))} onChange={event => setSelectedRobotNames(event.target.checked ? [...new Set([...selectedRobotNames, ...filteredRobots.map(robot => robot.name)])] : selectedRobotNames.filter(name => !filteredRobots.some(robot => robot.name === name)))} /><span>全选</span></label><span className="filter-select-control"><select name="robot-status-filter" aria-label="按 Robot 状态筛选" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option>全部状态</option><option>运行中</option><option>空闲</option><option>已暂停</option><option>维护中</option></select><ChevronDown aria-hidden="true" /></span><Tooltip content="批量设置" description={selectedRobotNames.length ? `修改已选择的 ${selectedRobotNames.length} 台 Robot` : "请先勾选 Robot"}><button className="robot-global-setting-button" aria-label="打开 Robot 批量设置" disabled={!selectedRobotNames.length} onClick={() => { const firstSelected = robotPool.find(robot => selectedRobotNames.includes(robot.name)); setGlobalSettingsDraft(firstSelected?.scheduleConfig || globalRobotConfig); setGlobalSettingsOpen(true); }}><Settings2 aria-hidden="true" /></button></Tooltip></div></div>
              <div className="robot-card-grid">{filteredRobots.map(r => { const config = r.scheduleConfig || globalRobotConfig; const isSelected = selectedRobotNames.includes(r.name); return <article className={`robot-card${isSelected ? " selected" : ""}`} key={r.name}><div className="robot-card-head"><div className="robot-card-identity"><input className="robot-card-checkbox" type="checkbox" aria-label={`选择 ${r.name}`} checked={isSelected} onChange={event => setSelectedRobotNames(names => event.target.checked ? names.includes(r.name) ? names : [...names, r.name] : names.filter(name => name !== r.name))} /><button className="robot-card-name" onClick={() => setSelectedRobot(r)}><span className="robot-card-icon" aria-hidden="true"><Bot /></span><span><strong>{r.name}</strong><small>{config.workStart}–{config.workEnd} · 停用 {config.breakStart}–{config.breakEnd}</small></span></button></div><StatusBadge value={r.status} /></div><div className="robot-card-metrics"><div><span>已排 / 容量</span><strong className="tabular">{r.scheduled} / {r.capacity || "—"}</strong></div><div><span>下次可用</span><strong>{r.next}</strong></div></div><div className="robot-card-util"><div><span>利用率</span><b>{r.capacity ? `${r.utilization}%` : "—"}</b></div><div className="util"><div><i className={r.utilization === 100 ? "full" : r.status === "已暂停" ? "paused" : ""} style={{ width: `${r.utilization}%` }} /></div></div></div><div className="robot-card-current"><span>当前实验</span>{r.current !== "—" ? <button className="link" onClick={() => { const firstSlot = getDispatchSchedule(r.name, 0, robotPool, robotBlocks)[0]; setSelectedExperiment({ ...scheduleSlotToExperiment(firstSlot, 0), id: r.current }); }}>{r.current}</button> : <strong>—</strong>}</div></article>; })}</div>
          </section>

          <section className="panel schedule-panel requester-gantt manager-gantt">
            <div className="section-head"><div><h2>今日 Robot 实验排期</h2><p>按 Robot 查看实验、Policy 与设备可用时段；排期只依据 Robot 容量和停用规则。</p></div><div className="schedule-controls"><div className="legend"><span><i className="done" />已完成</span><span><i className="progress" />进行中</span><span><i className="scheduled" />待执行</span><span><i className="conflict" />需处理</span><span><i className="available" />可申请</span></div></div></div>
            <div className="plan-constraint-note"><strong>今日排期 · {globalRobotConfig.workStart}–{globalRobotConfig.workEnd}</strong><span>平台默认平均用时 {globalRobotConfig.averageDuration} 分钟、{globalRobotConfig.breakStart}–{globalRobotConfig.breakEnd} 停用；批量或单机配置可覆盖对应 Robot。</span></div><div className="request-gantt-body"><div className="request-gantt-head"><span>ROBOT / {calculatedDailyLimit} EXP CAPACITY</span><ScheduleTimeAxis /></div>{scheduleRows.map(row => <div className="request-gantt-row" key={row.name}><div className="request-robot-label"><span>R</span><div><strong>{row.name}</strong><small>{row.slots.filter(isBookedSlot).length}/{robotPool.find(robot => robot.name === row.name)?.capacity || calculatedDailyLimit} 已排</small></div></div><div className="request-slot-track">{row.slots.map((slot, i) => <button key={slot.id} title={`${slotTimeLabel(i)} · ${slot.sub} · ${slot.policy}${slot.constraint ? ` · ${slot.constraint}` : ""}`} className={`${slot.status} ${slot.blocked ? "blocked" : ""}`} onClick={() => slot.available || slot.blocked ? undefined : setSelectedExperiment(scheduleSlotToExperiment(slot, i))}><span>{slot.sub}</span><small>{slot.available ? slotTimeLabel(i) : slot.policy.replace(" Policy", "")}</small><em>{slot.available ? `约 ${globalRobotConfig.averageDuration} 分钟` : slot.experimentName}</em></button>)}</div></div>)}</div>
          </section>

          <div className="section-grid lower-grid">
            <section className="panel queue-panel manager-request-queue"><div className="section-head"><div><h2>实验需求队列</h2><p>管理员从“待处理”开始处理，创建并关联实验后完成验证、问题修复与重新验证。</p></div><div className="segmented" aria-label="按优先级筛选"><button aria-pressed={requestPriorityFilter === "全部"} className={requestPriorityFilter === "全部" ? "active" : ""} onClick={() => setRequestPriorityFilter("全部")}>全部</button><button aria-pressed={requestPriorityFilter === "紧急"} className={requestPriorityFilter === "紧急" ? "active" : ""} onClick={() => setRequestPriorityFilter("紧急")}>紧急</button></div></div><div className="table-scroll"><table className="request-queue-table"><thead><tr><th>优先级</th><th>需求 ID</th><th>需求描述</th><th>Policy</th><th>Robot</th><th>申请人</th><th>状态</th><th>操作</th></tr></thead><tbody>{filteredManagerRequests.map(r => {
              const policies = r.policies?.length ? r.policies : [r.policy];
              const robotChoices = r.robotChoices?.length ? r.robotChoices : [r.robot];
              const requirementStatus = getRequirementStatus(r);
              return <tr key={r.id}><td><span className={`priority ${r.priority === "高" ? "high" : ""}`}>{r.priority === "高" ? "紧急" : "普通"}</span></td><td><strong className="req-id">{r.id}</strong></td><td className="description-cell"><span className="description-clamp" title={r.description || r.note || "验证 Policy 在目标场景中的执行稳定性。"}>{r.description || r.note || "验证 Policy 在目标场景中的执行稳定性。"}</span></td><td><div className="table-chip-list">{policies.map(policy => <span className="table-chip policy" key={policy}>{policy}</span>)}</div></td><td><div className="table-chip-list robots">{robotChoices.map(robot => <span className="table-chip robot" key={robot}>{robot}</span>)}</div></td><td>{r.requester}</td><td><SharedStatus value={requirementStatus} /></td><td><div className="manager-request-actions"><button className="view-request-btn" onClick={() => setSelectedManagerRequestId(r.id)}>{r.status === "待处理" ? "打开并处理" : "查看需求"}</button></div></td></tr>;
            })}</tbody></table></div></section>
          </div>
          <div className="tester-management-page">
            <section className="tester-kpis kpis" aria-label="实验员关键指标">
              <MetricCard label="当前可用" value={12 - testerBreaks.filter(item => item.active).length} description="可接受新实验分配" icon={<UsersRound />} tone="success" />
              <MetricCard label="待审批请假" value={pendingLeaveCount} description="需要管理员处理" icon={<CalendarDays />} tone={pendingLeaveCount ? "warning" : undefined} />
              <MetricCard label="临时 Break" value={testerBreaks.filter(item => item.active).length} description="排期正在实时校准" icon={<Pause />} tone={testerBreaks.some(item => item.active) ? "warning" : undefined} />
            </section>
            <div className="tester-workspace-row">
            <section className="panel schedule-panel requester-gantt manager-gantt tester-gantt">
              <div className="section-head"><div><h2>今日实验员排期</h2><p>按实验员查看实验、Robot 与可分配时段；Break 和请假审批会实时校准排期。</p></div><div className="schedule-controls"><div className="legend"><span><i className="done" />已完成</span><span><i className="progress" />进行中</span><span><i className="scheduled" />待执行</span><span><i className="conflict" />需处理</span><span><i className="available" />可分配</span></div></div></div>
              {testerBreaks.some(item => item.active) && <div className="active-break-list">{testerBreaks.filter(item => item.active).map(item => <div key={item.id}><span>Break</span><div><strong>{item.tester} 临时休息计时中</strong><small>开始 {item.start} · 后续 Queue 正在动态顺延，结束后固化新时间</small></div></div>)}</div>}
              <div className="plan-constraint-note"><strong>今日排期 · 10:00–19:00</strong><span>每格 {globalRobotConfig.averageDuration} 分钟；同一时段多重分配会标记为需处理。</span></div>
              <div className="request-gantt-body"><div className="request-gantt-head"><span>TESTER / {calculatedDailyLimit} EXP CAPACITY</span><ScheduleTimeAxis /></div>{testerScheduleRows.map(row => <div className="request-gantt-row" key={row.name}><div className="request-robot-label"><span>{row.initials}</span><div><strong>{row.name}</strong><small>{row.slots.filter(isBookedSlot).length}/{calculatedDailyLimit} 已排 · {testerBreaks.some(item => item.active && item.tester === row.name) ? "Break" : row.slots.some(slot => slot.status === "conflict") ? "需处理" : "可分配"}</small></div></div><div className="request-slot-track">{row.slots.map((slot, i) => <button key={slot.id} title={`${slotTimeLabel(i)} · ${slot.sub} · ${slot.policy} · ${slot.robot}${slot.constraint ? ` · ${slot.constraint}` : ""}`} className={`${slot.status} ${slot.blocked ? "blocked" : ""}`} onClick={() => slot.available || slot.blocked ? undefined : setSelectedExperiment(scheduleSlotToExperiment(slot, i))}><span>{slot.sub}</span><small>{slot.available ? slotTimeLabel(i) : slot.policy.replace(" Policy", "")}</small><em>{slot.available ? `约 ${globalRobotConfig.averageDuration} 分钟` : slot.robot}</em></button>)}</div></div>)}</div>
            </section>
            <section className="panel pending-leave-panel" aria-labelledby="pending-leave-title">
              <div className="section-head"><div><h2 id="pending-leave-title">待处理请假申请</h2><p>审批后系统会自动改派 Tester，并重新校准实验排期。</p></div><Badge tone={pendingLeaveCount ? "warning" : "neutral"} dot={pendingLeaveCount > 0}>{pendingLeaveCount ? `${pendingLeaveCount} 个待审批` : "暂无待审批"}</Badge></div>
              {pendingLeaveCount > 0 ? <div className="leave-approval-list">{leaves.filter(leave => leave.status === "待审批").map(leave => <article key={leave.id}><div className="leave-approval-copy"><strong>{leave.tester} · 请假申请</strong><span>{leave.start.replace("T", " ")} → {leave.end.replace("T", " ")}</span><small>{leave.reason}</small></div><div className="leave-approval-status"><SharedLeaveStatus value={leave.status} /></div><div className="approval-actions"><button onClick={() => reviewLeave(leave.id, false)}>拒绝</button><button className="approve" onClick={() => reviewLeave(leave.id, true)}>批准并自动调度</button></div></article>)}</div> : <div className="pending-leave-empty" role="status"><strong>暂无待处理申请</strong><span>新的请假申请会显示在这里。</span></div>}
            </section>
            </div>
          </div>
          </div>
          </> : activeConsole === "requester" ? <RequesterConsole requests={requests} setRequests={setRequests} assignedExperiments={assignedExperiments} robotPool={robotPool} robotBlocks={robotBlocks} testerBreaks={testerBreaks} notificationRequestId={requesterNotificationRequestId} onNotificationRequestOpened={() => setRequesterNotificationRequestId(null)} onSubmitWorkOrder={submitWorkOrder} onImportWorkOrders={importWorkOrders} onUpdatePending={updatePendingWorkOrder} onDeletePending={deletePendingWorkOrder} onCancelRequest={cancelWorkOrder} onAcknowledgeRequest={acknowledgeRequestDelivery} /> : <TesterConsole assignedExperiments={assignedExperiments} leaves={leaves} testerBreaks={testerBreaks} runningTimers={runningTimers} addLeave={addLeave} startExperiment={startExperiment} finishExperiment={finishExperiment} startBreak={startTesterBreak} endBreak={endTesterBreak} />}
        </div>
      </main>

      {(selectedRobot || selectedExperiment) && <div className="overlay" onMouseDown={() => { setSelectedRobot(null); setSelectedExperiment(null); setDrawerParentRobot(null); }}><aside className="drawer robot-management-drawer" role="dialog" aria-modal="true" aria-label={selectedRobot ? `${selectedRobot.name} Robot 详情` : `${selectedExperiment?.id} 实验详情`} onMouseDown={e => e.stopPropagation()}><IconButton className="close" label="关闭详情" icon={<X aria-hidden="true" />} onClick={() => { setSelectedRobot(null); setSelectedExperiment(null); setDrawerParentRobot(null); }} /><div className="drawer-scroll-content">{selectedRobot ? <RobotManagementDrawerView robot={selectedRobot} workConfig={globalRobotConfig} schedule={getDispatchSchedule(selectedRobot.name, 0, robotPool, robotBlocks)} onSave={(status, config) => saveRobotSettings(selectedRobot.name, status, config)} onExperiment={experiment => { setDrawerParentRobot(selectedRobot); setSelectedRobot(null); setSelectedExperiment(experiment); }} /> : selectedExperiment && <ExperimentDrawerWithRequest experiment={selectedExperiment} onBack={drawerParentRobot ? () => { setSelectedExperiment(null); setSelectedRobot(drawerParentRobot); setDrawerParentRobot(null); } : undefined} />}</div></aside></div>}
      {selectedManagerRequest && <div className="overlay request-detail-overlay" onMouseDown={() => setSelectedManagerRequestId(null)}><aside className="drawer request-detail-drawer" role="dialog" aria-modal="true" aria-label={`${selectedManagerRequest.id} 需求详情`} onMouseDown={event => event.stopPropagation()}><IconButton className="close" label="关闭需求详情" icon={<X aria-hidden="true" />} onClick={() => setSelectedManagerRequestId(null)} /><div className="drawer-scroll-content"><RequestDetailDrawer request={selectedManagerRequest} linkedExperiments={assignedExperiments.filter(experiment => experiment.requestId === selectedManagerRequest.id)} managerActions={{ onBegin: () => beginWorkOrder(selectedManagerRequest.id), onCreate: () => createAndLinkExperiments(selectedManagerRequest), onStartValidation: () => startRequestValidation(selectedManagerRequest.id), onPassValidation: () => passRequestValidation(selectedManagerRequest.id), onFailValidation: (issueType, note) => failRequestValidation(selectedManagerRequest.id, issueType, note), onCompleteRepair: () => completeRequestRepair(selectedManagerRequest.id), onCompleteDelivery: () => completeRequestDelivery(selectedManagerRequest.id) }} /></div></aside></div>}

      {globalSettingsOpen && <div className="modal-backdrop" onMouseDown={() => setGlobalSettingsOpen(false)}>
        <div className="modal robot-bulk-modal" role="dialog" aria-modal="true" aria-labelledby="global-robot-title" aria-describedby="global-robot-description" onMouseDown={event => event.stopPropagation()}>
          <IconButton className="composer-close" label="关闭 Robot 批量设置" icon={<X aria-hidden="true" />} onClick={() => setGlobalSettingsOpen(false)} />
          <div className="modal-icon blue"><Settings2 aria-hidden="true" /></div>
          <h3 id="global-robot-title">Robot 批量设置</h3>
          <p id="global-robot-description">将每日时间段、停用时间段和平均实验时长应用到已选择的 {selectedRobotNames.length} 台 Robot。</p>
          <div className="selected-robot-summary">{selectedRobotNames.map(name => <span key={name} translate="no">{name}</span>)}</div>
          <div className="bulk-modal-grid">
            <label><span>每日工作开始</span><input name="robot-work-start" autoComplete="off" type="time" value={globalSettingsDraft.workStart} onChange={event => setGlobalSettingsDraft(config => ({ ...config, workStart: event.target.value }))} /></label>
            <label><span>每日工作结束</span><input name="robot-work-end" autoComplete="off" type="time" value={globalSettingsDraft.workEnd} onChange={event => setGlobalSettingsDraft(config => ({ ...config, workEnd: event.target.value }))} /></label>
            <label><span>停用时间开始</span><input name="robot-break-start" autoComplete="off" type="time" value={globalSettingsDraft.breakStart} onChange={event => setGlobalSettingsDraft(config => ({ ...config, breakStart: event.target.value }))} /></label>
            <label><span>停用时间结束</span><input name="robot-break-end" autoComplete="off" type="time" value={globalSettingsDraft.breakEnd} onChange={event => setGlobalSettingsDraft(config => ({ ...config, breakEnd: event.target.value }))} /></label>
            <label className="wide"><span>平均实验时长</span><select name="average-experiment-duration" autoComplete="off" value={globalSettingsDraft.averageDuration} onChange={event => setGlobalSettingsDraft(config => ({ ...config, averageDuration: Number(event.target.value) }))}><option value={30}>30 分钟</option><option value={45}>45 分钟</option><option value={60}>60 分钟</option></select></label>
          </div>
          <div className="bulk-capacity-preview" aria-live="polite"><div className="bulk-capacity-result"><span>预计每日可排容量</span><strong>{draftDailyLimit}</strong><em>个实验 / Robot</em></div><div className="bulk-capacity-formula"><span>计算依据</span><p><strong>{draftWorkMinutes / 60} 小时</strong>工作跨度 − <strong>{draftBreakMinutes / 60} 小时</strong>停用时间</p><small>净可用时间按每个实验 {globalSettingsDraft.averageDuration} 分钟折算</small></div></div>
          <div className="modal-actions"><Button variant="secondary" onClick={() => setGlobalSettingsOpen(false)}>取消</Button><Button onClick={() => { applyBatchRobotConfig(globalSettingsDraft); setGlobalSettingsOpen(false); }}>应用到已选 Robot</Button></div>
        </div>
      </div>}
      {toast && <div className="toast" role="status" aria-live="polite"><CheckCircle2 aria-hidden="true" />{toast}</div>}
    </div>
  );
}

function SystemNotificationCenter({ notifications, unreadCount, readIds, open, onOpenChange, onRead, onReadAll, onOpenRequest, canOpenRequest }: {
  notifications: SystemRequirementNotification[];
  unreadCount: number;
  readIds: Set<string>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRead: (notification: SystemRequirementNotification) => void;
  onReadAll: () => void;
  onOpenRequest: (notification: SystemRequirementNotification) => void;
  canOpenRequest: boolean;
}) {
  const centerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!centerRef.current?.contains(event.target as Node)) onOpenChange(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      onOpenChange(false);
      triggerRef.current?.focus();
    };
    window.addEventListener("pointerdown", closeOnOutsideClick);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("pointerdown", closeOnOutsideClick);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open, onOpenChange]);

  return <div className="system-notification-center" ref={centerRef}>
      <button ref={triggerRef} type="button" className="system-notification-trigger" aria-label={`消息通知，${unreadCount} 条未读`} aria-expanded={open} aria-controls="system-notification-panel" onClick={() => onOpenChange(!open)}>
        <Bell aria-hidden="true" />
        {unreadCount > 0 && <span className="system-notification-badge" aria-hidden="true">{unreadCount > 99 ? "99+" : unreadCount}</span>}
        <span className="sr-only" role="status" aria-atomic="true">{unreadCount} 条未读通知</span>
      </button>
    {open && <section id="system-notification-panel" className="system-notification-menu" role="dialog" aria-label="消息通知">
      <div className="system-notification-head">
        <div><strong>消息通知</strong><span>{unreadCount ? `${unreadCount} 条未读` : "已全部读完"}</span></div>
        {unreadCount > 0 && <button type="button" className="notification-read-all" onClick={onReadAll}>全部已读</button>}
      </div>
      {notifications.length ? <div className="system-notification-scroll">
        {notifications.map(notification => {
          const unread = !readIds.has(notification.id);
          return <button type="button" key={notification.id} className={`system-notification-item ${unread ? "unread" : ""}`} onClick={() => canOpenRequest ? onOpenRequest(notification) : onRead(notification)}>
            <span className="system-notification-item-icon"><Bell aria-hidden="true" /></span>
            <div>
              <header><strong>{notification.title}</strong><time>{notification.createdAt}</time></header>
              <p>{notification.message}</p>
              <footer><span>{notification.requestId}</span><span>{unread ? "未读" : "已读"}</span><em>{canOpenRequest ? "查看需求" : unread ? "标记已读" : "消息详情"}</em></footer>
            </div>
          </button>;
        })}
      </div> : <div className="system-notification-empty"><CheckCircle2 aria-hidden="true" /><strong>暂无通知</strong><span>新的流程消息会显示在这里</span></div>}
      <span className="system-notification-arrow" aria-hidden="true" />
    </section>}
  </div>;
}

function SharedStatus({ value }: { value: string }) {
  return <StatusBadge value={value} />;
}

function SharedLeaveStatus({ value }: { value: LeaveRequest["status"] }) {
  const tone = value === "已批准" ? "success" : value === "已拒绝" ? "danger" : "warning";
  return <Badge tone={tone} dot>{value}</Badge>;
}

function RequesterConsole({ requests, setRequests, assignedExperiments, robotPool, robotBlocks, testerBreaks, notificationRequestId, onNotificationRequestOpened, onSubmitWorkOrder, onImportWorkOrders, onUpdatePending, onDeletePending, onCancelRequest, onAcknowledgeRequest }: { requests: SharedRequest[]; setRequests: Dispatch<SetStateAction<SharedRequest[]>>; assignedExperiments: Experiment[]; robotPool: Robot[]; robotBlocks: Record<string, RobotBlock[]>; testerBreaks: TesterBreak[]; notificationRequestId: string | null; onNotificationRequestOpened: () => void; onSubmitWorkOrder: (request: SharedRequest) => void; onImportWorkOrders: (requests: SharedRequest[]) => void; onUpdatePending: (id: string, updates: SharedRequest) => void; onDeletePending: (id: string) => void; onCancelRequest: (id: string) => void; onAcknowledgeRequest: (id: string) => void }) {
  const dialogReturnFocusRef = useRef<HTMLElement | null>(null);
  const dialogWasOpenRef = useRef(false);
  const [formOpen, setFormOpen] = useState(false);
  const [excelImportOpen, setExcelImportOpen] = useState(false);
  const [editingRequestId, setEditingRequestId] = useState<string | null>(null);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [selectedGanttExperiment, setSelectedGanttExperiment] = useState<Experiment | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [availabilityDay, setAvailabilityDay] = useState(0);
  const [requestFilter, setRequestFilter] = useState<RequirementStatusFilter>("全部");
  const [form, setForm] = useState({
    description: "",
    policies: [policyCatalog[0]],
    robots: [platformRobotNames[0]],
    groups: [{ objects: [objectCatalog[0]], backgrounds: [backgroundCatalog[0]] }],
    priority: "普通" as "高" | "普通",
    note: "",
  });
  const counts = { pending: requests.filter(r => r.status === "待处理" || r.status === "处理中").length, scheduled: requests.filter(r => r.status === "已排期").length, running: requests.filter(r => r.status === "进行中").length, completed: requests.filter(r => r.status === "已完成").length };
  const dayOptions = ["今天 · 8月18日", "明天 · 8月19日", "后天 · 8月20日"];
  const availabilityRows = robotPool.slice(0,6).map(robot => {
    const slots = getDispatchSchedule(robot.name, availabilityDay, robotPool, robotBlocks);
    const unavailable = robot.status === "维护中" || robot.status === "已暂停";
    return { robot, occupied: slots.filter(isBookedSlot).length, available: slots.filter(slot => slot.available).length, blockedCount: slots.filter(slot => slot.blocked).length, unavailable, slots };
  });
  const combinationCount = form.policies.length * form.robots.length * form.groups.reduce((total, group) => total + group.objects.length * group.backgrounds.length, 0);
  const selectedRequest = requests.find(request => request.id === (notificationRequestId || selectedRequestId)) || null;
  const editingRequest = requests.find(request => request.id === editingRequestId && request.status === "待处理") || null;
  const filteredRequests = useMemo(() => requests.filter(request => requestFilter === "全部" || getRequirementStatus(request) === requestFilter), [requestFilter, requests]);
  const estimatedExperiments = requests.reduce((total, request) => total + estimateRequestExperimentCount(request), 0);
  const todayAvailability = robotPool.slice(0, 6).flatMap(robot => getDispatchSchedule(robot.name, 0, robotPool, robotBlocks));
  const availableCapacity = todayAvailability.filter(slot => slot.available).length;
  const earliestAvailableIndex = Math.min(...robotPool.slice(0, 6).map(robot => getDispatchSchedule(robot.name, 0, robotPool, robotBlocks).findIndex(slot => slot.available)).filter(index => index >= 0));

  useEffect(() => {
    const hasDialog = Boolean(formOpen || excelImportOpen || editingRequest || selectedRequest || selectedGanttExperiment);
    if (!hasDialog) {
      if (dialogWasOpenRef.current) {
        dialogWasOpenRef.current = false;
        window.requestAnimationFrame(() => dialogReturnFocusRef.current?.focus());
      }
      return;
    }
    if (!dialogWasOpenRef.current) {
      dialogWasOpenRef.current = true;
      dialogReturnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      keepFocusInActiveDialog(event);
      if (event.key !== "Escape") return;
      setFormOpen(false);
      setExcelImportOpen(false);
      setEditingRequestId(null);
      setSelectedRequestId(null);
      if (notificationRequestId) onNotificationRequestOpened();
      setSelectedGanttExperiment(null);
    };
    document.body.classList.add("modal-open");
    focusActiveDialog();
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.classList.remove("modal-open");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [formOpen, excelImportOpen, editingRequest, selectedRequest, selectedGanttExperiment, notificationRequestId, onNotificationRequestOpened]);

  function closeSelectedRequest() {
    setSelectedRequestId(null);
    if (notificationRequestId) onNotificationRequestOpened();
  }

  function toggleMulti(field: "policies" | "robots", value: string) {
    setForm(current => {
      const selected = current[field];
      return { ...current, [field]: selected.includes(value) ? selected.filter(item => item !== value) : [...selected, value] };
    });
  }

  function toggleGroupValue(groupIndex: number, field: "objects" | "backgrounds", value: string) {
    setForm(current => ({ ...current, groups: current.groups.map((group, index) => index !== groupIndex ? group : { ...group, [field]: group[field].includes(value) ? group[field].filter(item => item !== value) : [...group[field], value] }) }));
  }

  function addCombinationGroup() {
    setForm(current => ({ ...current, groups: [...current.groups, { objects: [], backgrounds: [] }] }));
  }

  function openRequesterGanttExperiment(event: React.MouseEvent<HTMLDivElement>) {
    const button = (event.target as HTMLElement).closest(".requester-gantt .request-slot-track button");
    if (!button) return;
    const experimentId = button.querySelector("span")?.textContent || "";
    if (!experimentId.startsWith("EXP-")) return;
    for (const row of availabilityRows) {
      const slotIndex = row.slots.findIndex(slot => slot.id === experimentId);
      if (slotIndex >= 0) {
        setSelectedGanttExperiment(scheduleSlotToExperiment(row.slots[slotIndex], slotIndex));
        return;
      }
    }
  }

  function submitRequest(e: React.FormEvent) {
    e.preventDefault();
    const id = `REQ-${2090 + requests.length}`;
    const objects = form.groups.flatMap(group => group.objects);
    const backgrounds = form.groups.flatMap(group => group.backgrounds);
    const requestName = [...new Set(form.policies.map(getExperimentName))].join("、") + "需求";
    onSubmitWorkOrder({ id, name: requestName, robot: form.robots.join("、"), object: objects.join("、"), background: backgrounds.join("、"), policy: form.policies.join("、"), priority: form.priority, duration: "30 分钟/实验", expectedDate: "尽快", requester: "许晨", note: form.note, status: "待处理", tester: "待分配", scheduledTime: "等待管理员处理", description: form.description, policies: form.policies, robotChoices: form.robots, objectGroups: form.groups, objectSets: form.groups.map(group => group.objects), backgroundSets: form.groups.map(group => group.backgrounds), combinationCount, validationState: "待创建" });
    setSubmitted(true);
    setTimeout(() => { setFormOpen(false); setSubmitted(false); }, 1200);
  }

  return <div className="role-console requester-console" onClick={openRequesterGanttExperiment}>
    <section className="role-hero"><div><span className="eyebrow">EXPERIMENT REQUESTER</span><h2>需求总览</h2><p>提交后进入待处理；管理员开始处理前可修改，之后只读追踪。</p></div><div className="requester-hero-actions"><Button size="lg" variant="secondary" leadingIcon={<Upload aria-hidden="true" />} onClick={() => setExcelImportOpen(true)}>Excel 导入</Button><Button size="lg" leadingIcon={<Plus aria-hidden="true" />} onClick={() => setFormOpen(true)}>提交实验需求</Button></div></section>
    <section className="role-kpis" aria-label="需求关键指标">
      <MetricCard label="全部需求" value={requests.length} description={`${estimatedExperiments} 个关联实验`} icon={<ClipboardList />} />
      <MetricCard label="今日可用容量" value={availableCapacity} description="个 30 分钟实验时段" icon={<Bot />} tone="info" />
      <MetricCard label="最早预计开始" value={`今天 ${slotTimeLabel(Number.isFinite(earliestAvailableIndex) ? earliestAvailableIndex : 0)}`} description="综合 Robot 与 Tester 可用时间" icon={<CalendarDays />} />
      <MetricCard label="处理中需求" value={counts.pending} description={counts.pending ? "包含待处理与处理中" : "当前需求均已排期"} icon={counts.pending ? <AlertTriangle /> : <CheckCircle2 />} tone={counts.pending ? "warning" : "success"} />
    </section>
    <section className="panel my-requests requester-first"><div className="section-head"><div><h2>我的需求</h2><p>按需求追踪实验创建、排期与执行进度</p></div><div className="segmented" aria-label="按需求状态筛选">{requirementStatusFilters.map(filter => <button key={filter} aria-pressed={requestFilter === filter} className={requestFilter === filter ? "active" : ""} onClick={() => setRequestFilter(filter)}>{filter}</button>)}</div></div><div className="table-scroll"><table className="request-summary-table"><thead><tr><th>需求 ID</th><th>需求描述</th><th>Policy</th><th>Robot</th><th>状态</th><th>操作</th></tr></thead><tbody>{filteredRequests.map(r => {
      const policies = r.policies?.length ? r.policies : [r.policy];
      const robotChoices = r.robotChoices?.length ? r.robotChoices : [r.robot];
      const requirementStatus = getRequirementStatus(r);
      return <tr key={r.id}><td data-label="需求 ID"><strong className="req-id">{r.id}</strong></td><td data-label="需求描述" className="description-cell"><span className="description-clamp" title={r.description || r.note || "验证 Policy 在目标场景中的执行稳定性。"}>{r.description || r.note || "验证 Policy 在目标场景中的执行稳定性。"}</span></td><td data-label="Policy"><div className="table-chip-list">{policies.map(policy => <Tooltip content={policy} key={policy}><span className="table-chip policy">{policy}</span></Tooltip>)}</div></td><td data-label="Robot"><div className="table-chip-list robots">{robotChoices.map(robot => <Tooltip content={robot} key={robot}><span className="table-chip robot" translate="no">{robot}</span></Tooltip>)}</div></td><td data-label="状态"><SharedStatus value={requirementStatus} /></td><td data-label="操作"><button className="view-request-btn" onClick={() => setSelectedRequestId(r.id)}>查看详情 <ChevronRight aria-hidden="true" /></button></td></tr>;
    })}</tbody></table></div></section>
    <section className="panel requester-gantt"><div className="section-head"><div><h2>机器人排期与可用容量</h2><p>10:00–19:00 · 默认 12:00–13:00 Robot 停用休息；状态和 Break 会实时同步</p></div><div className="gantt-tools"><div className="segmented">{dayOptions.map((day,i) => <button key={day} className={availabilityDay === i ? "active" : ""} onClick={() => setAvailabilityDay(i)}>{day}</button>)}</div><div className="gantt-legend"><span><i className="occupied" />已占用</span><span><i className="available" />可申请</span><span><i className="unassigned" />待分配</span><span><i className="blocked" />不可排</span></div></div></div><div className="request-gantt-body"><div className="request-gantt-head"><span>ROBOT / 每日 16 个实验容量</span><ScheduleTimeAxis /></div>{availabilityRows.map(row => <div className="request-gantt-row" key={row.robot.name}><div className="request-robot-label"><span>R</span><div><strong>{row.robot.name}</strong><small>{row.unavailable ? `${row.robot.status} · 今日不可排` : `${row.occupied}/16 已占用 · ${row.available} 个可用 · ${row.blockedCount} 个休息格`}</small></div></div><div className="request-slot-track">{row.slots.map((slot,i) => <button key={slot.id} className={slot.blocked ? "blocked" : slot.available ? "available" : slot.status === "conflict" ? "conflict" : "occupied"} title={`${slotTimeLabel(i)} · ${slot.available ? "可申请" : `${slot.name} · ${slot.policy} · ${slot.tester}`}${slot.constraint ? ` · ${slot.constraint}` : ""}`}><span>{slot.blocked ? "不可排期" : slot.available ? "可申请" : slot.name}</span><small>{slot.available ? slotTimeLabel(i) : slot.policy.replace(" Policy","")}</small><em>{slot.available ? "约 30 分钟" : slot.tester}</em></button>)}</div></div>)}</div><div className="gantt-foot"><span>需求方与管理员使用同一份排期数据；Robot 状态与 Tester 变化会同步更新。</span><strong>{availabilityRows.reduce((sum,row) => sum + row.available,0)} 个可申请实验容量</strong></div></section>
    {(formOpen || editingRequest) && <ModernRequestModal requestCount={requests.length} initialRequest={editingRequest || undefined} setRequests={setRequests} robotPool={robotPool} robotBlocks={robotBlocks} testerBreaks={testerBreaks} onSubmitWorkOrder={request => editingRequest ? onUpdatePending(editingRequest.id, request) : onSubmitWorkOrder(request)} onClose={() => { setFormOpen(false); setEditingRequestId(null); }} />}
    {excelImportOpen && <ExcelImportModal requestCount={requests.length} onImport={onImportWorkOrders} onClose={() => setExcelImportOpen(false)} />}
    {selectedRequest && <div className="overlay request-detail-overlay" onClick={closeSelectedRequest}><aside className="drawer request-detail-drawer" role="dialog" aria-modal="true" aria-label={`${selectedRequest.id} 需求详情`} onClick={event => event.stopPropagation()}><IconButton className="close" label="关闭需求详情" icon={<X aria-hidden="true" />} onClick={closeSelectedRequest} /><div className="drawer-scroll-content"><RequestDetailDrawer request={selectedRequest} linkedExperiments={assignedExperiments.filter(experiment => experiment.requestId === selectedRequest.id)} requesterActions={{ onEdit: () => { closeSelectedRequest(); setEditingRequestId(selectedRequest.id); }, onDelete: () => { onDeletePending(selectedRequest.id); closeSelectedRequest(); }, onCancel: () => onCancelRequest(selectedRequest.id), onAcknowledge: () => onAcknowledgeRequest(selectedRequest.id) }} /></div></aside></div>}
    {selectedGanttExperiment && <div className="overlay" onClick={() => setSelectedGanttExperiment(null)}><aside className="drawer robot-management-drawer" role="dialog" aria-modal="true" aria-label={`${selectedGanttExperiment.id} 实验详情`} onClick={event => event.stopPropagation()}><IconButton className="close" label="关闭实验详情" icon={<X aria-hidden="true" />} onClick={() => setSelectedGanttExperiment(null)} /><div className="drawer-scroll-content"><ExperimentDrawerWithRequest experiment={selectedGanttExperiment} /></div></aside></div>}
  </div>;
}

type LinkedExperiment = {
  id: string; name: string; policy: string; robot: string; object: string; background: string;
  tester: string; schedule: string; status: "待执行" | "进行中" | "已完成"; requestId?: string; requester?: string;
};

function getExperimentName(policy: string) {
  if (policy.includes("Fold")) return "叠布实验";
  if (policy.includes("Battery")) return "插电池实验";
  return "抓取实验";
}

function estimateRequestExperimentCount(request: SharedRequest) {
  if (request.combinationCount) return request.combinationCount;
  const policyCount = request.policies?.length || 1;
  const robotCount = request.robotChoices?.length || 1;
  const objectCount = request.objectSets?.reduce((sum, group) => sum + Math.max(1, group.length), 0) || 1;
  const backgroundCount = request.backgroundSets?.reduce((sum, group) => sum + Math.max(1, group.length), 0) || 1;
  return policyCount * robotCount * objectCount * backgroundCount;
}

function buildLinkedExperiments(request: SharedRequest): LinkedExperiment[] {
  if (request.status === "待处理" || request.status === "处理中") return [];
  const policies = request.policies?.length ? request.policies : [request.policy];
  const robotChoices = request.robotChoices?.length ? request.robotChoices : [request.robot];
  const objectSets = request.objectSets?.length ? request.objectSets : [[request.object]];
  const backgroundSets = request.backgroundSets?.length ? request.backgroundSets : [[request.background]];
  const combinations: { policy: string; robot: string; object: string; background: string }[] = [];
  robotChoices.forEach(robot => policies.forEach(policy => objectSets.forEach(objects => backgroundSets.forEach(backgrounds => {
    objects.forEach(object => backgrounds.forEach(background => combinations.push({ policy, robot, object, background })));
  }))));
  const requestNumber = Number(request.id.replace(/\D/g, "")) || 2000;
  const testers = [request.tester, "陈哲", "李莎", "林超", "王睿"].filter((tester, index, values) => tester !== "待分配" && values.indexOf(tester) === index);
  const sequenceByRobot = new Map<string, number>();
  return combinations.slice(0, 60).map((combination, index) => {
    const sequence = sequenceByRobot.get(combination.robot) || 0;
    sequenceByRobot.set(combination.robot, sequence + 1);
    const dayOffset = Math.floor(sequence / 16);
    const workIndex = sequence % 16;
    const slotIndex = workIndex < 4 ? workIndex : workIndex + 2;
    const startMinutes = slotStartMinutes(slotIndex);
    const endMinutes = startMinutes + 30;
    const formatTime = (minutes: number) => `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
    return {
      id: `EXP-${requestNumber + 1000 + index}`,
      name: getExperimentName(combination.policy),
      ...combination,
      requestId: request.id,
      requester: request.requester,
      tester: testers[robotChoices.indexOf(combination.robot) % Math.max(testers.length, 1)] || "李莎",
      schedule: `${dayOffset === 0 ? "今天" : dayOffset === 1 ? "明天" : `${dayOffset} 天后`} ${formatTime(startMinutes)}–${formatTime(endMinutes)}`,
      status: request.status === "已完成" ? "已完成" : request.status === "进行中" && index === 0 ? "进行中" : "待执行",
    };
  });
}

type RequesterDetailActions = { onEdit: () => void; onDelete: () => void; onCancel: () => void; onAcknowledge: () => void };
type ManagerDetailActions = {
  onBegin: () => void;
  onCreate: () => void;
  onStartValidation: () => void;
  onPassValidation: () => void;
  onFailValidation: (issueType: "Policy 问题" | "JSON 问题", note: string) => void;
  onCompleteRepair: () => void;
  onCompleteDelivery: () => void;
};

function RequestDetailDrawer({ request, linkedExperiments, requesterActions, managerActions }: { request: SharedRequest; linkedExperiments?: Experiment[]; requesterActions?: RequesterDetailActions; managerActions?: ManagerDetailActions }) {
  const [activeTab, setActiveTab] = useState<"config" | "experiments" | "notifications">("config");
  const [confirmAction, setConfirmAction] = useState<"delete" | "cancel" | null>(null);
  const [validationFailureOpen, setValidationFailureOpen] = useState(false);
  const [validationIssueType, setValidationIssueType] = useState<"Policy 问题" | "JSON 问题">("Policy 问题");
  const [validationIssueNote, setValidationIssueNote] = useState("");
  const policies = request.policies?.length ? request.policies : [request.policy];
  const robotChoices = request.robotChoices?.length ? request.robotChoices : [request.robot];
  const experimentsForRequest: LinkedExperiment[] = linkedExperiments ? linkedExperiments.map(experiment => ({ ...experiment, status: experiment.status === "进行中" ? "进行中" : experiment.status === "已完成" ? "已完成" : "待执行" })) : buildLinkedExperiments(request);
  const objectSets = request.objectSets?.length ? request.objectSets : [[request.object]];
  const backgroundSets = request.backgroundSets?.length ? request.backgroundSets : [[request.background]];
  const objectSummary = objectSets.map((group, index) => request.objectMode === "group" ? `分组 ${index + 1}：${group.join(" + ")}` : group.join("、")).join("；");
  const backgroundSummary = backgroundSets.map((group, index) => request.backgroundMode === "group" ? `分组 ${index + 1}：${group.join(" + ")}` : group.join("、")).join("；");
  const workflowStatus = getRequestWorkflowStatus(request);
  const notifications = getRequirementNotifications(request);
  const flowStep = getRequestWorkflowStageIndex(workflowStatus === "已取消" ? request.cancelledFromWorkflowStatus || "待处理" : workflowStatus);
  const workflowComplete = workflowStatus === "已完成";
  const currentOwner = getRequestOwner(workflowStatus);
  const actionDescription = workflowStatus === "待处理" ? "开始处理后，需求内容立即锁定。" : workflowStatus === "待创建" || workflowStatus === "创建中" ? "根据 Requirement 创建并关联 Experiment；异常时仍停留在实验创建。" : workflowStatus === "待验证" ? "实验已创建，等待开始验证。" : workflowStatus === "验证中" || workflowStatus === "重新验证中" ? "验证通过后进入待实验；不通过时请选择问题类型。" : workflowStatus === "Policy 修复中" ? "模型团队修复 Policy / Model 后标记完成。" : workflowStatus === "DEBUG" || workflowStatus === "DEBUG 中" ? "实验团队修复 JSON / 实验配置后标记完成。" : workflowStatus === "待重新验证" || workflowStatus === "重新验证" ? "Policy 或 JSON 已修复，等待回归验证。" : workflowStatus === "待实验" ? "所有 Experiment 已完成前置验证，等待正式测试。" : workflowStatus === "实验中" ? "Experiment 正在执行，可查看关联实验进度。" : workflowStatus === "待确认" ? "审核已通过，等待管理员确认测试完成。" : workflowStatus === "已完成" ? "需求已完成，可查看最终测试结果。" : workflowStatus === "已取消" ? "需求已取消，已有记录继续保留。" : "当前阶段以查看和跟踪为主。";
  const validationDecisionButtons = managerActions ? <><Button variant="secondary" onClick={() => setValidationFailureOpen(true)}>不通过</Button><Button onClick={managerActions.onPassValidation}>通过</Button></> : null;
  const managerFooterAction = managerActions ? workflowStatus === "待处理" ? <Button onClick={managerActions.onBegin}>开始处理</Button> : workflowStatus === "待创建" || workflowStatus === "创建中" ? request.processingError ? <Button onClick={managerActions.onCreate}>重试</Button> : <Button onClick={managerActions.onCreate}>关联创建实验</Button> : workflowStatus === "待验证" || workflowStatus === "待重新验证" || workflowStatus === "重新验证" ? <Button onClick={managerActions.onStartValidation}>开始验证</Button> : workflowStatus === "验证中" || workflowStatus === "重新验证中" ? validationDecisionButtons : workflowStatus === "Policy 修复中" ? <Button onClick={managerActions.onCompleteRepair}>Policy 修复完成</Button> : workflowStatus === "DEBUG" || workflowStatus === "DEBUG 中" ? <Button onClick={managerActions.onCompleteRepair}>DEBUG 完成</Button> : workflowStatus === "待确认" ? <Button onClick={managerActions.onCompleteDelivery}>测试完成</Button> : null : null;
  const canCancelRequest = !["待处理", "驳回重测", "待确认", "已完成", "已取消"].includes(workflowStatus);
  const requesterFooterAction = requesterActions ? workflowStatus === "待处理" ? <><Button variant="destructive" onClick={() => setConfirmAction("delete")}>删除需求</Button><Button onClick={requesterActions.onEdit}>修改需求</Button></> : canCancelRequest ? <Button variant="destructive" onClick={() => setConfirmAction("cancel")}>取消需求</Button> : workflowStatus === "已完成" && !request.requesterAcknowledged ? <Button onClick={requesterActions.onAcknowledge}>确认已查看</Button> : null : null;
  const footerAction = managerFooterAction || requesterFooterAction;
  return <>
    <div className="drawer-content-body">
    <div className="drawer-kicker">需求详情</div>
    <div className="request-detail-title"><div><div className="request-detail-id-row"><h2>{request.id}</h2><SharedStatus value={request.status} /></div><p>提交人 {request.requester} · 期望日期 {request.expectedDate}</p></div></div>
    <div className="request-detail-tabs" role="tablist" aria-label="需求详情内容"><button type="button" role="tab" aria-selected={activeTab === "config"} className={activeTab === "config" ? "active" : ""} onClick={() => setActiveTab("config")}>需求配置</button><button type="button" role="tab" aria-selected={activeTab === "experiments"} className={activeTab === "experiments" ? "active" : ""} onClick={() => setActiveTab("experiments")}>关联实验 <span>{experimentsForRequest.length}</span></button><button type="button" role="tab" aria-selected={activeTab === "notifications"} className={activeTab === "notifications" ? "active" : ""} onClick={() => setActiveTab("notifications")}>消息通知 <span>{notifications.length}</span></button></div>
    {activeTab === "config" && <div className="request-progress" role="list" aria-label="需求流程">{requestWorkflowStages.map((stage, index) => {
      const completed = index < flowStep || workflowComplete;
      const current = index === flowStep && !workflowComplete;
      const showStatus = current || (workflowComplete && index === flowStep);
      return <div className={completed ? "done" : current ? "current" : "upcoming"} role="listitem" aria-current={current ? "step" : undefined} aria-label={`${stage.name}：${completed ? "已完成" : current ? workflowStatus : "待开始"}`} key={stage.name}><span>{completed ? <Check aria-hidden="true" /> : index + 1}</span><div className="request-progress-copy"><small>{stage.name}</small><em aria-hidden={!showStatus}>{showStatus ? workflowStatus : "\u00a0"}</em></div></div>;
    })}</div>}
    {(managerActions || requesterActions) && <section className="work-order-actions" aria-label="需求处理状态"><div><strong>{workflowStatus === "已取消" ? "需求已取消" : `${requestWorkflowStages[Math.max(0, flowStep)]?.name || "需求处理"} · ${workflowStatus}`}</strong><span>当前负责人：{currentOwner} · {actionDescription}</span>{requesterActions && <span className="requester-current-task">需求方当前任务：{getRequesterTask(workflowStatus)}</span>}</div>{request.validationIssueType && !request.processingError && <div className="validation-issue-note"><strong>{request.validationIssueType}</strong><span>{request.validationIssueNote || "未填写补充说明"}</span></div>}{request.processingError && <div className="work-order-error" role="alert"><AlertTriangle aria-hidden="true" /><p><strong>处理异常</strong><span>{request.processingError}</span></p></div>}</section>}
    {activeTab === "config" && <section className="request-detail-section request-config-panel" role="tabpanel">
      <div className="request-detail-heading"><h3>需求配置</h3><div className="request-config-actions"><span className={`priority ${request.priority === "高" ? "high" : ""}`}>{request.priority}优先级</span>{requesterActions && request.status !== "待处理" && <span className="locked-note">已锁定 · 只读</span>}</div></div>
      <dl className="details daily-rule-details request-config-details" aria-label="只读需求配置">
        <div className="description-row"><dt>需求描述</dt><dd>{request.description || request.note || "验证 Policy 在目标场景中的执行稳定性。"}</dd></div>
        <div><dt>Policy</dt><dd>{policies.join("、")}</dd></div>
        <div><dt>Robot</dt><dd className="mono-value">{robotChoices.join("、")}</dd></div>
        <div><dt>物体</dt><dd>{objectSummary}</dd></div>
        <div><dt>背景</dt><dd>{backgroundSummary}</dd></div>
        {request.note && <div><dt>实验备注</dt><dd>{request.note}</dd></div>}
      </dl>
    </section>}
    {activeTab === "experiments" && <section className="request-detail-section linked-experiments" role="tabpanel"><div className="request-detail-heading"><div><h3>关联实验</h3><p>创建脚本携带需求 ID，实验自动回写并关联到当前需求。</p></div></div>{experimentsForRequest.length ? <div className="linked-experiment-list">{experimentsForRequest.map(experiment => <article key={experiment.id}><header><div><span>{experiment.id}</span><strong>{experiment.name}</strong></div><StatusBadge value={experiment.status} /></header><div className="linked-experiment-meta"><p><span>Policy</span><strong>{experiment.policy}</strong></p><p><span>Robot</span><strong>{experiment.robot}</strong></p><p><span>实验对象</span><strong>{experiment.object} · {experiment.background}</strong></p></div><footer><span className="tester-avatar">{experiment.tester.slice(0, 1)}</span><div><small>实验员</small><strong>{experiment.tester}</strong></div><div className="experiment-time"><small>排期时间</small><strong>{experiment.schedule}</strong></div></footer></article>)}</div> : <div className="linked-empty"><span>需</span><strong>{request.status === "待处理" ? "等待管理员开始处理" : "等待脚本创建实验"}</strong><p>需求保持当前状态；创建成功后实验会按需求 ID 自动关联，无需需求方补充信息。</p></div>}</section>}
    {activeTab === "notifications" && <section className="request-detail-section request-notification-panel" role="tabpanel"><div className="request-detail-heading"><div><h3>消息通知</h3><p>状态流转成功后生成通知；“飞书群”标记表示该消息同时同步至群聊。</p></div></div><div className="request-notification-list">{notifications.map(notification => <article key={notification.id}><span className="notification-icon"><Bell aria-hidden="true" /></span><div><header><strong>{notification.title}</strong><time>{notification.createdAt}</time></header><p>{notification.message}</p><footer><span><UsersRound aria-hidden="true" />{notification.recipients.join("、")}</span><div><em>应用消息</em>{notification.syncToFeishu && <em className="feishu">飞书群</em>}</div></footer></div></article>)}</div></section>}
    </div>
    {footerAction && <footer className="drawer-action-bar" aria-label="抽屉操作"><span className="drawer-action-hint">{workflowStatus === "待处理" && requesterActions ? "待处理阶段可修改或删除；删除不可恢复" : "操作将更新当前需求的流程状态"}</span><div>{footerAction}</div></footer>}
    <DialogFrame open={confirmAction !== null} onOpenChange={open => !open && setConfirmAction(null)} title={confirmAction === "delete" ? "确认删除需求？" : "确认取消需求？"} description={confirmAction === "delete" ? `${request.id} 删除后不可恢复，且不会进入后续处理流程。` : `${request.id} 将标记为已取消；已有 Requirement 与 Experiment 记录不会被删除。`} size="sm" footer={<><Button variant="secondary" onClick={() => setConfirmAction(null)}>返回</Button><Button variant="destructive" onClick={() => { if (confirmAction === "delete") requesterActions?.onDelete(); else requesterActions?.onCancel(); setConfirmAction(null); }}>{confirmAction === "delete" ? "确认删除" : "确认取消"}</Button></>}><p className="confirmation-copy">请确认当前操作。{confirmAction === "cancel" && "取消后的资源释放与后续处置仍按待确认规则处理。"}</p></DialogFrame>
    <DialogFrame open={validationFailureOpen} onOpenChange={setValidationFailureOpen} title="记录验证不通过" description="选择问题类型后，需求会留在“需求验证”阶段并进入对应修复流程。" size="sm" footer={<><Button variant="secondary" onClick={() => setValidationFailureOpen(false)}>取消</Button><Button onClick={() => { managerActions?.onFailValidation(validationIssueType, validationIssueNote); setValidationFailureOpen(false); setValidationIssueNote(""); }}>确认</Button></>}><div className="validation-failure-form"><fieldset><legend>问题类型</legend><label><input type="radio" name="validation-issue-type" checked={validationIssueType === "Policy 问题"} onChange={() => setValidationIssueType("Policy 问题")} />Policy 问题</label><label><input type="radio" name="validation-issue-type" checked={validationIssueType === "JSON 问题"} onChange={() => setValidationIssueType("JSON 问题")} />JSON 问题</label></fieldset><label><span>补充说明（选填）</span><textarea value={validationIssueNote} onChange={event => setValidationIssueNote(event.target.value)} placeholder="描述验证现象、影响范围或修复提示" /></label></div></DialogFrame>
  </>;
}

function MultiSelectInput({ label, options, selected, onChange, placeholder, meta }: { label: string; options: string[]; selected: string[]; onChange: (values: string[]) => void; placeholder: string; meta?: (value: string) => string }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const visible = options.filter(option => option.toLowerCase().includes(query.toLowerCase()));
  const toggle = (value: string) => onChange(selected.includes(value) ? selected.filter(item => item !== value) : [...selected, value]);
  return <div className={`multi-select-input ${open ? "open" : ""}`}>
    <button type="button" className="multi-select-trigger" aria-label={`${label}多选，已选择 ${selected.length} 项`} aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen(!open)}>
      <div>{selected.length ? selected.map(value => <span className="selected-chip" key={value}><Check aria-hidden="true" />{value}</span>) : <span className="multi-placeholder">{placeholder}</span>}</div>
      <ChevronDown aria-hidden="true" />
    </button>
    {open && <div className="multi-select-menu"><label><Search aria-hidden="true" /><input name={`${label.toLowerCase()}-search`} autoComplete="off" aria-label={`搜索${label}`} placeholder={`搜索${label}…`} value={query} onChange={event => setQuery(event.target.value)} /></label><div role="listbox" aria-label={`${label}选项`} aria-multiselectable="true">{visible.map(value => <button type="button" role="option" aria-selected={selected.includes(value)} key={value} className={selected.includes(value) ? "selected" : ""} onClick={() => toggle(value)}><i>{selected.includes(value) && <Check aria-hidden="true" />}</i><span translate={label === "机器人" ? "no" : undefined}>{value}</span>{meta && <small>{meta(value)}</small>}</button>)}</div>{!visible.length && <p role="status">没有匹配结果</p>}</div>}
  </div>;
}

const excelRequestHeaders = ["需求描述*", "Policy*", "Robot*", "物体使用方式*", "物体*", "背景使用方式*", "背景*", "优先级*", "实验备注"] as const;

function excelCellText(value: ExcelCell | undefined) {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString();
  return String(value).trim();
}

function splitExcelList(value: string) {
  return value.split(/[；;]/).map(item => item.trim()).filter(Boolean);
}

function parseExcelGroups(value: string, mode: "single" | "group") {
  const groups = splitExcelList(value).map(group => group.split("+").map(item => item.trim()).filter(Boolean)).filter(group => group.length);
  return mode === "single" ? groups.flat().map(item => [item]) : groups;
}

async function parseExcelRequests(file: File, requestCount: number): Promise<{ requests: SharedRequest[]; errors: string[] }> {
  if (!file.name.toLowerCase().endsWith(".xlsx")) return { requests: [], errors: ["仅支持 .xlsx 文件，请使用页面提供的模板。"] };
  let rows: ExcelCell[][];
  try {
    rows = await readXlsxFile(file, { sheet: "实验需求" }) as ExcelCell[][];
  } catch {
    return { requests: [], errors: ["无法读取“实验需求”工作表，请确认文件来自当前模板且未修改工作表名称。"] };
  }
  const headerIndex = rows.findIndex(row => excelCellText(row[0]) === excelRequestHeaders[0]);
  if (headerIndex < 0) return { requests: [], errors: ["未找到模板表头，请保留“实验需求”工作表中的原始表头。"] };
  const headerRow = rows[headerIndex].map(excelCellText);
  const columnIndexes = Object.fromEntries(excelRequestHeaders.map(header => [header, headerRow.indexOf(header)])) as Record<(typeof excelRequestHeaders)[number], number>;
  const missingHeaders = excelRequestHeaders.filter(header => columnIndexes[header] < 0);
  if (missingHeaders.length) return { requests: [], errors: [`缺少列：${missingHeaders.join("、")}。请重新下载模板填写。`] };

  const errors: string[] = [];
  const imported: SharedRequest[] = [];
  const dataRows = rows.slice(headerIndex + 1).map((row, offset) => ({ row, excelRow: headerIndex + offset + 2 })).filter(({ row }) => excelRequestHeaders.some(header => excelCellText(row[columnIndexes[header]])));
  if (!dataRows.length) return { requests: [], errors: ["文件中没有可导入的需求数据。"] };
  if (dataRows.length > 200) return { requests: [], errors: ["单次最多导入 200 个需求，请拆分文件后重试。"] };

  dataRows.forEach(({ row, excelRow }) => {
    const value = (header: (typeof excelRequestHeaders)[number]) => excelCellText(row[columnIndexes[header]]);
    const description = value("需求描述*");
    const policies = splitExcelList(value("Policy*"));
    const robots = splitExcelList(value("Robot*"));
    const objectModeLabel = value("物体使用方式*");
    const backgroundModeLabel = value("背景使用方式*");
    const priorityLabel = value("优先级*");
    const objectMode = objectModeLabel === "单独使用" ? "single" : objectModeLabel === "按组使用" ? "group" : null;
    const backgroundMode = backgroundModeLabel === "单独使用" ? "single" : backgroundModeLabel === "按组使用" ? "group" : null;
    const objectSets = objectMode ? parseExcelGroups(value("物体*"), objectMode) : [];
    const backgroundSets = backgroundMode ? parseExcelGroups(value("背景*"), backgroundMode) : [];
    const rowErrors: string[] = [];
    if (!description) rowErrors.push("需求描述不能为空");
    if (!policies.length) rowErrors.push("Policy 不能为空");
    if (!robots.length) rowErrors.push("Robot 不能为空");
    if (!objectMode) rowErrors.push("物体使用方式只能为“单独使用”或“按组使用”");
    if (!objectSets.length) rowErrors.push("物体不能为空");
    if (!backgroundMode) rowErrors.push("背景使用方式只能为“单独使用”或“按组使用”");
    if (!backgroundSets.length) rowErrors.push("背景不能为空");
    if (priorityLabel !== "普通" && priorityLabel !== "紧急") rowErrors.push("优先级只能为“普通”或“紧急”");
    const invalidPolicies = policies.filter(item => !policyCatalog.includes(item));
    const invalidRobots = robots.filter(item => !platformRobotNames.includes(item));
    const invalidObjects = objectSets.flat().filter(item => !objectCatalog.includes(item));
    const invalidBackgrounds = backgroundSets.flat().filter(item => !backgroundCatalog.includes(item));
    if (invalidPolicies.length) rowErrors.push(`未知 Policy：${invalidPolicies.join("、")}`);
    if (invalidRobots.length) rowErrors.push(`未知 Robot：${invalidRobots.join("、")}`);
    if (invalidObjects.length) rowErrors.push(`未知物体：${invalidObjects.join("、")}`);
    if (invalidBackgrounds.length) rowErrors.push(`未知背景：${invalidBackgrounds.join("、")}`);
    if (rowErrors.length || !objectMode || !backgroundMode) {
      errors.push(`第 ${excelRow} 行：${rowErrors.join("；")}`);
      return;
    }
    const objectGroups = objectSets.flatMap(objects => backgroundSets.map(backgrounds => ({ objects, backgrounds })));
    const objects = objectSets.flat();
    const backgrounds = backgroundSets.flat();
    imported.push({
      id: `REQ-${2090 + requestCount + imported.length}`,
      name: [...new Set(policies.map(getExperimentName))].join("、") + "需求",
      robot: robots.join("、"),
      object: objects.join("、"),
      background: backgrounds.join("、"),
      policy: policies.join("、"),
      priority: priorityLabel === "紧急" ? "高" : "普通",
      duration: "系统全局平均用时",
      expectedDate: "尽快",
      requester: "许晨",
      note: value("实验备注"),
      status: "待处理",
      tester: "待分配",
      scheduledTime: "等待管理员处理",
      description,
      policies,
      robotChoices: robots,
      objectGroups,
      objectSets,
      backgroundSets,
      objectMode,
      backgroundMode,
      combinationCount: Math.max(1, objectGroups.length * policies.length * robots.length),
      validationState: "待创建",
      workflowStatus: "待处理",
    });
  });
  return { requests: errors.length ? [] : imported, errors };
}

function ExcelImportModal({ requestCount, onImport, onClose }: { requestCount: number; onImport: (requests: SharedRequest[]) => void; onClose: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [requests, setRequests] = useState<SharedRequest[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [reading, setReading] = useState(false);

  async function selectFile(file?: File) {
    if (!file) return;
    setFileName(file.name);
    setReading(true);
    setRequests([]);
    setErrors([]);
    const result = await parseExcelRequests(file, requestCount);
    setRequests(result.requests);
    setErrors(result.errors);
    setReading(false);
  }

  return <div className="modal-backdrop" onMouseDown={onClose}>
    <section className="modal excel-import-modal" role="dialog" aria-modal="true" aria-labelledby="excel-import-title" aria-describedby="excel-import-description" onMouseDown={event => event.stopPropagation()}>
      <header className="excel-import-head"><span><FileSpreadsheet aria-hidden="true" /></span><div><h3 id="excel-import-title">Excel 批量创建实验需求</h3><p id="excel-import-description">按模板填写，一行创建一个需求；导入成功后统一进入“待处理”。</p></div><IconButton type="button" label="关闭 Excel 导入" icon={<X aria-hidden="true" />} onClick={onClose} /></header>
      <a className="excel-template-download" href="/templates/实验需求批量导入模板.xlsx" download><span><Download aria-hidden="true" /></span><div><strong>下载 Excel 模板</strong><small>包含当前表单字段、填写说明、分组选项和可选值</small></div><em>下载 .xlsx</em></a>
      <div className="excel-upload-zone" onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); void selectFile(event.dataTransfer.files[0]); }}>
        <input ref={inputRef} type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" aria-label="选择 Excel 文件" onChange={event => void selectFile(event.target.files?.[0])} />
        <Upload aria-hidden="true" />
        <strong>{fileName || "拖拽 Excel 到这里，或选择文件"}</strong>
        <span>{reading ? "正在读取并校验…" : fileName ? "可重新选择文件" : "仅支持 .xlsx，单次最多 200 个需求"}</span>
        <Button type="button" variant="secondary" onClick={() => inputRef.current?.click()}>{fileName ? "重新选择" : "选择 Excel"}</Button>
      </div>
      {requests.length > 0 && <div className="excel-import-result success" role="status"><CheckCircle2 aria-hidden="true" /><div><strong>校验通过，可创建 {requests.length} 个需求</strong><span>所有需求将沿用当前表单的数据结构，并进入“待处理”。</span></div></div>}
      {errors.length > 0 && <div className="excel-import-errors" role="alert"><AlertTriangle aria-hidden="true" /><div><strong>发现 {errors.length} 个问题，请修改后重新上传</strong><ul>{errors.slice(0, 5).map(error => <li key={error}>{error}</li>)}</ul>{errors.length > 5 && <span>另有 {errors.length - 5} 个问题未展开。</span>}</div></div>}
      <footer className="excel-import-foot"><span>导入前会整表校验；存在错误时不会创建任何需求。</span><div><Button type="button" variant="secondary" onClick={onClose}>取消</Button><Button type="button" disabled={!requests.length || reading} onClick={() => { onImport(requests); onClose(); }}>{requests.length ? `创建 ${requests.length} 个需求` : "创建需求"}</Button></div></footer>
    </section>
  </div>;
}

function ModernRequestModal({ requestCount, initialRequest, setRequests: _setRequests, robotPool, robotBlocks, testerBreaks, onSubmitWorkOrder, onClose }: { requestCount: number; initialRequest?: SharedRequest; setRequests: React.Dispatch<React.SetStateAction<SharedRequest[]>>; robotPool: Robot[]; robotBlocks: Record<string, RobotBlock[]>; testerBreaks: TesterBreak[]; onSubmitWorkOrder: (request: SharedRequest) => void; onClose: () => void }) {
  const isEditing = Boolean(initialRequest);
  const initialObjectMode = initialRequest?.objectMode || "single";
  const initialBackgroundMode = initialRequest?.backgroundMode || "single";
  const initialObjects = initialRequest?.objectSets?.length ? initialRequest.objectSets : initialRequest ? [[initialRequest.object]] : [[]];
  const initialBackgrounds = initialRequest?.backgroundSets?.length ? initialRequest.backgroundSets : initialRequest ? [[initialRequest.background]] : [[]];
  const [description, setDescription] = useState(initialRequest?.description || "");
  const [policies, setPolicies] = useState<string[]>(initialRequest?.policies?.length ? initialRequest.policies : initialRequest ? [initialRequest.policy] : []);
  const [selectedRobots, setSelectedRobots] = useState<string[]>(initialRequest?.robotChoices?.length ? initialRequest.robotChoices : initialRequest ? [initialRequest.robot] : []);
  const [objectSets, setObjectSets] = useState<string[][]>(initialObjectMode === "single" ? [[...new Set(initialObjects.flat())]] : initialObjects.map(group => [...group]));
  const [backgroundSets, setBackgroundSets] = useState<string[][]>(initialBackgroundMode === "single" ? [[...new Set(initialBackgrounds.flat())]] : initialBackgrounds.map(group => [...group]));
  const [objectMode, setObjectMode] = useState<"single" | "group">(initialObjectMode);
  const [backgroundMode, setBackgroundMode] = useState<"single" | "group">(initialBackgroundMode);
  const [priority, setPriority] = useState<"高" | "普通">(initialRequest?.priority || "普通");
  const [note, setNote] = useState(initialRequest?.note || "");
  const [submitted, setSubmitted] = useState(false);
  const hasObjects = objectSets.some(group => group.length);
  const hasBackgrounds = backgroundSets.some(group => group.length);
  const valid = description.trim() && policies.length && selectedRobots.length && hasObjects && hasBackgrounds;
  const updateGroup = (kind: "object" | "background", index: number, values: string[]) => kind === "object" ? setObjectSets(groups => groups.map((group, i) => i === index ? values : group)) : setBackgroundSets(groups => groups.map((group, i) => i === index ? values : group));
  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!valid) return;
    const id = initialRequest?.id || `REQ-${2090 + requestCount}`;
    const objects = objectSets.flat();
    const backgrounds = backgroundSets.flat();
    const normalizedObjectSets = objectMode === "single" ? objects.map(object => [object]) : objectSets.filter(group => group.length);
    const normalizedBackgroundSets = backgroundMode === "single" ? backgrounds.map(background => [background]) : backgroundSets.filter(group => group.length);
    const groupedPairs = normalizedObjectSets.flatMap(objectGroup => normalizedBackgroundSets.map(backgroundGroup => ({ objects: objectGroup, backgrounds: backgroundGroup })));
    const requestName = [...new Set(policies.map(getExperimentName))].join("、") + "需求";
    onSubmitWorkOrder({ ...initialRequest, id, name: requestName, robot: selectedRobots.join("、"), object: objects.join("、"), background: backgrounds.join("、"), policy: policies.join("、"), priority, duration: initialRequest?.duration || "系统全局平均用时", expectedDate: initialRequest?.expectedDate || "尽快", requester: initialRequest?.requester || "许晨", note, status: "待处理", tester: "待分配", scheduledTime: "等待管理员处理", description, policies, robotChoices: selectedRobots, objectGroups: groupedPairs, objectSets: normalizedObjectSets, backgroundSets: normalizedBackgroundSets, objectMode, backgroundMode, combinationCount: Math.max(1, groupedPairs.length * policies.length * selectedRobots.length), validationState: "待创建", processingError: undefined });
    setSubmitted(true);
    setTimeout(onClose, 700);
  }
  return <div className="modal-backdrop modern-request-backdrop"><form className={`modern-request-modal ${selectedRobots.length ? "calendar-open" : ""}`} role="dialog" aria-modal="true" aria-labelledby="new-request-title" aria-describedby="new-request-description" onSubmit={submit}>
    <header className="modern-request-head"><div className="modal-icon blue"><FlaskConical aria-hidden="true" /></div><div><h3 id="new-request-title">{isEditing ? "修改实验需求" : "提交实验需求"}</h3><p id="new-request-description">{isEditing ? `正在修改 ${initialRequest?.id}；保存后仍为“待处理”。` : "提交后立即进入“待处理”；管理员开始处理前仍可修改。"}</p></div><IconButton type="button" label="关闭" icon={<X aria-hidden="true" />} onClick={onClose} /></header>
    <div className="modern-request-body"><div className="modern-form-pane">
      <label className="modern-field"><span>需求描述 <b>*</b></span><textarea name="request-description" autoComplete="off" required placeholder="例如：验证透明水杯抓取成功率达到 90%…" value={description} onChange={event => setDescription(event.target.value)} /></label>
      <div className="modern-section"><div className="modern-label"><strong>Policy <b>*</b></strong><span>输入搜索 · 下拉多选</span></div><MultiSelectInput label="Policy" options={policyCatalog} selected={policies} onChange={setPolicies} placeholder="输入或选择 Policy" /></div>
      <div className="modern-section"><div className="modern-label"><strong>机器人 <b>*</b></strong><span>选择后在右侧查看排期</span></div><MultiSelectInput label="机器人" options={platformRobotNames} selected={selectedRobots} onChange={setSelectedRobots} placeholder="输入机器人名称并多选" meta={value => robotPool.find(robot => robot.name === value)?.status || "可用"} /></div>
      <p className="resource-library-note">若所需物体或背景不在资源库中，请先联系实验管理员确认后再提交需求。</p>
      <div className="resource-group-grid">
        <ResourceGroupEditor title="物体" options={objectCatalog} groups={objectSets} mode={objectMode} onModeChange={mode => { setObjectMode(mode); if (mode === "single") setObjectSets(groups => [[...new Set(groups.flat())]]); }} onUpdate={(index, values) => updateGroup("object", index, values)} onAdd={() => setObjectSets(groups => [...groups, []])} onRemove={index => setObjectSets(groups => groups.filter((_, i) => i !== index))} />
        <ResourceGroupEditor title="背景" options={backgroundCatalog} groups={backgroundSets} mode={backgroundMode} onModeChange={mode => { setBackgroundMode(mode); if (mode === "single") setBackgroundSets(groups => [[...new Set(groups.flat())]]); }} onUpdate={(index, values) => updateGroup("background", index, values)} onAdd={() => setBackgroundSets(groups => [...groups, []])} onRemove={index => setBackgroundSets(groups => groups.filter((_, i) => i !== index))} />
      </div>
      <label className="modern-field compact"><span>优先级</span><div className="select-control"><select name="request-priority" autoComplete="off" value={priority} onChange={event => setPriority(event.target.value as "高" | "普通")}><option value="普通">普通</option><option value="高">紧急</option></select><ChevronDown aria-hidden="true" /></div></label>
      <label className="modern-field note-field"><span>实验备注</span><textarea name="request-note" autoComplete="off" placeholder="例如：操作时避免遮挡相机视野…（可选）" value={note} onChange={event => setNote(event.target.value)} /></label>
    </div>{selectedRobots.length ? <MultiRobotSchedulePanel robots={selectedRobots} robotPool={robotPool} robotBlocks={robotBlocks} testerBreaks={testerBreaks} /> : <aside className="calendar-empty-side"><span><CalendarDays aria-hidden="true" /></span><strong>选择机器人后查看排期</strong><p>右侧将并列显示所有已选机器人的当天排期，并可切换日期。</p></aside>}</div>
    <footer className="modern-request-foot"><p>当前关系：物体{objectMode === "single" ? "分别使用" : "按组使用"}，背景{backgroundMode === "single" ? "分别使用" : "按组使用"}；管理员处理时将按此配置创建并关联实验。</p><div><Button type="button" variant="secondary" onClick={onClose}>取消</Button><Button type="submit" loading={submitted} disabled={!valid}>{submitted ? isEditing ? "修改已保存" : "需求已提交" : isEditing ? "保存修改" : "提交需求"}</Button></div></footer>
  </form></div>;
}

function ResourceGroupEditor({ title, options, groups, mode, onModeChange, onUpdate, onAdd, onRemove }: { title: string; options: string[]; groups: string[][]; mode: "single" | "group"; onModeChange: (mode: "single" | "group") => void; onUpdate: (index: number, values: string[]) => void; onAdd: () => void; onRemove: (index: number) => void }) {
  const selectedCount = groups.flat().length;
  return <section className="resource-group-editor"><div className="modern-label"><strong>{title}使用方式 <b>*</b></strong><span>{selectedCount ? `已选 ${selectedCount} 个` : "请选择"}</span></div><div className="resource-mode-switch" role="group" aria-label={`${title}使用方式`}><button type="button" aria-pressed={mode === "single"} className={mode === "single" ? "active" : ""} onClick={() => onModeChange("single")}><strong>单独使用</strong><small>每项进入不同实验</small></button><button type="button" aria-pressed={mode === "group"} className={mode === "group" ? "active" : ""} onClick={() => onModeChange("group")}><strong>按组使用</strong><small>同组作为一个整体</small></button></div>{mode === "single" ? <div className="single-resource-mode"><p>一次多选即可快速添加；系统会把每个{title}分别交给管理员排实验。</p><MultiSelectInput label={title} options={options} selected={groups.flat()} onChange={values => onUpdate(0, values)} placeholder={`输入或选择多个${title}`} /></div> : <div className="group-resource-mode"><p>每组可选择多个{title}；同一组会作为一个整体用于实验。</p>{groups.map((group, index) => <article key={index}><header><strong>{title}组 {index + 1}</strong>{groups.length > 1 && <button type="button" onClick={() => onRemove(index)}>移除</button>}</header><MultiSelectInput label={title} options={options} selected={group} onChange={values => onUpdate(index, values)} placeholder={`选择此组的${title}`} /></article>)}<button className="add-resource-group" type="button" onClick={onAdd}><Plus aria-hidden="true" />新增{title}组</button></div>}</section>;
}

function MultiRobotSchedulePanel({ robots: selectedRobots, robotPool, robotBlocks, testerBreaks }: { robots: string[]; robotPool: Robot[]; robotBlocks: Record<string, RobotBlock[]>; testerBreaks: TesterBreak[] }) {
  const [dayIndex, setDayIndex] = useState(0);
  const days = ["8月18日 今天", "8月19日 明天", "8月20日 后天", "8月21日 周五", "8月24日 周一"];
  const calendarHourHeight = 72;
  const calendarHeight = calendarHourHeight * 9;
  const calendarColumns = `62px repeat(${selectedRobots.length}, minmax(0, 1fr))`;
  const schedules = selectedRobots.map(robotName => ({ robotName, robot: robotPool.find(item => item.name === robotName), slots: getDispatchSchedule(robotName, dayIndex, robotPool, robotBlocks) }));
  return <aside className="robot-schedule-side multi-robot-schedule-side">
    <header><button type="button" className="today-button" onClick={() => setDayIndex(0)}>今天</button><IconButton type="button" label="前一天" icon={<ChevronLeft aria-hidden="true" />} disabled={dayIndex === 0} onClick={() => setDayIndex(index => Math.max(0, index - 1))} /><strong>{days[dayIndex]}</strong><IconButton type="button" label="后一天" icon={<ChevronRight aria-hidden="true" />} disabled={dayIndex === days.length - 1} onClick={() => setDayIndex(index => Math.min(days.length - 1, index + 1))} /></header>
    <div className="multi-calendar-scroll"><div className="multi-calendar" style={{ "--robot-count": selectedRobots.length, "--calendar-hour-height": `${calendarHourHeight}px`, "--calendar-height": `${calendarHeight}px` } as React.CSSProperties}>
      <div className="multi-calendar-head" style={{ gridTemplateColumns: calendarColumns }}><span>GMT+8</span>{schedules.map(item => <div key={item.robotName}><strong>{item.robotName}</strong><small>{item.slots.filter(isBookedSlot).length}/16 已排 · {item.robot?.status}</small></div>)}</div>
      <div className="multi-robot-calendar-grid" style={{ gridTemplateColumns: calendarColumns }}><div className="calendar-times">{Array.from({ length: 10 }, (_, index) => <span key={index} style={{ top: `${index * calendarHourHeight}px` }}>{10 + index}:00</span>)}</div>{schedules.map(item => <div className="calendar-track robot-calendar-column" key={item.robotName}><div className="calendar-lunch-block"><strong>默认休息</strong><span>12:00–13:00</span></div>{item.slots.map((slot, slotIndex) => ({ slot, slotIndex })).filter(entry => isBookedSlot(entry.slot)).map(({ slot, slotIndex }) => <button type="button" key={slot.id} className={`calendar-event batch-${slot.batchIndex} ${slot.status === "conflict" ? "conflict" : ""}`} title={`${slot.id} · ${slot.experimentName} · ${slot.requestId} · ${slot.requester} · ${slot.policy} · ${slotTimeLabel(slotIndex)}–${formatMinutes(slotStartMinutes(slotIndex) + 30)}`} style={{ top: `${((slotStartMinutes(slotIndex) - 10 * 60) / 60) * calendarHourHeight + 2}px`, height: `${calendarHourHeight / 2 - 4}px` }}><strong>{slot.id}</strong><span>{slot.experimentName} · {slot.policy.replace(" Policy", "")}</span><span className="schedule-hover-card" role="tooltip"><b>{slot.id} · {slot.experimentName}</b><em>{slot.requestId}</em><small>需求人：{slot.requester}</small><small>{slot.policy}</small><small>{slotTimeLabel(slotIndex)}–{formatMinutes(slotStartMinutes(slotIndex) + 30)}</small></span></button>)}{item.slots.map((slot, slotIndex) => ({ slot, slotIndex })).filter(entry => entry.slot.blocked && !entry.slot.constraint.includes("默认停用休息")).map(({ slot, slotIndex }) => <div className="calendar-custom-block" key={slot.id} style={{ top: `${((slotStartMinutes(slotIndex) - 10 * 60) / 60) * calendarHourHeight}px` }}><strong>不可排</strong><span>{slot.constraint}</span></div>)}</div>)}</div>
    </div></div><footer><span><i />已占用</span><b>已同时显示 {selectedRobots.length} 台 Robot</b></footer>
  </aside>;
}

function RobotSchedulePanel({ robots: selectedRobots, robotPool, robotBlocks, testerBreaks }: { robots: string[]; robotPool: Robot[]; robotBlocks: Record<string, RobotBlock[]>; testerBreaks: TesterBreak[] }) {
  const [activeRobot, setActiveRobot] = useState(selectedRobots[0]);
  const [dayIndex, setDayIndex] = useState(0);
  const currentRobot = selectedRobots.includes(activeRobot) ? activeRobot : selectedRobots[0];
  const days = ["8月18日 今天", "8月19日 明天", "8月20日 后天", "8月21日 周五", "8月24日 周一"];
  const schedule = getDispatchSchedule(currentRobot, dayIndex, robotPool, robotBlocks);
  const occupied = schedule.map((slot, slotIndex) => ({ slot, slotIndex })).filter(item => isBookedSlot(item.slot));
  const blockedSlots = schedule.map((slot, slotIndex) => ({ slot, slotIndex })).filter(item => item.slot.blocked && !item.slot.constraint.includes("默认停用休息"));
  return <aside className="robot-schedule-side"><header><button type="button" className="today-button" onClick={() => setDayIndex(0)}>今天</button><button type="button" aria-label="前一天" disabled={dayIndex === 0} onClick={() => setDayIndex(index => Math.max(0, index - 1))}>‹</button><strong>{days[dayIndex]}</strong><button type="button" aria-label="后一天" disabled={dayIndex === days.length - 1} onClick={() => setDayIndex(index => Math.min(days.length - 1, index + 1))}>›</button></header><div className="schedule-robot-tabs">{selectedRobots.map(robot => <button type="button" key={robot} className={robot === currentRobot ? "active" : ""} onClick={() => setActiveRobot(robot)}>{robot}</button>)}</div><div className="day-calendar"><div className="day-calendar-heading"><span>GMT+8</span><strong>{currentRobot}</strong><small>{occupied.length}/16 已排 · {robotPool.find(robot => robot.name === currentRobot)?.status} · 数据与管理员一致</small></div><div className="day-calendar-grid"><div className="calendar-times">{Array.from({ length: 10 }, (_, index) => <span key={index} style={{ top: `${index * 60}px` }}>{10 + index}:00</span>)}</div><div className="calendar-track"><div className="calendar-lunch-block"><strong>Robot 默认停用休息</strong><span>12:00–13:00 不可安排实验</span></div>{blockedSlots.map(({ slot, slotIndex }) => <div className="calendar-custom-block" key={`blocked-${slot.id}`} style={{ top: `${slotStartMinutes(slotIndex) - 10 * 60}px` }}><strong>不可排期</strong><span>{slot.constraint}</span></div>)}{occupied.map(({ slot, slotIndex }, index) => <button type="button" key={slot.id} className={`calendar-event tone-${index % 3} ${slot.status === "conflict" ? "conflict" : ""}`} style={{ top: `${slotStartMinutes(slotIndex) - 10 * 60 + 2}px`, height: "26px" }} title={`${slot.id} · ${slot.name} · ${slot.policy}${slot.constraint ? ` · ${slot.constraint}` : ""}`}><strong>{slot.name}</strong><span>{slot.policy.replace(" Policy", "")}</span></button>)}{dayIndex === 0 && <i className="calendar-now" style={{ top: "192px" }}><span>13:12</span></i>}</div></div></div><footer><span><i />已占用</span><span><i />可申请容量</span></footer></aside>;
}

function RequestRobotCalendar({ selectedRobots }: { selectedRobots: string[] }) {
  const [calendarRobot, setCalendarRobot] = useState(selectedRobots[0] || "");
  const activeRobot = selectedRobots.includes(calendarRobot) ? calendarRobot : selectedRobots[0];
  const robotIndex = Math.max(0, platformRobotNames.indexOf(activeRobot));
  const days = ["8月19日 周三", "8月20日 周四", "8月21日 周五", "8月24日 周一", "8月25日 周二", "8月26日 周三", "8月27日 周四"];
  const occupancy = days.map((_, dayIndex) => 6 + ((robotIndex * 3 + dayIndex * 5) % 11));
  if (!selectedRobots.length) return <section className="robot-calendar empty"><strong>机器人排期日历</strong><p>选择至少一台机器人后，在这里查看未来排期与占用情况。</p></section>;
  return <section className="robot-calendar"><div className="calendar-head"><div><strong>机器人 Capacity Plan</strong><span>10:00–19:00 · 12:00–13:00 休息 · 选择机器人查看未来 7 个工作日</span></div><div className="calendar-robot-tabs">{selectedRobots.map(robot => <button type="button" key={robot} className={activeRobot === robot ? "active" : ""} onClick={() => setCalendarRobot(robot)}>{robot}</button>)}</div></div><div className="calendar-days">{days.map((day,index) => <article key={day} className={occupancy[index] === 16 ? "full" : ""}><header><strong>{day}</strong><span>{occupancy[index]}/16</span></header><div className="calendar-meter"><i style={{width:`${occupancy[index] / 16 * 100}%`}} /></div><div className="calendar-slots">{Array.from({length:16},(_,slot) => <i key={slot} className={slot < occupancy[index] ? "busy" : "free"} title={`${workIndexTimeLabel(slot)} · ${slot < occupancy[index] ? "已占用" : "可申请"}`} />)}</div><footer><span>{16-occupancy[index]} 个可用</span><b>{occupancy[index] === 16 ? "已排满" : `最早 ${workIndexTimeLabel(occupancy[index])}`}</b></footer></article>)}</div></section>;
}

function TesterConsole({ assignedExperiments, leaves, testerBreaks, runningTimers, addLeave, startExperiment, finishExperiment, startBreak, endBreak }: { assignedExperiments: Experiment[]; leaves: LeaveRequest[]; testerBreaks: TesterBreak[]; runningTimers: Record<string, number>; addLeave: (leave: { start: string; end: string; reason: string }) => void; startExperiment: (id: string) => void; finishExperiment: (id: string) => void; startBreak: (tester: string, reason?: string) => void; endBreak: (tester: string) => void }) {
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [leave, setLeave] = useState({ start: "2026-08-19T10:00", end: "2026-08-19T19:00", reason: "个人事务" });
  const [clock, setClock] = useState(Date.now());
  const myTasks = assignedExperiments.filter(experiment => experiment.tester === "李莎");
  const activeTask = myTasks.find(r => r.status === "进行中") || myTasks.find(r => r.status === "已排期") || myTasks[0];
  const activeBreak = testerBreaks.find(item => item.tester === "李莎" && item.active);
  const timerStartedAt = activeTask ? runningTimers[activeTask.id] : undefined;
  const elapsedSeconds = timerStartedAt ? Math.max(0, Math.floor((clock - timerStartedAt) / 1000)) : 0;
  const elapsedLabel = `${String(Math.floor(elapsedSeconds / 60)).padStart(2, "0")}:${String(elapsedSeconds % 60).padStart(2, "0")}`;
  const breakElapsedSeconds = activeBreak ? Math.max(0, Math.floor((clock - activeBreak.startedAt) / 1000)) : 0;
  const breakElapsedLabel = `${String(Math.floor(breakElapsedSeconds / 60)).padStart(2, "0")}:${String(breakElapsedSeconds % 60).padStart(2, "0")}`;
  const calibratedDelayMinutes = Math.max(1, Math.ceil(breakElapsedSeconds / 60));
  const baseTasks = [
    { id: "EXP-1032", name: "抓取实验", robot: platformRobotNames[1], time: "10:00–10:30", policy: "Grasp Policy v4.2", status: "已完成" },
    { id: "EXP-1033", name: "叠布实验", robot: platformRobotNames[1], time: "10:30–11:00", policy: "Fold Cloth Policy v2.1", status: "已完成" },
    { id: "EXP-1034", name: "插电池实验", robot: platformRobotNames[0], time: "11:00–11:30", policy: "Battery Insert Policy v1.8", status: "已完成" },
  ];
  const queueTasks = [
    ...baseTasks.map(task => ({ ...task, conflicted: false })),
    ...myTasks.map(task => {
      const time = (activeBreak && task.status === "冲突" ? shiftScheduledTime(task.schedule, calibratedDelayMinutes) : task.schedule).replace("今天 ", "");
      return { id: task.id, name: task.name, robot: task.robot, time, policy: task.policy, status: task.status, conflicted: task.status === "冲突" };
    }),
  ].map(task => {
    const match = task.time.match(/(\d{1,2}):(\d{2})/);
    return { ...task, startMinutes: match ? Number(match[1]) * 60 + Number(match[2]) : 10 * 60 };
  }).sort((a, b) => a.startMinutes - b.startMinutes);
  const queueRows = Array.from({ length: (19 * 60 - 10 * 60) / 30 }, (_, index) => {
    const startMinutes = 10 * 60 + index * 30;
    return {
      startMinutes,
      time: `${formatMinutes(startMinutes)}–${formatMinutes(startMinutes + 30)}`,
      task: queueTasks.find(item => item.startMinutes === startMinutes),
    };
  });

  useEffect(() => {
    if (!timerStartedAt && !activeBreak) return;
    const timer = window.setInterval(() => setClock(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [timerStartedAt, activeBreak]);

  useEffect(() => {
    if (!leaveOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      keepFocusInActiveDialog(event);
      if (event.key === "Escape") setLeaveOpen(false);
    };
    document.body.classList.add("modal-open");
    focusActiveDialog();
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.classList.remove("modal-open");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [leaveOpen]);

  function saveLeave(e: React.FormEvent) { e.preventDefault(); addLeave(leave); setLeaveOpen(false); }

  return <div className="role-console tester-console">
    <section className="tester-hero"><div className="tester-intro"><span className="avatar-lg">LS</span><div><span className="eyebrow">TESTER · 李莎</span><h2>下午好，李莎</h2><p>今天最多 16 个实验容量 · 10:00–19:00 · 12:00–13:00 默认休息</p></div></div><div className="tester-hero-actions"><div className="break-status-group"><span className={`availability-pill ${activeBreak || leaves.some(item => item.status === "已批准") ? "leave" : ""}`}><i />{activeBreak ? "Break 中" : leaves.some(item => item.status === "已批准") ? "请假已批准" : "今日可用"}</span>{activeBreak && <strong className="hero-break-timer">{breakElapsedLabel}</strong>}</div><button className="create-btn secondary" onClick={() => activeBreak ? endBreak("李莎") : startBreak("李莎")}>{activeBreak ? "结束临时休息" : "临时休息 Break"}</button><button className="create-btn secondary" onClick={() => setLeaveOpen(true)}>＋ 请假申请</button></div></section>
    {activeTask && <section className="current-task"><div className="live-mark"><i />{activeTask.status === "进行中" ? "正在执行" : "下一项实验"}</div><div className="current-main"><div><span>{activeBreak && activeTask.status === "冲突" ? shiftScheduledTime(activeTask.schedule, calibratedDelayMinutes) : activeTask.schedule}</span><h2>{activeTask.name}</h2><p>{activeTask.id} · {activeTask.policy}</p></div><div className="task-resource"><small>{activeTask.status === "进行中" ? "已运行时间" : activeBreak ? "动态校准后" : "执行资源"}</small><strong className={activeTask.status === "进行中" ? "running-timer" : ""}>{activeTask.status === "进行中" ? elapsedLabel : activeTask.robot}</strong><span>{activeTask.status === "进行中" ? "计时从点击开始实验后启动" : activeBreak ? `预计顺延 ${calibratedDelayMinutes} 分钟` : "预计约 30 分钟"}</span></div></div><div className="task-actions">{activeTask.status !== "进行中" ? <button onClick={() => startExperiment(activeTask.id)} disabled={Boolean(activeBreak)}>开始实验并计时</button> : <button className="complete" onClick={() => finishExperiment(activeTask.id)}>结束实验</button>}</div></section>}
    <div className="tester-grid"><section className="panel my-schedule"><div className="section-head"><div><h2>我的 Live Queue</h2><p>仅展示管理员创建并分配给李莎的 EXP 实验 · 排期随资源状态动态更新</p></div><button className="quiet">今天 · 8月18日</button></div><div className="task-list">{queueRows.map(row => row.task ? <article key={row.task.id} className={row.task.conflicted ? "conflicted" : ""}><time>{row.task.time}</time><span className={`task-line ${row.task.status === "已完成" ? "done" : row.task.status === "进行中" ? "live" : ""}`} /><div><strong>{row.task.name}</strong><small>{row.task.id} · {row.task.policy}{activeBreak && row.task.conflicted ? " · 动态校准中" : ""}</small></div><b>{row.task.robot}</b><SharedStatus value={row.task.status} /></article> : <article className="empty" key={`empty-${row.startMinutes}`} aria-label={`${row.time} 无实验安排`}><time>{row.time}</time><span className="task-line" /><div aria-hidden="true" /><b aria-hidden="true" /></article>)}</div></section>
    <section className="panel availability-card"><div className="section-head"><div><h2>我的可用时间</h2><p>请假需要管理员审批；Break 立即生效</p></div></div><div className="availability-summary">{(activeBreak || leaves.some(item => item.status === "待审批")) && <span className="leave"><i />{activeBreak ? "临时 Break 中" : "请假等待审批"}</span>}<strong>{leaves.length}</strong><small>条请假申请记录</small></div><div className="leave-list">{leaves.length ? leaves.map(l => <article className="leave-record" key={l.id}><span className="leave-record-icon" aria-hidden="true">假</span><div className="leave-record-copy"><strong>{l.start.replace("T"," ")} → {l.end.replace("T"," ")}</strong><small>{l.reason}</small></div><SharedLeaveStatus value={l.status} /></article>) : <div className="empty-leave"><span>✓</span><strong>暂无请假安排</strong><p>你的实验任务可正常分配</p></div>}</div></section></div>
    {leaveOpen && <div className="modal-backdrop"><form className="modal leave-form" role="dialog" aria-modal="true" aria-labelledby="leave-title" aria-describedby="leave-description" onSubmit={saveLeave}><div className="modal-icon amber"><CalendarDays aria-hidden="true" /></div><h3 id="leave-title">提交请假申请</h3><p id="leave-description">申请提交后由实验管理员审批；批准时系统会自动改派 Tester 并重新计算实验安排。</p><div className="form-grid"><label className="wide"><span>开始时间</span><input name="leave-start" autoComplete="off" type="datetime-local" value={leave.start} onChange={e => setLeave({...leave,start:e.target.value})} /></label><label className="wide"><span>结束时间</span><input name="leave-end" autoComplete="off" type="datetime-local" value={leave.end} onChange={e => setLeave({...leave,end:e.target.value})} /></label><label className="wide"><span>原因</span><input name="leave-reason" autoComplete="off" placeholder="例如：个人事务…" value={leave.reason} onChange={e => setLeave({...leave,reason:e.target.value})} /></label></div><div className="modal-actions"><Button type="button" variant="secondary" onClick={() => setLeaveOpen(false)}>取消</Button><Button className="leave-submit" type="submit">提交审批</Button></div></form></div>}
  </div>;
}

function RobotManagementDrawerView({ robot, workConfig, schedule, onSave, onExperiment }: { robot: Robot; workConfig: RobotScheduleConfig; schedule: ReturnType<typeof getDispatchSchedule>; onSave: (status: RobotStatusSetting, config: RobotScheduleConfig) => void; onExperiment: (experiment: Experiment) => void }) {
  const [tab, setTab] = useState<"info" | "settings">("info");
  const [statusSetting, setStatusSetting] = useState<RobotStatusSetting>(() => getRobotStatusSetting(robot));
  const effectiveConfig = robot.scheduleConfig || workConfig;
  const [localConfig, setLocalConfig] = useState<RobotScheduleConfig>(effectiveConfig);
  const scheduled = schedule.map((slot, slotIndex) => ({ slot, slotIndex })).filter(item => isBookedSlot(item.slot));
  const localWorkMinutes = Math.max(0, timeValueMinutes(localConfig.workEnd) - timeValueMinutes(localConfig.workStart));
  const localBreakMinutes = Math.max(0, timeValueMinutes(localConfig.breakEnd) - timeValueMinutes(localConfig.breakStart));
  const localDailyLimit = Math.max(1, Math.floor((localWorkMinutes - localBreakMinutes) / localConfig.averageDuration));
  return <>
    <div className="drawer-content-body">
    <div className="drawer-kicker">ROBOT 管理 · 数据与排期同步</div><h2>{robot.name}</h2>
    <div className="drawer-tabs" role="tablist" aria-label="Robot 信息视图"><button type="button" role="tab" aria-selected={tab === "info"} className={tab === "info" ? "active" : ""} onClick={() => setTab("info")}>当前信息</button><button type="button" role="tab" aria-selected={tab === "settings"} className={tab === "settings" ? "active" : ""} onClick={() => setTab("settings")}>设置</button></div>
    {tab === "info" ? <div className="robot-info-tab">
      <div className="drawer-title"><h3>运行概览</h3><StatusBadge value={robot.status} /></div>
      <div className="drawer-metrics"><div><span>今日利用率</span><strong>{robot.capacity ? `${robot.utilization}%` : "—"}</strong></div><div><span>已排 / 容量</span><strong>{robot.scheduled} / {robot.capacity || "—"}</strong></div><div><span>下次可用</span><strong>{robot.next}</strong></div></div>
      <section className="drawer-info-section"><h3>今日实验安排</h3><div className="drawer-schedule">{scheduled.length ? scheduled.map(({ slot, slotIndex }) => { const experiment = scheduleSlotToExperiment(slot, slotIndex); return <button key={slot.id} onClick={() => onExperiment(experiment)}><span>{slotTimeLabel(slotIndex)}</span><div><strong>{slot.id} · {slot.experimentName}</strong><small>{slot.requestId} · {slot.policy}</small></div><StatusBadge value={experiment.status} /></button>; }) : <div className="drawer-empty-schedule">今日暂无实验安排</div>}</div></section>
    </div> : <div className="robot-settings-tab">
      <div className="global-config-reference"><span>平台默认配置</span><strong>{workConfig.workStart}–{workConfig.workEnd} · 停用 {workConfig.breakStart}–{workConfig.breakEnd}</strong><small>平均 {workConfig.averageDuration} 分钟 / 实验。批量设置或单机保存只覆盖对应 Robot。</small></div>
      <label className="drawer-field"><span>状态设置</span><select name="robot-status-setting" value={statusSetting} onChange={event => setStatusSetting(event.target.value as RobotStatusSetting)}><option value="在线">在线（根据排期显示状态）</option><option value="已暂停">已暂停</option><option value="维护中">维护中</option></select></label>
      <section className="robot-local-config"><div className="drawer-section-title"><h3>每日时间配置</h3><Badge tone="info">单机覆盖</Badge></div><div className="robot-local-config-grid"><label><span>每日工作开始</span><input type="time" value={localConfig.workStart} onChange={event => setLocalConfig(config => ({ ...config, workStart: event.target.value }))} /></label><label><span>每日工作结束</span><input type="time" value={localConfig.workEnd} onChange={event => setLocalConfig(config => ({ ...config, workEnd: event.target.value }))} /></label><label><span>停用时间开始</span><input type="time" value={localConfig.breakStart} onChange={event => setLocalConfig(config => ({ ...config, breakStart: event.target.value }))} /></label><label><span>停用时间结束</span><input type="time" value={localConfig.breakEnd} onChange={event => setLocalConfig(config => ({ ...config, breakEnd: event.target.value }))} /></label><label className="wide"><span>平均实验时长</span><select value={localConfig.averageDuration} onChange={event => setLocalConfig(config => ({ ...config, averageDuration: Number(event.target.value) }))}><option value={30}>30 分钟</option><option value={45}>45 分钟</option><option value={60}>60 分钟</option></select></label></div><div className="local-capacity-preview"><span>预计每日可排容量</span><strong>{localDailyLimit} 个实验</strong></div></section>
    </div>}
    </div>
    {tab === "settings" && <footer className="drawer-action-bar" aria-label="Robot 设置操作"><span className="drawer-action-hint">保存后仅更新当前 Robot 并重新计算容量</span><div><Button onClick={() => onSave(statusSetting, localConfig)}>保存并确认</Button></div></footer>}
  </>;
}

function RobotManagementDrawer({ robot, blocks, workConfig, onSave, onAddBlock, onExperiment }: { robot: Robot; blocks: RobotBlock[]; workConfig: { workStart: string; workEnd: string; breakStart: string; breakEnd: string; averageDuration: number }; onSave: (status: Robot["status"], defaultTester: string, backupTesters: string[]) => void; onAddBlock: (block: Omit<RobotBlock, "id">) => void; onExperiment: () => void }) {
  const [tab, setTab] = useState<"info" | "settings">("info");
  const [status, setStatus] = useState<Robot["status"]>(robot.status);
  const [defaultTester, setDefaultTester] = useState(robot.defaultTester || robot.tester);
  const [backupTesters, setBackupTesters] = useState(robot.backupTesters || []);
  const [newBlock, setNewBlock] = useState({ start: "15:00", end: "15:30", reason: "临时维护" });
  const activeBlocks = blocks.length ? blocks : [{ id: 1, start: workConfig.breakStart, end: workConfig.breakEnd, reason: "默认停用休息" }];
  return <><div className="drawer-kicker">ROBOT 管理 · {robot.status}</div><h2>{robot.name}</h2><div className="drawer-tabs" role="tablist"><button className={tab === "info" ? "active" : ""} onClick={() => setTab("info")}>当前信息</button><button className={tab === "settings" ? "active" : ""} onClick={() => setTab("settings")}>设置</button></div>{tab === "info" ? <div className="robot-info-tab"><div className="drawer-title"><strong>运行概览</strong><StatusBadge value={robot.status} /></div><div className="drawer-metrics"><div><span>今日利用率</span><strong>{robot.capacity ? `${robot.utilization}%` : "—"}</strong></div><div><span>已排 / 容量</span><strong>{robot.scheduled} / {robot.capacity || "—"}</strong></div><div><span>下次可用</span><strong>{robot.next}</strong></div></div><section className="drawer-info-section"><h3>工作与停用规则</h3><dl className="details"><div><dt>每日工作时间</dt><dd>{workConfig.workStart}–{workConfig.workEnd}</dd></div><div><dt>默认停用休息</dt><dd>{workConfig.breakStart}–{workConfig.breakEnd}</dd></div><div><dt>实验平均用时</dt><dd>{workConfig.averageDuration} 分钟</dd></div><div><dt>每日最大容量</dt><dd>{robot.capacity || 0} 个实验</dd></div></dl></section><section className="drawer-info-section"><h3>Tester 配置</h3><dl className="details"><div><dt>默认 Tester</dt><dd>{robot.defaultTester || robot.tester}</dd></div><div><dt>备用 Tester</dt><dd>{(robot.backupTesters || []).join("、") || "未设置"}</dd></div></dl></section><section className="drawer-info-section"><h3>今日实验安排</h3><div className="drawer-schedule">{[["10:00","EXP-1024","已完成"],["14:00",robot.current === "—" ? "暂无实验" : robot.current,robot.status],["18:00","EXP-1081","待执行"]].map(item => <button key={item[0]} onClick={onExperiment}><span>{item[0]}</span><div><strong>{item[1]}</strong><small>Tester · {robot.tester}</small></div><StatusBadge value={item[2]} /></button>)}</div></section></div> : <div className="robot-settings-tab"><div className="settings-callout"><strong>单机设置</strong><p>此处只调整当前 Robot。工作时间、默认休息和平均用时来自 Robot 管理中的批量配置。</p></div><label className="drawer-field"><span>Robot 状态</span><select value={status} onChange={event => setStatus(event.target.value as Robot["status"])}><option>运行中</option><option>空闲</option><option>已暂停</option><option>维护中</option></select><small>停用或维护后，系统会重新计算受影响的未执行实验。</small></label><label className="drawer-field"><span>默认 Tester</span><select value={defaultTester} onChange={event => { setDefaultTester(event.target.value); setBackupTesters(items => items.filter(item => item !== event.target.value)); }}>{sharedTesterNames.map(tester => <option key={tester}>{tester}</option>)}</select><small>自动排期时优先分配，需具备当前 Robot 操作权限。</small></label><div className="drawer-field"><span>备用 Tester</span><div className="tester-checkbox-grid">{sharedTesterNames.filter(tester => tester !== defaultTester).map(tester => <label key={tester}><input type="checkbox" checked={backupTesters.includes(tester)} onChange={() => setBackupTesters(items => items.includes(tester) ? items.filter(item => item !== tester) : [...items, tester])} />{tester}</label>)}</div><small>默认 Tester 不可用时按此列表自动重新匹配。</small></div><section className="drawer-block-settings"><h3>额外不可排时段</h3><div className="robot-block-list">{activeBlocks.map(block => <div key={block.id}><span>{block.start}–{block.end}</span><div><strong>{block.reason}</strong><small>{block.reason.includes("默认") || block.reason.includes("批量") ? "批量规则 · 每日生效" : "单机规则 · 已同步排期"}</small></div></div>)}</div><div className="robot-block-form"><div><label><span>开始</span><input type="time" value={newBlock.start} onChange={event => setNewBlock({ ...newBlock, start: event.target.value })} /></label><label><span>结束</span><input type="time" value={newBlock.end} onChange={event => setNewBlock({ ...newBlock, end: event.target.value })} /></label></div><label><span>原因</span><input value={newBlock.reason} onChange={event => setNewBlock({ ...newBlock, reason: event.target.value })} /></label><button onClick={() => onAddBlock(newBlock)}>＋ 添加不可排时段</button></div></section><div className="drawer-save-bar"><span>保存后会立即同步到管理员与需求方排期。</span><button onClick={() => onSave(status, defaultTester, backupTesters)}>保存并确认</button></div></div>}</>;
}

function RobotDrawer({ robot, blocks, onStatusChange, onTestersChange, onAddBlock, onExperiment }: { robot: Robot; blocks: RobotBlock[]; onStatusChange: (status: Robot["status"]) => void; onTestersChange: (defaultTester: string, backupTesters: string[]) => void; onAddBlock: (block: Omit<RobotBlock, "id">) => void; onExperiment: () => void }) {
  const [newBlock, setNewBlock] = useState({ start: "16:00", end: "16:30", reason: "临时停用" });
  return <><div className="drawer-kicker">ROBOT 管理 · 仅实验管理员可编辑</div><h2>{robot.name}</h2><div className="robot-status-control"><StatusBadge value={robot.status} /><label><span>排期状态</span><select value={robot.status} onChange={event => onStatusChange(event.target.value as Robot["status"])}><option>运行中</option><option>空闲</option><option>已暂停</option><option>维护中</option></select></label></div><div className="drawer-metrics"><div><span>今日利用率</span><strong>{robot.capacity ? `${robot.utilization}%` : "—"}</strong></div><div><span>已排 / 容量</span><strong>{robot.scheduled} / {robot.capacity || "—"}</strong></div><div><span>下次可用</span><strong>{robot.status === "维护中" ? "待管理员恢复" : robot.next}</strong></div></div><h3>不可排时段</h3><div className="robot-block-list">{blocks.map(block => <div key={block.id}><span>{block.start}–{block.end}</span><div><strong>{block.reason}</strong><small>{block.reason.includes("默认") ? "系统默认 · 每日生效" : "管理员设置 · 已同步排期"}</small></div></div>)}</div><div className="robot-block-form"><div><label><span>开始</span><input type="time" value={newBlock.start} onChange={event => setNewBlock({ ...newBlock, start: event.target.value })} /></label><label><span>结束</span><input type="time" value={newBlock.end} onChange={event => setNewBlock({ ...newBlock, end: event.target.value })} /></label></div><label><span>原因</span><input value={newBlock.reason} onChange={event => setNewBlock({ ...newBlock, reason: event.target.value })} /></label><button onClick={() => onAddBlock(newBlock)}>＋ 添加不可排时段</button></div><h3>今日实验安排</h3><div className="drawer-schedule">{[["11:00","EXP-1024","已完成"],["14:00",robot.current === "—" ? "暂无实验" : robot.current,robot.status],["18:00","EXP-1081","待执行"]].map(x => <button key={x[0]} onClick={onExperiment}><span>{x[0]}</span><div><strong>{x[1]}</strong><small>Tester · {robot.tester}</small></div><StatusBadge value={x[2]} /></button>)}</div><h3>分配信息</h3><dl className="details"><div><dt>当前 Tester</dt><dd>{robot.tester}</dd></div><div><dt>工作跨度</dt><dd>10:00–19:00</dd></div><div><dt>默认停用休息</dt><dd>12:00–13:00</dd></div><div><dt>实际工作容量</dt><dd>8 小时 / 16 Experiments</dd></div><div><dt>剩余容量</dt><dd>{Math.max(0, robot.capacity - robot.scheduled)} 个实验</dd></div></dl></>;
}

function ExperimentDrawerWithRequest({ experiment: e, onBack }: { experiment: Experiment; onBack?: () => void }) {
  return <>
    <div className="drawer-content-body">
    <header className="experiment-drawer-head">{onBack && <Button className="drawer-back" variant="tertiary" size="sm" leadingIcon={<ArrowLeft aria-hidden="true" />} onClick={onBack}>返回 Robot 详情</Button>}<div className="drawer-kicker">实验详情 · {e.requestId || "关联需求"}</div><h2>{e.id}</h2><div className="drawer-title"><strong>{e.name}</strong><span className={`priority ${e.priority === "高" ? "high" : ""}`}>{e.priority}优先级</span></div><StatusBadge value={e.status} /></header>
    <section className="experiment-request-card"><span>来源需求</span><strong>{e.requestId || "—"}</strong><p>{e.requestDescription || "验证 Policy 在目标场景中的执行稳定性。"}</p><div><span>需求人</span><b>{e.requester || "许晨"}</b></div></section>
    <section className="drawer-info-section experiment-config-section"><h3>实验配置</h3><dl className="details"><div><dt>Robot</dt><dd>{e.robot}</dd></div><div><dt>物体</dt><dd>{e.object}</dd></div><div><dt>背景</dt><dd>{e.background}</dd></div><div><dt>Policy</dt><dd>{e.policy}</dd></div><div><dt>预计时长</dt><dd>{e.duration}</dd></div><div><dt>系统排期</dt><dd>{e.schedule}</dd></div></dl></section>
    <div className="drawer-note success"><strong>排期已同步</strong><p>该实验与来源需求已经关联，Robot 和时间信息已同步。</p></div>
    </div>
  </>;
}

function ExperimentDrawer({ experiment: e, onAssignTester }: { experiment: Experiment; onAssignTester: (tester: string) => void }) {
  const [tester, setTester] = useState(sharedTesterNames[0]);
  const needsTester = e.tester === "待分配" || e.status === "冲突";
  return <><div className="drawer-kicker">实验详情 · 系统自动排期</div><h2>{e.id}</h2><div className="drawer-title"><strong>{e.name}</strong><span className={`priority ${e.priority === "高" ? "high" : ""}`}>{e.priority}优先级</span></div><StatusBadge value={needsTester ? "等待资源" : e.status} /><h3>实验配置</h3><dl className="details"><div><dt>Robot</dt><dd>{e.robot}</dd></div><div><dt>物体</dt><dd>{e.object}</dd></div><div><dt>背景</dt><dd>{e.background}</dd></div><div><dt>Policy</dt><dd>{e.policy}</dd></div><div><dt>Tester</dt><dd>{e.tester}</dd></div><div><dt>预计时长</dt><dd>{e.duration}</dd></div><div><dt>系统排期</dt><dd>{e.schedule}</dd></div></dl>{needsTester ? <div className="tester-assignment-box"><strong>需要指定 Tester</strong><p>系统已确定 Robot 与时间，但没有匹配到具备操作权限且当前可用的实验员。</p><label><span>选择 Tester</span><select value={tester} onChange={event => setTester(event.target.value)}>{sharedTesterNames.map(name => <option key={name}>{name}</option>)}</select></label><button onClick={() => onAssignTester(tester)}>确认指定 Tester</button></div> : <div className="drawer-note success"><strong>自动排期完成</strong><p>Robot、Tester 和时间均由系统匹配，无需管理员调整排期。</p></div>}</>;
}

function LegacyExperimentDrawer({ experiment: e, onSchedule }: { experiment: Experiment; onSchedule: () => void }) {
  return <><div className="drawer-kicker">实验详情</div><h2>{e.id}</h2><div className="drawer-title"><strong>{e.name}</strong><span className={`priority ${e.priority === "高" ? "high" : ""}`}>{e.priority}优先级</span></div><StatusBadge value={e.status} /><h3>实验配置</h3><dl className="details"><div><dt>Robot</dt><dd>{e.robot}</dd></div><div><dt>物体</dt><dd>{e.object}</dd></div><div><dt>背景</dt><dd>{e.background}</dd></div><div><dt>策略</dt><dd>{e.policy}</dd></div><div><dt>Tester</dt><dd>{e.tester}</dd></div><div><dt>预计时长</dt><dd>{e.duration}</dd></div><div><dt>排期</dt><dd>{e.schedule}</dd></div></dl><div className="drawer-note"><strong>排期检查</strong><p>{e.priority === "高" ? "高优先级实验。插入今日排期将影响后续实验，请先查看影响范围。" : "当前资源满足要求，可按计划执行。"}</p></div><button className="wide-primary" onClick={onSchedule}>{e.schedule === "尚未排期" ? "安排实验" : "调整排期"}</button></>;
}
