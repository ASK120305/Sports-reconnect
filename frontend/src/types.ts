export type TemplateCategory = 'Corporate' | 'Education' | 'Creative' | 'Minimal' | 'Achievement';

export interface Template {
  id: string;
  title: string;
  category: TemplateCategory;
  image: string;
  accent: string;
}
