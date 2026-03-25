import { useState } from 'react';
import { useParams, Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import QRCode from 'react-qr-code';
import { QrCode } from 'lucide-react';

export default function Result() {
  const { shortCode } = useParams<{ shortCode: string }>();
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['url', shortCode],
    queryFn: async () => {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase is not configured.');
      }
      const { data, error } = await supabase
        .from('urls')
        .select('*')
        .eq('short_code', shortCode)
        .single();

      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
    enabled: !!shortCode,
  });

  const shortUrl = `${window.location.origin}/${shortCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">Loading...</div>;
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center pt-20">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Link not found</h1>
        <Link to="/" className="text-blue-600 hover:underline">Go back home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center pt-16 px-4">
      <div className="max-w-3xl w-full mb-8">
        <h1 className="text-[40px] font-bold text-[#4a4a4a] mb-3">Your shortened URL</h1>
        <p className="text-[#333333] text-[17px]">
          Copy the short link and share it in messages, texts, posts, websites and other locations.
        </p>
      </div>

      <div className="w-full max-w-3xl bg-white p-10 rounded-lg shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-gray-100">
        <div className="flex flex-col sm:flex-row max-w-2xl mx-auto">
          <input
            type="text"
            readOnly
            value={shortUrl}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-l focus:outline-none text-[17px] text-[#333333] bg-white"
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <button
            onClick={handleCopy}
            className="bg-[#2c8ed6] hover:bg-[#237cbd] text-white font-medium py-3 px-6 rounded-r transition-colors min-w-[120px]"
          >
            {copied ? 'Copied!' : 'Copy URL'}
          </button>
        </div>
        
        <div className="mt-8 max-w-2xl mx-auto flex flex-col gap-4">
          <p className="text-[15px] text-[#333333]">
            Long URL: <a href={data.long_url} target="_blank" rel="noopener noreferrer" className="text-[#0056b3] hover:underline break-all">{data.long_url}</a>
          </p>
          
          <div>
            <button
              onClick={() => setShowQR(!showQR)}
              className="flex items-center gap-2 text-[#2c8ed6] hover:underline text-[15px] font-medium transition-colors"
            >
              <QrCode size={18} />
              {showQR ? 'Hide QR Code' : 'Generate QR Code'}
            </button>
          </div>

          {showQR && (
            <div className="mt-4 flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg border border-gray-200 max-w-xs mx-auto w-full">
              <div className="bg-white p-4 rounded shadow-sm">
                <QRCode value={shortUrl} size={160} />
              </div>
              <p className="mt-4 text-sm text-gray-500 text-center">Scan this QR code to visit the shortened URL</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-8 flex gap-4 items-center">
        <Link to="/" className="text-[#2c8ed6] hover:underline text-[15px]">
          Shorten another URL
        </Link>
        <span className="text-gray-300">|</span>
        <Link to={`/analytics/${shortCode}`} className="text-[#2c8ed6] hover:underline text-[15px]">
          View Analytics
        </Link>
      </div>
    </div>
  );
}
