"use client";

import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";

type Robot = {
  name: string; status: "运行中" | "空闲" | "已暂停" | "维护中"; tester: string;
  scheduled: number; capacity: number; utilization: number; current: string; next: string;
  defaultTester?: string; backupTesters?: string[];
};

type Experiment = {
  id: string; name: string; robot: string; tester: string; duration: string; priority: "高" | "普通";
  object: string; background: string; policy: string; schedule: string; status: string;
  requestId?: string; requester?: string; requestDescription?: string;
};

type ConsoleRole = "manager" | "requester" | "tester";
type LeaveRequest = { id: number; tester: string; start: string; end: string; reason: string; status: "待审批" | "已批准" | "已拒绝" };
type TesterBreak = { id: number; tester: string; start: string; startedAt: number; reason: string; active: boolean; endedAt?: number; durationSeconds?: number };
type RobotBlock = { id: number; start: string; end: string; reason: string };
type SharedRequest = {
  id: string; name: string; robot: string; object: string; background: string; policy: string;
  priority: "高" | "普通"; duration: string; expectedDate: string; requester: string; note: string;
  status: "待审核" | "已排期" | "进行中" | "已完成" | "冲突"; tester: string; scheduledTime: string;
  description?: string; policies?: string[]; robotChoices?: string[];
  objectGroups?: { objects: string[]; backgrounds: string[] }[]; combinationCount?: number;
  objectSets?: string[][]; backgroundSets?: string[][];
  objectMode?: "single" | "group"; backgroundMode?: "single" | "group";
};

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
  { id: "REQ-2088", name: "抓取实验需求", robot: platformRobotNames[0], object: "透明水杯、马克杯", background: "厨房台面", policy: "Grasp Policy v4.2", priority: "高", duration: "30 分钟/实验", expectedDate: "8月18日", requester: "许晨", note: "验证新 Policy 的透明物体抓取成功率", status: "已排期", tester: "陈哲", scheduledTime: "今天 17:30–18:00", description: "验证机械臂对透明及反光容器的稳定抓取能力，并记录不同物体下的成功率。", policies: ["Grasp Policy v4.2"], robotChoices: [platformRobotNames[0]], objectGroups: [{ objects: ["透明水杯", "马克杯"], backgrounds: ["厨房台面"] }], objectSets: [["透明水杯"], ["马克杯"]], backgroundSets: [["厨房台面"]], objectMode: "single", backgroundMode: "single", combinationCount: 2 },
  { id: "REQ-2083", name: "插电池实验需求", robot: platformRobotNames[1], object: "圆柱电池", background: "电池仓场景", policy: "Battery Insert Policy v1.8", priority: "普通", duration: "30 分钟", expectedDate: "8月18日", requester: "许晨", note: "", status: "已排期", tester: "李莎", scheduledTime: "今天 16:30–17:00", description: "验证机器人识别电池正负极并准确插入电池仓的稳定性。", policies: ["Battery Insert Policy v1.8"], robotChoices: [platformRobotNames[1]], objectSets: [["圆柱电池"]], backgroundSets: [["电池仓场景"]], objectMode: "single", backgroundMode: "single" },
  { id: "REQ-2076", name: "叠布实验需求", robot: platformRobotNames[2], object: "方巾、毛巾", background: "标准桌面", policy: "Fold Cloth Policy v2.1", priority: "普通", duration: "30 分钟", expectedDate: "8月17日", requester: "许晨", note: "", status: "进行中", tester: "林超", scheduledTime: "今天 14:00–14:30", description: "验证机器人对不同尺寸布料的对齐、折叠和堆放能力。", policies: ["Fold Cloth Policy v2.1"], robotChoices: [platformRobotNames[2]], objectSets: [["方巾"], ["毛巾"]], backgroundSets: [["标准桌面"]], objectMode: "single", backgroundMode: "single" },
  { id: "REQ-2061", name: "抓取实验需求", robot: platformRobotNames[4], object: "彩色积木", background: "标准桌面", policy: "Grasp Policy v4.2", priority: "普通", duration: "30 分钟", expectedDate: "8月16日", requester: "许晨", note: "", status: "已完成", tester: "王睿", scheduledTime: "8月16日 15:00–15:30", description: "验证机器人连续抓取不同形状积木并放入目标区域的稳定性。", policies: ["Grasp Policy v4.2"], robotChoices: [platformRobotNames[4]], objectSets: [["彩色积木"]], backgroundSets: [["标准桌面"]], objectMode: "single", backgroundMode: "single" },
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
  { id: "EXP-3083", name: "插电池实验", robot: platformRobotNames[1], tester: "李莎", duration: "30 分钟", priority: "普通", object: "圆柱电池", background: "电池仓场景", policy: "Battery Insert Policy v1.8", schedule: "今天 16:30–17:00", status: "已排期" },
  { id: "EXP-3088", name: "抓取实验", robot: platformRobotNames[0], tester: "陈哲", duration: "30 分钟", priority: "高", object: "透明水杯", background: "厨房台面", policy: "Grasp Policy v4.2", schedule: "今天 17:30–18:00", status: "已排期" },
  { id: "EXP-3089", name: "抓取实验", robot: platformRobotNames[0], tester: "陈哲", duration: "30 分钟", priority: "高", object: "马克杯", background: "厨房台面", policy: "Grasp Policy v4.2", schedule: "今天 18:00–18:30", status: "已排期" },
];

const policyTests = ["抓取实验", "叠布实验", "插电池实验"];
const policyCatalog = ["Grasp Policy v4.2", "Fold Cloth Policy v2.1", "Battery Insert Policy v1.8"];
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

robots.forEach((robot, index) => {
  robot.defaultTester = robot.tester === "—" || robot.tester === "待分配" ? sharedTesterNames[index % sharedTesterNames.length] : robot.tester;
  robot.backupTesters = [sharedTesterNames[(index + 1) % sharedTesterNames.length], sharedTesterNames[(index + 2) % sharedTesterNames.length]];
});

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

function getDispatchSchedule(robotName: string, dayIndex: number, robotPool: Robot[] = robots, testerBreaks: TesterBreak[] = [], robotBlocks: Record<string, RobotBlock[]> = {}) {
  const robot = robotPool.find(item => item.name === robotName);
  const robotDisabled = robot?.status === "维护中" || robot?.status === "已暂停";
  const activeBreak = testerBreaks.find(item => item.active && item.tester === robot?.tester);
  return getRobotSchedule(robotName, dayIndex).map((slot, index) => {
    if (robotDisabled) return { ...slot, available: false, blocked: true, name: "Robot 停用", sub: "不可排期", policy: "维护 / 停用", tester: "—", constraint: robot?.status || "停用", status: "conflict" };
    const slotMinutes = slotStartMinutes(index);
    const customBlock = (robotBlocks[robotName] || []).find(block => {
      const [startHour, startMinute] = block.start.split(":").map(Number);
      const [endHour, endMinute] = block.end.split(":").map(Number);
      return slotMinutes >= startHour * 60 + startMinute && slotMinutes < endHour * 60 + endMinute;
    });
    if (customBlock && !customBlock.reason.includes("默认")) return { ...slot, available: false, blocked: true, name: "Robot 停用", sub: "不可排期", policy: "停用时段", tester: "—", constraint: customBlock.reason, status: "conflict" };
    if (dayIndex === 0 && robotName === platformRobotNames[4] && index === 15 && !slot.available && !slot.blocked) return { ...slot, tester: "待分配", constraint: "未找到具备当前 Robot 权限的可用 Tester", status: "conflict" };
    if (activeBreak && index >= 7 && !slot.available && !slot.blocked) {
      const replacement = (robot?.backupTesters || []).find(tester => tester !== activeBreak.tester);
      return replacement ? { ...slot, constraint: `${activeBreak.tester} Break，已自动改派`, status: "scheduled", tester: replacement } : { ...slot, constraint: "暂无具备权限的可用 Tester", status: "conflict", tester: "待分配" };
    }
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
    return { name, slots: getDispatchSchedule(robotName, 0, robotPool, testerBreaks, robotBlocks) };
  });
}

const attention = [
  { icon: "人", kind: "Tester 未匹配", title: "1 个实验等待指定 Tester", desc: "系统没有找到同时可用且具备该 Robot 操作权限的实验员，只需补充 Tester。", action: "指定 Tester", tone: "amber" },
];

const consoles: { id: ConsoleRole; label: string; icon: string; hint: string }[] = [
  { id: "manager", label: "实验管理员控制台", icon: "管", hint: "排期与冲突管理" },
  { id: "requester", label: "实验需求方控制台", icon: "需", hint: "提交与追踪需求" },
  { id: "tester", label: "实验员控制台", icon: "验", hint: "执行任务与请假" },
];

function StatusBadge({ value }: { value: string }) {
  const map: Record<string, string> = { "运行中": "green", "空闲": "blue", "已暂停": "amber", "维护中": "gray", "未排期": "amber", "可排期": "green", "等待资源": "red" };
  return <span className={`badge ${map[value] || "gray"}`}><i />{value}</span>;
}

