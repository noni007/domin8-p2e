import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { AuthProvider } from "@/hooks/useAuth";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
              <h1>Test App Loading - Step 3</h1>
              <p>✅ React is working</p>
              <p>✅ QueryClientProvider added</p>
              <p>✅ ThemeProvider added</p>
              <p>✅ AuthProvider added</p>
              <p>Next: Add Router and basic navigation</p>
            </div>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;