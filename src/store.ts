import { create } from 'zustand'
import { db, type Board, type Column, type Card } from './db'

interface KanbanState {
  boards: Board[]
  columns: Column[]
  cards: Card[]
  activeBoardId: number | null

  loadBoards: () => Promise<void>
  loadBoard: (boardId: number) => Promise<void>
  setActiveBoard: (boardId: number) => void

  addBoard: (title: string) => Promise<number>
  updateBoard: (id: number, title: string) => Promise<void>
  deleteBoard: (id: number) => Promise<void>

  addColumn: (boardId: number, title: string) => Promise<void>
  updateColumn: (id: number, patch: Partial<Column>) => Promise<void>
  deleteColumn: (id: number) => Promise<void>
  reorderColumns: (boardId: number, orderedIds: number[]) => Promise<void>

  addCard: (columnId: number, boardId: number, title: string) => Promise<void>
  updateCard: (id: number, patch: Partial<Card>) => Promise<void>
  deleteCard: (id: number) => Promise<void>
  moveCard: (cardId: number, toColumnId: number, newOrder: number) => Promise<void>
  reorderCards: (columnId: number, orderedIds: number[]) => Promise<void>
}

export const useKanban = create<KanbanState>((set, get) => ({
  boards: [],
  columns: [],
  cards: [],
  activeBoardId: null,

  loadBoards: async () => {
    const boards = await db.boards.orderBy('createdAt').toArray()
    set({ boards })
    if (boards.length > 0 && !get().activeBoardId) {
      await get().loadBoard(boards[0].id!)
    }
  },

  loadBoard: async (boardId) => {
    const [columns, cards] = await Promise.all([
      db.columns.where('boardId').equals(boardId).sortBy('order'),
      db.cards.where('boardId').equals(boardId).toArray(),
    ])
    set({ columns, cards, activeBoardId: boardId })
  },

  setActiveBoard: async (boardId) => {
    await get().loadBoard(boardId)
  },

  addBoard: async (title) => {
    const id = await db.boards.add({ title, createdAt: Date.now() })
    await get().loadBoards()
    return id as number
  },

  updateBoard: async (id, title) => {
    await db.boards.update(id, { title })
    await get().loadBoards()
  },

  deleteBoard: async (id) => {
    await db.cards.where('boardId').equals(id).delete()
    await db.columns.where('boardId').equals(id).delete()
    await db.boards.delete(id)
    const boards = await db.boards.orderBy('createdAt').toArray()
    if (boards.length > 0) {
      await get().loadBoard(boards[0].id!)
    } else {
      set({ boards: [], columns: [], cards: [], activeBoardId: null })
    }
  },

  addColumn: async (boardId, title) => {
    const cols = await db.columns.where('boardId').equals(boardId).toArray()
    const order = cols.length
    await db.columns.add({ boardId, title, order, wipLimit: null })
    await get().loadBoard(boardId)
  },

  updateColumn: async (id, patch) => {
    await db.columns.update(id, patch)
    const { activeBoardId } = get()
    if (activeBoardId) await get().loadBoard(activeBoardId)
  },

  deleteColumn: async (id) => {
    await db.cards.where('columnId').equals(id).delete()
    await db.columns.delete(id)
    const { activeBoardId } = get()
    if (activeBoardId) await get().loadBoard(activeBoardId)
  },

  reorderColumns: async (boardId, orderedIds) => {
    await db.transaction('rw', db.columns, async () => {
      for (let i = 0; i < orderedIds.length; i++) {
        await db.columns.update(orderedIds[i], { order: i })
      }
    })
    await get().loadBoard(boardId)
  },

  addCard: async (columnId, boardId, title) => {
    const cards = await db.cards.where('columnId').equals(columnId).toArray()
    const order = cards.length
    await db.cards.add({ columnId, boardId, title, description: '', order, dueDate: null, tags: [], createdAt: Date.now() })
    await get().loadBoard(boardId)
  },

  updateCard: async (id, patch) => {
    await db.cards.update(id, patch)
    const { activeBoardId } = get()
    if (activeBoardId) await get().loadBoard(activeBoardId)
  },

  deleteCard: async (id) => {
    await db.cards.delete(id)
    const { activeBoardId } = get()
    if (activeBoardId) await get().loadBoard(activeBoardId)
  },

  moveCard: async (cardId, toColumnId, newOrder) => {
    const card = await db.cards.get(cardId)
    if (!card) return
    await db.cards.update(cardId, { columnId: toColumnId, order: newOrder })
    const { activeBoardId } = get()
    if (activeBoardId) await get().loadBoard(activeBoardId)
  },

  reorderCards: async (columnId, orderedIds) => {
    await db.transaction('rw', db.cards, async () => {
      for (let i = 0; i < orderedIds.length; i++) {
        await db.cards.update(orderedIds[i], { order: i })
      }
    })
    const { activeBoardId } = get()
    if (activeBoardId) await get().loadBoard(activeBoardId)
  },
}))
