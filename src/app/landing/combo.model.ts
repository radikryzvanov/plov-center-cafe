export interface ComboMeal {
  id: string;
  title: string;
  badge?: string;
  description: string;
  items: string[];
  price: number;
  oldPrice?: number;
  weightGrams: number;
}