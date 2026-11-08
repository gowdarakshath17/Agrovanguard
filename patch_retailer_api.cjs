const fs = require('fs');
let code = fs.readFileSync('src/components/AI/RetailerRecommendations.tsx', 'utf-8');

code = code.replace(
  '  const [bookingStatus, setBookingStatus] = useState<string | null>(null);',
  `  const [bookingStatus, setBookingStatus] = useState<string | null>(null);
  const [bookingLoading, setBookingLoading] = useState<string | null>(null);
  
  const handleBooking = async (retailerId: string, retailerName: string) => {
    setBookingLoading(retailerId);
    try {
      const token = await getToken();
      await fetch('/api/notifications/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: \`Bearer \${token}\` },
        body: JSON.stringify({ retailerId, retailerName })
      });
      setBookingStatus(retailerId);
    } catch(err) {
      console.error(err);
      alert('Failed to process booking');
    } finally {
      setBookingLoading(null);
    }
  };`
);

code = code.replace(
  '<span className="text-xs text-green-600 mt-1 text-center">Your pesticides are reserved at {r.name}. They will be ready for pickup shortly.</span>',
  '<span className="text-xs text-green-600 mt-1 text-center">Your pesticides are reserved at {r.name}.<br/><b>SMS confirmation & Email sent to store!</b></span>'
);

code = code.replace(
  '<button onClick={() => setBookingStatus(r.id)} className="flex-1 bg-green-600 text-white py-1.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-sm">',
  `<button 
    onClick={() => handleBooking(r.id, r.name)} 
    disabled={bookingLoading === r.id}
    className="flex-1 flex justify-center items-center bg-green-600 text-white py-1.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-sm disabled:opacity-70"
  >`
);

code = code.replace(
  '                    Book Products\n                  </button>',
  '                    {bookingLoading === r.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Book Products"}\n                  </button>'
);

fs.writeFileSync('src/components/AI/RetailerRecommendations.tsx', code);
