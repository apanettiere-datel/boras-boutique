'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Logo, Icon } from '@/components/ds'

const NAV = [
  { href: '/admin', label: 'Overview', icon: 'grid', exact: true },
  { href: '/admin/inventory', label: 'Inventory', icon: 'package' },
  { href: '/admin/orders', label: 'Orders', icon: 'truck' },
  { href: '/admin/products', label: 'Products', icon: 'tag' },
  { href: '/admin/subscribers', label: 'Subscribers', icon: 'mail' },
]

function NavLink({ href, label, icon, active, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={[
        'flex items-center gap-3 rounded-md px-3 py-2.5 font-body text-[13px] font-semibold transition-colors duration-150',
        active ? 'bg-blush-200 text-rose-700' : 'text-ink-700 hover:bg-blush-100',
      ].join(' ')}
    >
      <Icon name={icon} size={17} />
      {label}
    </Link>
  )
}

export function AdminShell({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  function isActive(href, exact) {
    return exact ? pathname === href : pathname.startsWith(href)
  }

  async function signOut() {
    await fetch('/api/admin/login', { method: 'DELETE' })
    router.push('/admin/login')
  }

  const sidebarBottom = (onLinkClick) => (
    <div className="mt-auto flex flex-col gap-1 border-t border-line-soft pt-4">
      <Link
        href="/"
        onClick={onLinkClick}
        className="flex items-center gap-3 rounded-md px-3 py-2.5 font-body text-[13px] font-semibold text-ink-700 hover:bg-blush-100 transition-colors duration-150"
      >
        <Icon name="eye" size={17} />
        View shop
      </Link>
      <button
        onClick={signOut}
        className="flex items-center gap-3 rounded-md px-3 py-2.5 font-body text-[13px] font-semibold text-ink-700 hover:bg-blush-100 transition-colors duration-150 cursor-pointer text-left"
      >
        <Icon name="lock" size={17} />
        Sign out
      </button>
    </div>
  )

  return (
    <div className="relative flex min-h-screen bg-blush-100">
      {/* Desktop sidebar */}
      <aside className="hidden w-[228px] shrink-0 flex-col border-r border-line-soft bg-cream-50 p-5 lg:flex">
        <div className="mb-6">
          <Logo size="sm" />
        </div>
        <nav className="flex flex-col gap-1">
          {NAV.map(({ href, label, icon, exact }) => (
            <NavLink
              key={href}
              href={href}
              label={label}
              icon={icon}
              active={isActive(href, exact)}
            />
          ))}
        </nav>
        {sidebarBottom(undefined)}
      </aside>

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-30 flex items-center gap-3 border-b border-line-soft bg-cream-50 px-4 py-3 lg:hidden">
        <Logo size="sm" />
        <button
          onClick={() => setMobileOpen((o) => !o)}
          className="ml-auto flex h-9 w-9 items-center justify-center rounded-md hover:bg-blush-100 cursor-pointer"
          aria-label="Toggle menu"
        >
          <Icon name={mobileOpen ? 'close' : 'menu'} size={20} />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-20 lg:hidden">
          <div
            className="absolute inset-0 bg-ink-900/20"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-[240px] flex flex-col bg-cream-50 p-5 pt-[60px] shadow-lift">
            <nav className="flex flex-col gap-1">
              {NAV.map(({ href, label, icon, exact }) => (
                <NavLink
                  key={href}
                  href={href}
                  label={label}
                  icon={icon}
                  active={isActive(href, exact)}
                  onClick={() => setMobileOpen(false)}
                />
              ))}
            </nav>
            {sidebarBottom(() => setMobileOpen(false))}
          </aside>
        </div>
      )}

      {/* Content area */}
      <div className="min-w-0 flex-1 pt-[52px] lg:pt-0">{children}</div>
    </div>
  )
}
