export interface Product {
  id: string;
  name: string;
  code: string;
  category: string;
  brand: string;
  price: number;
  stock: number;
  description?: string;
  images?: string[];
  partnerId: string;
  partnerName: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'inactive' | 'pending';
}

export interface ProductCategory {
  id: string;
  name: string;
  icon?: string;
}
