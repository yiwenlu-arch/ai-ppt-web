"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import axios from "axios"
import * as fabric from "fabric"
import JSZip from "jszip"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  ArrowLeft, RefreshCw, Loader2, ZoomIn, ZoomOut, RotateCcw, 
  Undo2, Redo2, Download, FileImage, FileText, Plus, Trash2,
  MoveUp, MoveDown, Bold, Italic, AlignLeft, AlignCenter, AlignRight,
  RotateCw, Type, Palette
} from "lucide-react"
import { toast } from "sonner"
import { saveAs } from "file-saver"
import html2canvas from "html2canvas"
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, 
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter, 
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger 
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

/**
 * PPT页面数据结构
 */
interface PPTPage {
  pageNumber: number
  width: number
  height: number
  objects: fabric.Object[]
  thumbnail?: string
}

/**
 * 编辑历史记录
 */
interface EditHistory {
  pages: PPTPage[]
  timestamp: number
}

/**
 * 缓存数据结构
 */
interface CacheData {
  fileUrl: string
  pages: PPTPage[]
  totalPages: number
  timestamp: number
}

/**
 * PPT预览编辑组件
 */
export function PPTPreviewEditor() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // 路由参数：PPTX文件下载链接
  const fileUrl = searchParams.get("fileUrl") || ""
  
  // 状态管理
  const [downloadProgress, setDownloadProgress] = useState(0) // 下载进度 0-100
  const [statusMessage, setStatusMessage] = useState("AI正在加载PPT内容")
  const [isDownloading, setIsDownloading] = useState(false)
  const [isParsing, setIsParsing] = useState(false)
  const [isRendering, setIsRendering] = useState(false)
  const [isEditable, setIsEditable] = useState(false)
  const [renderedPages, setRenderedPages] = useState(0) // 已渲染的页数
  const [totalPages, setTotalPages] = useState(0) // PPT总页数
  const [currentPageIndex, setCurrentPageIndex] = useState(0) // 当前显示的页面索引
  const [pages, setPages] = useState<PPTPage[]>([]) // PPT页面数据
  const [error, setError] = useState<string | null>(null)
  const [canvasScale, setCanvasScale] = useState(1) // 画布缩放比例
  
  // 新增状态：文本样式编辑
  const [selectedTextStyle, setSelectedTextStyle] = useState({
    fontFamily: "Arial",
    fontSize: 20,
    fontWeight: "normal",
    fontStyle: "normal",
    fill: "#000000",
    textAlign: "left",
  })
  
  // 新增状态：撤销/重做
  const [history, setHistory] = useState<EditHistory[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [isUndoRedo, setIsUndoRedo] = useState(false)
  
  // 新增状态：页面拖拽
  const [draggedPageIndex, setDraggedPageIndex] = useState<number | null>(null)
  
  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const canvasInstanceRef = useRef<fabric.Canvas | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const pptxBlobRef = useRef<Blob | null>(null)
  const originalPPTXRef = useRef<JSZip | null>(null) // 保存原始PPTX结构
  const guidelineRefs = useRef<{ v: fabric.Line[], h: fabric.Line[] }>({ v: [], h: [] }) // 对齐辅助线
  const isCtrlPressedRef = useRef(false) // Ctrl键状态
  
  /**
   * 保存编辑历史记录
   */
  const saveHistory = useCallback(() => {
    if (isUndoRedo) return // 撤销/重做操作不记录历史
    
    const currentHistory = {
      pages: JSON.parse(JSON.stringify(pages)), // 深拷贝
      timestamp: Date.now(),
    }
    
    setHistory((prev) => {
      // 如果当前不在历史记录的末尾，删除后面的记录（分支历史）
      const newHistory = prev.slice(0, historyIndex + 1)
      newHistory.push(currentHistory)
      
      // 限制历史记录数量（最多50条）
      if (newHistory.length > 50) {
        newHistory.shift()
        setHistoryIndex(newHistory.length - 1)
      } else {
        setHistoryIndex(newHistory.length - 1)
      }
      
      return newHistory
    })
  }, [pages, historyIndex, isUndoRedo])
  
  /**
   * 撤销操作
   */
  const handleUndo = useCallback(() => {
    if (historyIndex <= 0) {
      toast.info("没有可撤销的操作")
      return
    }
    
    setIsUndoRedo(true)
    const prevHistory = history[historyIndex - 1]
    if (prevHistory) {
      setPages(prevHistory.pages)
      setHistoryIndex(historyIndex - 1)
      
      // 更新当前页面画布
      if (canvasInstanceRef.current && pages[currentPageIndex]) {
        const canvas = canvasInstanceRef.current
        canvas.clear()
        prevHistory.pages[currentPageIndex]?.objects.forEach((obj) => {
          canvas.add(obj)
        })
        canvas.renderAll()
      }
      
      toast.success("已撤销")
    }
    setTimeout(() => setIsUndoRedo(false), 100)
  }, [history, historyIndex, currentPageIndex, pages])
  
  /**
   * 重做操作
   */
  const handleRedo = useCallback(() => {
    if (historyIndex >= history.length - 1) {
      toast.info("没有可重做的操作")
      return
    }
    
    setIsUndoRedo(true)
    const nextHistory = history[historyIndex + 1]
    if (nextHistory) {
      setPages(nextHistory.pages)
      setHistoryIndex(historyIndex + 1)
      
      // 更新当前页面画布
      if (canvasInstanceRef.current && pages[currentPageIndex]) {
        const canvas = canvasInstanceRef.current
        canvas.clear()
        nextHistory.pages[currentPageIndex]?.objects.forEach((obj) => {
          canvas.add(obj)
        })
        canvas.renderAll()
      }
      
      toast.success("已重做")
    }
    setTimeout(() => setIsUndoRedo(false), 100)
  }, [history, historyIndex, currentPageIndex, pages])
  
  /**
   * 保存到本地缓存
   */
  const saveToCache = useCallback(() => {
    if (!fileUrl || pages.length === 0) return
    
    try {
      const cacheData: CacheData = {
        fileUrl,
        pages: JSON.parse(JSON.stringify(pages)), // 深拷贝，包括对象序列化
        totalPages,
        timestamp: Date.now(),
      }
      
      localStorage.setItem("ppt-editor-cache", JSON.stringify(cacheData))
      console.log("✅ 已保存到本地缓存")
    } catch (error) {
      console.error("❌ 保存缓存失败:", error)
    }
  }, [fileUrl, pages, totalPages])
  
  /**
   * 从本地缓存读取
   */
  const loadFromCache = useCallback((): CacheData | null => {
    try {
      const cacheStr = localStorage.getItem("ppt-editor-cache")
      if (!cacheStr) return null
      
      const cacheData: CacheData = JSON.parse(cacheStr)
      
      // 检查缓存是否匹配当前文件
      if (cacheData.fileUrl !== fileUrl) {
        return null
      }
      
      // 检查缓存是否过期（7天）
      const sevenDays = 7 * 24 * 60 * 60 * 1000
      if (Date.now() - cacheData.timestamp > sevenDays) {
        return null
      }
      
      console.log("✅ 从缓存加载数据")
      return cacheData
    } catch (error) {
      console.error("❌ 读取缓存失败:", error)
      return null
    }
  }, [fileUrl])
  
  /**
   * 清空缓存
   */
  const clearCache = useCallback(() => {
    localStorage.removeItem("ppt-editor-cache")
    toast.success("缓存已清空")
  }, [])
  
  /**
   * 初始化Fabric画布
   */
  const initCanvas = useCallback(() => {
    if (!canvasRef.current) return
    
    try {
      // 如果画布已经初始化，先销毁它
      if (canvasInstanceRef.current) {
        canvasInstanceRef.current.dispose()
        canvasInstanceRef.current = null
      }
      
      // 创建Fabric画布实例
      const canvas = new fabric.Canvas(canvasRef.current, {
        width: 960, // 默认宽度（16:9比例）
        height: 540, // 默认高度
        backgroundColor: "#ffffff",
        preserveObjectStacking: true, // 保持对象堆叠顺序
      })
      
      // 禁用默认的选择行为（在未解锁编辑模式前）
      canvas.selection = false
      canvas.defaultCursor = "default"
      
      // 保存画布实例引用
      canvasInstanceRef.current = canvas
      
      // 监听画布选择事件
      canvas.on("selection:created", (e) => {
        if (isEditable) {
          canvas.defaultCursor = "move"
          // 延迟更新样式，确保对象已完全选中
          setTimeout(() => {
            const activeObject = canvas.getActiveObject() as fabric.IText | fabric.Text
            if (activeObject && (activeObject instanceof fabric.IText || activeObject instanceof fabric.Text)) {
              setSelectedTextStyle({
                fontFamily: activeObject.fontFamily || "Arial",
                fontSize: activeObject.fontSize || 20,
                fontWeight: (activeObject as any).fontWeight === "bold" ? "bold" : "normal",
                fontStyle: activeObject.fontStyle === "italic" ? "italic" : "normal",
                fill: (activeObject.fill as string) || "#000000",
                textAlign: (activeObject as any).textAlign || "left",
              })
            }
          }, 50)
        }
      })
      
      canvas.on("selection:cleared", () => {
        canvas.defaultCursor = "default"
      })
      
      // 监听对象移动事件（用于对齐辅助线）
      canvas.on("object:moving", (e) => {
        if (isEditable) {
          drawGuidelines(e.target as fabric.Object)
        }
      })
      
      canvas.on("object:moved", () => {
        if (isEditable) {
          clearGuidelines()
        }
      })
      
      // 监听Ctrl键多选
      canvas.on("mouse:down", (options) => {
        if (isEditable && isCtrlPressedRef.current) {
          const target = options.target
          if (target) {
            canvas.setActiveObject(target)
            const activeObjects = canvas.getActiveObjects()
            if (activeObjects.length > 1) {
              const selection = new fabric.ActiveSelection(activeObjects, {
                canvas: canvas,
              })
              canvas.setActiveObject(selection)
            }
            canvas.renderAll()
          }
        }
      })
      
      console.log("✅ Fabric画布初始化完成")
    } catch (error) {
      console.error("❌ 初始化画布失败:", error)
      setError("初始化画布失败，请刷新页面重试")
    }
  }, [isEditable])
  
  /**
   * 下载PPTX文件
   */
  const downloadPPTX = useCallback(async (url: string): Promise<Blob> => {
    setIsDownloading(true)
    setDownloadProgress(0)
    setStatusMessage("正在下载PPT文件...")
    setError(null)
    
    try {
      const response = await axios({
        url: url,
        method: "GET",
        responseType: "blob", // 以二进制流方式下载
        onDownloadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            )
            setDownloadProgress(percentCompleted)
            setStatusMessage(`正在下载PPT文件... ${percentCompleted}%`)
          }
        },
      })
      
      const blob = response.data as Blob
      pptxBlobRef.current = blob
      
      setDownloadProgress(100)
      setStatusMessage("PPT文件下载完成")
      setIsDownloading(false)
      
      console.log("✅ PPTX文件下载完成，大小:", blob.size, "bytes")
      return blob
    } catch (error) {
      setIsDownloading(false)
      const errorMessage = error instanceof Error ? error.message : "下载PPT文件失败"
      console.error("❌ 下载PPT文件失败:", error)
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])
  
  /**
   * 解析PPTX文件并获取总页数
   */
  const parsePPTX = useCallback(async (blob: Blob): Promise<number> => {
    setIsParsing(true)
    setStatusMessage("正在解析PPT文件...")
    setError(null)
    
    try {
      // 使用JSZip解压PPTX文件（PPTX本质上是一个ZIP文件）
      const zip = new JSZip()
      const pptxData = await zip.loadAsync(blob)
      
      // 读取presentation.xml获取幻灯片数量
      const presentationXml = await pptxData.file("ppt/presentation.xml")?.async("string")
      if (!presentationXml) {
        throw new Error("无法读取PPTX文件结构")
      }
      
      // 解析XML获取幻灯片数量
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(presentationXml, "text/xml")
      const slideIds = xmlDoc.getElementsByTagName("p:sldId")
      const totalPages = slideIds.length
      
      setTotalPages(totalPages)
      setStatusMessage(`PPT文件解析完成，共${totalPages}页`)
      setIsParsing(false)
      
      console.log("✅ PPTX文件解析完成，总页数:", totalPages)
      return totalPages
    } catch (error) {
      setIsParsing(false)
      const errorMessage = error instanceof Error ? error.message : "解析PPT文件失败"
      console.error("❌ 解析PPT文件失败:", error)
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])
  
  /**
   * 渲染单页PPT到Fabric画布
   */
  const renderPage = useCallback(async (
    pageIndex: number,
    pptxBlob: Blob
  ): Promise<void> => {
    if (!canvasInstanceRef.current) {
      throw new Error("画布未初始化")
    }
    
    setIsRendering(true)
    setStatusMessage(`正在渲染第 ${pageIndex + 1}/${totalPages} 页...`)
    
    try {
      // 注意：pptxgenjs主要用于生成PPTX，解析PPTX需要使用其他方法
      // 这里我们手动解析PPTX的XML结构
      
      // 使用JSZip解压并读取幻灯片内容
      const zip = new JSZip()
      const pptxData = await zip.loadAsync(pptxBlob)
      
      // 读取指定页面的XML
      const slideXml = await pptxData.file(`ppt/slides/slide${pageIndex + 1}.xml`)?.async("string")
      if (!slideXml) {
        throw new Error(`无法读取第${pageIndex + 1}页的内容`)
      }
      
      // 读取幻灯片关系文件
      const relsFile = `ppt/slides/_rels/slide${pageIndex + 1}.xml.rels`
      const relsXml = await pptxData.file(relsFile)?.async("string")
      
      // 解析XML并转换为Fabric对象
      const parser = new DOMParser()
      const slideDoc = parser.parseFromString(slideXml, "text/xml")
      
      const canvas = canvasInstanceRef.current
      const fabricObjects: fabric.Object[] = []
      
      // 清空画布
      canvas.clear()
      canvas.backgroundColor = "#ffffff"
      
      // 解析文本对象
      const textElements = slideDoc.getElementsByTagName("a:t")
      for (let i = 0; i < textElements.length; i++) {
        const textElement = textElements[i]
        const text = textElement.textContent || ""
        
        // 手动向上遍历查找父段落元素（a:p）
        let parentParagraph: Element | null = null
        let current: Element | null = textElement as Element
        while (current && current.parentElement) {
          current = current.parentElement
          // 检查是否是段落元素（可能是 a:p 或 p，取决于命名空间处理）
          if (current.tagName === "a:p" || current.tagName === "p" || current.localName === "p") {
            parentParagraph = current
            break
          }
        }
        
        if (parentParagraph) {
          // 获取文本位置和样式
          const xfrm = parentParagraph.parentElement?.getElementsByTagName("a:xfrm")[0]
          if (xfrm && text) {
            const off = xfrm.getElementsByTagName("a:off")[0]
            const ext = xfrm.getElementsByTagName("a:ext")[0]
            
            const x = parseInt(off?.getAttribute("x") || "0")
            const y = parseInt(off?.getAttribute("y") || "0")
            const width = parseInt(ext?.getAttribute("cx") || "200")
            const height = parseInt(ext?.getAttribute("cy") || "50")
            
            // 创建Fabric文本对象
            const fabricText = new fabric.IText(text, {
              left: x,
              top: y,
              width: width,
              height: height,
              fontSize: 20,
              fontFamily: "Arial",
              fill: "#000000",
              editable: isEditable,
            })
            
            fabricObjects.push(fabricText)
          }
        }
      }
      
      // 解析图片对象
      if (relsXml) {
        const relsDoc = parser.parseFromString(relsXml, "text/xml")
        const relationships = relsDoc.getElementsByTagName("Relationship")
        
        for (let i = 0; i < relationships.length; i++) {
          const rel = relationships[i]
          const target = rel.getAttribute("Target")
          
          if (target && target.includes("image")) {
            try {
              // 读取图片文件
              const imagePath = `ppt/${target.replace("../", "")}`
              const imageBlob = await pptxData.file(imagePath)?.async("blob")
              
              if (imageBlob) {
                const imageUrl = URL.createObjectURL(imageBlob)
                
                // 查找图片的位置信息
                const picElements = slideDoc.getElementsByTagName("p:pic")
                for (let j = 0; j < picElements.length; j++) {
                  const pic = picElements[j]
                  const xfrm = pic.getElementsByTagName("a:xfrm")[0]
                  
                  if (xfrm) {
                    const off = xfrm.getElementsByTagName("a:off")[0]
                    const ext = xfrm.getElementsByTagName("a:ext")[0]
                    
                    const x = parseInt(off?.getAttribute("x") || "0")
                    const y = parseInt(off?.getAttribute("y") || "0")
                    const width = parseInt(ext?.getAttribute("cx") || "200")
                    const height = parseInt(ext?.getAttribute("cy") || "200")
                    
                    // 创建Fabric图片对象
                    fabric.Image.fromURL(
                      imageUrl,
                      (img) => {
                        img.set({
                          left: x,
                          top: y,
                          scaleX: width / (img.width || 1),
                          scaleY: height / (img.height || 1),
                          selectable: isEditable,
                        })
                        
                        canvas.add(img)
                        canvas.renderAll()
                      },
                      { crossOrigin: "anonymous" }
                    )
                  }
                }
              }
            } catch (imgError) {
              console.warn(`⚠️ 加载图片失败:`, imgError)
            }
          }
        }
      }
      
      // 添加所有文本对象到画布（带淡入动画）
      fabricObjects.forEach((obj, index) => {
        obj.set({
          opacity: 0,
          selectable: isEditable,
        })
        
        canvas.add(obj)
        
        // 淡入动画
        obj.animate("opacity", 1, {
          duration: 500,
          onChange: canvas.renderAll.bind(canvas),
          onComplete: () => {
            if (index === fabricObjects.length - 1) {
              canvas.renderAll()
            }
          },
        })
      })
      
      // 更新画布尺寸
      const slideSize = slideDoc.getElementsByTagName("p:sldSz")[0]
      if (slideSize) {
        const width = parseInt(slideSize.getAttribute("cx") || "960") / 9525 // 转换为像素
        const height = parseInt(slideSize.getAttribute("cy") || "540") / 9525
        
        // 使用 setDimensions 方法设置画布尺寸
        canvas.setDimensions({ width, height })
        canvas.renderAll()
      }
      
      // 等待所有对象渲染完成后再生成缩略图
      await new Promise<void>((resolve) => {
        // 等待所有动画和图片加载完成
        const checkComplete = () => {
          const allObjects = canvas.getObjects()
          const allLoaded = allObjects.every((obj) => {
            if (obj instanceof fabric.Image) {
              return obj.isLoaded !== false
            }
            return true
          })
          
          if (allLoaded) {
            canvas.renderAll()
            // 再等待一小段时间确保渲染完成
            setTimeout(() => {
              resolve()
            }, 100)
          } else {
            setTimeout(checkComplete, 50)
          }
        }
        
        // 初始延迟，确保动画开始
        setTimeout(checkComplete, 600)
      })
      
      // 生成缩略图（使用临时离屏canvas）
      let thumbnail = ""
      try {
        // 创建一个临时的离屏canvas用于生成缩略图
        const tempCanvas = document.createElement("canvas")
        tempCanvas.width = (canvas.width || 960) * 0.3
        tempCanvas.height = (canvas.height || 540) * 0.3
        const tempCtx = tempCanvas.getContext("2d")
        
        if (tempCtx) {
          // 设置白色背景
          tempCtx.fillStyle = "#ffffff"
          tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height)
          
          // 将主canvas内容绘制到临时canvas
          const mainCanvasEl = canvas.getElement()
          if (mainCanvasEl) {
            tempCtx.drawImage(
              mainCanvasEl,
              0,
              0,
              tempCanvas.width,
              tempCanvas.height
            )
            thumbnail = tempCanvas.toDataURL("image/png", 0.8)
          }
        }
        
        // 如果临时canvas方法失败，尝试使用主canvas（需要确保已渲染）
        if (!thumbnail && canvas.toDataURL) {
          thumbnail = canvas.toDataURL({
            format: "png",
            quality: 0.8,
            multiplier: 0.3,
          })
        }
      } catch (thumbError) {
        console.warn("⚠️ 生成缩略图失败:", thumbError)
        // 使用占位符
        thumbnail = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='288' height='162'%3E%3Crect width='288' height='162' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999'%3E第" + (pageIndex + 1) + "页%3C/text%3E%3C/svg%3E"
      }
      
      // 更新页面数据
      const pageData: PPTPage = {
        pageNumber: pageIndex + 1,
        width: canvas.width || 960,
        height: canvas.height || 540,
        objects: fabricObjects,
        thumbnail: thumbnail,
      }
      
      setPages((prev) => {
        const newPages = [...prev]
        newPages[pageIndex] = pageData
        return newPages
      })
      
      setRenderedPages((prev) => prev + 1)
      setStatusMessage(`已渲染 ${renderedPages + 1}/${totalPages} 页`)
      
      console.log(`✅ 第${pageIndex + 1}页渲染完成`)
      
      // 如果是最后一页，解锁编辑模式
      if (renderedPages + 1 >= totalPages) {
        setTimeout(() => {
          setIsEditable(true)
          if (canvasInstanceRef.current) {
            canvasInstanceRef.current.selection = true
            canvasInstanceRef.current.defaultCursor = "default"
          }
          setStatusMessage("PPT生成完成，可自由编辑")
          setIsRendering(false)
          toast.success("PPT加载完成，可以开始编辑了！")
        }, 500)
      }
      
      setIsRendering(false)
    } catch (error) {
      setIsRendering(false)
      const errorMessage = error instanceof Error ? error.message : `渲染第${pageIndex + 1}页失败`
      console.error("❌ 渲染页面失败:", error)
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [totalPages, renderedPages, isEditable])
  
  /**
   * 逐页渲染PPT
   */
  const renderAllPages = useCallback(async (blob: Blob, totalPages: number) => {
    setIsRendering(true)
    setStatusMessage("开始渲染PPT内容...")
    
    try {
      // 逐页渲染
      for (let i = 0; i < totalPages; i++) {
        await renderPage(i, blob)
        
        // 延迟一下，让用户看到渲染过程
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
    } catch (error) {
      console.error("❌ 渲染PPT失败:", error)
      setError(error instanceof Error ? error.message : "渲染PPT失败")
    } finally {
      setIsRendering(false)
    }
  }, [renderPage])
  
  /**
   * 居中画布
   */
  const centerCanvas = useCallback(() => {
    if (!containerRef.current || !canvasInstanceRef.current) return
    
    const container = containerRef.current
    const canvas = canvasInstanceRef.current
    
    const containerRect = container.getBoundingClientRect()
    const canvasWidth = canvas.width || 960
    const canvasHeight = canvas.height || 540
    
    const scaledWidth = canvasWidth * canvasScale
    const scaledHeight = canvasHeight * canvasScale
    
    // 计算居中位置
    const left = (containerRect.width - scaledWidth) / 2
    const top = (containerRect.height - scaledHeight) / 2
    
    if (canvas.wrapperEl) {
      canvas.wrapperEl.style.left = `${left}px`
      canvas.wrapperEl.style.top = `${top}px`
    }
  }, [canvasScale])
  
  /**
   * 切换到指定页面
   */
  const switchToPage = useCallback((pageIndex: number) => {
    if (!canvasInstanceRef.current) return
    
    // 先保存当前页面的对象数据
    if (pages[currentPageIndex]) {
      const canvas = canvasInstanceRef.current
      const objects = canvas.getObjects()
      setPages((prev) => {
        const newPages = [...prev]
        if (newPages[currentPageIndex]) {
          newPages[currentPageIndex] = {
            ...newPages[currentPageIndex],
            objects: objects,
          }
        }
        return newPages
      })
    }
    
    // 切换到新页面
    if (!pages[pageIndex]) return
    
    setCurrentPageIndex(pageIndex)
    const page = pages[pageIndex]
    
    // 清空画布并加载页面对象
    const canvas = canvasInstanceRef.current
    canvas.clear()
    
    // 重新添加页面对象（带淡入效果）
    page.objects.forEach((obj, index) => {
      // 创建对象的副本，避免引用问题
      const objCopy = fabric.util.object.clone(obj)
      
      objCopy.set({
        opacity: 0,
        selectable: isEditable,
      })
      canvas.add(objCopy)
      
      objCopy.animate("opacity", 1, {
        duration: 500,
        onChange: canvas.renderAll.bind(canvas),
      })
    })
    
    // 更新画布尺寸
    canvas.setDimensions({ width: page.width, height: page.height })
    canvas.renderAll()
    
    // 居中画布
    centerCanvas()
    
    // 更新当前页面的对象引用
    setPages((prev) => {
      const newPages = [...prev]
      if (newPages[pageIndex]) {
        newPages[pageIndex] = {
          ...newPages[pageIndex],
          objects: canvas.getObjects(),
        }
      }
      return newPages
    })
  }, [pages, currentPageIndex, isEditable, centerCanvas])
  
  /**
   * 缩放画布
   */
  const zoomCanvas = useCallback((delta: number) => {
    if (!canvasInstanceRef.current) return
    
    const newScale = Math.max(0.5, Math.min(2, canvasScale + delta))
    setCanvasScale(newScale)
    
    const canvas = canvasInstanceRef.current
    if (canvas.wrapperEl) {
      canvas.wrapperEl.style.transform = `scale(${newScale})`
      canvas.wrapperEl.style.transformOrigin = "top left"
    }
    
    // 缩放后居中
    setTimeout(() => {
      centerCanvas()
    }, 0)
  }, [canvasScale, centerCanvas])
  
  /**
   * 处理滚轮缩放
   */
  const handleWheel = useCallback((e: WheelEvent) => {
    if (!isEditable) return
    
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    zoomCanvas(delta)
  }, [isEditable, zoomCanvas])
  
  
  /**
   * 应用文本样式到选中对象
   */
  const applyTextStyle = useCallback((style: Partial<typeof selectedTextStyle>) => {
    if (!canvasInstanceRef.current) return
    
    const canvas = canvasInstanceRef.current
    const activeObject = canvas.getActiveObject()
    
    if (!activeObject) {
      toast.info("请先选择文本对象")
      return
    }
    
    if (activeObject instanceof fabric.IText || activeObject instanceof fabric.Text) {
      const newStyle = { ...selectedTextStyle, ...style }
      setSelectedTextStyle(newStyle)
      
      // 更新文本样式
      activeObject.set({
        fontFamily: newStyle.fontFamily,
        fontSize: newStyle.fontSize,
        fontWeight: newStyle.fontWeight,
        fontStyle: newStyle.fontStyle,
        fill: newStyle.fill,
        textAlign: newStyle.textAlign as any,
      } as any)
      
      canvas.renderAll()
      saveHistory()
      updateCurrentPageObjects()
    } else if (canvas.getActiveObjects().length > 0) {
      // 批量更新多个对象
      const activeObjects = canvas.getActiveObjects()
      activeObjects.forEach((obj) => {
        if (obj instanceof fabric.IText || obj instanceof fabric.Text) {
          obj.set({
            fontFamily: style.fontFamily ?? selectedTextStyle.fontFamily,
            fontSize: style.fontSize ?? selectedTextStyle.fontSize,
            fontWeight: style.fontWeight === "bold" ? "bold" : ((obj as any).fontWeight || "normal"),
            fontStyle: style.fontStyle === "italic" ? "italic" : (obj.fontStyle || "normal"),
            fill: style.fill ?? selectedTextStyle.fill,
            textAlign: (style.textAlign as any) ?? ((obj as any).textAlign || "left"),
          } as any)
        }
      })
      canvas.renderAll()
      saveHistory()
      updateCurrentPageObjects()
    }
  }, [selectedTextStyle])
  
  /**
   * 更新当前页面的对象数据
   */
  const updateCurrentPageObjects = useCallback(() => {
    if (!canvasInstanceRef.current) return
    
    const canvas = canvasInstanceRef.current
    const objects = canvas.getObjects()
    
    setPages((prev) => {
      const newPages = [...prev]
      if (newPages[currentPageIndex]) {
        newPages[currentPageIndex] = {
          ...newPages[currentPageIndex],
          objects: objects,
        }
      }
      return newPages
    })
  }, [currentPageIndex])
  
  /**
   * 绘制对齐辅助线
   */
  const drawGuidelines = useCallback((movingObject: fabric.Object) => {
    if (!canvasInstanceRef.current) return
    
    const canvas = canvasInstanceRef.current
    const objects = canvas.getObjects()
    const guidelines = { v: [] as fabric.Line[], h: [] as fabric.Line[] }
    
    const movingCenterX = movingObject.left! + (movingObject.width! * movingObject.scaleX!) / 2
    const movingCenterY = movingObject.top! + (movingObject.height! * movingObject.scaleY!) / 2
    const movingLeft = movingObject.left!
    const movingRight = movingObject.left! + movingObject.width! * movingObject.scaleX!
    const movingTop = movingObject.top!
    const movingBottom = movingObject.top! + movingObject.height! * movingObject.scaleY!
    
    const canvasCenterX = (canvas.width || 0) / 2
    const canvasCenterY = (canvas.height || 0) / 2
    
    // 检查与画布中心的对齐
    if (Math.abs(movingCenterX - canvasCenterX) < 5) {
      const line = new fabric.Line([canvasCenterX, 0, canvasCenterX, canvas.height || 0], {
        stroke: "#0084ff",
        strokeWidth: 1,
        strokeDashArray: [5, 5],
        selectable: false,
        evented: false,
      })
      canvas.add(line)
      guidelines.v.push(line)
    }
    
    if (Math.abs(movingCenterY - canvasCenterY) < 5) {
      const line = new fabric.Line([0, canvasCenterY, canvas.width || 0, canvasCenterY], {
        stroke: "#0084ff",
        strokeWidth: 1,
        strokeDashArray: [5, 5],
        selectable: false,
        evented: false,
      })
      canvas.add(line)
      guidelines.h.push(line)
    }
    
    // 检查与其他对象的对齐
    objects.forEach((obj) => {
      if (obj === movingObject) return
      
      const objCenterX = obj.left! + (obj.width! * obj.scaleX!) / 2
      const objCenterY = obj.top! + (obj.height! * obj.scaleY!) / 2
      const objLeft = obj.left!
      const objRight = obj.left! + obj.width! * obj.scaleX!
      const objTop = obj.top!
      const objBottom = obj.top! + obj.height! * obj.scaleY!
      
      // 垂直对齐
      if (Math.abs(movingCenterX - objCenterX) < 5) {
        const line = new fabric.Line([objCenterX, 0, objCenterX, canvas.height || 0], {
          stroke: "#0084ff",
          strokeWidth: 1,
          strokeDashArray: [5, 5],
          selectable: false,
          evented: false,
        })
        canvas.add(line)
        guidelines.v.push(line)
        movingObject.set({ left: objCenterX - (movingObject.width! * movingObject.scaleX!) / 2 })
      } else if (Math.abs(movingLeft - objLeft) < 5) {
        const line = new fabric.Line([objLeft, 0, objLeft, canvas.height || 0], {
          stroke: "#0084ff",
          strokeWidth: 1,
          strokeDashArray: [5, 5],
          selectable: false,
          evented: false,
        })
        canvas.add(line)
        guidelines.v.push(line)
        movingObject.set({ left: objLeft })
      } else if (Math.abs(movingRight - objRight) < 5) {
        const line = new fabric.Line([objRight, 0, objRight, canvas.height || 0], {
          stroke: "#0084ff",
          strokeWidth: 1,
          strokeDashArray: [5, 5],
          selectable: false,
          evented: false,
        })
        canvas.add(line)
        guidelines.v.push(line)
        movingObject.set({ left: objRight - movingObject.width! * movingObject.scaleX! })
      }
      
      // 水平对齐
      if (Math.abs(movingCenterY - objCenterY) < 5) {
        const line = new fabric.Line([0, objCenterY, canvas.width || 0, objCenterY], {
          stroke: "#0084ff",
          strokeWidth: 1,
          strokeDashArray: [5, 5],
          selectable: false,
          evented: false,
        })
        canvas.add(line)
        guidelines.h.push(line)
        movingObject.set({ top: objCenterY - (movingObject.height! * movingObject.scaleY!) / 2 })
      } else if (Math.abs(movingTop - objTop) < 5) {
        const line = new fabric.Line([0, objTop, canvas.width || 0, objTop], {
          stroke: "#0084ff",
          strokeWidth: 1,
          strokeDashArray: [5, 5],
          selectable: false,
          evented: false,
        })
        canvas.add(line)
        guidelines.h.push(line)
        movingObject.set({ top: objTop })
      } else if (Math.abs(movingBottom - objBottom) < 5) {
        const line = new fabric.Line([0, objBottom, canvas.width || 0, objBottom], {
          stroke: "#0084ff",
          strokeWidth: 1,
          strokeDashArray: [5, 5],
          selectable: false,
          evented: false,
        })
        canvas.add(line)
        guidelines.h.push(line)
        movingObject.set({ top: objBottom - movingObject.height! * movingObject.scaleY! })
      }
    })
    
    guidelineRefs.current = guidelines
    canvas.renderAll()
  }, [])
  
  /**
   * 清除对齐辅助线
   */
  const clearGuidelines = useCallback(() => {
    if (!canvasInstanceRef.current) return
    
    const canvas = canvasInstanceRef.current
    const guidelines = guidelineRefs.current
    
    // 合并垂直和水平辅助线数组，然后移除
    const allGuidelines = (guidelines.v || []).concat(guidelines.h || [])
    allGuidelines.forEach((line) => {
      if (line) {
        canvas.remove(line)
      }
    })
    
    guidelineRefs.current = { v: [], h: [] }
    canvas.renderAll()
  }, [])
  
  /**
   * 新增空白PPT页面
   */
  const addBlankPage = useCallback(() => {
    const newPage: PPTPage = {
      pageNumber: pages.length + 1,
      width: 960,
      height: 540,
      objects: [],
    }
    
    setPages((prev) => {
      const newPages = [...prev]
      newPages.push(newPage)
      return newPages
    })
    
    setTotalPages((prev) => prev + 1)
    setCurrentPageIndex(pages.length)
    switchToPage(pages.length)
    saveHistory()
    toast.success("已添加新页面")
  }, [pages, switchToPage, saveHistory])
  
  /**
   * 删除当前页面
   */
  const deleteCurrentPage = useCallback(() => {
    if (pages.length <= 1) {
      toast.error("至少保留一页")
      return
    }
    
    setPages((prev) => {
      const newPages = prev.filter((_, index) => index !== currentPageIndex)
      // 重新编号
      return newPages.map((page, index) => ({
        ...page,
        pageNumber: index + 1,
      }))
    })
    
    setTotalPages((prev) => prev - 1)
    
    // 切换到前一页或第一页
    const newIndex = currentPageIndex > 0 ? currentPageIndex - 1 : 0
    setCurrentPageIndex(newIndex)
    switchToPage(newIndex)
    
    saveHistory()
    toast.success("已删除当前页面")
  }, [pages, currentPageIndex, switchToPage, saveHistory])
  
  /**
   * 移动页面顺序
   */
  const movePage = useCallback((fromIndex: number, toIndex: number) => {
    setPages((prev) => {
      const newPages = [...prev]
      const [movedPage] = newPages.splice(fromIndex, 1)
      newPages.splice(toIndex, 0, movedPage)
      
      // 重新编号
      return newPages.map((page, index) => ({
        ...page,
        pageNumber: index + 1,
      }))
    })
    
    setCurrentPageIndex(toIndex)
    switchToPage(toIndex)
    saveHistory()
  }, [switchToPage, saveHistory])
  
  /**
   * 导出PPTX文件
   */
  const exportPPTX = useCallback(async () => {
    if (!pptxBlobRef.current || pages.length === 0) {
      toast.error("没有可导出的内容")
      return
    }
    
    try {
      setStatusMessage("正在导出PPTX文件...")
      toast.loading("正在导出PPTX文件，请稍候...", { id: "export-pptx" })
      
      // 加载原始PPTX文件
      const zip = new JSZip()
      const originalPPTX = await zip.loadAsync(pptxBlobRef.current)
      originalPPTXRef.current = originalPPTX
      
      // TODO: 这里需要将Fabric对象转换回PPTX格式
      // 由于PPTX格式复杂，这里提供一个基础框架
      // 实际实现需要根据Fabric对象的属性生成对应的XML结构
      
      // 为每个页面更新幻灯片XML
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i]
        // 这里需要根据page.objects生成对应的slide XML
        // 由于实现复杂，暂时保留原有幻灯片内容
        // 实际使用时需要实现Fabric对象到PPTX XML的转换
      }
      
      // 生成新的PPTX文件
      const newPPTXBlob = await originalPPTX.generateAsync({ type: "blob" })
      
      // 使用file-saver下载
      saveAs(newPPTXBlob, `edited-presentation-${Date.now()}.pptx`)
      
      toast.success("PPTX文件导出成功", { id: "export-pptx" })
      setStatusMessage("PPTX文件导出成功")
    } catch (error) {
      console.error("❌ 导出PPTX失败:", error)
      toast.error("导出PPTX文件失败", { id: "export-pptx" })
      setError("导出PPTX文件失败")
    }
  }, [pages])
  
  /**
   * 导出PDF文件
   */
  const exportPDF = useCallback(async (allPages: boolean = false) => {
    if (!canvasInstanceRef.current) {
      toast.error("画布未初始化")
      return
    }
    
    try {
      setStatusMessage(allPages ? "正在导出所有页面为PDF..." : "正在导出当前页为PDF...")
      toast.loading("正在导出PDF，请稍候...", { id: "export-pdf" })
      
      // 这里需要使用jsPDF库，暂时用html2canvas导出图片后提示用户
      // 实际实现需要使用jsPDF将多个画布内容合并为PDF
      
      toast.info("PDF导出功能开发中，请先使用图片导出", { id: "export-pdf" })
    } catch (error) {
      console.error("❌ 导出PDF失败:", error)
      toast.error("导出PDF失败", { id: "export-pdf" })
    }
  }, [])
  
  /**
   * 导出图片
   */
  const exportImage = useCallback(async (allPages: boolean = false) => {
    if (!canvasInstanceRef.current) {
      toast.error("画布未初始化")
      return
    }
    
    try {
      setStatusMessage(allPages ? "正在导出所有页面为图片..." : "正在导出当前页为图片...")
      toast.loading("正在导出图片，请稍候...", { id: "export-image" })
      
      if (allPages) {
        // 导出所有页面
        for (let i = 0; i < pages.length; i++) {
          switchToPage(i)
          await new Promise((resolve) => setTimeout(resolve, 300)) // 等待页面切换
          
          if (canvasInstanceRef.current) {
            const dataURL = canvasInstanceRef.current.toDataURL({
              format: "png",
              quality: 1,
              multiplier: 2, // 高清导出
            })
            
            const link = document.createElement("a")
            link.download = `page-${i + 1}.png`
            link.href = dataURL
            link.click()
          }
        }
        toast.success(`已导出${pages.length}张图片`, { id: "export-image" })
      } else {
        // 导出当前页
        if (canvasInstanceRef.current) {
          const dataURL = canvasInstanceRef.current.toDataURL({
            format: "png",
            quality: 1,
            multiplier: 2, // 高清导出
          })
          
          const link = document.createElement("a")
          link.download = `page-${currentPageIndex + 1}.png`
          link.href = dataURL
          link.click()
          
          toast.success("图片导出成功", { id: "export-image" })
        }
      }
      
      setStatusMessage("图片导出完成")
    } catch (error) {
      console.error("❌ 导出图片失败:", error)
      toast.error("导出图片失败", { id: "export-image" })
    }
  }, [pages, currentPageIndex, switchToPage])
  
  /**
   * 重新下载
   */
  const handleRetry = useCallback(async () => {
    if (!fileUrl) {
      toast.error("缺少文件链接")
      return
    }
    
    setError(null)
    setRenderedPages(0)
    setPages([])
    
    try {
      // 重新执行下载和渲染流程
      const blob = await downloadPPTX(fileUrl)
      const totalPages = await parsePPTX(blob)
      
      // 创建占位缩略图
      setPages(
        Array.from({ length: totalPages }, (_, i) => ({
          pageNumber: i + 1,
          width: 960,
          height: 540,
          objects: [],
        }))
      )
      
      // 逐页渲染
      await renderAllPages(blob, totalPages)
    } catch (error) {
      console.error("❌ 重新加载失败:", error)
    }
  }, [fileUrl, downloadPPTX, parsePPTX, renderAllPages])
  
  /**
   * 初始化：下载和渲染PPT（优先从缓存加载）
   */
  useEffect(() => {
    if (!fileUrl) {
      setError("缺少PPT文件链接，请返回重试")
      return
    }
    
    let isMounted = true // 防止组件卸载后继续执行
    
    // 初始化画布
    initCanvas()
    
    // 优先从缓存加载
    const cacheData = loadFromCache()
    if (cacheData && cacheData.pages.length > 0) {
      console.log("✅ 从缓存加载PPT数据")
      if (isMounted) {
        setPages(cacheData.pages)
        setTotalPages(cacheData.totalPages)
        setRenderedPages(cacheData.pages.length)
        
        // 切换到第一页
        setTimeout(() => {
          if (isMounted && canvasInstanceRef.current) {
            switchToPage(0)
            setIsEditable(true)
            setStatusMessage("已从缓存加载PPT")
            toast.success("已从缓存加载PPT，可以继续编辑")
          }
        }, 100)
      }
      return
    }
    
    // 开始下载和渲染流程
    const loadPPT = async () => {
      try {
        console.log("🚀 开始加载PPT，fileUrl:", fileUrl)
        
        // 1. 下载PPTX文件
        console.log("📥 步骤1: 开始下载PPTX文件...")
        const blob = await downloadPPTX(fileUrl)
        if (!isMounted) return
        console.log("✅ 步骤1完成: PPTX文件下载成功，大小:", blob.size, "bytes")
        
        // 2. 解析PPTX获取总页数
        console.log("📄 步骤2: 开始解析PPTX文件...")
        const totalPages = await parsePPTX(blob)
        if (!isMounted) return
        console.log("✅ 步骤2完成: 解析成功，总页数:", totalPages)
        
        // 3. 创建占位缩略图
        if (isMounted) {
          console.log("🖼️  步骤3: 创建占位缩略图...")
          setPages(
            Array.from({ length: totalPages }, (_, i) => ({
              pageNumber: i + 1,
              width: 960,
              height: 540,
              objects: [],
            }))
          )
          console.log("✅ 步骤3完成: 已创建", totalPages, "个占位缩略图")
        }
        
        // 4. 逐页渲染
        if (isMounted) {
          console.log("🎨 步骤4: 开始逐页渲染...")
          await renderAllPages(blob, totalPages)
          console.log("✅ 步骤4完成: 所有页面渲染完成")
        }
      } catch (error) {
        if (isMounted) {
          console.error("❌ 加载PPT失败:", error)
          setError(error instanceof Error ? error.message : "加载PPT失败")
          toast.error("加载PPT失败: " + (error instanceof Error ? error.message : "未知错误"))
        }
      }
    }
    
    loadPPT()
    
    // 清理函数：组件卸载时销毁画布
    return () => {
      isMounted = false
      if (canvasInstanceRef.current) {
        canvasInstanceRef.current.dispose()
        canvasInstanceRef.current = null
      }
    }
    // 只依赖 fileUrl，其他函数使用 useRef 或确保稳定
  }, [fileUrl])
  
  /**
   * 自动保存到缓存
   */
  useEffect(() => {
    if (pages.length > 0 && renderedPages === totalPages && totalPages > 0) {
      // 使用 setTimeout 避免在渲染过程中立即保存，防止循环更新
      const timer = setTimeout(() => {
        saveToCache()
      }, 500)
      
      return () => clearTimeout(timer)
    }
  }, [pages, renderedPages, totalPages, saveToCache])
  
  /**
   * 监听Ctrl键和快捷键
   */
  useEffect(() => {
    if (!isEditable) return
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd键状态
      if (e.key === "Control" || e.metaKey) {
        isCtrlPressedRef.current = true
      }
      
      // 快捷键
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault()
        handleUndo()
      } else if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault()
        handleRedo()
      } else if ((e.ctrlKey || e.metaKey) && e.key === "b") {
        e.preventDefault()
        applyTextStyle({ fontWeight: selectedTextStyle.fontWeight === "bold" ? "normal" : "bold" })
      } else if ((e.ctrlKey || e.metaKey) && e.key === "i") {
        e.preventDefault()
        applyTextStyle({ fontStyle: selectedTextStyle.fontStyle === "italic" ? "normal" : "italic" })
      }
    }
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Control" || e.metaKey) {
        isCtrlPressedRef.current = false
      }
    }
    
    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [isEditable, handleUndo, handleRedo, applyTextStyle, selectedTextStyle])
  
  /**
   * 设置画布编辑模式
   */
  useEffect(() => {
    if (!canvasInstanceRef.current) return
    
    const canvas = canvasInstanceRef.current
    
    if (isEditable) {
      // 启用编辑模式
      canvas.selection = true
      canvas.defaultCursor = "default"
      
      // 监听对象修改事件
      canvas.on("object:modified", () => {
        updateCurrentPageObjects()
        saveHistory()
        saveToCache()
      })
      
      // 监听对象添加事件
      canvas.on("object:added", () => {
        updateCurrentPageObjects()
        saveHistory()
      })
      
      // 监听对象删除事件
      canvas.on("object:removed", () => {
        updateCurrentPageObjects()
        saveHistory()
      })
      
      // 监听文本编辑事件
      canvas.on("text:changed", () => {
        updateCurrentPageObjects()
        saveHistory()
      })
      
      // 启用旋转控制
      canvas.on("selection:created", (e) => {
        const activeObject = e.selected?.[0] || canvas.getActiveObject()
        if (activeObject) {
          activeObject.set({
            borderColor: "#0084ff",
            cornerColor: "#0084ff",
            cornerSize: 10,
            transparentCorners: false,
          })
          canvas.renderAll()
        }
      })
      
      // 监听删除键（删除对象）
      const handleDeleteKey = (e: KeyboardEvent) => {
        if ((e.key === "Delete" || e.key === "Backspace") && !(e.target instanceof HTMLInputElement)) {
          const activeObject = canvas.getActiveObject()
          if (activeObject) {
            if (activeObject instanceof fabric.ActiveSelection) {
              // 多选删除
              const objects = activeObject.getObjects()
              objects.forEach((obj) => canvas.remove(obj))
            } else {
              canvas.remove(activeObject)
            }
            canvas.discardActiveObject()
            canvas.renderAll()
            updateCurrentPageObjects()
            saveHistory()
          }
        }
      }
      
      window.addEventListener("keydown", handleDeleteKey)
      
      return () => {
        window.removeEventListener("keydown", handleDeleteKey)
      }
    } else {
      // 禁用编辑模式
      canvas.selection = false
      canvas.defaultCursor = "default"
    }
  }, [isEditable, currentPageIndex, pages, updateCurrentPageObjects, saveHistory, saveToCache])
  
  /**
   * 设置滚轮缩放监听
   */
  useEffect(() => {
    if (!containerRef.current) return
    
    const container = containerRef.current
    container.addEventListener("wheel", handleWheel, { passive: false })
    
    return () => {
      container.removeEventListener("wheel", handleWheel)
    }
  }, [handleWheel])
  
  // 渲染页面
  return (
    <div className="h-screen flex flex-col bg-background">
      {/* 顶部工具栏 */}
      <div className="border-b bg-card px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Button>
          
          <div className="flex items-center gap-2">
            {isEditable && (
              <>
                {/* 撤销/重做 */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUndo}
                  disabled={historyIndex <= 0}
                  title="撤销 (Ctrl+Z)"
                >
                  <Undo2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRedo}
                  disabled={historyIndex >= history.length - 1}
                  title="重做 (Ctrl+Y)"
                >
                  <Redo2 className="h-4 w-4" />
                </Button>
                
                <div className="h-4 w-px bg-border mx-1" />
                
                {/* 文本样式编辑 */}
                <Select
                  value={selectedTextStyle.fontFamily}
                  onValueChange={(value) => applyTextStyle({ fontFamily: value })}
                >
                  <SelectTrigger className="w-32 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Arial">Arial</SelectItem>
                    <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                    <SelectItem value="Courier New">Courier New</SelectItem>
                    <SelectItem value="Helvetica">Helvetica</SelectItem>
                    <SelectItem value="Georgia">Georgia</SelectItem>
                  </SelectContent>
                </Select>
                
                <Input
                  type="number"
                  value={selectedTextStyle.fontSize}
                  onChange={(e) => applyTextStyle({ fontSize: parseInt(e.target.value) || 20 })}
                  className="w-16 h-8 text-xs"
                  min="8"
                  max="200"
                />
                
                <Button
                  variant={selectedTextStyle.fontWeight === "bold" ? "default" : "outline"}
                  size="sm"
                  onClick={() => applyTextStyle({ fontWeight: selectedTextStyle.fontWeight === "bold" ? "normal" : "bold" })}
                  title="加粗 (Ctrl+B)"
                >
                  <Bold className="h-4 w-4" />
                </Button>
                
                <Button
                  variant={selectedTextStyle.fontStyle === "italic" ? "default" : "outline"}
                  size="sm"
                  onClick={() => applyTextStyle({ fontStyle: selectedTextStyle.fontStyle === "italic" ? "normal" : "italic" })}
                  title="斜体 (Ctrl+I)"
                >
                  <Italic className="h-4 w-4" />
                </Button>
                
                <div className="h-4 w-px bg-border mx-1" />
                
                <Button
                  variant={selectedTextStyle.textAlign === "left" ? "default" : "outline"}
                  size="sm"
                  onClick={() => applyTextStyle({ textAlign: "left" })}
                  title="左对齐"
                >
                  <AlignLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant={selectedTextStyle.textAlign === "center" ? "default" : "outline"}
                  size="sm"
                  onClick={() => applyTextStyle({ textAlign: "center" })}
                  title="居中对齐"
                >
                  <AlignCenter className="h-4 w-4" />
                </Button>
                <Button
                  variant={selectedTextStyle.textAlign === "right" ? "default" : "outline"}
                  size="sm"
                  onClick={() => applyTextStyle({ textAlign: "right" })}
                  title="右对齐"
                >
                  <AlignRight className="h-4 w-4" />
                </Button>
                
                <input
                  type="color"
                  value={selectedTextStyle.fill}
                  onChange={(e) => applyTextStyle({ fill: e.target.value })}
                  className="h-8 w-12 cursor-pointer rounded border"
                  title="文字颜色"
                />
                
                <div className="h-4 w-px bg-border mx-1" />
                
                {/* 缩放控制 */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => zoomCanvas(-0.1)}
                  disabled={canvasScale <= 0.5}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => zoomCanvas(0.1)}
                  disabled={canvasScale >= 2}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCanvasScale(1)
                    centerCanvas()
                  }}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  重置缩放
                </Button>
                
                <div className="h-4 w-px bg-border mx-1" />
                
                {/* 导出功能 */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportPPTX}
                  title="导出PPTX文件"
                >
                  <Download className="h-4 w-4 mr-2" />
                  导出PPTX
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportImage(false)}
                  title="导出当前页为图片"
                >
                  <FileImage className="h-4 w-4 mr-2" />
                  导出图片
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" title="清空缓存">
                      清空缓存
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>确认清空缓存</AlertDialogTitle>
                      <AlertDialogDescription>
                        清空缓存后，页面刷新将重新下载和解析PPT文件。当前编辑内容将保存到缓存中，请确认是否继续？
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>取消</AlertDialogCancel>
                      <AlertDialogAction onClick={clearCache}>确认清空</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4 flex-1 max-w-md">
          {isDownloading && (
            <div className="flex-1">
              <Progress value={downloadProgress} className="h-2" />
            </div>
          )}
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {statusMessage}
          </span>
        </div>
      </div>
      
      {/* 主体内容区域 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧缩略图导航栏 */}
        <div className="w-48 border-r bg-muted/30 overflow-y-auto">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-3">
              {/* 添加新页面按钮 */}
              {isEditable && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={addBlankPage}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  添加新页面
                </Button>
              )}
              
              {pages.map((page, index) => (
                <Card
                  key={index}
                  className={`cursor-pointer transition-all group relative ${
                    index === currentPageIndex
                      ? "ring-2 ring-primary"
                      : "hover:border-primary/50"
                  }`}
                  draggable={isEditable}
                  onDragStart={(e) => {
                    setDraggedPageIndex(index)
                    e.dataTransfer.effectAllowed = "move"
                  }}
                  onDragOver={(e) => {
                    e.preventDefault()
                    e.dataTransfer.dropEffect = "move"
                  }}
                  onDrop={(e) => {
                    e.preventDefault()
                    if (draggedPageIndex !== null && draggedPageIndex !== index) {
                      movePage(draggedPageIndex, index)
                    }
                    setDraggedPageIndex(null)
                  }}
                  onClick={() => switchToPage(index)}
                >
                  <div className="p-2">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs text-muted-foreground">
                        第 {page.pageNumber} 页
                      </div>
                      {isEditable && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {index > 0 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation()
                                movePage(index, index - 1)
                              }}
                            >
                              <MoveUp className="h-3 w-3" />
                            </Button>
                          )}
                          {index < pages.length - 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation()
                                movePage(index, index + 1)
                              }}
                            >
                              <MoveDown className="h-3 w-3" />
                            </Button>
                          )}
                          {pages.length > 1 && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-destructive"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>确认删除页面</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    确定要删除第 {page.pageNumber} 页吗？此操作无法撤销。
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>取消</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => {
                                      if (index === currentPageIndex) {
                                        deleteCurrentPage()
                                      } else {
                                        setPages((prev) => {
                                          const newPages = prev.filter((_, i) => i !== index)
                                          return newPages.map((p, i) => ({
                                            ...p,
                                            pageNumber: i + 1,
                                          }))
                                        })
                                        setTotalPages((prev) => prev - 1)
                                        saveHistory()
                                      }
                                    }}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    删除
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      )}
                    </div>
                    {page.thumbnail ? (
                      <img
                        src={page.thumbnail}
                        alt={`第${page.pageNumber}页`}
                        className="w-full h-auto border rounded"
                      />
                    ) : (
                      <div className="w-full aspect-video bg-muted rounded flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
        
        {/* 中间核心编辑画布 */}
        <div
          ref={containerRef}
          className="flex-1 relative overflow-auto bg-muted/20"
        >
          {error ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Card className="p-6 max-w-md">
                <div className="text-center space-y-4">
                  <p className="text-destructive font-medium">{error}</p>
                  <Button onClick={handleRetry}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    重新下载
                  </Button>
                </div>
              </Card>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <canvas ref={canvasRef} className="shadow-2xl" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
