import { useParams, Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export default function Analytics() {
  const { shortCode } = useParams<{ shortCode: string }>();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['analytics', shortCode],
    queryFn: async () => {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase is not configured.');
      }

      // 1. Fetch the URL details
      const { data: urlData, error: urlError } = await supabase
        .from('urls')
        .select('id, long_url, created_at')
        .eq('short_code', shortCode)
        .single();

      if (urlError) {
        throw new Error(urlError.message);
      }

      // 2. Fetch the clicks for this URL
      const { data: clicksData, error: clicksError } = await supabase
        .from('clicks')
        .select('created_at')
        .eq('url_id', urlData.id)
        .order('created_at', { ascending: false });

      if (clicksError) {
        throw new Error(clicksError.message);
      }

      return { url: urlData, clicks: clicksData };
    },
    enabled: !!shortCode,
  });

  if (isLoading) {
    return <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">Loading analytics...</div>;
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center pt-20">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Analytics not found</h1>
        <Link to="/" className="text-blue-600 hover:underline">Go back home</Link>
      </div>
    );
  }

  const shortUrl = `${window.location.origin}/${shortCode}`;

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center pt-16 px-4">
      <div className="max-w-3xl w-full mb-8">
        <h1 className="text-[40px] font-bold text-[#4a4a4a] mb-3">Link Analytics</h1>
        <p className="text-[#333333] text-[17px]">
          Track the performance of your shortened URL.
        </p>
      </div>

      <div className="w-full max-w-3xl bg-white p-10 rounded-lg shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-gray-100">
        <div className="mb-8">
          <p className="text-sm text-gray-500 mb-1">Short Link</p>
          <a href={shortUrl} target="_blank" rel="noopener noreferrer" className="text-xl font-medium text-[#2c8ed6] hover:underline">
            {shortUrl}
          </a>
          <p className="text-sm text-gray-500 mt-4 mb-1">Destination</p>
          <a href={data.url.long_url} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:underline break-all">
            {data.url.long_url}
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
            <h3 className="text-blue-800 text-sm font-semibold uppercase tracking-wider mb-2">Total Clicks</h3>
            <p className="text-4xl font-bold text-blue-600">{data.clicks.length}</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-gray-600 text-sm font-semibold uppercase tracking-wider mb-2">Created On</h3>
            <p className="text-xl font-medium text-gray-800">
              {new Date(data.url.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Recent Clicks</h3>
          {data.clicks.length === 0 ? (
            <p className="text-gray-500 italic">No clicks recorded yet.</p>
          ) : (
            <div className="max-h-64 overflow-y-auto pr-2">
              <ul className="space-y-3">
                {data.clicks.map((click, index) => (
                  <li key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded border border-gray-100">
                    <span className="text-gray-600">Click #{data.clicks.length - index}</span>
                    <span className="text-gray-500 text-sm">
                      {new Date(click.created_at).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-8 flex gap-4 items-center">
        <Link to="/" className="text-[#2c8ed6] hover:underline text-[15px]">
          Shorten another URL
        </Link>
        <span className="text-gray-300">|</span>
        <Link to={`/result/${shortCode}`} className="text-[#2c8ed6] hover:underline text-[15px]">
          View Short Link
        </Link>
      </div>
    </div>
  );
}
