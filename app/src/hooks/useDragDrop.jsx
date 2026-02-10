import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates } from '@dnd-kit/sortable';

// Create drag-drop context
const DragDropContext = createContext(null);

export function useDragDrop() {
  const context = useContext(DragDropContext);
  if (!context) {
    throw new Error('useDragDrop must be used within DragDropProvider');
  }
  return context;
}

export function DragDropProvider({ children }) {
  const [activeId, setActiveId] = useState(null);
  const [items, setItems] = useState({});

  const sensors = useSensors(
    useSensor(PointerSensor, {
      distance: 8,
    }),
    useSensor(TouchSensor, {
      distance: 8,
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = useCallback((event) => {
    setActiveId(event.active.id);
  }, []);

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    // Call custom handler if registered
    if (items[active.id]?.onDrop) {
      items[active.id].onDrop(over.id);
    }
  }, [items]);

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
  }, []);

  const registerItem = useCallback((id, data) => {
    setItems((prev) => ({
      ...prev,
      [id]: data,
    }));
  }, []);

  const unregisterItem = useCallback((id) => {
    setItems((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const value = {
    activeId,
    registerItem,
    unregisterItem,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
    sensors,
  };

  return (
    <DragDropContext.Provider value={value}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        {children}
      </DndContext>
    </DragDropContext.Provider>
  );
}

export default DragDropProvider;
