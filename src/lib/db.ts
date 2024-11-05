import { z } from 'zod';
import initSqlJs from 'sql.js';

export const TaskSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'Task name is required'),
  description: z.string().optional().nullable(),
  due_date: z.string().optional().nullable(),
  status: z.enum(['pending', 'completed']).default('pending'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
});

export type Task = z.infer<typeof TaskSchema>;

let db: any = null;

export async function initDb() {
  if (db) return db;

  const SQL = await initSqlJs({
    locateFile: file => `https://sql.js.org/dist/${file}`
  });
  
  db = new SQL.Database();
  
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      due_date TEXT,
      status TEXT DEFAULT 'pending',
      priority TEXT DEFAULT 'medium',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  return db;
}

function mapRow(row: any[]): Task {
  return {
    id: row[0],
    name: row[1],
    description: row[2],
    due_date: row[3],
    status: row[4] as Task['status'],
    priority: row[5] as Task['priority']
  };
}

export const dbTasks = {
  async getAll(): Promise<Task[]> {
    const db = await initDb();
    const result = db.exec("SELECT id, name, description, due_date, status, priority FROM tasks ORDER BY created_at DESC");
    if (!result.length) return [];
    return result[0].values.map(mapRow);
  },

  async getById(id: number): Promise<Task | null> {
    const db = await initDb();
    const result = db.exec(
      "SELECT id, name, description, due_date, status, priority FROM tasks WHERE id = ?",
      [id]
    );
    if (!result.length || !result[0].values.length) return null;
    return mapRow(result[0].values[0]);
  },

  async create(task: Omit<Task, 'id'>): Promise<Task> {
    const db = await initDb();
    db.run(
      'INSERT INTO tasks (name, description, due_date, status, priority) VALUES (?, ?, ?, ?, ?)',
      [task.name, task.description, task.due_date, task.status, task.priority]
    );
    const id = db.exec('SELECT last_insert_rowid()')[0].values[0][0];
    return this.getById(id) as Promise<Task>;
  },

  async update(id: number, task: Partial<Task>): Promise<Task | null> {
    const db = await initDb();
    const current = await this.getById(id);
    if (!current) return null;

    const updates = Object.entries(task)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => ({ key, value }));

    if (updates.length === 0) return current;

    const setClause = updates.map(({ key }) => `${key} = ?`).join(', ');
    const values = [...updates.map(({ value }) => value), id];

    db.run(`UPDATE tasks SET ${setClause} WHERE id = ?`, values);
    return this.getById(id);
  },

  async delete(id: number): Promise<void> {
    const db = await initDb();
    db.run('DELETE FROM tasks WHERE id = ?', [id]);
  }
};