export default function Home() {
  const [activeConsole, setActiveConsole] = useState<ConsoleRole>("manager");
  const [managerPage, setManagerPage] = useState<"operations" | "requests">("operations");
  const [requests, setRequests] = useState<SharedRequest[]>(initialRequests);
  const [assignedExperiments, setAssignedExperiments] = useState<Experiment[]>(initialAssignedExperiments);
  const [robotPool, setRobotPool] = useState<Robot[]>(robots);
  const [robotBlocks, setRobotBlocks] = useState<Record<string, RobotBlock[]>>(() => Object.fromEntries(platformRobotNames.map(name => [name, [{ id: 1, start: "12:00", end: "13:00", reason: "默认停用休息" }]])));
  const [globalRobotConfig, setGlobalRobotConfig] = useState({ workStart: "10:00", workEnd: "19:00", breakStart: "12:00", breakEnd: "13:00", averageDuration: 30 });
  const [selectedRobotNames, setSelectedRobotNames] = useState<string[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [testerBreaks, setTesterBreaks] = useState<TesterBreak[]>([]);
  const [runningTimers, setRunningTimers] = useState<Record<string, number>>({});
  const [dateOffset, setDateOffset] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("全部状态");
  const [selectedRobot, setSelectedRobot] = useState<Robot | null>(null);
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null);
  const [selectedManagerRequestId, setSelectedManagerRequestId] = useState<string | null>(null);
  const [bulkMenuOpen, setBulkMenuOpen] = useState(false);
  const [bulkSettingsOpen, setBulkSettingsOpen] = useState(false);
  const [requestPriorityFilter, setRequestPriorityFilter] = useState<"全部" | "Urgent">("全部");
  const [toast, setToast] = useState("");

  const dateLabel = dateOffset === 0 ? "今天 · 8月18日 周二" : dateOffset === -1 ? "昨天 · 8月17日 周一" : "明天 · 8月19日 周三";
  const filteredRobots = useMemo(() => robotPool.slice(0, 10).filter(r =>
    (statusFilter === "全部状态" || r.status === statusFilter) &&
    (r.name.toLowerCase().includes(search.toLowerCase()) || r.tester.includes(search) || r.current.toLowerCase().includes(search.toLowerCase()))
  ), [search, statusFilter, robotPool]);
  const scheduleRows = useMemo(() => buildScheduleRows("robot", robotPool, testerBreaks, robotBlocks), [robotPool, testerBreaks, robotBlocks]);
  const selectedManagerRequest = requests.find(request => request.id === selectedManagerRequestId) || null;
  const filteredManagerRequests = useMemo(() => requestPriorityFilter === "Urgent" ? requests.filter(request => request.priority === "高") : requests, [requestPriorityFilter, requests]);
  const dispatchStats = useMemo(() => {
    const slots = buildScheduleRows("robot", robotPool, testerBreaks, robotBlocks).flatMap(row => row.slots);
    const scheduled = slots.filter(isBookedSlot).length;
    const completed = slots.filter(slot => slot.status === "done").length;
    const running = slots.filter(slot => slot.status === "progress").length;
    const atRisk = slots.filter(slot => slot.status === "conflict" && !slot.blocked && slot.tester === "待分配").length;
    const unassigned = requests.filter(request => request.status === "待审核").reduce((sum, request) => sum + (request.combinationCount || 1), 0);
    return { scheduled, completed, running, atRisk, unassigned, utilization: Math.round(scheduled / (scheduleResources.robot.length * 16) * 100) };
  }, [requests, robotPool, testerBreaks, robotBlocks]);
  const managerAlertCount = requests.filter(request => request.status === "待审核" || request.status === "冲突").length + leaves.filter(leave => leave.status === "待审批").length;
  const globalBreakMinutes = Math.max(0, timeValueMinutes(globalRobotConfig.breakEnd) - timeValueMinutes(globalRobotConfig.breakStart));
  const globalWorkMinutes = Math.max(0, timeValueMinutes(globalRobotConfig.workEnd) - timeValueMinutes(globalRobotConfig.workStart));
  const calculatedDailyLimit = Math.max(1, Math.floor((globalWorkMinutes - globalBreakMinutes) / globalRobotConfig.averageDuration));

  useEffect(() => {
    const hasDialog = Boolean(selectedRobot || selectedExperiment || selectedManagerRequest || bulkSettingsOpen);
    if (!hasDialog) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setSelectedRobot(null);
      setSelectedExperiment(null);
      setSelectedManagerRequestId(null);
      setBulkSettingsOpen(false);
    };
    document.body.classList.add("modal-open");
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.classList.remove("modal-open");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedRobot, selectedExperiment, selectedManagerRequest, bulkSettingsOpen]);

  const consoleMeta = {
    manager: ["实验管理员控制台", "管理 Robot Capacity、实验排期、Tester 分配及异常调整。"],
    requester: ["实验需求方控制台", "提交实验需求、查看资源可用性并追踪排期进度。"],
    tester: ["实验员控制台", "查看个人任务、执行 Policy 实验并维护可用时间。"],
  }[activeConsole];

  function autoCreateAndScheduleRequest(request: SharedRequest) {
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
      const eligible = [robot.defaultTester || robot.tester, ...(robot.backupTesters || [])].filter(Boolean);
      const tester = eligible.find(name => !testerBreaks.some(item => item.active && item.tester === name) && !leaves.some(item => item.status === "已批准" && item.tester === name)) || "待分配";
      const availableIndices = getDispatchSchedule(robot.name, 0, robotPool, testerBreaks, robotBlocks).map((slot, slotIndex) => ({ slot, slotIndex })).filter(item => item.slot.available).map(item => item.slotIndex);
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
    setRequests(items => [{ ...request, combinationCount: scheduledExperiments.length, status: hasUnassignedTester ? "冲突" : "已排期", tester: hasUnassignedTester ? "部分待分配" : [...new Set(scheduledExperiments.map(item => item.tester))].join("、"), robot: [...new Set(scheduledExperiments.map(item => item.robot))].join("、"), scheduledTime: first?.schedule || "等待可用资源" }, ...items]);
    setAssignedExperiments(items => [...items, ...scheduledExperiments].sort((a, b) => {
      const executionOrder = (status: string) => status === "进行中" ? 0 : status === "已完成" ? 1 : 2;
      const stateDiff = executionOrder(a.status) - executionOrder(b.status);
      return stateDiff || (a.priority === b.priority ? 0 : a.priority === "高" ? -1 : 1);
    }));
    done(`${request.id} 已自动创建 ${scheduledExperiments.length} 个实验，并完成 Robot、Tester 与时间匹配`);
  }

  function applyGlobalRobotConfig() {
    if (!selectedRobotNames.length) {
      done("请先勾选需要配置的 Robot");
      return;
    }
    const workMinutes = Math.max(0, timeValueMinutes(globalRobotConfig.workEnd) - timeValueMinutes(globalRobotConfig.workStart));
    const breakMinutes = Math.max(0, timeValueMinutes(globalRobotConfig.breakEnd) - timeValueMinutes(globalRobotConfig.breakStart));
    const maxExperiments = Math.max(1, Math.floor((workMinutes - breakMinutes) / globalRobotConfig.averageDuration));
    setRobotBlocks(items => {
      const next = { ...items };
      selectedRobotNames.forEach(name => {
        const custom = (next[name] || []).filter(block => !block.reason.includes("默认") && !block.reason.includes("批量"));
        next[name] = [{ id: Date.now(), start: globalRobotConfig.breakStart, end: globalRobotConfig.breakEnd, reason: "批量配置的默认停用休息" }, ...custom];
      });
      return next;
    });
    setRobotPool(items => items.map(robot => selectedRobotNames.includes(robot.name) ? ({ ...robot, capacity: robot.status === "维护中" || robot.status === "已暂停" ? 0 : maxExperiments, scheduled: Math.min(robot.scheduled, maxExperiments), utilization: maxExperiments ? Math.round(Math.min(robot.scheduled, maxExperiments) / maxExperiments * 100) : 0 }) : robot));
    done(`已为 ${selectedRobotNames.length} 台 Robot 保存配置：${globalRobotConfig.workStart}–${globalRobotConfig.workEnd}，休息 ${globalRobotConfig.breakStart}–${globalRobotConfig.breakEnd}，每日最多 ${maxExperiments} 个实验`);
  }

  function updateRobotTesters(name: string, defaultTester: string, backupTesters: string[]) {
    const update = (robot: Robot): Robot => ({ ...robot, tester: defaultTester, defaultTester, backupTesters });
    setRobotPool(items => items.map(robot => robot.name === name ? update(robot) : robot));
    setSelectedRobot(current => current?.name === name ? update(current) : current);
    setAssignedExperiments(items => items.map(experiment => experiment.robot === name && (experiment.status === "已排期" || experiment.status === "冲突") ? { ...experiment, tester: defaultTester, status: "已排期" } : experiment));
    done(`${name} 的默认 Tester 与备用 Tester 已更新`);
  }

  function assignExperimentTester(id: string, tester: string) {
    setAssignedExperiments(items => items.map(experiment => experiment.id === id ? { ...experiment, tester, status: "已排期" } : experiment));
    setSelectedExperiment(experiment => experiment?.id === id ? { ...experiment, tester, status: "已排期" } : experiment);
    done(`${id} 已指定给 ${tester}，排期保持由系统自动计算`);
  }

  function updateRequestStatus(id: string, status: SharedRequest["status"]) {
    setRequests(items => items.map(item => item.id === id ? { ...item, status } : item));
  }

  function addLeave(leave: { start: string; end: string; reason: string }) {
    setLeaves(items => [...items, { ...leave, id: Date.now(), tester: "李莎", status: "待审批" }]);
    done("请假申请已提交，等待实验管理员审批");
  }

  function reviewLeave(id: number, approved: boolean) {
    const leave = leaves.find(item => item.id === id);
    setLeaves(items => items.map(item => item.id === id ? { ...item, status: approved ? "已批准" : "已拒绝" } : item));
    if (approved && leave) {
      setRequests(items => items.map(item => item.tester === leave.tester && (item.status === "已排期" || item.status === "进行中") ? { ...item, tester: "林超", status: "已排期", scheduledTime: "今天 17:00–17:30" } : item));
      setAssignedExperiments(items => items.map(item => {
        if (item.tester !== leave.tester || item.status === "已完成" || item.status === "进行中") return item;
        const robot = robotPool.find(candidate => candidate.name === item.robot);
        const replacement = (robot?.backupTesters || []).find(tester => tester !== leave.tester && !testerBreaks.some(entry => entry.active && entry.tester === tester)) || "待分配";
        return { ...item, tester: replacement, status: replacement === "待分配" ? "冲突" : "已排期", schedule: shiftScheduledTime(item.schedule, 30) };
      }));
      done(`${leave.tester} 的请假已批准，未执行实验已按 Robot 备用 Tester 自动重新匹配`);
    } else done("请假申请已拒绝，原实验排期保持不变");
  }

  function updateRobotStatus(name: string, status: Robot["status"]) {
    const disabled = status === "维护中" || status === "已暂停";
    const robotIndex = Math.max(0, platformRobotNames.indexOf(name));
    const restoredScheduled = sharedDailyCapacity[0][robotIndex % sharedDailyCapacity[0].length];
    const update = (robot: Robot): Robot => ({ ...robot, status, capacity: disabled ? 0 : 16, scheduled: disabled ? 0 : Math.min(restoredScheduled, 16), utilization: disabled ? 0 : Math.round(Math.min(restoredScheduled, 16) / 16 * 100), current: disabled ? "—" : robot.current === "—" ? `EXP-${1200 + robotIndex * 18}` : robot.current, next: disabled ? "待管理员恢复" : restoredScheduled >= 16 ? "明天 10:00" : `今天 ${workIndexTimeLabel(restoredScheduled)}` });
    setRobotPool(items => items.map(robot => robot.name === name ? update(robot) : robot));
    setSelectedRobot(current => current?.name === name ? update(current) : current);
    if (disabled) {
      const fallbackRobot = robotPool.find(robot => robot.name !== name && (robot.status === "运行中" || robot.status === "空闲"));
      setAssignedExperiments(items => items.map(experiment => {
        if (experiment.robot !== name || (experiment.status !== "已排期" && experiment.status !== "冲突")) return experiment;
        if (!fallbackRobot) return { ...experiment, status: "冲突", tester: "待分配" };
        const replacementTester = fallbackRobot.defaultTester || fallbackRobot.tester;
        return { ...experiment, robot: fallbackRobot.name, tester: replacementTester, status: "已排期", schedule: shiftScheduledTime(experiment.schedule, 30) };
      }));
    }
    done(`${name} 已设置为${status}，受影响的未执行实验已自动重新匹配 Robot、Tester 与时间`);
  }

  function addRobotBlock(name: string, block: Omit<RobotBlock, "id">) {
    const [startHour, startMinute] = block.start.split(":").map(Number);
    const [endHour, endMinute] = block.end.split(":").map(Number);
    const start = startHour * 60 + startMinute;
    const end = endHour * 60 + endMinute;
    if (!block.start || !block.end || end <= start) {
      done("结束时间需要晚于开始时间");
      return;
    }
    setRobotBlocks(items => ({ ...items, [name]: [...(items[name] || []), { ...block, id: Date.now() }] }));
    const blockedSlots = Array.from({ length: 18 }, (_, index) => slotStartMinutes(index)).filter((minutes, index) => index !== 4 && index !== 5 && minutes >= start && minutes < end).length;
    if (blockedSlots > 0) {
      const updateCapacity = (robot: Robot): Robot => {
        const capacity = Math.max(0, robot.capacity - blockedSlots);
        const scheduled = Math.min(robot.scheduled, capacity);
        return { ...robot, capacity, scheduled, utilization: capacity ? Math.round(scheduled / capacity * 100) : 0, next: scheduled >= capacity ? "暂无可用时段" : robot.next };
      };
      setRobotPool(items => items.map(robot => robot.name === name ? updateCapacity(robot) : robot));
      setSelectedRobot(current => current?.name === name ? updateCapacity(current) : current);
    }
    done(`${name} 已新增不可排时段 ${block.start}–${block.end}`);
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
    setAssignedExperiments(items => items.map(item => item.id === id ? { ...item, status: "进行中" } : item));
    setRunningTimers(items => ({ ...items, [id]: Date.now() }));
  }

  function finishExperiment(id: string) {
    setAssignedExperiments(items => items.map(item => item.id === id ? { ...item, status: "已完成" } : item));
    setRunningTimers(items => { const next = { ...items }; delete next[id]; return next; });
    done(`${id} 已完成并停止计时，实验员保持可用状态`);
  }

  function done(message: string) { setToast(message); setTimeout(() => setToast(""), 2600); }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">跳到主要内容</a>
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">R</span><div><strong>RobotOps</strong><small>实验运营平台</small></div></div>
        <nav className="console-nav" aria-label="角色控制台">{consoles.map(item => <button key={item.id} aria-current={activeConsole === item.id ? "page" : undefined} className={activeConsole === item.id ? "active" : ""} onClick={() => setActiveConsole(item.id)}><span className="nav-icon role-icon">{item.icon}</span><span className="nav-copy"><strong>{item.label}</strong><small>{item.hint}</small></span>{item.id === "manager" && managerAlertCount > 0 && <b aria-label={`${managerAlertCount} 个待处理事项`}>{managerAlertCount}</b>}</button>)}</nav>
        <div className="sidebar-foot"><div className="workspace"><span>R</span><div><strong>机器人实验室</strong><small>生产环境</small></div></div></div>
      </aside>

      <main id="main-content">
        <header className="topbar">
          <div><h1>{consoleMeta[0]}</h1><p>{consoleMeta[1]}</p></div>
          <div className="top-actions">
            <div className="date-picker"><button onClick={() => setDateOffset(-1)} aria-label="前一天">‹</button><span>▣&nbsp; {dateLabel}</span><button onClick={() => setDateOffset(1)} aria-label="后一天">›</button></div>
            {dateOffset !== 0 && <button className="today" onClick={() => setDateOffset(0)}>回到今天</button>}
            {activeConsole === "manager" && <label className="search">⌕<input aria-label="搜索 Robot、实验或 Tester" placeholder="搜索 Robot、实验、Tester..." value={search} onChange={e => setSearch(e.target.value)} /></label>}
            <span className="avatar" aria-label="当前用户 JC">JC</span>
          </div>
        </header>

        <div className="content">
          {activeConsole === "manager" ? <>
          <SharedFlow active="manager" requests={requests} onNavigate={setActiveConsole} />
          <nav className="manager-subnav" aria-label="实验管理员页面"><button aria-current={managerPage === "operations" ? "page" : undefined} className={managerPage === "operations" ? "active" : ""} onClick={() => setManagerPage("operations")}><span>运</span><div><strong>运行与资源</strong><small>今日排期、Robot 与 Tester</small></div></button><button aria-current={managerPage === "requests" ? "page" : undefined} className={managerPage === "requests" ? "active" : ""} onClick={() => setManagerPage("requests")}><span>需</span><div><strong>实验需求管理</strong><small>{requests.length} 个需求及关联实验</small></div></button></nav>
          <div className={`manager-console-page ${managerPage}`}>
          {managerPage === "requests" && <section className="manager-request-page-head"><div><span>EXPERIMENT REQUEST MANAGEMENT</span><h2>实验需求管理</h2><p>集中查看需求内容、自动创建的实验，以及每个实验对应的 Robot、Tester 和排期。</p></div><div><strong>{requests.length}</strong><span>全部需求</span></div><div><strong>{requests.reduce((sum, request) => sum + estimateRequestExperimentCount(request), 0)}</strong><span>关联实验</span></div></section>}
          <section className="readiness dispatch-readiness manager-day-summary">
            <div className="readiness-copy"><span className="pulse"><i /></span><div><strong>今日实验运行概览</strong><p>管理员通过固定排期查看 Robot、实验与 Tester 状态；异常项目集中显示并手动处理。</p></div></div>
            <button onClick={() => document.getElementById("attention")?.scrollIntoView({ behavior: "smooth" })}>查看需要处理 ↓</button>
          </section>

          <section className="kpis">
            {[
              ["今日已排", dispatchStats.scheduled, `${dispatchStats.completed} 已完成 · ${dispatchStats.running} 进行中`, ""], ["Robot 可用", "8 / 10", "2 台暂不可使用", ""], ["Robot 利用率", `${dispatchStats.utilization}%`, `${dispatchStats.scheduled} / ${scheduleResources.robot.length * 16} 个实验容量`, "meter"], ["需要处理", dispatchStats.atRisk, "仅统计未匹配到 Tester 的实验", "alert"], ["待创建实验", dispatchStats.unassigned, "来自待审核实验需求", "alert"],
            ].map(([label, value, sub, cls]) => <article className={`kpi ${cls}`} key={label}><div><span>{label}</span>{cls === "alert" && <em>!</em>}</div><strong>{value}</strong><p>{sub}</p>{cls === "meter" && <div className="mini-meter"><i style={{ width: `${dispatchStats.utilization}%` }} /></div>}</article>)}
          </section>

          <div className="section-grid top-grid">
            <section className="panel capacity-panel">
              <div className="section-head"><div><h2>Robot 管理</h2><p>{selectedRobotNames.length ? `已选择 ${selectedRobotNames.length} 台 Robot，可通过 More 批量设置` : "勾选 Robot 后，通过右上角 More 进行批量设置。"}</p></div><div className="filters robot-more-wrap"><select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option>全部状态</option><option>运行中</option><option>空闲</option><option>已暂停</option><option>维护中</option></select><button aria-label="更多操作" onClick={() => setBulkMenuOpen(open => !open)}>⋮</button>{bulkMenuOpen && <div className="robot-more-menu"><button disabled={!selectedRobotNames.length} onClick={() => { setBulkMenuOpen(false); setBulkSettingsOpen(true); }}>批量设置{selectedRobotNames.length ? `（${selectedRobotNames.length}）` : ""}</button></div>}</div></div>
              <div className="table-scroll"><table className="capacity-table"><thead><tr><th className="check-col"><input aria-label="选择当前列表全部 Robot" type="checkbox" checked={filteredRobots.length > 0 && filteredRobots.every(robot => selectedRobotNames.includes(robot.name))} onChange={event => setSelectedRobotNames(event.target.checked ? [...new Set([...selectedRobotNames, ...filteredRobots.map(robot => robot.name)])] : selectedRobotNames.filter(name => !filteredRobots.some(robot => robot.name === name)))} /></th><th>Robot</th><th>状态</th><th>Tester</th><th>已排 / 容量</th><th>利用率</th><th>当前实验</th><th>下次可用</th></tr></thead><tbody>{filteredRobots.map(r => <tr key={r.name}><td className="check-col"><input aria-label={`选择 ${r.name}`} type="checkbox" checked={selectedRobotNames.includes(r.name)} onChange={event => setSelectedRobotNames(names => event.target.checked ? [...names, r.name] : names.filter(name => name !== r.name))} /></td><td><button className="robot-name-link" onClick={() => setSelectedRobot(r)}>{r.name}</button></td><td><StatusBadge value={r.status} /></td><td>{r.tester}</td><td><span className="tabular">{r.scheduled} / {r.capacity || "—"}</span></td><td><div className="util"><div><i className={r.utilization === 100 ? "full" : r.status === "已暂停" ? "paused" : ""} style={{ width: `${r.utilization}%` }} /></div><span>{r.capacity ? `${r.utilization}%` : "—"}</span></div></td><td>{r.current !== "—" ? <button className="link" onClick={() => { const firstSlot = getDispatchSchedule(r.name, 0, robotPool, testerBreaks, robotBlocks)[0]; setSelectedExperiment({ ...scheduleSlotToExperiment(firstSlot, 0), id: r.current }); }}>{r.current}</button> : "—"}</td><td>{r.next}</td></tr>)}</tbody></table></div>
            </section>

            <section className="panel attention" id="attention">
              <div className="section-head"><div><h2>需要人工处理</h2><p><b>{attention.length}</b> 个问题需要实验管理员确认</p></div></div>
              <div className="issues">{attention.map(a => <article className="issue" key={a.kind}><span className={`issue-icon ${a.tone}`}>{a.icon}</span><div className="issue-body"><div><small>{a.kind}</small><em>需人工指定</em></div><strong>{a.title}</strong><p>{a.desc}</p><div className="issue-actions"><button className="primary-sm" onClick={() => { const slot = getDispatchSchedule(platformRobotNames[4], 0, robotPool, testerBreaks, robotBlocks)[15]; setSelectedExperiment(scheduleSlotToExperiment(slot, 15)); }}>{a.action}</button></div></div></article>)}</div>
            </section>
          </div>

          <section className="panel schedule-panel requester-gantt manager-gantt">
            <div className="section-head"><div><h2>今日 Robot 实验排期</h2><p>按 Robot 查看固定排期、Policy 与实验员；需要调整时由管理员打开实验详情处理。</p></div><div className="schedule-controls"><div className="legend"><span><i className="done" />已完成</span><span><i className="progress" />进行中</span><span><i className="scheduled" />待执行</span><span><i className="conflict" />需处理</span></div></div></div>
            <div className="plan-constraint-note"><strong>今日排期 · 10:00–19:00</strong><span>全局平均用时 {globalRobotConfig.averageDuration} 分钟；全部 Robot {globalRobotConfig.breakStart}–{globalRobotConfig.breakEnd} 停用休息，其他不可排时段可在 Robot 详情中设置。</span></div><div className="request-gantt-body"><div className="request-gantt-head"><span>ROBOT / {calculatedDailyLimit} EXP CAPACITY</span>{["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"].map(t => <b key={t}>{t}</b>)}</div>{scheduleRows.map(row => <div className="request-gantt-row" key={row.name}><div className="request-robot-label"><span>R</span><div><strong>{row.name}</strong><small>{row.slots.filter(isBookedSlot).length}/{robotPool.find(robot => robot.name === row.name)?.capacity || calculatedDailyLimit} 已排 · {row.slots.find(isBookedSlot)?.tester || "待分配"}</small></div></div><div className="request-slot-track">{row.slots.map((slot, i) => <button key={slot.id} title={`${slotTimeLabel(i)} · ${slot.sub} · ${slot.policy} · ${slot.tester}${slot.constraint ? ` · ${slot.constraint}` : ""}`} className={`${slot.status} ${slot.blocked ? "blocked" : ""}`} onClick={() => slot.available || slot.blocked ? undefined : setSelectedExperiment(scheduleSlotToExperiment(slot, i))}><span>{slot.sub}</span><small>{slot.available ? slotTimeLabel(i) : slot.policy.replace(" Policy", "")}</small><em>{slot.available ? `约 ${globalRobotConfig.averageDuration} 分钟` : slot.tester}</em></button>)}</div></div>)}</div>
          </section>

          <div className="section-grid lower-grid">
            <section className="panel queue-panel manager-request-queue"><div className="section-head"><div><h2>实验需求队列</h2><p>需求提交后系统自动创建实验与排期；管理员在此查看需求及关联实验。</p></div><div className="segmented" aria-label="按优先级筛选"><button aria-pressed={requestPriorityFilter === "全部"} className={requestPriorityFilter === "全部" ? "active" : ""} onClick={() => setRequestPriorityFilter("全部")}>全部</button><button aria-pressed={requestPriorityFilter === "Urgent"} className={requestPriorityFilter === "Urgent" ? "active" : ""} onClick={() => setRequestPriorityFilter("Urgent")}>Urgent</button></div></div><div className="table-scroll"><table><thead><tr><th>优先级</th><th>需求 ID</th><th>需求描述</th><th>Policy</th><th>Robot</th><th>申请人</th><th>Deadline</th><th>状态</th><th>操作</th></tr></thead><tbody>{filteredManagerRequests.map(r => {
              const policies = r.policies?.length ? r.policies : [r.policy];
              const robotChoices = r.robotChoices?.length ? r.robotChoices : [r.robot];
              return <tr key={r.id}><td><span className={`priority ${r.priority === "高" ? "high" : ""}`}>{r.priority === "高" ? "Urgent" : "Normal"}</span></td><td><strong className="req-id">{r.id}</strong></td><td className="description-cell">{r.description || r.note || "验证 Policy 在目标场景中的执行稳定性。"}</td><td><div className="table-chip-list">{policies.map(policy => <span className="table-chip policy" key={policy}>{policy}</span>)}</div></td><td><div className="table-chip-list robots">{robotChoices.map(robot => <span className="table-chip robot" key={robot}>{robot}</span>)}</div></td><td>{r.requester}</td><td>{r.expectedDate}</td><td><SharedStatus value={r.status} /></td><td><div className="manager-request-actions"><button className="view-request-btn" onClick={() => setSelectedManagerRequestId(r.id)}>查看需求与实验</button></div></td></tr>;
            })}</tbody></table></div><button className="text-link" onClick={() => setActiveConsole("requester")}>查看需求方视图 →</button></section>
            <section className="panel testers tester-operations"><div className="section-head"><div><h2>Tester 可用性与审批</h2><p>{leaves.filter(leave => leave.status === "待审批").length} 个请假申请待处理 · Break 独立计时并实时校准排期</p></div><button className="quiet">管理 Tester</button></div><div className="tester-stats"><div><strong>{12 - testerBreaks.filter(item => item.active).length}</strong><span>当前可用</span></div><div><strong>{leaves.filter(leave => leave.status === "待审批").length}</strong><span>待审批请假</span></div><div><strong>{testerBreaks.filter(item => item.active).length}</strong><span>临时 Break</span></div></div>{leaves.length > 0 && <div className="leave-approval-list">{leaves.map(leave => <article key={leave.id}><div><strong>{leave.tester} · 请假申请</strong><span>{leave.start.replace("T", " ")} → {leave.end.replace("T", " ")}</span><small>{leave.reason}</small></div><SharedLeaveStatus value={leave.status} />{leave.status === "待审批" && <div className="approval-actions"><button onClick={() => reviewLeave(leave.id, false)}>拒绝</button><button className="approve" onClick={() => reviewLeave(leave.id, true)}>批准并自动调度</button></div>}</article>)}</div>}{testerBreaks.some(item => item.active) && <div className="active-break-list">{testerBreaks.filter(item => item.active).map(item => <div key={item.id}><span>Break</span><div><strong>{item.tester} 临时休息计时中</strong><small>开始 {item.start} · 后续 Queue 正在动态顺延，结束后固化新时间</small></div></div>)}</div>}<div className="people">{[["LS","李莎",testerBreaks.some(item => item.active && item.tester === "李莎") ? "Break" : "可用",testerBreaks.some(item => item.active && item.tester === "李莎") ? "amber" : "green"],["WM","吴明","已分配","blue"],["CZ","陈哲","可用","green"],["ZR","周睿","可用","green"],["ZJ","赵静","满负荷","gray"]].map(p => <div className="person" key={p[1]}><span>{p[0]}</span><div><strong>{p[1]}</strong><small><i className={p[3]} />{p[2]}</small></div><em>›</em></div>)}</div></section>
          </div>
          </div>
          </> : activeConsole === "requester" ? <RequesterConsole requests={requests} setRequests={setRequests} robotPool={robotPool} robotBlocks={robotBlocks} testerBreaks={testerBreaks} onAutoSchedule={autoCreateAndScheduleRequest} onNavigate={setActiveConsole} /> : <TesterConsole workflowRequests={requests} assignedExperiments={assignedExperiments} leaves={leaves} testerBreaks={testerBreaks} runningTimers={runningTimers} addLeave={addLeave} startExperiment={startExperiment} finishExperiment={finishExperiment} startBreak={startTesterBreak} endBreak={endTesterBreak} onNavigate={setActiveConsole} />}
        </div>
      </main>

      {(selectedRobot || selectedExperiment) && <div className="overlay" onMouseDown={() => { setSelectedRobot(null); setSelectedExperiment(null); }}><aside className="drawer robot-management-drawer" onMouseDown={e => e.stopPropagation()}><button className="close" onClick={() => { setSelectedRobot(null); setSelectedExperiment(null); }}>×</button>{selectedRobot ? <RobotManagementDrawerView robot={selectedRobot} blocks={robotBlocks[selectedRobot.name] || []} workConfig={globalRobotConfig} schedule={getDispatchSchedule(selectedRobot.name, 0, robotPool, testerBreaks, robotBlocks)} onSave={(status, defaultTester, backupTesters) => { updateRobotStatus(selectedRobot.name, status); updateRobotTesters(selectedRobot.name, defaultTester, backupTesters); }} onAddBlock={block => addRobotBlock(selectedRobot.name, block)} onExperiment={experiment => { setSelectedRobot(null); setSelectedExperiment(experiment); }} /> : selectedExperiment && <ExperimentDrawerWithRequest experiment={selectedExperiment} onAssignTester={tester => assignExperimentTester(selectedExperiment.id, tester)} />}</aside></div>}
      {selectedManagerRequest && <div className="overlay request-detail-overlay" onMouseDown={() => setSelectedManagerRequestId(null)}><aside className="drawer request-detail-drawer" onMouseDown={event => event.stopPropagation()}><button className="close" aria-label="关闭需求详情" onClick={() => setSelectedManagerRequestId(null)}>×</button><RequestDetailDrawer request={selectedManagerRequest} /></aside></div>}

      {bulkSettingsOpen && <div className="modal-backdrop" onMouseDown={() => setBulkSettingsOpen(false)}><div className="modal robot-bulk-modal" onMouseDown={event => event.stopPropagation()}><button className="composer-close" onClick={() => setBulkSettingsOpen(false)}>×</button><div className="modal-icon blue">配</div><h3>批量设置 Robot</h3><p>将配置应用到已选择的 {selectedRobotNames.length} 台 Robot。保存后系统重新计算每日容量和未执行实验。</p><div className="selected-robot-summary">{selectedRobotNames.map(name => <span key={name}>{name}</span>)}</div><div className="bulk-modal-grid"><label><span>每日工作开始</span><input type="time" value={globalRobotConfig.workStart} onChange={event => setGlobalRobotConfig(config => ({ ...config, workStart: event.target.value }))} /></label><label><span>每日工作结束</span><input type="time" value={globalRobotConfig.workEnd} onChange={event => setGlobalRobotConfig(config => ({ ...config, workEnd: event.target.value }))} /></label><label><span>停用 / 休息开始</span><input type="time" value={globalRobotConfig.breakStart} onChange={event => setGlobalRobotConfig(config => ({ ...config, breakStart: event.target.value }))} /></label><label><span>停用 / 休息结束</span><input type="time" value={globalRobotConfig.breakEnd} onChange={event => setGlobalRobotConfig(config => ({ ...config, breakEnd: event.target.value }))} /></label><label className="wide"><span>平均实验时长</span><select value={globalRobotConfig.averageDuration} onChange={event => setGlobalRobotConfig(config => ({ ...config, averageDuration: Number(event.target.value) }))}><option value={30}>30 分钟</option><option value={45}>45 分钟</option><option value={60}>60 分钟</option></select></label></div><div className="bulk-capacity-preview"><span>预计每日可排容量</span><strong>{calculatedDailyLimit} 个实验 / Robot</strong><small>{globalWorkMinutes / 60} 小时跨度，扣除 {globalBreakMinutes / 60} 小时停用时间</small></div><div className="modal-actions"><button onClick={() => setBulkSettingsOpen(false)}>取消</button><button className="primary-submit" onClick={() => { applyGlobalRobotConfig(); setBulkSettingsOpen(false); }}>保存并应用</button></div></div></div>}
      {toast && <div className="toast"><span>✓</span>{toast}</div>}
    </div>
  );
}

