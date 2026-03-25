import { useEffect } from 'react';
import { useParams } from 'react-router';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export default function Redirect() {
  const { shortCode } = useParams<{ shortCode: string }>();

  useEffect(() => {
    const fetchUrl = async () => {
      if (!shortCode || !isSupabaseConfigured) {
        window.location.href = '/';
        return;
      }
      
      const { data, error } = await supabase
        .from('urls')
        .select('id, long_url')
        .eq('short_code', shortCode)
        .single();

      if (data && data.long_url) {
        // Record the click
        await supabase.from('clicks').insert([{ url_id: data.id }]);
        
        window.location.href = data.long_url;
      } else {
        // If not found, redirect to home
        window.location.href = '/';
      }
    };

    fetchUrl();
  }, [shortCode]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
