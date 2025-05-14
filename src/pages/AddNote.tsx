import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { ArrowLeft, Plus } from 'lucide-react'

export default function AddNote() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [professor, setProfessor] = useState('')
  const [year, setYear] = useState('')
  const [noteType, setNoteType] = useState<'file' | 'text'>('file')
  const [file, setFile] = useState<File | null>(null)
  const [content, setContent] = useState('')
  const [subjects, setSubjects] = useState<Array<{ id: string; name: string }>>([])
  const [professors, setProfessors] = useState<Array<{ id: string; name: string }>>([])
  const [newSubject, setNewSubject] = useState('')
  const [newProfessor, setNewProfessor] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchSubjectsAndProfessors()
  }, [])

  const fetchSubjectsAndProfessors = async () => {
    const [subjectsData, professorsData] = await Promise.all([
      supabase.from('subjects').select('id, name').order('name'),
      supabase.from('professors').select('id, name').order('name')
    ])

    if (subjectsData.data) setSubjects(subjectsData.data)
    if (professorsData.data) setProfessors(professorsData.data)
  }

  const handleAddSubject = async () => {
    if (!newSubject.trim()) {
      toast.error('Wprowadź nazwę przedmiotu')
      return
    }

    try {
      const { data, error } = await supabase
        .from('subjects')
        .insert([{ name: newSubject.trim() }])
        .select()
        .single()

      if (error) throw error

      setSubjects([...subjects, data])
      setSubject(data.id)
      setNewSubject('')
      toast.success('Dodano nowy przedmiot')
    } catch (error) {
      toast.error('Nie udało się dodać przedmiotu')
    }
  }

  const handleAddProfessor = async () => {
    if (!newProfessor.trim()) {
      toast.error('Wprowadź nazwę prowadzącego')
      return
    }

    try {
      const { data, error } = await supabase
        .from('professors')
        .insert([{ name: newProfessor.trim() }])
        .select()
        .single()

      if (error) throw error

      setProfessors([...professors, data])
      setProfessor(data.id)
      setNewProfessor('')
      toast.success('Dodano nowego prowadzącego')
    } catch (error) {
      toast.error('Nie udało się dodać prowadzącego')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (noteType === 'file' && !file) {
      toast.error('Proszę wybrać plik')
      return
    }

    if (noteType === 'text' && !content.trim()) {
      toast.error('Proszę wprowadzić treść notatki')
      return
    }

    setLoading(true)
    try {
      let filePath = null
      let fileType = noteType === 'text' ? 'text' : null

      if (noteType === 'file' && file) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        filePath = `${user?.id}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('notes')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        fileType = fileExt === 'pdf' ? 'pdf' : 'image'
      }

      const { error: dbError } = await supabase.from('notes').insert([
        {
          title,
          subject_id: subject,
          professor_id: professor,
          year: parseInt(year),
          user_id: user?.id,
          file_path: filePath,
          file_type: fileType,
          content: noteType === 'text' ? content : null
        }
      ])

      if (dbError) throw dbError

      toast.success('Notatka została dodana!')
      navigate('/')
    } catch (error) {
      toast.error('Wystąpił błąd podczas dodawania notatki')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Powrót
        </button>

        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Dodaj nową notatkę</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Tytuł</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Przedmiot</label>
              <div className="mt-1 flex gap-2">
                <select
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">Wybierz przedmiot</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="Nowy przedmiot"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddSubject}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Prowadzący</label>
              <div className="mt-1 flex gap-2">
                <select
                  required
                  value={professor}
                  onChange={(e) => setProfessor(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">Wybierz prowadzącego</option>
                  {professors.map((professor) => (
                    <option key={professor.id} value={professor.id}>
                      {professor.name}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newProfessor}
                    onChange={(e) => setNewProfessor(e.target.value)}
                    placeholder="Nowy prowadzący"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddProfessor}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Rok</label>
              <input
                type="number"
                required
                value={year}
                onChange={(e) => setYear(e.target.value)}
                min="2000"
                max="2100"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Typ notatki</label>
              <div className="mt-1 space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="file"
                    checked={noteType === 'file'}
                    onChange={(e) => setNoteType(e.target.value as 'file')}
                    className="form-radio text-indigo-600"
                  />
                  <span className="ml-2">Plik (PDF lub zdjęcie)</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="text"
                    checked={noteType === 'text'}
                    onChange={(e) => setNoteType(e.target.value as 'text')}
                    className="form-radio text-indigo-600"
                  />
                  <span className="ml-2">Notatka tekstowa</span>
                </label>
              </div>
            </div>

            {noteType === 'file' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Plik (PDF lub zdjęcie)
                </label>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="mt-1 block w-full"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700">Treść notatki</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={10}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Wprowadź treść notatki..."
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Dodawanie...' : 'Dodaj notatkę'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}