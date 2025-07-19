import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
          <h1>Test App Loading - Step 1</h1>
          <p>✅ React is working</p>
          <p>✅ QueryClientProvider added</p>
          <p>Next: Add ThemeProvider</p>
        </div>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;