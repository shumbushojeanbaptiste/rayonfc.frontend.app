// types.ts (optional)
export interface Video {
  id: number;
  title: string;
  price: number;
  duration: string;
  ref?: string; // needed for payment check
  thumbnail?: string;
  profile_photo?: string;
  owner?: string;
  views?: number;
  first_name?: string;
  last_name?: string;
  created_at?: string;
  preview?: string;
   description?: string;
}

export interface User {
  id: number;
  name?: string;
}
