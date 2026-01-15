"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, RotateCcw } from "lucide-react";

export interface Widget {
  id: string;
  type: string;
  size: "compact" | "normal" | "expanded";
  visible: boolean;
  fullWidth?: boolean;
  settings?: Record<string, any>;
}

interface DashboardGridProps {
  widgets: Widget[];
  onWidgetsChange: (widgets: Widget[]) => void;
  onResetLayout: () => void;
  onAddWidget: () => void;
  children: (widget: Widget, dragHandleProps?: any) => React.ReactNode;
}

function SortableWidget({ widget, children }: { widget: Widget; children: (dragHandleProps: any) => React.ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const dragHandleProps = {
    ...attributes,
    ...listeners,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`min-w-0 ${widget.fullWidth ? 'col-span-full' : ''} ${
        widget.size === 'expanded' ? 'row-span-2' : ''
      }`}
    >
      {children(dragHandleProps)}
    </div>
  );
}

export default function DashboardGrid({
  widgets,
  onWidgetsChange,
  onResetLayout,
  onAddWidget,
  children,
}: DashboardGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = widgets.findIndex((w) => w.id === active.id);
      const newIndex = widgets.findIndex((w) => w.id === over.id);

      const newWidgets = arrayMove(widgets, oldIndex, newIndex);
      onWidgetsChange(newWidgets);
    }
  };

  const visibleWidgets = widgets.filter((w) => w.visible);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onAddWidget}
            className="px-3 py-1.5 bg-revnu-green/20 border border-revnu-green/30 rounded-lg text-revnu-green font-semibold hover:bg-revnu-green/30 transition text-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Widget
          </button>
          <button
            onClick={onResetLayout}
            className="px-3 py-1.5 bg-revnu-slate/40 border border-revnu-green/20 rounded-lg text-revnu-gray font-semibold hover:text-revnu-green transition text-xs flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
        <div className="text-xs text-revnu-gray">
          {visibleWidgets.length} widget{visibleWidgets.length !== 1 ? "s" : ""} • Drag to reorder
        </div>
      </div>

      {/* Draggable Widgets - Uniform Grid Layout */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={visibleWidgets.map((w) => w.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
            {visibleWidgets.map((widget) => (
              <SortableWidget key={widget.id} widget={widget}>
                {(dragHandleProps) => children(widget, dragHandleProps)}
              </SortableWidget>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {visibleWidgets.length === 0 && (
        <div className="p-12 text-center bg-revnu-slate/40 rounded-lg border border-revnu-green/20">
          <p className="text-revnu-gray mb-4">No widgets visible</p>
          <button
            onClick={onAddWidget}
            className="px-4 py-2 bg-revnu-green text-revnu-dark font-bold rounded-lg hover:bg-revnu-greenLight transition"
          >
            Add Your First Widget
          </button>
        </div>
      )}
    </div>
  );
}