function SharedStatus({ value }: { value: SharedRequest["status"] }) {
  const cls = { "待审核": "amber", "已排期": "blue", "进行中": "green", "已完成": "gray", "冲突": "red" }[value];
  return <span className={`shared-status ${cls}`}><i />{value}</span>;
}

function SharedLeaveStatus({ value }: { value: LeaveRequest["status"] }) {
  const cls = value === "已批准" ? "green" : value === "已拒绝" ? "red" : "amber";
  return <span className={`shared-status ${cls}`}><i />{value}</span>;
}

function SharedFlow({ active, requests, onNavigate }: { active: ConsoleRole; requests: SharedRequest[]; onNavigate: (role: ConsoleRole) => void }) {
  const scheduled = requests.some(r => r.status === "已排期" || r.status === "进行中" || r.status === "已完成");
  const executing = requests.some(r => r.status === "进行中" || r.status === "已完成");
  const completed = requests.some(r => r.status === "已完成");
  const steps = [
    { role: "requester" as ConsoleRole, label: "需求已提交", detail: `${requests.length} 个需求`, done: requests.length > 0 },
    { role: "manager" as ConsoleRole, label: "管理员排期", detail: `${requests.filter(r => r.status === "待审核").length} 个待确认`, done: scheduled },
    { role: "tester" as ConsoleRole, label: "实验员执行", detail: `${requests.filter(r => r.status === "进行中").length} 个进行中`, done: executing },
    { role: "requester" as ConsoleRole, label: "结果已同步", detail: `${requests.filter(r => r.status === "已完成").length} 个已完成`, done: completed },
  ];
  return <section className="shared-flow"><div className="flow-title"><strong>实验协作流程</strong><span>三个控制台共享同一份实时数据</span></div><div className="flow-steps">{steps.map((step, i) => <button key={step.label} className={`${step.done ? "done" : ""} ${step.role === active ? "current" : ""}`} onClick={() => onNavigate(step.role)}><span>{step.done ? "✓" : i + 1}</span><div><strong>{step.label}</strong><small>{step.detail}</small></div>{i < steps.length - 1 && <em>→</em>}</button>)}</div></section>;
}

