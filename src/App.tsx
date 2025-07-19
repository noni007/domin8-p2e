import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import "./App.css";

function App() {
  return (
    <ErrorBoundary>
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1>Test App Loading</h1>
        <p>If you see this, React is working properly!</p>
        <p>Next step: Add providers one by one to identify the issue.</p>
      </div>
    </ErrorBoundary>
  );
}

export default App;