import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { PlusCircle, Trash2, Star } from 'lucide-react'
import UserMenu from '../components/UserMenu'
import { supabase } from '../lib/supabase'
import { toast } from 'sonner'

interface Note {
  id: string
  title: string
  created_at: string
  subjects: {
    name: string
  }
  professors: {
    name: string
  }
  user_profiles: {
    username: string
    university: string | null
    major: string | null
  }
  user_id: string
  file_type: string
  content: string | null
  average_rating: number
}

function Home() {
  const { user } = useAuth()
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select(`
          *,
          subjects (name),
          professors (name),
          user_profiles (username, university, major)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setNotes(data || [])
    } catch (error) {
      console.error('Error fetching notes:', error)
      toast.error('Nie udało się załadować notatek')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (noteId: string, userId: string) => {
    if (userId !== user?.id) {
      toast.error('Możesz usuwać tylko własne notatki')
      return
    }

    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId)

      if (error) throw error

      setNotes(notes.filter(note => note.id !== noteId))
      toast.success('Notatka została usunięta')
    } catch (error) {
      console.error('Error deleting note:', error)
      toast.error('Nie udało się usunąć notatki')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Notatki</h1>
          <div className="flex items-center space-x-4">
            <Link
              to="/add-note"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              Dodaj notatkę
            </Link>
            <UserMenu />
          </div>
        </div>

        {notes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-500">Brak notatek. Dodaj swoją pierwszą notatkę!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => (
              <div
                key={note.id}
                onClick={() => navigate(`/notes/${note.id}`)}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {note.title}
                    </h2>
                    {note.user_id === user?.id && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(note.id, note.user_id)
                        }}
                        className="text-red-500 hover:text-red-700 ml-2"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Autor: {note.user_profiles.username}
                    {note.user_profiles.university && (
                      <span className="block text-xs text-gray-400">
                        {note.user_profiles.university}
                        {note.user_profiles.major && ` - ${note.user_profiles.major}`}
                      </span>
                    )}
                  </p>
                  <div className="mt-4 space-y-2">
                    <p className="text-sm text-gray-600">
                      Przedmiot: {note.subjects?.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      Prowadzący: {note.professors?.name}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {new Date(note.created_at).toLocaleDateString()}
                    </span>
                    <div className="flex items-center">
                      <div className="flex items-center mr-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= Math.round(note.average_rating || 0)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium text-blue-600">
                        {note.file_type === 'text' ? 'Notatka tekstowa' : note.file_type.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}