function RequesterConsole({ requests, setRequests, robotPool, robotBlocks, testerBreaks, onAutoSchedule, onNavigate }: { requests: SharedRequest[]; setRequests: Dispatch<SetStateAction<SharedRequest[]>>; robotPool: Robot[]; robotBlocks: Record<string, RobotBlock[]>; testerBreaks: TesterBreak[]; onAutoSchedule: (request: SharedRequest) => void; onNavigate: (role: ConsoleRole) => void }) {
  const [formOpen, setFormOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [selectedGanttExperiment, setSelectedGanttExperiment] = useState<Experiment | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [availabilityDay, setAvailabilityDay] = useState(0);
  const [requestFilter, setRequestFilter] = useState<"全部" | "待排期" | "进行中">("全部");
  const [form, setForm] = useState({
    description: "",
    policies: [policyCatalog[0]],
    robots: [platformRobotNames[0]],
    groups: [{ objects: [objectCatalog[0]], backgrounds: [backgroundCatalog[0]] }],
    priority: "普通" as "高" | "普通",
    note: "",
  });
  const counts = { pending: requests.filter(r => r.status === "待审核").length, scheduled: requests.filter(r => r.status === "已排期").length, running: requests.filter(r => r.status === "进行中").length, completed: requests.filter(r => r.status === "已完成").length };
  const dayOptions = ["今天 · 8月18日", "明天 · 8月19日", "后天 · 8月20日"];
  const availabilityRows = robotPool.slice(0,6).map(robot => {
    const slots = getDispatchSchedule(robot.name, availabilityDay, robotPool, testerBreaks, robotBlocks);
    const unavailable = robot.status === "维护中" || robot.status === "已暂停";
    return { robot, occupied: slots.filter(isBookedSlot).length, available: slots.filter(slot => slot.available).length, blockedCount: slots.filter(slot => slot.blocked).length, unavailable, slots };
  });
  const combinationCount = form.policies.length * form.robots.length * form.groups.reduce((total, group) => total + group.objects.length * group.backgrounds.length, 0);
  const selectedRequest = requests.find(request => request.id === selectedRequestId) || null;
  const filteredRequests = useMemo(() => requests.filter(request => requestFilter === "全部" || (requestFilter === "待排期" ? request.status === "待审核" || request.status === "冲突" : request.status === "进行中")), [requestFilter, requests]);
  const estimatedExperiments = requests.reduce((total, request) => total + estimateRequestExperimentCount(request), 0);
  const todayAvailability = robotPool.slice(0, 6).flatMap(robot => getDispatchSchedule(robot.name, 0, robotPool, testerBreaks, robotBlocks));
  const availableCapacity = todayAvailability.filter(slot => slot.available).length;
  const earliestAvailableIndex = Math.min(...robotPool.slice(0, 6).map(robot => getDispatchSchedule(robot.name, 0, robotPool, testerBreaks, robotBlocks).findIndex(slot => slot.available)).filter(index => index >= 0));

  useEffect(() => {
    const hasDialog = Boolean(formOpen || selectedRequest || selectedGanttExperiment);
    if (!hasDialog) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setFormOpen(false);
      setSelectedRequestId(null);
      setSelectedGanttExperiment(null);
    };
    document.body.classList.add("modal-open");
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.classList.remove("modal-open");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [formOpen, selectedRequest, selectedGanttExperiment]);

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
    onAutoSchedule({ id, name: requestName, robot: form.robots.join("、"), object: objects.join("、"), background: backgrounds.join("、"), policy: form.policies.join("、"), priority: form.priority, duration: "30 分钟/实验", expectedDate: "尽快", requester: "许晨", note: form.note, status: "待审核", tester: "待分配", scheduledTime: "系统排期中", description: form.description, policies: form.policies, robotChoices: form.robots, objectGroups: form.groups, objectSets: form.groups.map(group => group.objects), backgroundSets: form.groups.map(group => group.backgrounds), combinationCount });
    setSubmitted(true);
    setTimeout(() => { setFormOpen(false); setSubmitted(false); }, 1200);
  }

  return <div className="role-console requester-console" onClick={openRequesterGanttExperiment}>
    <SharedFlow active="requester" requests={requests} onNavigate={onNavigate} />
    <section className="role-hero"><div><span className="eyebrow">EXPERIMENT REQUESTER</span><h2>我的实验需求</h2><p>先查看 Robot 可用时间，再提交 Policy 实验需求；排期变化会自动同步到这里。</p></div><button className="create-btn" onClick={() => setFormOpen(true)}>＋ 提交实验需求</button></section>
    <section className="role-kpis">{[["全部需求",requests.length,"本周期"],["排期异常",counts.pending,"仅资源不足时出现"],["进行中",counts.running,"正在执行"],["已完成",counts.completed,"结果已同步"]].map(x => <article key={String(x[0])}><span>{x[0]}</span><strong>{x[1]}</strong><small>{x[2]}</small></article>)}</section>
    <section className="requester-capacity-insights"><article><span>预计工作量</span><strong>{estimatedExperiments} Experiments</strong><small>约 {Math.round(estimatedExperiments * 0.5 * 10) / 10} 小时 Robot Capacity</small></article><article><span>今日可用 Capacity</span><strong>{availableCapacity} 个实验</strong><small>未来排程会随运行状态动态变化</small></article><article><span>最早预计开始</span><strong>今天 {slotTimeLabel(Number.isFinite(earliestAvailableIndex) ? earliestAvailableIndex : 0)}</strong><small>系统综合 Robot 与 Tester 可用时间</small></article><article className={counts.pending ? "risk" : ""}><span>排期异常</span><strong>{counts.pending ? `${counts.pending} 个待处理` : "暂无异常"}</strong><small>{counts.pending ? "系统暂未找到完整资源组合" : "所有需求均已自动排期"}</small></article></section>
    <section className="panel my-requests requester-first"><div className="section-head"><div><h2>我的需求</h2><p>按需求追踪自动创建的实验与执行进度</p></div><div className="segmented" aria-label="按需求状态筛选">{(["全部", "待排期", "进行中"] as const).map(filter => <button key={filter} aria-pressed={requestFilter === filter} className={requestFilter === filter ? "active" : ""} onClick={() => setRequestFilter(filter)}>{filter}</button>)}</div></div><div className="table-scroll"><table className="request-summary-table"><thead><tr><th>需求 ID</th><th>需求描述</th><th>Policy</th><th>Robot</th><th>状态</th><th>操作</th></tr></thead><tbody>{filteredRequests.map(r => {
      const policies = r.policies?.length ? r.policies : [r.policy];
      const robotChoices = r.robotChoices?.length ? r.robotChoices : [r.robot];
      return <tr key={r.id} onClick={() => setSelectedRequestId(r.id)}><td><strong className="req-id">{r.id}</strong></td><td className="description-cell">{r.description || r.note || "验证 Policy 在目标场景中的执行稳定性。"}</td><td><div className="table-chip-list">{policies.map(policy => <span className="table-chip policy" key={policy}>{policy}</span>)}</div></td><td><div className="table-chip-list robots">{robotChoices.map(robot => <span className="table-chip robot" key={robot}>{robot}</span>)}</div></td><td><SharedStatus value={r.status} /></td><td><button className="view-request-btn" onClick={event => { event.stopPropagation(); setSelectedRequestId(r.id); }}>查看详情 <span>→</span></button></td></tr>;
    })}</tbody></table></div></section>
    <section className="panel requester-gantt"><div className="section-head"><div><h2>机器人排期与可用容量</h2><p>10:00–19:00 · 默认 12:00–13:00 Robot 停用休息；状态和 Break 会实时同步</p></div><div className="gantt-tools"><div className="segmented">{dayOptions.map((day,i) => <button key={day} className={availabilityDay === i ? "active" : ""} onClick={() => setAvailabilityDay(i)}>{day}</button>)}</div><div className="gantt-legend"><span><i className="occupied" />已占用</span><span><i className="available" />可申请</span><span><i className="blocked" />不可排</span></div></div></div><div className="request-gantt-body"><div className="request-gantt-head"><span>ROBOT / 每日 16 个实验容量</span>{["10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00"].map(t => <b key={t}>{t}</b>)}</div>{availabilityRows.map(row => <div className="request-gantt-row" key={row.robot.name}><div className="request-robot-label"><span>R</span><div><strong>{row.robot.name}</strong><small>{row.unavailable ? `${row.robot.status} · 今日不可排` : `${row.occupied}/16 已占用 · ${row.available} 个可用 · ${row.blockedCount} 个休息格`}</small></div></div><div className="request-slot-track">{row.slots.map((slot,i) => <button key={slot.id} className={slot.blocked ? "blocked" : slot.available ? "available" : slot.status === "conflict" ? "conflict" : "occupied"} title={`${slotTimeLabel(i)} · ${slot.available ? "可申请" : `${slot.name} · ${slot.policy} · ${slot.tester}`}${slot.constraint ? ` · ${slot.constraint}` : ""}`}><span>{slot.blocked ? "不可排期" : slot.available ? "可申请" : slot.name}</span><small>{slot.available ? slotTimeLabel(i) : slot.policy.replace(" Policy","")}</small><em>{slot.available ? "约 30 分钟" : slot.tester}</em></button>)}</div></div>)}</div><div className="gantt-foot"><span>需求方与管理员使用同一份排期数据；Robot 状态与 Tester 变化会同步更新。</span><strong>{availabilityRows.reduce((sum,row) => sum + row.available,0)} 个可申请实验容量</strong></div></section>
    {formOpen && <div className="modal-backdrop"><form className="modal request-form request-composer" onSubmit={submitRequest}><div className="composer-head"><div className="modal-icon blue">需</div><div><h3>提交实验需求</h3><p>管理员会将下列选项排列组合，创建多个具体实验。</p></div><button type="button" className="composer-close" onClick={() => setFormOpen(false)}>×</button></div><div className="composer-scroll"><label className="composer-field"><span>需求描述 <b>*</b></span><textarea required placeholder="说明希望验证的问题、成功标准和实验目标" value={form.description} onChange={e => setForm({...form,description:e.target.value})} /></label><section className="composer-section"><div className="composer-label"><strong>Policy <b>*</b></strong><span>支持多选</span></div><div className="choice-grid policies">{policyCatalog.map(policy => <button type="button" key={policy} aria-pressed={form.policies.includes(policy)} className={form.policies.includes(policy) ? "selected" : ""} onClick={() => toggleMulti("policies",policy)}><i>{form.policies.includes(policy) ? "✓" : "+"}</i><span>{policy}</span></button>)}</div></section><section className="composer-section"><div className="composer-label"><strong>机器人 <b>*</b></strong><span>支持多选 · 数据来自实验平台</span></div><div className="choice-grid robots">{robots.map(robot => <button type="button" key={robot.name} aria-pressed={form.robots.includes(robot.name)} className={form.robots.includes(robot.name) ? "selected" : ""} onClick={() => toggleMulti("robots",robot.name)}><i>{form.robots.includes(robot.name) ? "✓" : "+"}</i><span>{robot.name}</span><small>{robot.status}</small></button>)}</div></section><section className="composer-section"><div className="composer-label"><strong>物体 × 背景组合 <b>*</b></strong><span>组内多选；不同组分别组合</span></div><div className="combination-groups">{form.groups.map((group,groupIndex) => <article key={groupIndex}><header><strong>组合组 {groupIndex + 1}</strong><span>{group.objects.length} 个物体 × {group.backgrounds.length} 个背景 = {group.objects.length * group.backgrounds.length} 组</span>{form.groups.length > 1 && <button type="button" onClick={() => setForm(current => ({...current,groups:current.groups.filter((_,i) => i !== groupIndex)}))}>移除</button>}</header><div className="group-columns"><div><small>物体（可多选）</small><div className="mini-choices">{objectCatalog.map(object => <button type="button" key={object} className={group.objects.includes(object) ? "selected" : ""} onClick={() => toggleGroupValue(groupIndex,"objects",object)}>{group.objects.includes(object) ? "✓ " : "+ "}{object}</button>)}</div></div><div><small>背景（可多选）</small><div className="mini-choices">{backgroundCatalog.map(background => <button type="button" key={background} className={group.backgrounds.includes(background) ? "selected" : ""} onClick={() => toggleGroupValue(groupIndex,"backgrounds",background)}>{group.backgrounds.includes(background) ? "✓ " : "+ "}{background}</button>)}</div></div></div></article>)}</div><button type="button" className="add-group" onClick={addCombinationGroup}>＋ 新增物体 / 背景组合组</button></section><div className="composer-two"><label className="composer-field"><span>优先级</span><select value={form.priority} onChange={e => setForm({...form,priority:e.target.value as "高"|"普通"})}><option>普通</option><option>高</option></select></label><label className="composer-field"><span>备注</span><input placeholder="其他执行要求（可选）" value={form.note} onChange={e => setForm({...form,note:e.target.value})} /></label></div><RequestRobotCalendar selectedRobots={form.robots} /></div><div className="composer-summary"><div><strong>{combinationCount}</strong><span>个预计实验组合</span><small>{form.policies.length} Policy × {form.robots.length} Robot × 物体/背景组合</small></div><p>每个实验默认 30 分钟。管理员会检查容量并确认最终组合与排期。</p><div className="modal-actions"><button type="button" onClick={() => setFormOpen(false)}>取消</button><button className="primary-submit" type="submit" disabled={!form.description || !form.policies.length || !form.robots.length || combinationCount === 0}>{submitted ? "✓ 已同步" : "提交需求"}</button></div></div></form></div>}
    {formOpen && <ModernRequestModal requestCount={requests.length} setRequests={setRequests} robotPool={robotPool} robotBlocks={robotBlocks} testerBreaks={testerBreaks} onAutoSchedule={onAutoSchedule} onClose={() => setFormOpen(false)} />}
    {selectedRequest && <div className="overlay request-detail-overlay" onClick={() => setSelectedRequestId(null)}><aside className="drawer request-detail-drawer" onClick={event => event.stopPropagation()}><button className="close" aria-label="关闭需求详情" onClick={() => setSelectedRequestId(null)}>×</button><RequestDetailDrawer request={selectedRequest} /></aside></div>}
    {selectedGanttExperiment && <div className="overlay" onClick={() => setSelectedGanttExperiment(null)}><aside className="drawer robot-management-drawer" onClick={event => event.stopPropagation()}><button className="close" onClick={() => setSelectedGanttExperiment(null)}>×</button><ExperimentDrawerWithRequest experiment={selectedGanttExperiment} onAssignTester={() => undefined} /></aside></div>}
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
  if (request.status === "待审核") return [];
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

function RequestDetailDrawer({ request }: { request: SharedRequest }) {
  const policies = request.policies?.length ? request.policies : [request.policy];
  const robotChoices = request.robotChoices?.length ? request.robotChoices : [request.robot];
  const experimentsForRequest = buildLinkedExperiments(request);
  const objectSets = request.objectSets?.length ? request.objectSets : [[request.object]];
  const backgroundSets = request.backgroundSets?.length ? request.backgroundSets : [[request.background]];
  const flowStep = request.status === "已完成" ? 4 : request.status === "进行中" ? 3 : request.status === "待审核" ? 1 : 2;
  return <>
    <div className="drawer-kicker">需求详情</div>
    <div className="request-detail-title"><div><h2>{request.id}</h2><p>提交人 {request.requester} · 期望日期 {request.expectedDate}</p></div><SharedStatus value={request.status} /></div>
    <p className="request-detail-description">{request.description || request.note || "验证 Policy 在目标场景中的执行稳定性。"}</p>
    <div className="request-progress">{["需求已提交", "管理员创建实验", "实验执行", "结果同步"].map((label, index) => <div className={index < flowStep ? "done" : ""} key={label}><span>{index < flowStep ? "✓" : index + 1}</span><small>{label}</small></div>)}</div>
    <section className="request-detail-section"><div className="request-detail-heading"><h3>需求配置</h3><span className={`priority ${request.priority === "高" ? "high" : ""}`}>{request.priority}优先级</span></div><dl className="request-config"><div><dt>Policy</dt><dd>{policies.map(policy => <span className="detail-chip policy" key={policy}>{policy}</span>)}</dd></div><div><dt>Robot</dt><dd>{robotChoices.map(robot => <span className="detail-chip robot" key={robot}>{robot}</span>)}</dd></div><div><dt>物体</dt><dd>{objectSets.map((group, index) => <span className="detail-chip resource" key={`${group.join("-")}-${index}`}>{request.objectMode === "group" ? `分组 ${index + 1}：` : ""}{group.join(" + ")}</span>)}</dd></div><div><dt>背景</dt><dd>{backgroundSets.map((group, index) => <span className="detail-chip resource" key={`${group.join("-")}-${index}`}>{request.backgroundMode === "group" ? `分组 ${index + 1}：` : ""}{group.join(" + ")}</span>)}</dd></div>{request.note && <div><dt>实验备注</dt><dd className="plain-value">{request.note}</dd></div>}</dl></section>
    <section className="request-detail-section linked-experiments"><div className="request-detail-heading"><div><h3>关联实验</h3><p>管理员创建后，可在这里追踪每个实验与对应实验员</p></div><strong>{experimentsForRequest.length}</strong></div>{experimentsForRequest.length ? <div className="linked-experiment-list">{experimentsForRequest.map(experiment => <article key={experiment.id}><header><div><span>{experiment.id}</span><strong>{experiment.name}</strong></div><em className={`experiment-state ${experiment.status === "进行中" ? "running" : experiment.status === "已完成" ? "completed" : "scheduled"}`}>{experiment.status}</em></header><div className="linked-experiment-meta"><p><span>Policy</span><strong>{experiment.policy}</strong></p><p><span>Robot</span><strong>{experiment.robot}</strong></p><p><span>实验对象</span><strong>{experiment.object} · {experiment.background}</strong></p></div><footer><span className="tester-avatar">{experiment.tester.slice(0, 1)}</span><div><small>实验员</small><strong>{experiment.tester}</strong></div><div className="experiment-time"><small>排期时间</small><strong>{experiment.schedule}</strong></div></footer></article>)}</div> : <div className="linked-empty"><span>排</span><strong>等待实验管理员创建实验</strong><p>管理员完成组合与排期后，实验名称、Robot、排期时间和实验员会自动同步到这里。</p></div>}</section>
  </>;
}

function MultiSelectInput({ label, options, selected, onChange, placeholder, meta }: { label: string; options: string[]; selected: string[]; onChange: (values: string[]) => void; placeholder: string; meta?: (value: string) => string }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const visible = options.filter(option => option.toLowerCase().includes(query.toLowerCase()));
  const toggle = (value: string) => onChange(selected.includes(value) ? selected.filter(item => item !== value) : [...selected, value]);
  return <div className={`multi-select-input ${open ? "open" : ""}`}><button type="button" className="multi-select-trigger" aria-label={`${label}多选，已选择 ${selected.length} 项`} aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen(!open)}><div>{selected.length ? selected.map(value => <span className="selected-chip" key={value}>{value}<i aria-hidden="true">×</i></span>) : <span className="multi-placeholder">{placeholder}</span>}</div><b aria-hidden="true">⌄</b></button>{open && <div className="multi-select-menu"><label>⌕<input aria-label={`搜索${label}`} placeholder={`搜索${label}`} value={query} onChange={event => setQuery(event.target.value)} /></label><div role="listbox" aria-label={`${label}选项`} aria-multiselectable="true">{visible.map(value => <button type="button" role="option" aria-selected={selected.includes(value)} key={value} className={selected.includes(value) ? "selected" : ""} onClick={() => toggle(value)}><i>{selected.includes(value) ? "✓" : ""}</i><span>{value}</span>{meta && <small>{meta(value)}</small>}</button>)}</div>{!visible.length && <p>没有匹配结果</p>}</div>}</div>;
}

