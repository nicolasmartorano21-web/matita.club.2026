
export type Category = 'Escolar' | 'Otros' | 'Oficina' | 'Tecnología' | 'Novedades' | 'Ofertas';

export interface ColorStock {
  color: string;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  oldPrice?: number;
  price: number;
  points: number;
  category: Category;
  images: string[]; // Soporte para galería
  colors: ColorStock[];
}

export interface IdeaSubmission {
  id: string;
  userName: string;
  title: string;
  content: string;
  createdAt: string;
  status: 'pending' | 'reviewed';
}

export interface Sale {
  id: string;
  date: string;
  total: number;
  items: number;
  userName: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  points: number;
  isAdmin: boolean;
  isSocio: boolean; // Solo los socios suman puntos
}

export interface Coupon {
  id: string;
  code: string;
  discount: number;
  pointsRequired: number;
}
