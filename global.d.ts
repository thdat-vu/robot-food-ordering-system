import '@google/model-viewer';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': {
        src?: string;
        alt?: string;
        'auto-rotate'?: boolean | '';
        'camera-controls'?: boolean | '';
        'shadow-intensity'?: string;
        exposure?: string;
        'interaction-prompt'?: string;
        style?: React.CSSProperties;
        width?: string;
        height?: string;
        [key: string]: any;
      };
    }
  }
} 