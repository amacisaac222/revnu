"use client";

import { useState } from "react";
import { Maximize2, Minimize2, Settings, X, GripVertical, Maximize } from "lucide-react";

export type WidgetSize = "compact" | "normal" | "expanded";

interface WidgetContainerProps {
  id: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  size?: WidgetSize;
  onSizeChange?: (size: WidgetSize) => void;
  onRemove?: () => void;
  onSettings?: () => void;
  isDraggable?: boolean;
  dragHandleProps?: any;
  isFullWidth?: boolean;
  onToggleFullWidth?: () => void;
  className?: string;
}

export default function WidgetContainer({
  id,
  title,
  subtitle,
  children,
  size = "normal",
  onSizeChange,
  onRemove,
  onSettings,
  isDraggable = true,
  dragHandleProps,
  isFullWidth = false,
  onToggleFullWidth,
  className = "",
}: WidgetContainerProps) {
  const [isHovered, setIsHovered] = useState(false);

  const toggleExpanded = () => {
    if (!onSizeChange) return;
    onSizeChange(size === "expanded" ? "normal" : "expanded");
  };

  return (
    <div
      className={`bg-revnu-slate/40 rounded-lg border border-revnu-green/20 overflow-hidden group h-full flex flex-col ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Widget Header */}
      <div className="p-4 border-b border-revnu-green/10 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {isDraggable && (
            <div
              {...dragHandleProps}
              className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition flex-shrink-0"
            >
              <GripVertical className="w-4 h-4 text-revnu-gray" />
            </div>
          )}
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-white truncate">{title}</h3>
            {subtitle && <p className="text-xs text-revnu-gray truncate">{subtitle}</p>}
          </div>
        </div>

        {/* Widget Controls */}
        <div className={`flex items-center gap-1 transition-opacity flex-shrink-0 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          {onToggleFullWidth && (
            <button
              onClick={onToggleFullWidth}
              className="p-1.5 hover:bg-revnu-green/10 rounded transition"
              title={isFullWidth ? "Normal width" : "Full width"}
            >
              <Maximize className={`w-3.5 h-3.5 text-revnu-gray hover:text-revnu-green ${isFullWidth ? 'rotate-45' : ''}`} />
            </button>
          )}

          {onSizeChange && (
            <button
              onClick={toggleExpanded}
              className="p-1.5 hover:bg-revnu-green/10 rounded transition"
              title={size === "expanded" ? "Collapse to normal height" : "Expand to 2x height"}
            >
              {size === "expanded" ? (
                <Minimize2 className="w-3.5 h-3.5 text-revnu-gray hover:text-revnu-green" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5 text-revnu-gray hover:text-revnu-green" />
              )}
            </button>
          )}

          {onSettings && (
            <button
              onClick={onSettings}
              className="p-1.5 hover:bg-revnu-green/10 rounded transition"
              title="Widget settings"
            >
              <Settings className="w-3.5 h-3.5 text-revnu-gray hover:text-revnu-green" />
            </button>
          )}

          {onRemove && (
            <button
              onClick={onRemove}
              className="p-1.5 hover:bg-red-500/10 rounded transition"
              title="Remove widget"
            >
              <X className="w-3.5 h-3.5 text-revnu-gray hover:text-red-400" />
            </button>
          )}
        </div>
      </div>

      {/* Widget Content */}
      <div className={`
        flex-1 overflow-auto
        ${size === "compact" ? "p-3" : size === "expanded" ? "p-6" : "p-4"}
      `}>
        {children}
      </div>
    </div>
  );
}
