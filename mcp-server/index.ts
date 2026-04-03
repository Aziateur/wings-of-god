import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { createClient } from "@supabase/supabase-js";
import 'dotenv/config'; 

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in environment.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

const server = new Server(
  { name: "Wings of God MCP", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

// Defensively parse a value that might be a string or an actual array/object
function safeParse(val: any): any {
  if (typeof val === 'string') {
    try { return JSON.parse(val); } catch { return []; }
  }
  return val ?? [];
}

async function getState() {
  const { data, error } = await supabase.from('wog_app_state').select('*').eq('id', 1).single();
  if (error) throw error;
  // Always normalize to prevent double-serialization issues
  return {
    ...data,
    projects: safeParse(data.projects),
    tasks: safeParse(data.tasks),
  };
}

async function saveState(projects: any, tasks: any) {
  const { error } = await supabase.from('wog_app_state').update({
    projects,
    tasks,
    updated_at: new Date().toISOString()
  }).eq('id', 1);
  if (error) throw error;
}

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
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
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "wog_get_all_data") {
      const state = await getState();
      return { content: [{ type: "text", text: JSON.stringify({ projects: state.projects, tasks: state.tasks }, null, 2) }] };
    }

    if (name === "wog_create_project") {
      const { name: pName, color } = args as any;
      const state = await getState();
      const newProject = {
        id: crypto.randomUUID(),
        name: pName,
        color,
        stages: [],
        axes: [],
        checklists: [],
        kpis: [],
        problemLog: []
      };
      state.projects.push(newProject);
      await saveState(state.projects, state.tasks);
      return { content: [{ type: "text", text: `Project created:\n${JSON.stringify(newProject, null, 2)}` }] };
    }

    if (name === "wog_create_task") {
      const { projectId, text, priority, status } = args as any;
      const state = await getState();
      const newTask = {
        id: crypto.randomUUID(),
        text,
        projectId,
        priority,
        status,
        completed: false,
        createdAt: Date.now(),
        subtasks: [],
        tags: []
      };
      state.tasks.push(newTask);
      await saveState(state.projects, state.tasks);
      return { content: [{ type: "text", text: `Task created:\n${JSON.stringify(newTask, null, 2)}` }] };
    }

    if (name === "wog_update_task_status") {
      const { taskId, status } = args as any;
      const state = await getState();
      const task = state.tasks.find((t: any) => t.id === taskId);
      if (!task) throw new Error("Task not found");
      task.status = status;
      await saveState(state.projects, state.tasks);
      return { content: [{ type: "text", text: `Task updated:\n${JSON.stringify(task, null, 2)}` }] };
    }

  } catch (error: any) {
    return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
  }

  return {
    content: [{ type: "text", text: `Unknown tool: ${name}` }],
    isError: true,
  };
});

async function startServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Wings of God MCP Server running on stdio");
}

startServer().catch(err => {
  console.error("MCP Server Error:", err);
  process.exit(1);
});
