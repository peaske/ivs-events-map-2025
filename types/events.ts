// イベントデータの型定義
export interface Event {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  location?: {
    name?: string;
    address?: string;
    lat?: number;
    lng?: number;
  };
  organizer?: string;
  url?: string;
  imageUrl?: string;
  category?: string;
  tags?: string[];
}

export interface EventsApiResponse {
  events: Event[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}