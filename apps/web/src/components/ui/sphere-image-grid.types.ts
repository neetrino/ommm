export type Position3D = {
  x: number;
  y: number;
  z: number;
};

export type RotationState = {
  x: number;
  y: number;
  z: number;
};

export type VelocityState = {
  x: number;
  y: number;
};

export type SphericalPosition = {
  theta: number;
  phi: number;
  radius: number;
};

export type WorldPosition = Position3D & {
  scale: number;
  zIndex: number;
  isVisible: boolean;
  fadeOpacity: number;
  originalIndex: number;
};

export type SphereImageItem = {
  id: string;
  src: string | null;
  alt: string;
  fallbackLabel: string;
};

export type SphereImageGridProps = {
  images: SphereImageItem[];
  onSelect?: (id: string) => void;
  autoRotate?: boolean;
  className?: string;
  ariaLabel: string;
};
