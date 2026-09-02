'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Logo, Card, Input, Button } from '@/components/ds'

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      if (data.ok) {
        router.push('/admin')
        router.refresh()
      } else {
        setError(data.message || 'Incorrect password.')
        setLoading(false)
      }
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-blush-100 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo size="md" />
        </div>
        <Card tone="paper" padding="lg">
          <p className="mb-6 font-display text-[22px] font-medium text-ink-900">Admin login</p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              required
            />
            {error && (
              <p className="font-body text-[13px] text-terracotta-700">{error}</p>
            )}
            <Button variant="primary" fullWidth loading={loading} type="submit">
              Sign in
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
