export interface PublicVendor {
  id: string;
  name: string;
  description: string | null;
  city: string | null;
  priceFrom: number | null;
  imageUrl: string | null;
  phone: string | null;
  telegram: string | null;
  instagram: string | null;
  whatsapp: string | null;
  website: string | null;
  isFeatured: boolean;
}

export interface PublicCategory {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  emoji: string;
  vendors: PublicVendor[];
}

export interface AdminCategory {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  emoji: string;
  position: number;
  isActive: boolean;
  _count: { vendors: number };
}

export interface AdminVendor {
  id: string;
  categoryId: string;
  name: string;
  description: string | null;
  city: string | null;
  priceFrom: number | null;
  imageUrl: string | null;
  phone: string | null;
  telegram: string | null;
  instagram: string | null;
  whatsapp: string | null;
  website: string | null;
  position: number;
  isFeatured: boolean;
  isActive: boolean;
}
