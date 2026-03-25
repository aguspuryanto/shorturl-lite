/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Home from './pages/Home';
import Result from './pages/Result';
import Redirect from './pages/Redirect';
import Analytics from './pages/Analytics';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/result/:shortCode" element={<Result />} />
          <Route path="/analytics/:shortCode" element={<Analytics />} />
          <Route path="/:shortCode" element={<Redirect />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
