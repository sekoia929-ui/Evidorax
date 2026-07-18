'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'
import UploadZone from '@/components/UploadZone'
import ExtractionDossier from '@/components/ExtractionDossier'
import { getProjects, getPapers, uploadPaper, checkPaperLimit } from '@/lib/supabase'
import { exportToExcel } from '@/lib/export'

export default function DashboardPage() {
  const [userId, setUserId] = useState(null) // set from auth session
  const [projects, setProjects] = useState([])
  const [activeProjectId, setActiveProjectId] = useState(null)
  const [papers, setPapers] = useState([])
  const [usage, setUsage] = useState({ used: 0, limit: 5 })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!userId) return
    getProjects(userId).then(setProjects)
    checkPaperLimit(userId).then(setUsage)
  }, [userId])

  useEffect(() => {
    if (!activeProjectId) return
    setLoading(true)
    getPapers(activeProjectId)
      .then(setPapers)
      .finally(() => setLoading(false))
  }, [activeProjectId])

  const activeProject = projects.find(p => p.id === activeProjectId)

  async function handleFilesSelected(files) {
    for (const file of files) {
      const paper = await uploadPaper(file, userId, activeProjectId)
      setPapers(prev => [paper, ...prev])
      // Kick off extraction pipeline via API route
      fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paperId: paper.id })
      })
    }
  }

  function handleExport() {
    const extractions = papers
      .map(p => p.extractions_structured?.[0])
      .filter(Boolean)
    if (extractions.length === 0) return
    exportToExcel(extractions, `${activeProject?.name || 'evidorax'}_extraction.xlsx`)
  }

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar
        projects={projects}
        activeProjectId={activeProjectId}
        onSelectProject={setActiveProjectId}
        onNewProject={() => { /* open create-project modal */ }}
        papersUsed={usage.used}
        papersLimit={usage.limit}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Topbar
          projectName={activeProject?.name}
          paperCount={papers.length}
          onExport={handleExport}
        />

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          {activeProjectId ? (
            <>
              <div style={{ marginBottom: 20 }}>
                <UploadZone onFilesSelected={handleFilesSelected} />
              </div>
              {loading ? (
                <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: '24px 0' }}>Loading dossier…</div>
              ) : (
                <ExtractionDossier papers={papers} />
              )}
            </>
          ) : (
            <div style={{ padding: '64px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Select or create a project to begin
              </div>
              <div style={{ fontSize: 13 }}>Each project holds the papers for one review or one guideline topic.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
