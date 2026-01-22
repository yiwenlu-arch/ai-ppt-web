"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home, FolderOpen, Layout, FileText } from "lucide-react"
import { getFiles, type FileInfo } from "@/lib/api"

export function WorkspaceSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const [recentFiles, setRecentFiles] = useState<FileInfo[]>([])

  // 加载最近文件
  const loadRecentFiles = async () => {
    try {
      const response = await getFiles({
        page: 1,
        limit: 3,
        tab: 'files',
      })
      if (response.success) {
        setRecentFiles(response.data.files.slice(0, 3))
      }
    } catch (error) {
      console.error('加载最近文件失败:', error)
    }
  }

  useEffect(() => {
    loadRecentFiles()
  }, [])

  // 点击文件进入详情页
  const handleFileClick = (file: FileInfo) => {
    router.push(`/library/${file.id}`)
  }

  // 查看全部
  const handleViewAll = () => {
    router.push('/library')
  }

  return (
    <aside className="w-64 border-r bg-muted/30 p-6 flex flex-col overflow-auto">
      <div className="space-y-2">
        <nav className="space-y-2">
          <Button 
            variant={pathname === "/workspace" ? "default" : "ghost"} 
            className="w-full justify-start" 
            asChild
          >
            <Link href="/workspace">
              <Home className="h-4 w-4 mr-2" />
              工作台
            </Link>
          </Button>
          <Button 
            variant={pathname === "/library" ? "default" : "ghost"} 
            className="w-full justify-start" 
            asChild
          >
            <Link href="/library">
              <FolderOpen className="h-4 w-4 mr-2" />
              文件库
            </Link>
          </Button>
          <Button 
            variant={pathname === "/templates" ? "default" : "ghost"} 
            className="w-full justify-start" 
            asChild
          >
            <Link href="/templates">
              <Layout className="h-4 w-4 mr-2" />
              模版中心
            </Link>
          </Button>
        </nav>
      </div>

      {/* 最近文件移至底部 */}
      <div className="mt-auto pt-8 border-t border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium">最近文件</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-auto p-0 text-xs text-primary"
            onClick={handleViewAll}
          >
            查看全部
          </Button>
        </div>
        <div className="space-y-2">
          {recentFiles.length > 0 ? (
            recentFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer p-2 rounded-md hover:bg-accent/50 transition-colors"
                onClick={() => handleFileClick(file)}
              >
                <FileText className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{file.name}</span>
              </div>
            ))
          ) : (
            <p className="text-xs text-muted-foreground p-2">暂无最近文件</p>
          )}
        </div>
      </div>
    </aside>
  )
}
