import type { RotationState } from "@/components/ui/sphere-image-grid.types";

export const SPHERE_RADIUS_RATIO = 0.42;
export const SPHERE_BASE_IMAGE_SCALE = 0.14;
export const SPHERE_PERSPECTIVE_PX = 1000;
export const SPHERE_DRAG_SENSITIVITY = 0.8;
export const SPHERE_MOMENTUM_DECAY = 0.96;
export const SPHERE_MAX_ROTATION_SPEED = 6;
export const SPHERE_AUTO_ROTATE_SPEED = 0.2;
export const SPHERE_VELOCITY_STOP = 0.01;
export const SPHERE_DRAG_CLICK_SUPPRESS_PX = 8;
export const SPHERE_FADE_ZONE_START_Z = -10;
export const SPHERE_FADE_ZONE_END_Z = -30;
export const SPHERE_MIN_NODE_SCALE = 0.25;
export const SPHERE_COLLISION_PADDING_PX = 20;
export const SPHERE_Z_INDEX_BASE = 1000;
export const SPHERE_GOLDEN_RATIO = (1 + Math.sqrt(5)) / 2;

export const SPHERE_INITIAL_ROTATION: RotationState = { x: 15, y: 15, z: 0 };
