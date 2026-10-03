import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from 'react'
import { HashRouter, Link, Route, Routes } from 'react-router-dom'

import { appConstants } from './config/constants'
import { vi } from './locales/vi'
import { storage } from './data'
import type { Folder, Item, StudySet } from './data/types'
import { parseQuizletText } from './utils/import'
import { buildQuizQuestion, createDistractors, isAnswerCorrect } from './utils/quiz'
import { parseSnapshot } from './utils/snapshot'
import { shuffleItems } from './utils/shuffle'

function App() {
  return (
    <HashRouter>
      <div className="app-shell">
        <header className="topbar">
          <div className="brand-wrap">
            <div className="brand-badge">●</div>
            <div>
              <p className="eyebrow">{vi.appConfig}</p>
              <h1>{vi.appName}</h1>
            </div>
          </div>
          <nav className="header-actions">
            <Link to="/">{vi.folders}</Link>
            <BackupActions />
          </nav>
        </header>

        <main className="page-shell">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/folders/:folderId" element={<FolderDetailPage />} />
            <Route path="/sets/:setId" element={<SetDetailPage />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  )
}

function DashboardPage() {
  const [folders, setFolders] = useState<Folder[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchData, setSearchData] = useState<{ query: string; results: StudySet[] } | null>(null)
  const [folderName, setFolderName] = useState('')
  const [folderIcon, setFolderIcon] = useState<string>(appConstants.defaultFolderIcon)
  const [folderColor, setFolderColor] = useState<string>(appConstants.defaultFolderColor)
  const [selectedFolderId, setSelectedFolderId] = useState('')
  const [setName, setSetName] = useState('')
  const [setDescription, setSetDescription] = useState('')
  const [sampleText, setSampleText] = useState<string>(vi.sampleText)

  const refresh = useCallback(async () => {
    const nextFolders = await storage.listFolders()
    setFolders(nextFolders)
    if (!selectedFolderId && nextFolders[0]) {
      setSelectedFolderId(nextFolders[0].id)
    }
  }, [selectedFolderId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const query = searchQuery.trim()
  const searchResults = searchData?.query === query ? searchData.results : []

  useEffect(() => {
    let active = true
    if (!query) {
      return
    }

    void storage.searchStudySets(query).then((results) => {
      if (active) setSearchData({ query, results })
    }).catch(() => {
      if (active) setSearchData({ query, results: [] })
    })

    return () => {
      active = false
    }
  }, [query])

  const createFolder = async () => {
    const name = folderName.trim() || appConstants.defaultFolderName
    if (!name) return

    await storage.createFolder({
      name,
      icon: folderIcon,
      color: folderColor,
      ownerId: null,
    })

    setFolderName('')
    setFolderIcon(appConstants.defaultFolderIcon)
    setFolderColor(appConstants.defaultFolderColor)
    await refresh()
  }

  const createStudySet = async () => {
    const validFolderId = selectedFolderId || folders[0]?.id
    if (!validFolderId || !setName.trim()) return

    await storage.createStudySet({
      folderId: validFolderId,
      name: setName.trim(),
      description: setDescription.trim() || 'Bộ ôn tập của bạn',
      color: '#8b5cf6',
      icon: '📘',
      ownerId: null,
      itemIds: [],
    })

    setSetName('')
    setSetDescription('')
    await refresh()
  }

  const importSample = async () => {
    const validFolderId = selectedFolderId || folders[0]?.id
    if (!validFolderId) return

    const sets = await storage.listStudySets(validFolderId)
    const parsed = parseQuizletText(sampleText)
    const nextSet = await storage.createStudySet({
      folderId: validFolderId,
      name: `Bộ mẫu ${sets.length + 1}`,
      description: vi.importedFromText,
      color: '#22c55e',
      icon: '🧪',
      ownerId: null,
      itemIds: [],
    })

    for (let index = 0; index < parsed.length; index += 1) {
      const entry = parsed[index]
      await storage.createItem({
        studySetId: nextSet.id,
        type: 'card',
        order: index,
        ownerId: null,
        payload: { term: entry.term, definition: entry.definition },
      })
    }

    setSampleText(vi.sampleText)
    await refresh()
  }

  const folderCount = folders.length

  return (
    <div className="dashboard-content">
      <section className="panel search-panel">
        <label htmlFor="study-set-search">Tìm bộ ôn tập</label>
        <input
          id="study-set-search"
          type="search"
          placeholder="Nhập tên hoặc mô tả bộ học…"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
        {searchQuery.trim() && (
          <div className="search-results" aria-live="polite">
            {searchData?.query !== query ? <p>Đang tìm bộ ôn tập…</p> : searchResults.length ? searchResults.map((set) => (
              <Link key={set.id} to={`/sets/${set.id}`} className="search-result">
                <span>{set.icon} {set.name}</span>
                <small>{set.description}</small>
              </Link>
            )) : <p>Không tìm thấy bộ ôn tập phù hợp.</p>}
          </div>
        )}
      </section>

      <div className="layout-grid">
      <section className="panel panel-primary">
        <div className="section-header">
          <h2>{vi.folders}</h2>
          <span className="pill">{folderCount}</span>
        </div>

        {folders.length === 0 ? (
          <div className="empty-state">
            <h3>{vi.emptyTitle}</h3>
            <p>{vi.emptyDescription}</p>
          </div>
        ) : (
          <div className="card-grid">
            {folders.map((folder) => (
              <Link key={folder.id} to={`/folders/${folder.id}`} className="folder-card" style={{ borderColor: folder.color }}>
                <span className="folder-icon" style={{ background: folder.color }}>{folder.icon}</span>
                <strong>{folder.name}</strong>
              </Link>
            ))}
          </div>
        )}

        <div className="field-stack">
          <label>
            {vi.folderName}
            <input value={folderName} onChange={(event) => setFolderName(event.target.value)} />
          </label>
          <div className="inline-fields">
            <label>
              {vi.folderIcon}
              <input value={folderIcon} onChange={(event) => setFolderIcon(event.target.value)} />
            </label>
            <label>
              {vi.folderColor}
              <input type="color" value={folderColor} onChange={(event) => setFolderColor(event.target.value)} />
            </label>
          </div>
          <button type="button" className="primary-button" onClick={createFolder}>{vi.createFolder}</button>
        </div>
      </section>

      <aside className="panel">
        <div className="section-header">
          <h2>{vi.createStudySet}</h2>
        </div>

        <div className="field-stack">
          <label>
            {vi.folders}
            <select value={selectedFolderId} onChange={(event) => setSelectedFolderId(event.target.value)}>
              <option value="">{vi.selectFolder}</option>
              {folders.map((folder) => (
                <option key={folder.id} value={folder.id}>{folder.name}</option>
              ))}
            </select>
          </label>
          <label>
            {vi.setName}
            <input value={setName} onChange={(event) => setSetName(event.target.value)} />
          </label>
          <label>
            {vi.description}
            <textarea value={setDescription} onChange={(event) => setSetDescription(event.target.value)} rows={3} />
          </label>
          <button type="button" className="primary-button" onClick={createStudySet}>{vi.createStudySet}</button>
        </div>

        <div className="field-stack">
          <label>
            {vi.importFromText}
            <textarea value={sampleText} onChange={(event) => setSampleText(event.target.value)} rows={8} />
          </label>
          <button type="button" className="secondary-button" onClick={importSample}>{vi.importSample}</button>
        </div>
      </aside>
      </div>
    </div>
  )
}

function BackupActions() {
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  const exportBackup = async () => {
    setBusy(true)
    try {
      const snapshot = await storage.exportSnapshot()
      const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `on-tap-backup-${new Date().toISOString().slice(0, 10)}.json`
      link.click()
      URL.revokeObjectURL(url)
      setMessage('Đã tải bản sao lưu.')
    } catch {
      setMessage('Không thể tạo bản sao lưu.')
    } finally {
      setBusy(false)
    }
  }

  const importBackup = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0]
    event.currentTarget.value = ''
    if (!file) return
    if (!window.confirm('Khôi phục sẽ thay thế toàn bộ dữ liệu hiện tại. Bạn có muốn tiếp tục?')) return

    setBusy(true)
    try {
      const snapshot = parseSnapshot(await file.text())
      if (!snapshot) {
        setMessage('File không đúng định dạng bản sao lưu của ứng dụng.')
        return
      }
      await storage.importSnapshot(snapshot)
      window.location.reload()
    } catch {
      setMessage('Không thể khôi phục bản sao lưu.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="backup-actions">
      <button type="button" className="header-button" onClick={() => void exportBackup()} disabled={busy}>
        Xuất backup
      </button>
      <label className={`header-button file-button${busy ? ' is-disabled' : ''}`}>
        Khôi phục
        <input type="file" accept="application/json,.json" onChange={(event) => void importBackup(event)} disabled={busy} />
      </label>
      {message && <span className="backup-message" role="status">{message}</span>}
    </div>
  )
}

function FolderDetailPage() {
  const folderId = window.location.hash.split('/folders/')[1] ?? ''
  const [folder, setFolder] = useState<Folder | null>(null)
  const [sets, setSets] = useState<StudySet[]>([])

  const refresh = useCallback(async () => {
    const nextFolder = await storage.getFolder(folderId)
    const nextSets = await storage.listStudySets(folderId)
    setFolder(nextFolder)
    setSets(nextSets)
  }, [folderId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  if (!folder) {
    return <div className="panel">{vi.emptyTitle}</div>
  }

  return (
    <div className="panel">
      <div className="section-header">
        <h2>{folder.name}</h2>
        <Link to="/">← {vi.folders}</Link>
      </div>

      {sets.length === 0 ? (
        <div className="empty-state">{vi.noSets}</div>
      ) : (
        <div className="card-grid">
          {sets.map((set) => (
            <Link key={set.id} to={`/sets/${set.id}`} className="set-card" style={{ borderColor: set.color }}>
              <span className="folder-icon" style={{ background: set.color }}>{set.icon}</span>
              <div>
                <strong>{set.name}</strong>
                <small>{set.description}</small>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function SetDetailPage() {
  const setId = window.location.hash.split('/sets/')[1] ?? ''
  const [studySet, setStudySet] = useState<StudySet | null>(null)
  const [items, setItems] = useState<Item[]>([])
  const [term, setTerm] = useState('')
  const [definition, setDefinition] = useState('')
  const [importText, setImportText] = useState<string>(vi.sampleText)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [quizResult, setQuizResult] = useState<string | null>(null)
  const [shuffleOrder, setShuffleOrder] = useState<Item[] | null>(null)

  const refresh = useCallback(async () => {
    const nextSet = await storage.getStudySet(setId)
    setStudySet(nextSet)
    if (nextSet) {
      const nextItems = await storage.listItems(nextSet.id)
      setItems(nextItems)
      setShuffleOrder(null)
      setCurrentIndex(0)
    }
  }, [setId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const displayItems = shuffleOrder ?? items

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target
      if (target instanceof HTMLElement && (
        target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(target.tagName)
      )) return

      if (event.code === 'Space') {
        event.preventDefault()
        setFlipped((value) => !value)
      } else if (event.key === 'ArrowRight') {
        setCurrentIndex((value) => Math.min(displayItems.length - 1, value + 1))
        setFlipped(false)
      } else if (event.key === 'ArrowLeft') {
        setCurrentIndex((value) => Math.max(0, value - 1))
        setFlipped(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [displayItems.length])

  const addItem = async () => {
    if (!studySet || !term.trim() || !definition.trim()) return

    await storage.createItem({
      studySetId: studySet.id,
      type: 'card',
      order: items.length,
      ownerId: null,
      payload: { term: term.trim(), definition: definition.trim() },
    })

    setTerm('')
    setDefinition('')
    await refresh()
  }

  const importCards = async () => {
    if (!studySet) return

    const parsed = parseQuizletText(importText)
    for (let index = 0; index < parsed.length; index += 1) {
      const item = parsed[index]
      await storage.createItem({
        studySetId: studySet.id,
        type: 'card',
        order: items.length + index,
        ownerId: null,
        payload: { term: item.term, definition: item.definition },
      })
    }

    setImportText(vi.sampleText)
    await refresh()
  }

  const currentItem = displayItems[currentIndex] ?? null
  const quiz = useMemo(() => {
    if (!currentItem) return null
    return buildQuizQuestion(currentItem)
  }, [currentItem])

  const handleChoice = (selected: string) => {
    if (!quiz) return
    setQuizResult(isAnswerCorrect(quiz.answer, selected) ? vi.correct : vi.wrong)
  }

  if (!studySet) {
    return <div className="panel">{vi.emptyTitle}</div>
  }

  return (
    <div className="stacked-panel">
      <div className="section-header">
        <h2>{studySet.name}</h2>
        <Link to="/">← {vi.folders}</Link>
      </div>

      <div className="study-toolbar">
        <span>{displayItems.length} thẻ trong bộ này</span>
        <button
          type="button"
          className="secondary-button"
          onClick={() => {
            setShuffleOrder((current) => current ? null : shuffleItems(items))
            setCurrentIndex(0)
            setFlipped(false)
          }}
          disabled={items.length < 2}
        >
          {shuffleOrder ? 'Tắt xáo trộn' : 'Xáo trộn thẻ'}
        </button>
      </div>

      <div className="study-grid">
        <section className="panel panel-primary">
          <h3>{vi.flashcards}</h3>
          {currentItem ? (
            <>
              <div className="study-progress">
                <span>Thẻ {currentIndex + 1} / {displayItems.length}</span>
                <progress value={currentIndex + 1} max={displayItems.length} />
              </div>
              <div
                className="flashcard"
                role="button"
                tabIndex={0}
                aria-label="Lật thẻ ghi nhớ"
                onClick={() => setFlipped((value) => !value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') setFlipped((value) => !value)
                }}
              >
                <p>{flipped ? 'Định nghĩa' : 'Thuật ngữ'}</p>
                <strong>{flipped ? (currentItem.payload as { definition: string }).definition : (currentItem.payload as { term: string }).term}</strong>
              </div>
              <div className="button-row">
                <button type="button" className="secondary-button" onClick={() => setCurrentIndex((value) => Math.max(0, value - 1))}>{vi.previous}</button>
                <button type="button" className="primary-button" onClick={() => setFlipped((value) => !value)}>{vi.flip}</button>
                <button type="button" className="secondary-button" onClick={() => setCurrentIndex((value) => Math.min(displayItems.length - 1, value + 1))}>{vi.next}</button>
              </div>
              <p className="keyboard-hint">Phím tắt: ← → chuyển thẻ · Space lật thẻ</p>
            </>
          ) : (
            <div className="empty-state">{vi.noSets}</div>
          )}

          {quiz && (
            <div className="quiz-box">
              <h4>{vi.testMode}</h4>
              <p>{quiz.question}</p>
              <div className="choice-list">
                {[...quiz.choices, ...createDistractors(items, currentItem)].slice(0, appConstants.quizOptionsPerQuestion).map((option) => (
                  <button key={option} type="button" className="choice-button" onClick={() => handleChoice(option)}>
                    {option}
                  </button>
                ))}
              </div>
              {quizResult && <p className="result-text">{quizResult}</p>}
            </div>
          )}
        </section>

        <aside className="panel">
          <h3>{vi.addItem}</h3>
          <div className="field-stack">
            <label>
              {vi.term}
              <input value={term} onChange={(event) => setTerm(event.target.value)} />
            </label>
            <label>
              {vi.definition}
              <textarea value={definition} onChange={(event) => setDefinition(event.target.value)} rows={3} />
            </label>
            <button type="button" className="primary-button" onClick={addItem}>{vi.addItem}</button>
          </div>

          <div className="field-stack">
            <label>
              {vi.importFromText}
              <textarea value={importText} onChange={(event) => setImportText(event.target.value)} rows={8} />
            </label>
            <button type="button" className="secondary-button" onClick={importCards}>{vi.preview}</button>
          </div>
        </aside>
      </div>

      <section className="panel">
        <div className="section-header">
          <h3>{vi.reviewSets}</h3>
        </div>
        <div className="list-table">
          {items.map((item) => (
            <div key={item.id} className="list-row">
              <span>{(item.payload as { term?: string }).term ?? 'Thẻ'}</span>
              <small>{(item.payload as { definition?: string }).definition ?? ''}</small>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default App
