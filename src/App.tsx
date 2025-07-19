import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1>Test App Loading - Step 2</h1>
            <p>✅ React is working</p>
            <p>✅ QueryClientProvider added</p>
            <p>✅ ThemeProvider added</p>
            <p>Next: Add AuthProvider</p>
          </div>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;