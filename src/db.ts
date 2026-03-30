import Dexie, { type Table } from 'dexie'

export interface Board {
  id?: number
  title: string
  createdAt: number
}

export interface Column {
  id?: number
  boardId: number
  title: string
  order: number
  wipLimit: number | null
}

export interface Card {
  id?: number
  columnId: number
  boardId: number
  title: string
  description: string
  order: number
  dueDate: string | null
  tags: string[]
  createdAt: number
}

class KanbanDB extends Dexie {
  boards!: Table<Board>
  columns!: Table<Column>
  cards!: Table<Card>

  constructor() {
    super('team-board')
    this.version(1).stores({
      boards: '++id, createdAt',
      columns: '++id, boardId, order',
      cards: '++id, columnId, boardId, order',
    })
  }
}

export const db = new KanbanDB()

export async function seedDefaultBoard() {
  const count = await db.boards.count()
  if (count > 0) return

  const boardId = await db.boards.add({ title: '내 칸반보드', createdAt: Date.now() })
  const cols = [
    { title: 'Todo', order: 0, wipLimit: null },
    { title: 'In Progress', order: 1, wipLimit: 3 },
    { title: 'Done', order: 2, wipLimit: null },
  ]
  for (const col of cols) {
    await db.columns.add({ ...col, boardId: boardId as number })
  }
}
