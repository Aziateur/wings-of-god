"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
var stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
var types_js_1 = require("@modelcontextprotocol/sdk/types.js");
var supabase_js_1 = require("@supabase/supabase-js");
require("dotenv/config");
var supabaseUrl = process.env.VITE_SUPABASE_URL || '';
var supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in environment.");
}
var supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
var server = new index_js_1.Server({ name: "Wings of God MCP", version: "1.0.0" }, { capabilities: { tools: {} } });
function getState() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, data, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, supabase.from('wog_app_state').select('*').eq('id', 1).single()];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error)
                        throw error;
                    return [2 /*return*/, data];
            }
        });
    });
}
function saveState(projects, tasks) {
    return __awaiter(this, void 0, void 0, function () {
        var error;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, supabase.from('wog_app_state').update({
                        projects: projects,
                        tasks: tasks,
                        updated_at: new Date().toISOString()
                    }).eq('id', 1)];
                case 1:
                    error = (_a.sent()).error;
                    if (error)
                        throw error;
                    return [2 /*return*/];
            }
        });
    });
}
server.setRequestHandler(types_js_1.ListToolsRequestSchema, function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, {
                tools: [
                    {
                        name: "wog_get_all_data",
                        description: "Fetch all projects and tasks from Wings of God",
                        inputSchema: { type: "object", properties: {} },
                    },
                    {
                        name: "wog_create_project",
                        description: "Create a new project",
                        inputSchema: {
                            type: "object",
                            properties: {
                                name: { type: "string" },
                                color: { type: "string", description: "Format: #RRGGBB" },
                            },
                            required: ["name", "color"]
                        },
                    },
                    {
                        name: "wog_create_task",
                        description: "Create a new task in a project",
                        inputSchema: {
                            type: "object",
                            properties: {
                                projectId: { type: "string" },
                                text: { type: "string" },
                                priority: { type: "string", enum: ["low", "medium", "high"] },
                                status: { type: "string", description: "execute, unclear, skill_gap, constraint, optional, bottleneck" }
                            },
                            required: ["projectId", "text", "priority", "status"]
                        },
                    },
                    {
                        name: "wog_update_task_status",
                        description: "Update the status of an existing task",
                        inputSchema: {
                            type: "object",
                            properties: {
                                taskId: { type: "string" },
                                status: { type: "string" }
                            },
                            required: ["taskId", "status"]
                        },
                    }
                ],
            }];
    });
}); });
server.setRequestHandler(types_js_1.CallToolRequestSchema, function (request) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, name, args, state, _b, pName, color, state, newProject, _c, projectId, text, priority, status_1, state, newTask, _d, taskId_1, status_2, state, task, error_1;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _a = request.params, name = _a.name, args = _a.arguments;
                _e.label = 1;
            case 1:
                _e.trys.push([1, 13, , 14]);
                if (!(name === "wog_get_all_data")) return [3 /*break*/, 3];
                return [4 /*yield*/, getState()];
            case 2:
                state = _e.sent();
                return [2 /*return*/, { content: [{ type: "text", text: JSON.stringify({ projects: state.projects, tasks: state.tasks }, null, 2) }] }];
            case 3:
                if (!(name === "wog_create_project")) return [3 /*break*/, 6];
                _b = args, pName = _b.name, color = _b.color;
                return [4 /*yield*/, getState()];
            case 4:
                state = _e.sent();
                newProject = {
                    id: crypto.randomUUID(),
                    name: pName,
                    color: color,
                    stages: [],
                    axes: [],
                    checklists: [],
                    kpis: [],
                    problemLog: []
                };
                state.projects.push(newProject);
                return [4 /*yield*/, saveState(state.projects, state.tasks)];
            case 5:
                _e.sent();
                return [2 /*return*/, { content: [{ type: "text", text: "Project created:\n".concat(JSON.stringify(newProject, null, 2)) }] }];
            case 6:
                if (!(name === "wog_create_task")) return [3 /*break*/, 9];
                _c = args, projectId = _c.projectId, text = _c.text, priority = _c.priority, status_1 = _c.status;
                return [4 /*yield*/, getState()];
            case 7:
                state = _e.sent();
                newTask = {
                    id: crypto.randomUUID(),
                    text: text,
                    projectId: projectId,
                    priority: priority,
                    status: status_1,
                    completed: false,
                    createdAt: Date.now(),
                    subtasks: [],
                    tags: []
                };
                state.tasks.push(newTask);
                return [4 /*yield*/, saveState(state.projects, state.tasks)];
            case 8:
                _e.sent();
                return [2 /*return*/, { content: [{ type: "text", text: "Task created:\n".concat(JSON.stringify(newTask, null, 2)) }] }];
            case 9:
                if (!(name === "wog_update_task_status")) return [3 /*break*/, 12];
                _d = args, taskId_1 = _d.taskId, status_2 = _d.status;
                return [4 /*yield*/, getState()];
            case 10:
                state = _e.sent();
                task = state.tasks.find(function (t) { return t.id === taskId_1; });
                if (!task)
                    throw new Error("Task not found");
                task.status = status_2;
                return [4 /*yield*/, saveState(state.projects, state.tasks)];
            case 11:
                _e.sent();
                return [2 /*return*/, { content: [{ type: "text", text: "Task updated:\n".concat(JSON.stringify(task, null, 2)) }] }];
            case 12: return [3 /*break*/, 14];
            case 13:
                error_1 = _e.sent();
                return [2 /*return*/, { content: [{ type: "text", text: "Error: ".concat(error_1.message) }], isError: true }];
            case 14: return [2 /*return*/, {
                    content: [{ type: "text", text: "Unknown tool: ".concat(name) }],
                    isError: true,
                }];
        }
    });
}); });
function startServer() {
    return __awaiter(this, void 0, void 0, function () {
        var transport;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    transport = new stdio_js_1.StdioServerTransport();
                    return [4 /*yield*/, server.connect(transport)];
                case 1:
                    _a.sent();
                    console.error("Wings of God MCP Server running on stdio");
                    return [2 /*return*/];
            }
        });
    });
}
startServer().catch(function (err) {
    console.error("MCP Server Error:", err);
    process.exit(1);
});