function ModernRequestModal({ requestCount, setRequests: _setRequests, robotPool, robotBlocks, testerBreaks, onAutoSchedule, onClose }: { requestCount: number; setRequests: React.Dispatch<React.SetStateAction<SharedRequest[]>>; robotPool: Robot[]; robotBlocks: Record<string, RobotBlock[]>; testerBreaks: TesterBreak[]; onAutoSchedule: (request: SharedRequest) => void; onClose: () => void }) {
  const [description, setDescription] = useState("");
  const [policies, setPolicies] = useState<string[]>([]);
  const [selectedRobots, setSelectedRobots] = useState<string[]>([]);
  const [objectSets, setObjectSets] = useState<string[][]>([[]]);
  const [backgroundSets, setBackgroundSets] = useState<string[][]>([[]]);
  const [objectMode, setObjectMode] = useState<"single" | "group">("single");
  const [backgroundMode, setBackgroundMode] = useState<"single" | "group">("single");
  const [priority, setPriority] = useState<"高" | "普通">("普通");
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const hasObjects = objectSets.some(group => group.length);
  const hasBackgrounds = backgroundSets.some(group => group.length);
  const valid = description.trim() && policies.length && selectedRobots.length && hasObjects && hasBackgrounds;
  const updateGroup = (kind: "object" | "background", index: number, values: string[]) => kind === "object" ? setObjectSets(groups => groups.map((group, i) => i === index ? values : group)) : setBackgroundSets(groups => groups.map((group, i) => i === index ? values : group));
  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!valid) return;
    const id = `REQ-${2090 + requestCount}`;
    const objects = objectSets.flat();
    const backgrounds = backgroundSets.flat();
    const normalizedObjectSets = objectMode === "single" ? objects.map(object => [object]) : objectSets.filter(group => group.length);
    const normalizedBackgroundSets = backgroundMode === "single" ? backgrounds.map(background => [background]) : backgroundSets.filter(group => group.length);
    const groupedPairs = normalizedObjectSets.flatMap(objectGroup => normalizedBackgroundSets.map(backgroundGroup => ({ objects: objectGroup, backgrounds: backgroundGroup })));
    const requestName = [...new Set(policies.map(getExperimentName))].join("、") + "需求";
    onAutoSchedule({ id, name: requestName, robot: selectedRobots.join("、"), object: objects.join("、"), background: backgrounds.join("、"), policy: policies.join("、"), priority, duration: "系统全局平均用时", expectedDate: "尽快", requester: "许晨", note, status: "待审核", tester: "待分配", scheduledTime: "系统排期中", description, policies, robotChoices: selectedRobots, objectGroups: groupedPairs, objectSets: normalizedObjectSets, backgroundSets: normalizedBackgroundSets, objectMode, backgroundMode, combinationCount: Math.max(1, groupedPairs.length * policies.length * selectedRobots.length) });
    setSubmitted(true);
    setTimeout(onClose, 700);
  }
  return <div className="modal-backdrop modern-request-backdrop"><form className={`modern-request-modal ${selectedRobots.length ? "calendar-open" : ""}`} role="dialog" aria-modal="true" aria-labelledby="new-request-title" onSubmit={submit}>
    <header className="modern-request-head"><div className="modal-icon blue">需</div><div><h3 id="new-request-title">提交实验需求</h3><p>提交后系统将自动创建实验，并匹配 Robot、合格 Tester 与最近可用时间。</p></div><button type="button" aria-label="关闭" onClick={onClose}>×</button></header>
    <div className="modern-request-body"><div className="modern-form-pane">
      <label className="modern-field"><span>需求描述 <b>*</b></span><textarea required placeholder="说明实验问题、成功标准和实验目标" value={description} onChange={event => setDescription(event.target.value)} /></label>
      <div className="modern-section"><div className="modern-label"><strong>Policy <b>*</b></strong><span>输入搜索 · 下拉多选</span></div><MultiSelectInput label="Policy" options={policyCatalog} selected={policies} onChange={setPolicies} placeholder="输入或选择 Policy" /></div>
      <div className="modern-section"><div className="modern-label"><strong>机器人 <b>*</b></strong><span>选择后在右侧查看排期</span></div><MultiSelectInput label="机器人" options={platformRobotNames} selected={selectedRobots} onChange={setSelectedRobots} placeholder="输入机器人名称并多选" meta={value => robotPool.find(robot => robot.name === value)?.status || "可用"} /></div>
      <div className="resource-group-grid">
        <ResourceGroupEditor title="物体" options={objectCatalog} groups={objectSets} mode={objectMode} onModeChange={mode => { setObjectMode(mode); if (mode === "single") setObjectSets(groups => [[...new Set(groups.flat())]]); }} onUpdate={(index, values) => updateGroup("object", index, values)} onAdd={() => setObjectSets(groups => [...groups, []])} onRemove={index => setObjectSets(groups => groups.filter((_, i) => i !== index))} />
        <ResourceGroupEditor title="背景" options={backgroundCatalog} groups={backgroundSets} mode={backgroundMode} onModeChange={mode => { setBackgroundMode(mode); if (mode === "single") setBackgroundSets(groups => [[...new Set(groups.flat())]]); }} onUpdate={(index, values) => updateGroup("background", index, values)} onAdd={() => setBackgroundSets(groups => [...groups, []])} onRemove={index => setBackgroundSets(groups => groups.filter((_, i) => i !== index))} />
      </div>
      <label className="modern-field compact"><span>优先级</span><select value={priority} onChange={event => setPriority(event.target.value as "高" | "普通")}><option value="普通">Normal（普通）</option><option value="高">Urgent（紧急）</option></select></label>
      <label className="modern-field note-field"><span>实验备注</span><textarea placeholder="独立填写补充要求、操作注意事项或验收说明（可选）" value={note} onChange={event => setNote(event.target.value)} /></label>
    </div>{selectedRobots.length ? <MultiRobotSchedulePanel robots={selectedRobots} robotPool={robotPool} robotBlocks={robotBlocks} testerBreaks={testerBreaks} /> : <aside className="calendar-empty-side"><span>日</span><strong>选择机器人后查看排期</strong><p>右侧将并列显示所有已选机器人的当天排期，并可切换日期。</p></aside>}</div>
    <footer className="modern-request-foot"><p>当前关系：物体{objectMode === "single" ? "分别使用" : "按组使用"}，背景{backgroundMode === "single" ? "分别使用" : "按组使用"}；系统会保持该关系自动创建并排期实验。</p><div><button type="button" onClick={onClose}>取消</button><button className="primary-submit" type="submit" disabled={!valid}>{submitted ? "✓ 已自动排期" : "提交并自动排期"}</button></div></footer>
  </form></div>;
}

