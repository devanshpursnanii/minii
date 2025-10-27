'use client'

import { Button } from '@/components/ui/button'
import { FileText } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="text-center">
          <div className="mx-auto mb-8 h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center">
            <FileText className="h-12 w-12 text-gray-400" />
          </div>
          <h1 className="mb-4 text-3xl font-bold text-gray-900">
            Welcome to Pensift
          </h1>
          <p className="mb-8 text-lg text-gray-600">
            Your creative workspace for thoughts, ideas, and stories.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/workspace">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Go to Workspace
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
