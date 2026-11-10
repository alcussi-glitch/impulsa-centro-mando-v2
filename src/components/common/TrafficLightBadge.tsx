/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';

export type TrafficLightColor = 'green' | 'yellow' | 'red';

interface TrafficLightBadgeProps {
  color: TrafficLightColor;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const TrafficLightBadge: React.FC<TrafficLightBadgeProps> = ({
  color,
  label,
  size = 'sm',
  className = '',
}) => {
  const defaultLabel =
    color === 'green' ? 'Favorable' : color === 'yellow' ? 'Alerta' : 'Crítico';
  const displayLabel = label || defaultLabel;

  const colorStyles = {
    green: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    yellow: 'bg-amber-50 text-amber-800 border-amber-300',
    red: 'bg-rose-50 text-rose-800 border-rose-300',
  }[color];

  const iconStyles = {
    green: 'text-emerald-600',
    yellow: 'text-amber-600',
    red: 'text-rose-600',
  }[color];

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }[size];

  const textSizes = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold uppercase rounded-md border ${colorStyles} ${textSizes} ${className}`}
    >
      {color === 'green' && <CheckCircle2 className={`${iconSizes} ${iconStyles}`} />}
      {color === 'yellow' && <AlertTriangle className={`${iconSizes} ${iconStyles}`} />}
      {color === 'red' && <AlertOctagon className={`${iconSizes} ${iconStyles}`} />}
      <span>{displayLabel}</span>
    </span>
  );
};
