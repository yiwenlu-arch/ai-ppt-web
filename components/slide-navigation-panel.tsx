"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface SlideNavigationPanelProps {
  totalSlides: number
  currentSlide: number
  onSlideChange: (slide: number) => void
}

export function SlideNavigationPanel({ totalSlides, currentSlide, onSlideChange }: SlideNavigationPanelProps) {
  return (
    <aside className="w-64 border-r bg-muted/30 flex flex-col">
      <div className="p-4 border-b">
        <p className="text-sm font-semibold text-center">
          {currentSlide} / {totalSlides}
        </p>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {Array.from({ length: Math.min(totalSlides, 6) }, (_, i) => i + 1).map((slide) => (
            <Card
              key={slide}
              className={`cursor-pointer transition-all hover:shadow-md ${
                currentSlide === slide ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => onSlideChange(slide)}
            >
              <div className="p-2">
                <div className="aspect-video bg-background rounded overflow-hidden mb-2">
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <span className="text-4xl font-bold">{slide}</span>
                  </div>
                </div>
                <p className="text-xs text-center">
                  {slide === 1 ? "封面页" : slide === totalSlides ? "结束页" : `第 ${slide} 页`}
                </p>
              </div>
            </Card>
          ))}
        </div>

        {totalSlides > 6 && (
          <div className="mt-4">
            <Button variant="outline" size="sm" className="w-full bg-transparent">
              全部幻灯片 ({totalSlides})
            </Button>
          </div>
        )}
      </ScrollArea>
    </aside>
  )
}
