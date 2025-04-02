import { useEffect, useState } from 'react';
import axios from 'axios';

import { BarChart2, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';

// ประเภทข้อมูลสำหรับข้อมูลตำแหน่งทางภูมิศาสตร์
interface LocationData {
  ip: string;
  country: string;
  city: string;
  lat: number;
  lng: number;
  count: number;
}

interface LocationStats {
  totalClicks: number;
  locations: LocationData[];
}

// สร้างคอมโพเนนต์แผนที่อย่างง่าย
const SimpleMap = ({ locations }: { locations: LocationData[] }) => {
  // สร้างสีที่แตกต่างกันตามจำนวนคลิก
  const getMarkerColor = (count: number) => {
    if (count >= 10) return "bg-red-500";
    if (count >= 5) return "bg-orange-500";
    return "bg-blue-500";
  };

  const getMarkerSize = (count: number) => {
    if (count >= 10) return "w-5 h-5";
    if (count >= 5) return "w-4 h-4";
    return "w-3 h-3";
  };

  return (
    <div className="relative w-full h-64 bg-gray-100 rounded-md overflow-hidden">
      {/* ตรงนี้เราใช้ภาพพื้นหลังเป็นแผนที่อย่างง่าย */}
      <div className="absolute inset-0 bg-blue-50 border border-gray-200 rounded-md">
        {/* จำลองเส้นละติจูด/ลองจิจูด */}
        <div className="grid grid-cols-6 grid-rows-6 w-full h-full">
          {Array(36).fill(0).map((_, i) => (
            <div key={i} className="border border-blue-100/50"></div>
          ))}
        </div>
        
        {/* แสดงตำแหน่งของแต่ละ IP */}
        {locations.map((loc, index) => {
          // จำลองตำแหน่งบนแผนที่ (ในโค้ดจริงควรใช้ค่าจริงจาก lat/lng)
          // สำหรับตัวอย่างนี้เราจะสุ่มตำแหน่ง
          const leftPos = `${(index * 17 + loc.lat * 10) % 80 + 10}%`;
          const topPos = `${(index * 19 + loc.lng * 10) % 80 + 10}%`;
          
          return (
            <div 
              key={index} 
              className={`absolute rounded-full ${getMarkerSize(loc.count)} ${getMarkerColor(loc.count)} flex items-center justify-center`}
              style={{ left: leftPos, top: topPos }}
              title={`${loc.city}, ${loc.country} (${loc.count} clicks)`}
            >
              <span className="text-xs text-white font-bold">{loc.count}</span>
              <div className="absolute -bottom-5 bg-white px-1 rounded text-xs whitespace-nowrap">
                {loc.city || 'Unknown'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// คอมโพเนนต์หลักสำหรับแสดงสถิติการคลิกตามตำแหน่ง
const GeoTrackingStats = ({ urlToTrack, trackingType }: { urlToTrack: string, trackingType: 'short' | 'original' }) => {
  const [locationStats, setLocationStats] = useState<LocationStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchLocationStats = async () => {
      if (!urlToTrack) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // ทำการเรียก API สำหรับดึงข้อมูลตำแหน่ง
        const endpoint = trackingType === 'short' 
          ? `${import.meta.env.VITE_API_URL}/location-stats?shortUrl=${urlToTrack}`
          : `${import.meta.env.VITE_API_URL}/location-stats?originalUrl=${urlToTrack}`;
        
        const response = await axios.get(endpoint);
        setLocationStats(response.data);
      } catch (err) {
        console.error("Failed to fetch location stats:", err);
        setError("Failed to load location data. Please try again.");
        // ใช้ข้อมูลตัวอย่างเมื่อเกิดข้อผิดพลาด
        setLocationStats({
          totalClicks: 5,
          locations: [
            { ip: "192.168.1.1", country: "Thailand", city: "Bangkok", lat: 13.7563, lng: 100.5018, count: 3 },
            { ip: "203.0.113.1", country: "Japan", city: "Tokyo", lat: 35.6762, lng: 139.6503, count: 2 }
          ]
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLocationStats();
  }, [urlToTrack, trackingType]);
  
  if (isLoading) {
    return <div className="py-4 text-center text-gray-500">Loading location data...</div>;
  }
  
  if (error) {
    return <div className="py-4 text-center text-red-500">{error}</div>;
  }
  
  if (!locationStats) {
    return null;
  }
  
  return (
    <Card className="w-full mt-4">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <MapPin className="text-blue-500" />
          <CardTitle className="text-lg">Geographic Distribution</CardTitle>
        </div>
        <CardDescription>
          Where your clicks are coming from ({locationStats.totalClicks} total clicks)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {locationStats.locations.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No location data available yet.
          </div>
        ) : (
          <>
            <SimpleMap locations={locationStats.locations} />
            
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Top Locations:</h4>
              <div className="grid gap-2">
                {locationStats.locations.map((loc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${loc.count >= 5 ? 'bg-orange-500' : 'bg-blue-500'}`}></div>
                      <span>{loc.city || 'Unknown'}, {loc.country || 'Unknown'}</span>
                    </div>
                    <span className="text-gray-600 font-medium">{loc.count} clicks</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default GeoTrackingStats;