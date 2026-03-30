import { useState } from 'react'
import type { Card } from '../db'
import { useKanban } from '../store'

interface Props {
  card: Card
  onClose: () => void
}

export default function CardModal({ card, onClose }: Props) {
  const { updateCard } = useKanban()
  const [title, setTitle] = useState(card.title)
  const [description, setDescription] = useState(card.description)
  const [dueDate, setDueDate] = useState(card.dueDate ?? '')
  const [tagInput, setTagInput] = useState(card.tags.join(', '))

  const save = async () => {
    const tags = tagInput.split(',').map(t => t.trim()).filter(Boolean)
    await updateCard(card.id!, { title, description, dueDate: dueDate || null, tags })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-slate-800">카드 편집</h2>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-500">제목</label>
          <input
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
            value={title}
            onChange={e => setTitle(e.target.value)}
            autoFocus
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-500">설명</label>
          <textarea
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="메모, 링크, 상세 설명..."
          />
        </div>

        <div className="flex gap-3">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs text-slate-500">마감일</label>
            <input
              type="date"
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs text-slate-500">태그 (쉼표 구분)</label>
            <input
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              placeholder="디자인, 버그, 아이디어"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
            onClick={onClose}
          >
            취소
          </button>
          <button
            className="px-4 py-2 text-sm bg-violet-600 text-white rounded-lg hover:bg-violet-700"
            onClick={save}
          >
            저장
          </button>
        </div>
      </div>
    </div>
  )
}
