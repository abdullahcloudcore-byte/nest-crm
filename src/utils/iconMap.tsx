import React from 'react';
import {
  Layers,
  Cpu,
  Server,
  ShieldCheck,
  Database,
  Terminal,
  Zap,
  Code,
  Globe,
  Lock,
  Box,
  Compass,
  FileCode,
  Workflow,
  Sparkles,
} from 'lucide-react';

export function getCategoryIcon(iconName: string, className = 'w-4 h-4') {
  switch (iconName?.toLowerCase()) {
    case 'cpu':
      return <Cpu className={className} />;
    case 'server':
      return <Server className={className} />;
    case 'shieldcheck':
    case 'shield':
    case 'security':
      return <ShieldCheck className={className} />;
    case 'database':
    case 'db':
      return <Database className={className} />;
    case 'terminal':
    case 'devops':
      return <Terminal className={className} />;
    case 'zap':
      return <Zap className={className} />;
    case 'code':
      return <Code className={className} />;
    case 'workflow':
      return <Workflow className={className} />;
    case 'box':
      return <Box className={className} />;
    case 'sparkles':
      return <Sparkles className={className} />;
    case 'layers':
    default:
      return <Layers className={className} />;
  }
}
