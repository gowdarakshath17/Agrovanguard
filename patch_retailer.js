const fs = require('fs');
const code = fs.readFileSync('src/components/AI/RetailerRecommendations.tsx', 'utf-8');

const newCode = code.replace(
  'export default function RetailerRecommendations({ lat = 19.0760, lon = 72.8777, query = "Agricultural fertilizer and pesticide store" }) {',
  `export default function RetailerRecommendations({ lat: initialLat = 19.0760, lon: initialLon = 72.8777, query = "Agricultural fertilizer and pesticide store" }) {
  const [lat, setLat] = useState(initialLat);
  const [lon, setLon] = useState(initialLon);
  const [bookingStatus, setBookingStatus] = useState<string | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLat(pos.coords.latitude);
        setLon(pos.coords.longitude);
      }, (err) => {
        console.warn("Could not get farmer geolocation, using default/farm location.", err);
      });
    }
  }, []);`
).replace(
  '{retailers.map(r => (',
  `{retailers.map(r => (
          <div key={r.id} className="p-4 hover:bg-gray-50 transition-colors">
            {bookingStatus === r.id ? (
              <div className="flex flex-col items-center justify-center p-4 bg-green-50 rounded-lg text-green-700">
                <Store className="h-6 w-6 mb-2" />
                <span className="font-bold text-sm">Booking Confirmed!</span>
                <span className="text-xs text-green-600 mt-1 text-center">Your pesticides are reserved at {r.name}. They will be ready for pickup shortly.</span>
                <button onClick={() => setBookingStatus(null)} className="mt-3 text-xs underline">Dismiss</button>
              </div>
            ) : (`
).replace(
  '<button className="flex-1 bg-green-600 text-white py-1.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-sm">',
  '<button onClick={() => setBookingStatus(r.id)} className="flex-1 bg-green-600 text-white py-1.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-sm">'
).replace(
  '        ))}      </div>',
  '            )}          </div>        ))}      </div>'
);

fs.writeFileSync('src/components/AI/RetailerRecommendations.tsx', newCode);
