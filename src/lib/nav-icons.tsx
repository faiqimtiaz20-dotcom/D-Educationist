import {
  BarChart3,
  BookOpen,
  Building2,
  Calendar,
  CheckSquare,
  FileText,
  FolderOpen,
  Globe,
  GraduationCap,
  LayoutDashboard,
  Megaphone,
  MessageSquare,
  Plug,
  Settings,
  User,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react'

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  Calendar,
  MessageSquare,
  Users,
  FileText,
  Globe,
  GraduationCap,
  Wallet,
  Building2,
  BarChart3,
  FolderOpen,
  Settings,
  Plug,
  Megaphone,
  User,
  BookOpen,
  CheckSquare,
}

export function getNavIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? LayoutDashboard
}