function ResourceGroupEditor({ title, options, groups, mode, onModeChange, onUpdate, onAdd, onRemove }: { title: string; options: string[]; groups: string[][]; mode: "single" | "group"; onModeChange: (mode: "single" | "group") => void; onUpdate: (index: number, values: string[]) => void; onAdd: () => void; onRemove: (index: number) => void }) {
  const selectedCount = groups.flat().length;
  return <section className="resource-group-editor"><div className="modern-label"><strong>{title}使用方式 <b>*</b></strong><span>{selectedCount ? `已选 ${selectedCount} 个` : "请选择"}</span></div><div className="resource-mode-switch"><button type="button" className={mode === "single" ? "active" : ""} onClick={() => onModeChange("single")}><strong>单独使用</strong><small>每项进入不同实验</small></button><button type="button" className={mode === "group" ? "active" : ""} onClick={() => onModeChange("group")}><strong>按组使用</strong><small>同组作为一个整体</small></button></div>{mode === "single" ? <div className="single-resource-mode"><p>一次多选即可快速添加；系统会把每个{title}分别交给管理员排实验。</p><MultiSelectInput label={title} options={options} selected={groups.flat()} onChange={values => onUpdate(0, values)} placeholder={`输入或选择多个${title}`} /></div> : <div className="group-resource-mode"><p>每组可选择多个{title}；同一组会作为一个整体用于实验。</p>{groups.map((group, index) => <article key={index}><header><strong>{title}组 {index + 1}</strong>{groups.length > 1 && <button type="button" onClick={() => onRemove(index)}>移除</button>}</header><MultiSelectInput label={title} options={options} selected={group} onChange={values => onUpdate(index, values)} placeholder={`选择此组的${title}`} /></article>)}<button className="add-resource-group" type="button" onClick={onAdd}>＋ 新增{title}组</button></div>}</section>;
}

