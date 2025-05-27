import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { ArrowLeft, Upload, Loader2 } from 'lucide-react'

interface UserProfile {
  username: string
  avatar_url: string | null
  university: string | null
  major: string | null
  study_start_year: number | null
}

export default function Settings() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user?.id)
        .single()

      if (error) throw error
      setProfile(data)
      if (data.avatar_url) {
        setAvatarPreview(data.avatar_url)
      }
    } catch (error) {
      toast.error('Nie udało się załadować profilu')
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadAvatar = async () => {
    if (!avatarFile) return null

    const fileExt = avatarFile.name.split('.').pop()
    const fileName = `${user?.id}/avatar.${fileExt}`

    try {
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, avatarFile, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      return publicUrl
    } catch (error) {
      console.error('Error uploading avatar:', error)
      throw error
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      // Update password if provided
      if (newPassword) {
        if (newPassword !== confirmPassword) {
          toast.error('Hasła nie są takie same')
          return
        }

        const { error: passwordError } = await supabase.auth.updateUser({
          password: newPassword
        })

        if (passwordError) throw passwordError
      }

      // Upload avatar if changed
      let avatarUrl = profile?.avatar_url
      if (avatarFile) {
        avatarUrl = await uploadAvatar()
      }

      // Update profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          username: profile?.username,
          avatar_url: avatarUrl,
          university: profile?.university,
          major: profile?.major,
          study_start_year: profile?.study_start_year
        })
        .eq('id', user?.id)

      if (profileError) throw profileError

      toast.success('Profil został zaktualizowany')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      toast.error('Nie udało się zaktualizować profilu')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
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
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Ustawienia konta</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zdjęcie profilowe
              </label>
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <Upload className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  <span>Zmień zdjęcie</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                </label>
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nazwa użytkownika
              </label>
              <input
                type="text"
                value={profile?.username || ''}
                onChange={(e) => setProfile(prev => ({ ...prev!, username: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            {/* University */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Uczelnia
              </label>
              <input
                type="text"
                value={profile?.university || ''}
                onChange={(e) => setProfile(prev => ({ ...prev!, university: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Nazwa uczelni"
              />
            </div>

            {/* Major */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Kierunek studiów
              </label>
              <input
                type="text"
                value={profile?.major || ''}
                onChange={(e) => setProfile(prev => ({ ...prev!, major: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Kierunek studiów"
              />
            </div>

            {/* Study start year */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Rok rozpoczęcia studiów
              </label>
              <input
                type="number"
                value={profile?.study_start_year || ''}
                onChange={(e) => setProfile(prev => ({ ...prev!, study_start_year: parseInt(e.target.value) || null }))}
                min="2000"
                max={new Date().getFullYear()}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="RRRR"
              />
            </div>

            {/* Password change */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Zmiana hasła</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nowe hasło
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Zostaw puste jeśli nie chcesz zmieniać"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Potwierdź nowe hasło
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {saving ? 'Zapisywanie...' : 'Zapisz zmiany'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}