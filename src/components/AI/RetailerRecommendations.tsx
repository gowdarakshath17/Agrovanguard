import React, { useState, useEffect } from 'react';
import { Store, MapPin, Loader2, Navigation } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';

interface Retailer {
  id: string;
  name: string;
  address: string;
  distance: string;
  rating?: number;
  openNow?: boolean;
  phone?: string;
}

export default function RetailerRecommendations({ lat: initialLat = 19.0760, lon: initialLon = 72.8777, query = "Agricultural fertilizer and pesticide store" }) {
  const [lat, setLat] = useState(initialLat);
  const [lon, setLon] = useState(initialLon);
  const [bookingStatus, setBookingStatus] = useState<string | null>(null);
  const [bookingLoading, setBookingLoading] = useState<string | null>(null);
  
  const handleBooking = async (retailerId: string, retailerName: string) => {
    setBookingLoading(retailerId);
    try {
      const token = await getToken();
      await fetch('/api/notifications/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ retailerId, retailerName })
      });
      setBookingStatus(retailerId);
    } catch(err) {
      console.error(err);
      alert('Failed to process booking');
    } finally {
      setBookingLoading(null);
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLat(pos.coords.latitude);
        setLon(pos.coords.longitude);
      }, (err) => {
        console.warn("Could not get farmer geolocation, using default/farm location.", err);
      });
    }
  }, []);
  const [retailers, setRetailers] = useState<Retailer[]>(() => {
    try {
      const cached = localStorage.getItem('retailers_cache');
      if (cached) return JSON.parse(cached);
    } catch(e) {}
    return [];
  });
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth();

  useEffect(() => {
    let mounted = true;
    const fetchRetailers = async () => {
      setLoading(true);
      try {
        const token = await getToken();
        const res = await fetch(`/api/places/search?lat=${lat}&lon=${lon}&query=${encodeURIComponent(query)}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          if (mounted) {
            setRetailers(data.results || []);
            try { localStorage.setItem("retailers_cache", JSON.stringify(data.results || [])); } catch(e) {}
          }
        }
      } catch (err) {
        console.error("Failed to fetch retailers:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchRetailers();
    return () => { mounted = false; };
  }, [lat, lon, query, getToken]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6 bg-gray-50 rounded-xl border border-gray-100">
        <Loader2 className="h-6 w-6 text-green-600 animate-spin mr-3" />
        <span className="text-gray-600">Finding nearby suppliers...</span>
      </div>
    );
  }

  if (retailers.length === 0) {
    return (
      <div className="p-6 bg-gray-50 rounded-xl border border-gray-100 text-center">
        <Store className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600">No agricultural stores found nearby.</p>
        <a 
          href={`https://www.google.com/maps/search/${encodeURIComponent(query)}`}
          target="_blank" rel="noopener noreferrer"
          className="text-green-600 font-medium hover:underline text-sm mt-2 inline-block"
        >
          Search manually on Google Maps
        </a>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="bg-green-50 px-4 py-3 border-b border-green-100 flex items-center justify-between">
        <div className="flex items-center text-green-800 font-semibold">
          <Store className="h-5 w-5 mr-2 text-green-600" />
          Nearby Verified Suppliers
        </div>
        <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full font-medium">Google Maps Data</span>
      </div>
      <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
        {retailers.map(r => (
          <div key={r.id} className="p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
            {bookingStatus === r.id ? (
              <div className="flex flex-col items-center justify-center p-4 bg-green-50 rounded-lg text-green-700">
                <Store className="h-6 w-6 mb-2" />
                <span className="font-bold text-sm">Booking Confirmed!</span>
                <span className="text-xs text-green-600 mt-1 text-center">Your pesticides are reserved at {r.name}.<br/><b>SMS confirmation & Email sent to store!</b></span>
                <button onClick={() => setBookingStatus(null)} className="mt-3 text-xs underline">Dismiss</button>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-bold text-gray-900">{r.name}</h5>
                    <p className="text-sm text-gray-500 mt-0.5 flex items-start">
                      <MapPin className="h-4 w-4 mr-1 flex-shrink-0 mt-0.5 text-gray-400" />
                      {r.address}
                    </p>
                    {r.rating && (
                      <div className="flex items-center mt-1">
                        <span className="text-yellow-500 text-xs font-bold">★ {r.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.name + ' ' + r.address)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="ml-3 flex-shrink-0 bg-green-100 hover:bg-green-200 text-green-700 p-2 rounded-full transition-colors"
                    title="Get Directions"
                  >
                    <Navigation className="h-4 w-4" />
                  </a>
                </div>
                <div className="mt-3 flex items-center space-x-3">
                  <button className="flex-1 bg-white border border-gray-300 text-gray-700 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                    Call Store
                  </button>
                  <button 
    onClick={() => handleBooking(r.id, r.name)} 
    disabled={bookingLoading === r.id}
    className="flex-1 flex justify-center items-center bg-green-600 text-white py-1.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-sm disabled:opacity-70"
  >
                    {bookingLoading === r.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Book Products"}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
