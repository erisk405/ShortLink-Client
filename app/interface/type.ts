export interface PreviewData {
    title: string;
    description: string;
    image: string | null;
}

export interface LocationData {
    country: string;
    city: string;
    latitude: number;
    longitude: number;
    count: number;
}

export interface StatsData {
    totalClicks: number;
    latestGeoLocation:LocationData | null;
    locations: LocationData[];
}

export type UrlHistory = {
    id: number;
    originalUrl: string;
    shortCode: string;
    createdAt: string;
    clickCount: number;
  };
  