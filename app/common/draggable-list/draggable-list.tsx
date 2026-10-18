// Single seam for drag-to-reorder lists (MyPlansScreen, WorkoutsScreen, WorkoutScreen).
//
// Backed by react-native-draggable-flatlist 4.0.3. Its source only uses Reanimated APIs that still
// exist in Reanimated 4 (useSharedValue, useAnimatedReaction, withSpring, runOnJS, ...) and the
// Gesture Handler 2 `Gesture` API, so it is kept for now. It still calls findNodeHandle, which
// works under the New Architecture but is deprecated. If it misbehaves on a device, swap the
// implementation here (e.g. react-native-reorderable-list) without touching the three screens.
import {
  NestableDraggableFlatList,
  NestableScrollContainer,
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist'

/** Scroll container that hosts one or more DraggableList instances. */
export const DraggableScrollContainer = NestableScrollContainer

/** A reorderable list. Props: data, renderItem, keyExtractor, onDragEnd({ data }), ... */
export const DraggableList = NestableDraggableFlatList

/** Wrap each rendered row so it scales up while being dragged. */
export const DraggableItem = ScaleDecorator

/** renderItem params: { item, drag, isActive, getIndex } */
export type DraggableRenderItemParams<T> = RenderItemParams<T>
