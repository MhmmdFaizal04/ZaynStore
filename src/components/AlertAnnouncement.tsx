'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface Announcement {
  id: number
  title: string
  content: string
  type: string
  created_at: string
  created_by_name: string
}

export default function AlertAnnouncement() {
  const { user } = useAuth()
  const [alertAnnouncements, setAlertAnnouncements] = useState<Announcement[]>([])
  const [currentAlert, setCurrentAlert] = useState<Announcement | null>(null)
  const [alertIndex, setAlertIndex] = useState(0)
  const [showAlert, setShowAlert] = useState(false)
  const [hasBeenClosed, setHasBeenClosed] = useState(false)

  const closeAlert = useCallback(() => {
    setShowAlert(false)
    setCurrentAlert(null)
    setAlertIndex(0)
    setHasBeenClosed(true)
    setAlertAnnouncements([]) // Clear all alerts to prevent re-showing
  }, [])

  useEffect(() => {
    // Only fetch alerts for logged-in users who are NOT admin
    if (user && user.role !== 'admin') {
      fetchAlertAnnouncements()
    }
  }, [user])

  useEffect(() => {
    if (alertAnnouncements.length > 0 && !currentAlert && !hasBeenClosed && user && user.role !== 'admin') {
      setCurrentAlert(alertAnnouncements[0])
      setShowAlert(true)
    }
  }, [alertAnnouncements, currentAlert, hasBeenClosed, user])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showAlert) {
        closeAlert()
      }
    }

    if (showAlert) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [showAlert, closeAlert])

  const fetchAlertAnnouncements = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/announcements', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        },
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        // Filter only alert-type announcements
        const alerts = (data.announcements || []).filter((ann: Announcement) => ann.type === 'alert')
        setAlertAnnouncements(alerts)
      }
    } catch (error) {
      console.error('Error fetching alert announcements:', error)
    }
  }

  const showNextAlert = () => {
    if (alertIndex + 1 < alertAnnouncements.length) {
      setAlertIndex(alertIndex + 1)
      setCurrentAlert(alertAnnouncements[alertIndex + 1])
    } else {
      closeAlert()
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeAlert()
    }
  }

  if (!showAlert || !currentAlert || !user || user.role === 'admin') {
    return null
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        {/* Alert Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Pengumuman</h2>
              {alertAnnouncements.length > 1 && (
                <p className="text-sm text-gray-500">
                  {alertIndex + 1} dari {alertAnnouncements.length}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={closeAlert}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Alert Body */}
        <div className="p-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            {currentAlert.title}
          </h3>
          <div className="text-gray-700 leading-relaxed mb-6 text-base">
            {currentAlert.content.split('\n').map((line, index) => (
              <p key={index} className={index > 0 ? 'mt-3' : ''}>
                {line}
              </p>
            ))}
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-200">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {currentAlert.created_by_name}
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {new Date(currentAlert.created_at).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>

          {/* Navigation for multiple alerts */}
          {alertAnnouncements.length > 1 && (
            <div className="flex justify-center items-center mt-6 pt-4 border-t border-gray-200">
              <div className="flex space-x-2 mr-4">
                {alertAnnouncements.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index === alertIndex ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              {alertIndex + 1 < alertAnnouncements.length && (
                <button
                  onClick={showNextAlert}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                >
                  Berikutnya
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