function MultiRobotSchedulePanel({ robots: selectedRobots, robotPool, robotBlocks, testerBreaks }: { robots: string[]; robotPool: Robot[]; robotBlocks: Record<string, RobotBlock[]>; testerBreaks: TesterBreak[] }) {
  const [dayIndex, setDayIndex] = useState(0);
  const days = ["8月18日 今天", "8月19日 明天", "8月20日 后天", "8月21日 周五", "8月24日 周一"];
  const schedules = selectedRobots.map(robotName => ({ robotName, robot: robotPool.find(item => item.name === robotName), slots: getDispatchSchedule(robotName, dayIndex, robotPool, testerBreaks, robotBlocks) }));
  return <aside className="robot-schedule-side multi-robot-schedule-side">
    <header><button type="button" className="today-button" onClick={() => setDayIndex(0)}>今天</button><button type="button" disabled={dayIndex === 0} onClick={() => setDayIndex(index => Math.max(0, index - 1))}>‹</button><strong>{days[dayIndex]}</strong><button type="button" disabled={dayIndex === days.length - 1} onClick={() => setDayIndex(index => Math.min(days.length - 1, index + 1))}>›</button></header>
    <div className="multi-calendar-scroll"><div className="multi-calendar" style={{ minWidth: `${62 + selectedRobots.length * 210}px` }}>
      <div className="multi-calendar-head"><span>GMT+8</span>{schedules.map(item => <div key={item.robotName}><strong>{item.robotName}</strong><small>{item.slots.filter(isBookedSlot).length}/16 已排 · {item.robot?.status}</small></div>)}</div>
      <div className="multi-robot-calendar-grid" style={{ gridTemplateColumns: `62px repeat(${selectedRobots.length}, minmax(210px, 1fr))` }}><div className="calendar-times">{Array.from({ length: 10 }, (_, index) => <span key={index} style={{ top: `${index * 60}px` }}>{10 + index}:00</span>)}</div>{schedules.map(item => <div className="calendar-track robot-calendar-column" key={item.robotName}><div className="calendar-lunch-block"><strong>默认休息</strong><span>12:00–13:00</span></div>{item.slots.map((slot, slotIndex) => ({ slot, slotIndex })).filter(entry => isBookedSlot(entry.slot)).map(({ slot, slotIndex }) => <button type="button" key={slot.id} className={`calendar-event batch-${slot.batchIndex} ${slot.status === "conflict" ? "conflict" : ""}`} style={{ top: `${slotStartMinutes(slotIndex) - 10 * 60 + 2}px`, height: "26px" }}><strong>{slot.id}</strong><span>{slot.experimentName} · {slot.tester}</span><span className="schedule-hover-card"><b>{slot.id} · {slot.experimentName}</b><em>{slot.requestId}</em><small>需求人：{slot.requester}</small><small>{slot.policy}</small><small>{slotTimeLabel(slotIndex)}–{formatMinutes(slotStartMinutes(slotIndex) + 30)}</small></span></button>)}{item.slots.map((slot, slotIndex) => ({ slot, slotIndex })).filter(entry => entry.slot.blocked && !entry.slot.constraint.includes("默认停用休息")).map(({ slot, slotIndex }) => <div className="calendar-custom-block" key={slot.id} style={{ top: `${slotStartMinutes(slotIndex) - 10 * 60}px` }}><strong>不可排</strong><span>{slot.constraint}</span></div>)}</div>)}</div>
    </div></div><footer><span><i />已占用</span><span><i />Hover 查看需求信息</span><b>已同时显示 {selectedRobots.length} 台 Robot</b></footer>
  </aside>;
}

