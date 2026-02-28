// src/types/index.ts
export type Priority = 'High' | 'Medium' | 'Low';
export type Category = 'Medical' | 'Food' | 'Shelter';
export type Status = 'Pending' | 'Accepted' | 'In Progress' | 'Completed';

export interface RequestData {
  id: string;
  userId: string;
  category: Category;
  priority: Priority;
  status: Status;
  location: { lat: number; lng: number };
  description: string;
  timestamp: number;
  assignedVolunteerId?: string;
  distance?: number; // Optional for volunteer dashboard sorting
}

export interface User {
  uid: string;
  email: string | null;
  role: 'requester' | 'volunteer' | 'admin';
  location?: { lat: number; lng: number };
}