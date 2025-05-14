import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { PlusCircle } from 'lucide-react'

function Home() {
  const { user } = useAuth()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Notes</h1>
        <Link
          to="/add-note"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          Add New Note
        </Link>
      </div>

      {/* Notes list will be implemented later */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <p className="text-gray-500 text-center">No notes yet. Create your first note!</p>
        </div>
      </div>
    </div>
  )
}

export default Home