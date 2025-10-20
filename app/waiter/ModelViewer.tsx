import "@google/model-viewer";
import React from "react";

interface ModelViewerProps {
  src: string;
  alt: string;
  autoRotate?: boolean;
  cameraControls?: boolean;
  shadowIntensity?: string;
  exposure?: string;
  interactionPrompt?: string;
  style?: React.CSSProperties;
}

export default function ModelViewer({
  src,
  alt,
  autoRotate = false,
  cameraControls = false,
  shadowIntensity,
  exposure,
  interactionPrompt,
  style
}: ModelViewerProps) {
  return React.createElement('model-viewer' as any, {
    src,
    alt,
    'auto-rotate': autoRotate,
    'camera-controls': cameraControls,
    'shadow-intensity': shadowIntensity,
    exposure,
    'interaction-prompt': interactionPrompt,
    style
  });
} 