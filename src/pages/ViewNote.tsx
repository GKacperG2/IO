import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { ArrowLeft, Download, Star } from 'lucide-react'

interface Note {
  id: string
  title: string
  file_path: string | null
  file_type: string
  content: string | null
  created_at: string
  user_profiles: {
    username: string
  }
  subjects: {
    name: string
  }
  professors: {
    name: string
  }
  year: number
  average_rating: number
  download_count: number
}

interface Rating {
  id: string
  stars: number
  comment: string
  user_profiles: {
    username: string
  }
  created_at: string
}

export default function ViewNote() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [note, setNote] = useState<Note | null>(null)
  const [ratings, setRatings] = useState<Rating[]>([])
  const [userRating, setUserRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNoteAndRatings()
  }, [id])

  const fetchNoteAndRatings = async () => {
    try {
      const { data: noteData, error: noteError } = await supabase
        .from('notes')
        .select(`
          *,
          user_profiles (username),
          subjects (name),
          professors (name)
        `)
        .eq('id', id)
        .single()

      if (noteError) throw noteError
      setNote(noteData)

      const { data: ratingsData, error: ratingsError } = await supabase
        .from('ratings')
        .select(`
          *,
          user_profiles!ratings_user_id_fkey (username)
        `)
        .eq('note_id', id)
        .order('created_at', { ascending: false })

      if (ratingsError) throw ratingsError
      setRatings(ratingsData)

      // Check if user has already rated
      const userRating = ratingsData.find(r => r.user_id === user?.id)
      if (userRating) {
        setUserRating(userRating.stars)
        setComment(userRating.comment || '')
      }
    } catch (error) {
      toast.error('Nie udało się załadować notatki')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!note?.file_path) {
      toast.error('Ta notatka nie zawiera pliku do pobrania')
      return
    }

    try {
      const { data, error } = await supabase.storage
        .from('notes')
        .download(note.file_path)

      if (error) throw error

      // Record download
      await supabase.from('downloads').insert([
        { note_id: id, user_id: user?.id }
      ])

      // Create download link
      const url = window.URL.createObjectURL(data)
      const link = document.createElement('a')
      link.href = url
      link.download = note.title || 'note'
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      toast.success('Pobieranie rozpoczęte')
    } catch (error) {
      toast.error('Nie udało się pobrać pliku')
    }
  }

  const handleRating = async (stars: number) => {
    try {
      const { error } = await supabase.from('ratings').upsert([
        {
          note_id: id,
          user_id: user?.id,
          stars,
          comment
        }
      ])

      if (error) throw error

      toast.success('Ocena została dodana')
      fetchNoteAndRatings()
    } catch (error) {
      toast.error('Nie udało się dodać oceny')
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Ładowanie...</div>
  }

  if (!note) {
    return <div className="flex justify-center items-center min-h-screen">Nie znaleziono notatki</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Powrót
        </button>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{note.title}</h1>
                <p className="text-gray-500 mt-2">
                  Dodane przez {note.user_profiles.username}
                </p>
              </div>
              {note.file_path && (
                <button
                  onClick={handleDownload}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Pobierz
                </button>
              )}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Przedmiot</p>
                <p className="font-medium">{note.subjects.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Prowadzący</p>
                <p className="font-medium">{note.professors.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Rok</p>
                <p className="font-medium">{note.year}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Pobrania</p>
                <p className="font-medium">{note.download_count}</p>
              </div>
            </div>

            {note.content && (
              <div className="mt-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Treść notatki</h2>
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                    {note.content}
                  </pre>
                </div>
              </div>
            )}

            <div className="mt-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Oceń notatkę</h2>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRating(star)}
                    className={`p-1 ${userRating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                  >
                    <Star className="w-8 h-8" fill={userRating >= star ? 'currentColor' : 'none'} />
                  </button>
                ))}
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Dodaj komentarz (opcjonalnie)"
                className="mt-4 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                rows={3}
              />
            </div>

            <div className="mt-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Oceny</h2>
              <div className="space-y-4">
                {ratings.map((rating) => (
                  <div key={rating.id} className="border-b pb-4">
                    <div className="flex items-center">
                      <div className="flex items-center">
                        {Array.from({ length: rating.stars }).map((_, i) => (
                          <Star key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" />
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-gray-500">
                        przez {rating.user_profiles.username}
                      </span>
                    </div>
                    {rating.comment && (
                      <p className="mt-2 text-gray-700">{rating.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}