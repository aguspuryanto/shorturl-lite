import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useMutation } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const generateShortCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export default function Home() {
  const [url, setUrl] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const navigate = useNavigate();

  const createShortUrl = useMutation({
    mutationFn: async (longUrl: string) => {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables.');
      }

      const shortCode = customSlug.trim() || generateShortCode();
      const { data, error } = await supabase
        .from('urls')
        .insert([{ long_url: longUrl, short_code: shortCode }])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // Unique violation error code in Postgres
          throw new Error('This custom slug is already taken. Please choose another one.');
        }
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: (data) => {
      navigate(`/result/${data.short_code}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url) {
      let finalUrl = url;
      if (!/^https?:\/\//i.test(url)) {
        finalUrl = 'https://' + url;
      }
      createShortUrl.mutate(finalUrl);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-20 px-4">
      {!isSupabaseConfigured && (
        <div className="max-w-3xl w-full bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8 rounded shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Supabase is not configured.</strong> The app will not work until you set up your database and add the <code className="bg-yellow-100 px-1 rounded">VITE_SUPABASE_URL</code> and <code className="bg-yellow-100 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> environment variables.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-3xl w-full text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Paste the URL to be shortened</h1>
        <p className="text-gray-600">ShortURL is a free tool to shorten URLs and generate short links</p>
        <p className="text-gray-600">URL shortener allows to create a shortened link making it easy to share</p>
      </div>

      <div className="w-full max-w-3xl bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter the link here"
              required
              className="flex-1 px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            />
            <button
              type="submit"
              disabled={createShortUrl.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded transition-colors disabled:opacity-50 sm:w-auto w-full"
            >
              {createShortUrl.isPending ? 'Shortening...' : 'Shorten URL'}
            </button>
          </div>
          
          <div className="flex items-center mt-2">
            <span className="bg-gray-100 border border-gray-300 border-r-0 px-4 py-3 rounded-l text-gray-500 text-lg hidden sm:block">
              {window.location.host}/
            </span>
            <input
              type="text"
              value={customSlug}
              onChange={(e) => setCustomSlug(e.target.value)}
              placeholder="custom-slug (optional)"
              pattern="[a-zA-Z0-9-_]+"
              title="Only letters, numbers, hyphens, and underscores are allowed"
              className="flex-1 px-4 py-3 border border-gray-300 rounded sm:rounded-l-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            />
          </div>
        </form>
        {createShortUrl.isError && (
          <p className="text-red-500 mt-4 text-sm">
            {createShortUrl.error.message}
          </p>
        )}
        <p className="text-center text-gray-500 text-sm mt-6">
          ShortURL.at is a free service to shorten URLs and create short links.
        </p>
      </div>
    </div>
  );
}
