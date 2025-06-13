
import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

// Mock Supabase client for testing
export const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        order: jest.fn(() => Promise.resolve({ data: [], error: null }))
      })),
      order: jest.fn(() => Promise.resolve({ data: [], error: null }))
    })),
    insert: jest.fn(() => Promise.resolve({ data: null, error: null })),
    update: jest.fn(() => Promise.resolve({ data: null, error: null })),
    delete: jest.fn(() => Promise.resolve({ data: null, error: null }))
  })),
  auth: {
    getUser: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
    signIn: jest.fn(() => Promise.resolve({ data: null, error: null })),
    signOut: jest.fn(() => Promise.resolve({ error: null }))
  }
};

// Test wrapper with providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

// Performance testing utilities
export const measureComponentRender = (component: () => JSX.Element) => {
  const start = performance.now();
  const result = render(component());
  const end = performance.now();
  return {
    renderTime: end - start,
    component: result
  };
};

// Mock data generators
export const createMockTournament = (overrides = {}) => ({
  id: 'test-tournament-1',
  title: 'Test Tournament',
  description: 'A test tournament',
  game: 'Test Game',
  prize_pool: 1000,
  max_participants: 16,
  start_date: new Date().toISOString(),
  end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  registration_deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
  status: 'registration_open',
  organizer_id: 'test-organizer',
  bracket_generated: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
});

export const createMockUser = (overrides = {}) => ({
  id: 'test-user-1',
  email: 'test@example.com',
  username: 'testuser',
  user_type: 'player',
  avatar_url: null,
  bio: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
});

// Accessibility testing helper - Fix: Use correct axe-core API
export const testAccessibility = async (component: HTMLElement) => {
  const axe = await import('axe-core');
  const results = await axe.run(component);
  return results;
};

// Network simulation for testing
export const simulateNetworkDelay = (ms: number = 1000) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const simulateNetworkError = () => {
  throw new Error('Network request failed');
};
