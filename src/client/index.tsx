/**
 * dsh-todo-panel, browser half.
 *
 * Registers a "TODO" sidebar tab into dsh-better-sidebar:
 * - Card layout with priority colors (high/medium/low), Chinese UI.
 * - Tasks persist per-session to localStorage under `dsh-todo-panel:<sessionId>`
 *   (the same persistence family better-sidebar uses for its own layout).
 *
 * This file is a Cordis client plugin: no JSX transform runs, so we build the
 * tree with React.createElement. Every registration is wrapped in ctx.effect
 * so fiber disposal (HMR / plugin disable) unregisters cleanly.
 */
import type { Context } from '@deepseek-ai/cordis'
import type {} from 'dsh-better-sidebar/client/service'
import type { SessionScope } from 'dsh-better-sidebar/client/service'
import { useEffect, useState } from 'react'
import styles from './todo.module.css'

/** Session-scoped localStorage key prefix. */
const STORAGE_PREFIX = 'dsh-todo-panel:'

/** Priority vocabulary: label, tag color, description. */
const PRIORITIES = [
  { key: 'high', label: '高', color: '#e5484d', desc: '重要' },
  { key: 'medium', label: '中', color: '#f5a524', desc: '一般' },
  { key: 'low', label: '低', color: '#30a46c', desc: '可缓' },
] as const

type PriorityKey = typeof PRIORITIES[number]['key']

/** One task. */
interface TodoItem {
  id: string
  text: string
  done: boolean
  priority: PriorityKey
  created: number
}

function priorityOf(key: unknown): typeof PRIORITIES[number] {
  return PRIORITIES.find((p) => p.key === key) ?? PRIORITIES[1]
}

/** Read tasks for one session from localStorage. */
function loadTasks(sessionId: string | undefined): TodoItem[] {
  if (sessionId === undefined) return []
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + sessionId)
    if (raw === null) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((x): x is TodoItem => {
      if (typeof x !== 'object' || x === null) return false
      const o = x as Record<string, unknown>
      return typeof o.id === 'string' && typeof o.text === 'string' && typeof o.done === 'boolean'
    })
  } catch {
    return []
  }
}

/** Persist tasks for one session to localStorage. */
function saveTasks(sessionId: string | undefined, items: TodoItem[]): void {
  if (sessionId === undefined) return
  try {
    localStorage.setItem(STORAGE_PREFIX + sessionId, JSON.stringify(items))
  } catch {
    // Quota / privacy mode: persist is best-effort, in-memory state still works.
  }
}

/** Services required before mounting (provided by the client runtime and
 *  better-sidebar's registry). `betterSidebar` is optional (peer), so we
 *  guard on it and no-op when absent. */
export const inject = ['betterSidebar']

/** Register the TODO tab into the sidebar. */
export function apply(ctx: Context): void {
  const bs = ctx.get('betterSidebar')
  if (bs === undefined) return

  ctx.effect(() => bs.registerTab({
    id: 'todo',
    title: () => 'TODO',
    icon: (size: number) => (
      <span style={{ fontSize: `${size}px`, lineHeight: 1 }}>☑</span>
    ),
    order: 60,
    single: true,
    component: ({ scope }) => <TodoPanel scope={scope} />,
  }))
}

/** The panel body: one task list bound to the session. */
function TodoPanel({ scope }: { readonly scope: SessionScope }) {
  const sessionId = scope?.sessionId
  const [items, setItems] = useState<TodoItem[]>(() => loadTasks(sessionId))
  const [text, setText] = useState('')
  const [priority, setPriority] = useState<PriorityKey>('medium')

  // Reload when the session changes (workspace switch remounts or swaps scope).
  useEffect(() => {
    setItems(loadTasks(sessionId))
  }, [sessionId])

  const save = (next: TodoItem[]) => {
    setItems(next)
    saveTasks(sessionId, next)
  }

  const add = () => {
    const t = text.trim()
    if (t === '') return
    const now = Date.now()
    save([...items, { id: String(now), text: t, done: false, priority, created: now }])
    setText('')
  }

  const toggle = (id: string) => {
    save(items.map((it) => it.id === id ? { ...it, done: !it.done } : it))
  }

  const cyclePriority = (id: string) => {
    save(items.map((it) => {
      if (it.id !== id) return it
      const idx = PRIORITIES.findIndex((p) => p.key === it.priority)
      const next = PRIORITIES[(idx + 1) % PRIORITIES.length]
      // PRIORITIES is a non-empty const tuple, so the index is always defined.
      if (next === undefined) return it
      return { ...it, priority: next.key }
    }))
  }

  const remove = (id: string) => {
    save(items.filter((it) => it.id !== id))
  }

  const clearDone = () => {
    save(items.filter((it) => !it.done))
  }

  const pendingCount = items.filter((i) => !i.done).length

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.title}>TODO 任务列表</span>
        <span className={pendingCount > 0 ? styles.badgeActive : styles.badge}>
          {pendingCount} 待办
        </span>
      </div>

      <div className={styles.inputRow}>
        <input
          className={styles.input}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') add() }}
          placeholder="添加任务...（回车确认）"
        />
        <select
          className={styles.prioritySelect}
          value={priority}
          onChange={(e) => setPriority(e.target.value as PriorityKey)}
        >
          {PRIORITIES.map((p) => (
            <option key={p.key} value={p.key}>{p.label}（{p.desc}）</option>
          ))}
        </select>
        <button className={styles.addButton} onClick={add}>添加</button>
      </div>

      <div className={styles.list}>
        {items.length === 0 ? (
          <div className={styles.empty}>暂无任务，在上方添加一个吧</div>
        ) : (
          items.map((it) => {
            const p = priorityOf(it.priority)
            return (
              <div
                key={it.id}
                className={styles.card}
                style={{ borderLeft: `4px solid ${it.done ? 'var(--dsw-alias-border-l2)' : p.color}` }}
              >
                <span
                  className={`${styles.checkbox} ${it.done ? styles.checkboxDone : ''}`}
                  style={it.done ? undefined : { borderColor: p.color }}
                  onClick={() => toggle(it.id)}
                >
                  {it.done ? '✓' : ''}
                </span>
                <span className={`${styles.text} ${it.done ? styles.textDone : ''}`}>
                  {it.text}
                </span>
                <span
                  className={styles.priorityTag}
                  style={{ background: it.done ? 'var(--dsw-alias-border-l2)' : p.color }}
                  title={`点击切换优先级：${p.label}（${p.desc}）`}
                  onClick={() => cyclePriority(it.id)}
                >
                  {p.label}
                </span>
                <button className={styles.deleteButton} onClick={() => remove(it.id)}>×</button>
              </div>
            )
          })
        )}
      </div>

      <div className={styles.footer}>
        <span>未完成 {pendingCount} / 共 {items.length} 项</span>
        {items.some((i) => i.done) && (
          <button className={styles.clearButton} onClick={clearDone}>清除已完成</button>
        )}
      </div>
    </div>
  )
}
