import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Layers } from "lucide-react"

export function EditorToolbar() {
  return (
    <div className="flex items-center gap-2 p-3 bg-card border rounded-lg">
      <Select defaultValue="arial">
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="arial">Arial</SelectItem>
          <SelectItem value="times">Times New Roman</SelectItem>
          <SelectItem value="courier">Courier</SelectItem>
        </SelectContent>
      </Select>

      <Select defaultValue="16">
        <SelectTrigger className="w-20">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="12">12</SelectItem>
          <SelectItem value="14">14</SelectItem>
          <SelectItem value="16">16</SelectItem>
          <SelectItem value="18">18</SelectItem>
          <SelectItem value="24">24</SelectItem>
        </SelectContent>
      </Select>

      <div className="h-4 w-px bg-border" />

      <Button variant="ghost" size="icon">
        <Bold className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon">
        <Italic className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon">
        <Underline className="h-4 w-4" />
      </Button>

      <div className="h-4 w-px bg-border" />

      <Button variant="ghost" size="icon">
        <AlignLeft className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon">
        <AlignCenter className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon">
        <AlignRight className="h-4 w-4" />
      </Button>

      <div className="h-4 w-px bg-border" />

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">颜色</span>
        <input type="color" className="h-8 w-12 cursor-pointer" />
      </div>

      <div className="h-4 w-px bg-border" />

      <Button variant="ghost" size="sm">
        <Layers className="h-4 w-4 mr-1" />
        图层
      </Button>
    </div>
  )
}
