import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useState } from 'react'
import type { Card } from '../db'
import { useKanban } from '../store'
import CardModal from './CardModal'

interface Props {
  card: Card
}

export default function CardItem({ card }: Props) {
  const { deleteCard } = useKanban()
  const [showModal, setShowModal] = useState(false)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `card-${card.id}`,
    data: { type: 'card', card },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const isOverdue = card.dueDate && new Date(card.dueDate) < new Date()

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className="bg-white rounded-lg p-3 shadow-sm border border-slate-200 cursor-grab active:cursor-grabbing group"
        {...attributes}
        {...listeners}
        onClick={() => setShowModal(true)}
      >
        <p className="text-sm text-slate-800 leading-snug">{card.title}</p>
        <div className="flex items-center gap-1 mt-2 flex-wrap">
          {card.tags.map(tag => (
            <span key={tag} className="text-xs bg-violet-100 text-violet-700 rounded px-1.5 py-0.5">{tag}</span>
          ))}
          {card.dueDate && (
            <span className={`text-xs rounded px-1.5 py-0.5 ml-auto ${isOverdue ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
              {card.dueDate}
            </span>
          )}
        </div>
        <button
          className="hidden group-hover:flex absolute top-2 right-2 text-slate-400 hover:text-red-500 text-xs"
          onClick={e => { e.stopPropagation(); deleteCard(card.id!) }}
        >
          ✕
        </button>
      </div>
      {showModal && <CardModal card={card} onClose={() => setShowModal(false)} />}
    </>
  )
}
