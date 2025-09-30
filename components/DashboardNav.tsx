'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Calendar, CheckSquare, FolderOpen, Settings, PieChart } from 'lucide-react'

const navItems = [
  {
    title: "Aujourd'hui",
    href: '/today',
    icon: Calendar,
  },
  {
    title: 'Tâches',
    href: '/tasks',
    icon: CheckSquare,
  },
  {
    title: 'Projets',
    href: '/projects',
    icon: FolderOpen,
  },
  {
    title: 'Budget',
    href: '/budget',
    icon: PieChart,
  },
  {
    title: 'Paramètres',
    href: '/settings',
    icon: Settings,
  },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center space-x-6">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary',
              isActive
                ? 'text-primary'
                : 'text-muted-foreground'
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{item.title}</span>
          </Link>
        )
      })}
    </nav>
  )
}
