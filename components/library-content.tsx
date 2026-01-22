"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { FileText, Search, MoreVertical, Download, Edit, Trash2, FolderOpen, RotateCcw, Upload, X, Home, Layout } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import Link from "next/link"
import { 
  getFiles, 
  downloadFileById, 
  renameFile, 
  deleteFile, 
  restoreFile, 
  permanentDeleteFile, 
  uploadFile,
  getFileDetail,
  type FileInfo 
} from "@/lib/api"

export function LibraryContent() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [activeTab, setActiveTab] = useState<"files" | "trash">("files")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [files, setFiles] = useState<FileInfo[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [renameFileId, setRenameFileId] = useState<string>("")
  const [renameValue, setRenameValue] = useState("")
  const [recentFiles, setRecentFiles] = useState<FileInfo[]>([])

  // 加载文件列表
  const loadFiles = async () => {
    setLoading(true)
    try {
      const response = await getFiles({
        page: currentPage,
        limit: 20,
        tab: activeTab,
        search: searchQuery,
      })
      if (response.success) {
        setFiles(response.data.files)
        setTotalPages(response.data.totalPages)
      } else {
        toast.error(response.message || '获取文件列表失败')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '加载文件列表失败'
      toast.error(errorMessage)
      console.error('加载文件列表错误:', error)
    } finally {
      setLoading(false)
    }
  }

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
    loadFiles()
  }, [activeTab, currentPage, searchQuery])

  useEffect(() => {
    loadRecentFiles()
  }, [])

  // 下载文件
  const handleDownload = async (fileId: string) => {
    try {
      await downloadFileById(fileId)
      toast.success('文件下载成功')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '下载失败')
    }
  }

  // 打开重命名对话框
  const handleRenameClick = (file: FileInfo) => {
    setRenameFileId(file.id)
    setRenameValue(file.name)
    setRenameDialogOpen(true)
  }

  // 确认重命名
  const handleRenameConfirm = async () => {
    if (!renameValue.trim()) {
      toast.error('文件名不能为空')
      return
    }
    try {
      await renameFile(renameFileId, renameValue.trim())
      toast.success('重命名成功')
      setRenameDialogOpen(false)
      loadFiles()
      loadRecentFiles()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '重命名失败')
    }
  }

  // 删除文件
  const handleDelete = async (fileId: string) => {
    try {
      await deleteFile(fileId)
      toast.success('文件已移动到回收站')
      loadFiles()
      loadRecentFiles()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '删除失败')
    }
  }

  // 还原文件
  const handleRestore = async (fileId: string) => {
    try {
      await restoreFile(fileId)
      toast.success('文件已还原')
      loadFiles()
      loadRecentFiles()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '还原失败')
    }
  }

  // 永久删除
  const handlePermanentDelete = async (fileId: string) => {
    if (!confirm('确定要永久删除此文件吗？此操作不可恢复。')) {
      return
    }
    try {
      await permanentDeleteFile(fileId)
      toast.success('文件已永久删除')
      loadFiles()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '永久删除失败')
    }
  }

  // 上传文件
  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.pptx')) {
      toast.error('只支持PPTX文件')
      return
    }

    if (file.size > 100 * 1024 * 1024) {
      toast.error('文件大小不能超过100MB')
      return
    }

    try {
      await uploadFile(file)
      toast.success('文件上传成功')
      loadFiles()
      loadRecentFiles()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '上传失败')
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // 点击文件进入详情页
  const handleFileClick = (file: FileInfo) => {
    router.push(`/library/${file.id}`)
  }

  // 查看全部
  const handleViewAll = () => {
    setActiveTab('files')
    setCurrentPage(1)
    setSearchQuery('')
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Left Sidebar */}
      <aside className="w-64 border-r border-border bg-muted/30">
        <div className="p-6">
          <div className="space-y-2">
            <nav className="space-y-2">
              <Link href="/workspace">
                <Button variant="ghost" className="w-full justify-start">
                  <Home className="h-4 w-4 mr-2" />
                  工作台
                </Button>
              </Link>
              <Link href="/library">
                <Button variant="default" className="w-full justify-start">
                  <FolderOpen className="h-4 w-4 mr-2" />
                  文件库
                </Button>
              </Link>
              <Link href="/templates">
                <Button variant="ghost" className="w-full justify-start">
                  <Layout className="h-4 w-4 mr-2" />
                  模版中心
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container py-8 pl-8">
          {/* 快捷导入卡片 */}
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-sm mb-1">导入本地PPT</h3>
                  <p className="text-xs text-muted-foreground">从电脑上传PPT文件</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-sm mb-1">PPT文案润色</h3>
                  <p className="text-xs text-muted-foreground">导入PPT一键美化</p>
                </div>
              </div>
            </Card>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pptx"
            onChange={handleUpload}
            className="hidden"
          />

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Button 
                  variant={activeTab === "files" ? "default" : "ghost"} 
                  onClick={() => {
                    setActiveTab("files")
                    setCurrentPage(1)
                  }}
                >
                  我的文件
                </Button>
                <Button 
                  variant={activeTab === "trash" ? "default" : "ghost"} 
                  onClick={() => {
                    setActiveTab("trash")
                    setCurrentPage(1)
                  }}
                >
                  回收站
                </Button>
              </div>

              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索文件..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          {/* File Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-muted-foreground">加载中...</p>
            </div>
          ) : files.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {files.map((file) => (
                  <Card key={file.id} className="group overflow-hidden hover:shadow-lg transition-all">
                    <div 
                      className="aspect-[16/9] bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center border-b border-border cursor-pointer overflow-hidden relative"
                      onClick={() => handleFileClick(file)}
                    >
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/files/${encodeURIComponent(file.id)}/thumbnail`}
                        alt={file.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // 如果图片加载失败，隐藏img，显示占位符图标
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            const placeholder = parent.querySelector('.thumbnail-placeholder');
                            if (placeholder) {
                              (placeholder as HTMLElement).style.display = 'flex';
                            }
                          }
                        }}
                      />
                      <div className="thumbnail-placeholder absolute inset-0 flex items-center justify-center" style={{ display: 'none' }}>
                        <FileText className="h-16 w-16 text-primary/60" />
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 
                        className="font-medium text-sm mb-2 line-clamp-1 cursor-pointer hover:text-primary"
                        onClick={() => handleFileClick(file)}
                      >
                        {file.name}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                        <span>{file.date}</span>
                        <span>{file.pages || 0}页</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {activeTab === "files" ? (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex-1 bg-transparent"
                              onClick={() => handleDownload(file.id)}
                            >
                              <Download className="h-3 w-3 mr-1" />
                              下载
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="ghost">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleFileClick(file)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  编辑
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleRenameClick(file)}>
                                  <FileText className="h-4 w-4 mr-2" />
                                  重命名
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={() => handleDelete(file.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  删除
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </>
                        ) : (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex-1 bg-transparent"
                              onClick={() => handleRestore(file.id)}
                            >
                              <RotateCcw className="h-3 w-3 mr-1" />
                              还原
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handlePermanentDelete(file.id)}
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              永久删除
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    上一页
                  </Button>
                  <div className="flex gap-1">
                    {[...Array(totalPages)].map((_, i) => (
                      <Button
                        key={i + 1}
                        variant={currentPage === i + 1 ? "default" : "outline"}
                        size="sm"
                        className="w-9"
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    下一页
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <FolderOpen className="h-24 w-24 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium mb-2">暂无文件</h3>
              <p className="text-muted-foreground text-sm mb-6">
                {activeTab === "files" ? "开始创建您的第一个PPT吧" : "回收站是空的"}
              </p>
              {activeTab === "files" && (
                <Link href="/workspace">
                  <Button>前往工作台</Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </main>

      {/* 重命名对话框 */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>重命名文件</DialogTitle>
          </DialogHeader>
          <Input
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            placeholder="请输入新文件名"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleRenameConfirm()
              }
            }}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleRenameConfirm}>
              确认
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
