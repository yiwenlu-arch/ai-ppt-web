"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, Download, ArrowLeft, Edit, Trash2 } from "lucide-react"
import { getFileDetail, downloadFileById, deleteFile, type FileInfo } from "@/lib/api"
import { toast } from "sonner"
import Link from "next/link"

export default function FileDetailPage() {
  const params = useParams()
  const router = useRouter()
  const fileId = params.id as string
  const [file, setFile] = useState<FileInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadFile = async () => {
      try {
        const response = await getFileDetail(decodeURIComponent(fileId))
        if (response.success) {
          setFile(response.data)
        } else {
          toast.error('文件不存在')
          router.push('/library')
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : '加载文件详情失败')
        router.push('/library')
      } finally {
        setLoading(false)
      }
    }

    if (fileId) {
      loadFile()
    }
  }, [fileId, router])

  const handleDownload = async () => {
    if (!file) return
    try {
      await downloadFileById(file.id)
      toast.success('文件下载成功')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '下载失败')
    }
  }

  const handleDelete = async () => {
    if (!file) return
    if (!confirm('确定要删除此文件吗？文件将移动到回收站。')) {
      return
    }
    try {
      await deleteFile(file.id)
      toast.success('文件已移动到回收站')
      router.push('/library')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '删除失败')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader currentPage="files" showUser />
        <div className="flex items-center justify-center py-16">
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    )
  }

  if (!file) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader currentPage="files" showUser />
      <div className="container py-8">
        <div className="mb-6">
          <Link href="/library">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回文件库
            </Button>
          </Link>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              <div className="w-48 h-32 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg flex items-center justify-center border-2 border-border">
                <FileText className="h-16 w-16 text-primary/60" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-4">{file.name}</h1>
                <div className="space-y-2 text-sm text-muted-foreground mb-6">
                  <div className="flex items-center gap-4">
                    <span>创建日期：{file.date}</span>
                    <span>页数：{file.pages || 0}页</span>
                    <span>大小：{(file.size / 1024 / 1024).toFixed(2)}MB</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    下载
                  </Button>
                  <Button variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    编辑
                  </Button>
                  <Button variant="destructive" onClick={handleDelete}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    删除
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
