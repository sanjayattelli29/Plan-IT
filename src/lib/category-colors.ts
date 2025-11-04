'use client';

export const defaultCategoryColors: Record<string, string> = {
  Work: '#22c55e',       
  Personal: '#3b82f6',
  Meeting: '#f59e0b',
  Appointment: '#8b5cf6',
  Other: '#6b7280',
};

interface CustomCategory {
  name: string;
  color: string;
}

export const getCategoryColor = (category: string | null, customCategories: CustomCategory[]): string => {
  if (!category) return '#6b7280'; 
  
  const customCategory = customCategories.find(cat => cat.name === category);
  if (customCategory) {
    return customCategory.color;
  }

  return defaultCategoryColors[category] || '#6b7280';
};