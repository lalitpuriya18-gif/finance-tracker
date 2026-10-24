import React from 'react';
import {
  Briefcase,
  ShoppingCart,
  Utensils,
  Car,
  Home,
  Zap,
  Tv,
  HeartPulse,
  ShoppingBag,
  Laptop,
  TrendingUp,
  Tag,
  Coffee,
  Plane,
  Gift,
  Smartphone,
  Shield,
  HelpCircle,
} from 'lucide-react';

interface CategoryIconProps {
  icon: string;
  color?: string;
  className?: string;
  size?: number;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Briefcase,
  ShoppingCart,
  Utensils,
  Car,
  Home,
  Zap,
  Tv,
  HeartPulse,
  ShoppingBag,
  Laptop,
  TrendingUp,
  Tag,
  Coffee,
  Plane,
  Gift,
  Smartphone,
  Shield,
};

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  icon,
  color,
  className = 'w-4 h-4',
  size = 16,
}) => {
  const IconComponent = ICON_MAP[icon] || HelpCircle;

  return (
    <span
      className={`inline-flex items-center justify-center rounded-lg p-1.5 shrink-0 ${className}`}
      style={{
        backgroundColor: color ? `${color}18` : undefined,
        color: color || 'inherit',
      }}
    >
      <IconComponent size={size} />
    </span>
  );
};