function RobotSchedulePanel({ robots: selectedRobots, robotPool, robotBlocks, testerBreaks }: { robots: string[]; robotPool: Robot[]; robotBlocks: Record<string, RobotBlock[]>; testerBreaks: TesterBreak[] }) {
  const [activeRobot, setActiveRobot] = useState(selectedRobots[0]);
  const [dayIndex, setDayIndex] = useState(0);
  const currentRobot = selectedRobots.includes(activeRobot) ? activeRobot : selectedRobots[0];
  const days = ["8月18日 今天", "8月19日 明天", "8月20日 后天", "8月21日 周五", "8月24日 周一"];
  const schedule = getDispatchSchedule(currentRobot, dayIndex, robotPool, testerBreaks, robotBlocks);
  const occupied = schedule.map((slot, slotIndex) => ({ slot, slotIndex })).filter(item => isBookedSlot(item.slot));
  const blockedSlots = schedule.map((slot, slotIndex) => ({ slot, slotIndex })).filter(item => item.slot.blocked && !item.slot.constraint.includes("默认停用休息"));
  return <aside className="robot-schedule-side"><header><button type="button" className="today-button" onClick={() => setDayIndex(0)}>今天</button><button type="button" aria-label="前一天" disabled={dayIndex === 0} onClick={() => setDayIndex(index => Math.max(0, index - 1))}>‹</button><strong>{days[dayIndex]}</strong><button type="button" aria-label="后一天" disabled={dayIndex === days.length - 1} onClick={() => setDayIndex(index => Math.min(days.length - 1, index + 1))}>›</button></header><div className="schedule-robot-tabs">{selectedRobots.map(robot => <button type="button" key={robot} className={robot === currentRobot ? "active" : ""} onClick={() => setActiveRobot(robot)}>{robot}</button>)}</div><div className="day-calendar"><div className="day-calendar-heading"><span>GMT+8</span><strong>{currentRobot}</strong><small>{occupied.length}/16 已排 · {robotPool.find(robot => robot.name === currentRobot)?.status} · 数据与管理员一致</small></div><div className="day-calendar-grid"><div className="calendar-times">{Array.from({ length: 10 }, (_, index) => <span key={index} style={{ top: `${index * 60}px` }}>{10 + index}:00</span>)}</div><div className="calendar-track"><div className="calendar-lunch-block"><strong>Robot 默认停用休息</strong><span>12:00–13:00 不可安排实验</span></div>{blockedSlots.map(({ slot, slotIndex }) => <div className="calendar-custom-block" key={`blocked-${slot.id}`} style={{ top: `${slotStartMinutes(slotIndex) - 10 * 60}px` }}><strong>不可排期</strong><span>{slot.constraint}</span></div>)}{occupied.map(({ slot, slotIndex }, index) => <button type="button" key={slot.id} className={`calendar-event tone-${index % 3} ${slot.status === "conflict" ? "conflict" : ""}`} style={{ top: `${slotStartMinutes(slotIndex) - 10 * 60 + 2}px`, height: "26px" }} title={`${slot.id} · ${slot.name} · ${slot.policy} · ${slot.tester}${slot.constraint ? ` · ${slot.constraint}` : ""}`}><strong>{slot.name}</strong><span>{slot.policy.replace(" Policy", "")} · {slot.tester}</span></button>)}{dayIndex === 0 && <i className="calendar-now" style={{ top: "192px" }}><span>13:12</span></i>}</div></div></div><footer><span><i />已占用</span><span><i />可申请容量</span></footer></aside>;
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

function TesterConsole({ workflowRequests, assignedExperiments, leaves, testerBreaks, runningTimers, addLeave, startExperiment, finishExperiment, startBreak, endBreak, onNavigate }: { workflowRequests: SharedRequest[]; assignedExperiments: Experiment[]; leaves: LeaveRequest[]; testerBreaks: TesterBreak[]; runningTimers: Record<string, number>; addLeave: (leave: { start: string; end: string; reason: string }) => void; startExperiment: (id: string) => void; finishExperiment: (id: string) => void; startBreak: (tester: string, reason?: string) => void; endBreak: (tester: string) => void; onNavigate: (role: ConsoleRole) => void }) {
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

  useEffect(() => {
    if (!timerStartedAt && !activeBreak) return;
    const timer = window.setInterval(() => setClock(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [timerStartedAt, activeBreak]);

  useEffect(() => {
    if (!leaveOpen) return;
    const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && setLeaveOpen(false);
    document.body.classList.add("modal-open");
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.classList.remove("modal-open");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [leaveOpen]);

  function saveLeave(e: React.FormEvent) { e.preventDefault(); addLeave(leave); setLeaveOpen(false); }

  return <div className="role-console tester-console">
    <SharedFlow active="tester" requests={workflowRequests} onNavigate={onNavigate} />
    <section className="tester-hero"><div className="tester-intro"><span className="avatar-lg">LS</span><div><span className="eyebrow">TESTER · 李莎</span><h2>下午好，李莎</h2><p>今天最多 16 个实验容量 · 10:00–19:00 · 12:00–13:00 默认休息</p></div></div><div className="tester-hero-actions"><div className="break-status-group"><span className={`availability-pill ${activeBreak || leaves.some(item => item.status === "已批准") ? "leave" : ""}`}><i />{activeBreak ? "Break 中" : leaves.some(item => item.status === "已批准") ? "请假已批准" : "今日可用"}</span>{activeBreak && <strong className="hero-break-timer">{breakElapsedLabel}</strong>}</div><button className="create-btn secondary" onClick={() => activeBreak ? endBreak("李莎") : startBreak("李莎")}>{activeBreak ? "结束临时休息" : "临时休息 Break"}</button><button className="create-btn secondary" onClick={() => setLeaveOpen(true)}>＋ 请假申请</button></div></section>
    {activeTask && <section className="current-task"><div className="live-mark"><i />{activeTask.status === "进行中" ? "正在执行" : "下一项实验"}</div><div className="current-main"><div><span>{activeBreak && activeTask.status === "冲突" ? shiftScheduledTime(activeTask.schedule, calibratedDelayMinutes) : activeTask.schedule}</span><h2>{activeTask.name}</h2><p>{activeTask.id} · {activeTask.policy}</p></div><div className="task-resource"><small>{activeTask.status === "进行中" ? "已运行时间" : activeBreak ? "动态校准后" : "执行资源"}</small><strong className={activeTask.status === "进行中" ? "running-timer" : ""}>{activeTask.status === "进行中" ? elapsedLabel : activeTask.robot}</strong><span>{activeTask.status === "进行中" ? "计时从点击开始实验后启动" : activeBreak ? `预计顺延 ${calibratedDelayMinutes} 分钟` : "预计约 30 分钟"}</span></div></div><div className="task-actions">{activeTask.status !== "进行中" ? <button onClick={() => startExperiment(activeTask.id)} disabled={Boolean(activeBreak)}>开始实验并计时</button> : <button className="complete" onClick={() => finishExperiment(activeTask.id)}>结束实验</button>}</div></section>}
    <div className="tester-grid"><section className="panel my-schedule"><div className="section-head"><div><h2>我的 Live Queue</h2><p>仅展示管理员创建并分配给李莎的 EXP 实验 · 排期随资源状态动态更新</p></div><button className="quiet">今天 · 8月18日</button></div><div className="task-list">{baseTasks.map(t => <article key={t.id}><time>{t.time}</time><span className="task-line done" /><div><strong>{t.name}</strong><small>{t.id} · {t.policy}</small></div><b>{t.robot}</b><SharedStatus value="已完成" /></article>)}{myTasks.map(t => { const calibratedTime = activeBreak && t.status === "冲突" ? shiftScheduledTime(t.schedule, calibratedDelayMinutes) : t.schedule; return <article key={t.id} className={t.status === "冲突" ? "conflicted" : ""}><time>{calibratedTime.replace("今天 ","")}</time><span className={`task-line ${t.status === "进行中" ? "live" : ""}`} /><div><strong>{t.name}</strong><small>{t.id} · {t.policy}{activeBreak && t.status === "冲突" ? " · 动态校准中" : ""}</small></div><b>{t.robot}</b><SharedStatus value={t.status} /></article>; })}</div><button className="text-link">查看完整 Live Queue →</button></section>
    <section className="panel availability-card"><div className="section-head"><div><h2>我的可用时间</h2><p>请假需要管理员审批；Break 立即生效</p></div><button className="quiet" onClick={() => setLeaveOpen(true)}>请假申请</button></div><div className="availability-summary"><span className={leaves.length || activeBreak ? "leave" : "available"}><i />{activeBreak ? "临时 Break 中" : leaves.some(item => item.status === "待审批") ? "请假等待审批" : "未来 7 天可用"}</span><strong>{leaves.length}</strong><small>条请假申请记录</small></div><div className="leave-list">{leaves.length ? leaves.map(l => <article key={l.id}><span>假</span><div><strong>{l.start.replace("T"," ")} → {l.end.replace("T"," ")}</strong><small>{l.reason}</small></div><SharedLeaveStatus value={l.status} /></article>) : <div className="empty-leave"><span>✓</span><strong>暂无请假安排</strong><p>你的实验任务可正常分配</p></div>}</div></section></div>
    {leaveOpen && <div className="modal-backdrop"><form className="modal leave-form" onSubmit={saveLeave}><div className="modal-icon amber">假</div><h3>提交请假申请</h3><p>申请提交后由实验管理员审批；批准时系统会自动改派 Tester 并重新计算实验安排。</p><div className="form-grid"><label className="wide"><span>开始时间</span><input type="datetime-local" value={leave.start} onChange={e => setLeave({...leave,start:e.target.value})} /></label><label className="wide"><span>结束时间</span><input type="datetime-local" value={leave.end} onChange={e => setLeave({...leave,end:e.target.value})} /></label><label className="wide"><span>原因</span><input value={leave.reason} onChange={e => setLeave({...leave,reason:e.target.value})} /></label></div><div className="leave-warning"><strong>审批后联动</strong><span>{myTasks.filter(t => t.status === "已排期").length} 个已排期实验可能受影响；管理员批准后系统自动生成并应用调整方案。</span></div><div className="modal-actions"><button type="button" onClick={() => setLeaveOpen(false)}>取消</button><button className="primary-submit" type="submit">提交审批</button></div></form></div>}
  </div>;
}

function RobotManagementDrawerView({ robot, blocks, workConfig, schedule, onSave, onAddBlock, onExperiment }: { robot: Robot; blocks: RobotBlock[]; workConfig: { workStart: string; workEnd: string; breakStart: string; breakEnd: string; averageDuration: number }; schedule: ReturnType<typeof getDispatchSchedule>; onSave: (status: Robot["status"], defaultTester: string, backupTesters: string[]) => void; onAddBlock: (block: Omit<RobotBlock, "id">) => void; onExperiment: (experiment: Experiment) => void }) {
  const [tab, setTab] = useState<"info" | "settings">("info");
  const [status, setStatus] = useState<Robot["status"]>(robot.status);
  const [defaultTester, setDefaultTester] = useState(robot.defaultTester || robot.tester);
  const [backupTesters, setBackupTesters] = useState(robot.backupTesters || []);
  const [newBlock, setNewBlock] = useState({ start: "15:00", end: "15:30", reason: "临时维护" });
  const scheduled = schedule.map((slot, slotIndex) => ({ slot, slotIndex })).filter(item => isBookedSlot(item.slot));
  return <>
    <div className="drawer-kicker">ROBOT 管理 · 数据与排期同步</div><h2>{robot.name}</h2>
    <div className="drawer-tabs"><button className={tab === "info" ? "active" : ""} onClick={() => setTab("info")}>当前信息</button><button className={tab === "settings" ? "active" : ""} onClick={() => setTab("settings")}>设置</button></div>
    {tab === "info" ? <div className="robot-info-tab">
      <div className="drawer-title"><strong>运行概览</strong><StatusBadge value={robot.status} /></div>
      <div className="drawer-metrics"><div><span>今日利用率</span><strong>{robot.capacity ? `${robot.utilization}%` : "—"}</strong></div><div><span>已排 / 容量</span><strong>{robot.scheduled} / {robot.capacity || "—"}</strong></div><div><span>下次可用</span><strong>{robot.next}</strong></div></div>
      <section className="drawer-info-section"><h3>每日规则</h3><dl className="details"><div><dt>工作时间</dt><dd>{workConfig.workStart}–{workConfig.workEnd}</dd></div><div><dt>默认休息</dt><dd>{workConfig.breakStart}–{workConfig.breakEnd}</dd></div><div><dt>平均实验时长</dt><dd>{workConfig.averageDuration} 分钟</dd></div><div><dt>默认 / 备用 Tester</dt><dd>{robot.defaultTester || robot.tester} / {(robot.backupTesters || []).join("、")}</dd></div></dl></section>
      <section className="drawer-info-section"><h3>今日实验安排</h3><div className="drawer-schedule">{scheduled.length ? scheduled.map(({ slot, slotIndex }) => { const experiment = scheduleSlotToExperiment(slot, slotIndex); return <button key={slot.id} onClick={() => onExperiment(experiment)}><span>{slotTimeLabel(slotIndex)}</span><div><strong>{slot.id} · {slot.experimentName}</strong><small>{slot.requestId} · {slot.policy} · {slot.tester}</small></div><StatusBadge value={experiment.status} /></button>; }) : <div className="drawer-empty-schedule">今日暂无实验安排</div>}</div></section>
    </div> : <div className="robot-settings-tab">
      <div className="settings-callout"><strong>单机设置</strong><p>调整当前 Robot 的状态和 Tester。工作时段等通用规则请在列表勾选后通过 More 批量设置。</p></div>
      <label className="drawer-field"><span>Robot 状态</span><select value={status} onChange={event => setStatus(event.target.value as Robot["status"])}><option>运行中</option><option>空闲</option><option>已暂停</option><option>维护中</option></select></label>
      <label className="drawer-field"><span>默认 Tester</span><select value={defaultTester} onChange={event => setDefaultTester(event.target.value)}>{sharedTesterNames.map(tester => <option key={tester}>{tester}</option>)}</select></label>
      <div className="drawer-field"><span>备用 Tester</span><div className="tester-checkbox-grid">{sharedTesterNames.filter(tester => tester !== defaultTester).map(tester => <label key={tester}><input type="checkbox" checked={backupTesters.includes(tester)} onChange={() => setBackupTesters(items => items.includes(tester) ? items.filter(item => item !== tester) : [...items, tester])} />{tester}</label>)}</div></div>
      <section className="drawer-block-settings"><h3>额外不可排时段</h3><div className="robot-block-list">{blocks.map(block => <div key={block.id}><span>{block.start}–{block.end}</span><div><strong>{block.reason}</strong><small>已同步至所有排期视图</small></div></div>)}</div><div className="robot-block-form"><div><label><span>开始</span><input type="time" value={newBlock.start} onChange={event => setNewBlock({ ...newBlock, start: event.target.value })} /></label><label><span>结束</span><input type="time" value={newBlock.end} onChange={event => setNewBlock({ ...newBlock, end: event.target.value })} /></label></div><label><span>原因</span><input value={newBlock.reason} onChange={event => setNewBlock({ ...newBlock, reason: event.target.value })} /></label><button onClick={() => onAddBlock(newBlock)}>＋ 添加不可排时段</button></div></section>
      <div className="drawer-save-bar"><span>保存后自动重新匹配受影响的实验。</span><button onClick={() => onSave(status, defaultTester, backupTesters)}>保存并确认</button></div>
    </div>}
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

function ExperimentDrawerWithRequest({ experiment: e, onAssignTester }: { experiment: Experiment; onAssignTester: (tester: string) => void }) {
  const [tester, setTester] = useState(sharedTesterNames[0]);
  const needsTester = e.tester === "待分配" || e.status === "冲突";
  return <>
    <div className="drawer-kicker">实验详情 · {e.requestId || "关联需求"}</div><h2>{e.id}</h2>
    <div className="drawer-title"><strong>{e.name}</strong><span className={`priority ${e.priority === "高" ? "high" : ""}`}>{e.priority}优先级</span></div><StatusBadge value={needsTester ? "等待资源" : e.status} />
    <section className="experiment-request-card"><span>来源需求</span><strong>{e.requestId || "—"}</strong><p>{e.requestDescription || "验证 Policy 在目标场景中的执行稳定性。"}</p><div><span>需求人</span><b>{e.requester || "许晨"}</b></div></section>
    <h3>实验配置</h3><dl className="details"><div><dt>Robot</dt><dd>{e.robot}</dd></div><div><dt>物体</dt><dd>{e.object}</dd></div><div><dt>背景</dt><dd>{e.background}</dd></div><div><dt>Policy</dt><dd>{e.policy}</dd></div><div><dt>Tester</dt><dd>{e.tester}</dd></div><div><dt>预计时长</dt><dd>{e.duration}</dd></div><div><dt>系统排期</dt><dd>{e.schedule}</dd></div></dl>
    {needsTester ? <div className="tester-assignment-box"><strong>需要指定 Tester</strong><p>系统已确定 Robot 与时间，但没有匹配到具备操作权限且当前可用的实验员。</p><label><span>选择 Tester</span><select value={tester} onChange={event => setTester(event.target.value)}>{sharedTesterNames.map(name => <option key={name}>{name}</option>)}</select></label><button onClick={() => onAssignTester(tester)}>确认指定 Tester</button></div> : <div className="drawer-note success"><strong>自动排期完成</strong><p>该实验与来源需求已经关联，Robot、Tester 和时间均由系统自动匹配。</p></div>}
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

