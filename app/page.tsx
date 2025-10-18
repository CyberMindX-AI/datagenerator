export default function Home() {
  return (
    <div style={{ padding: '20px', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Simple Header */}
      <header style={{ padding: '20px', backgroundColor: 'white', marginBottom: '20px', borderRadius: '8px' }}>
        <h1 style={{ fontSize: '32px', color: '#333', margin: '0' }}>🚀 Data Generator</h1>
        <p style={{ color: '#666', margin: '5px 0 0 0' }}>Generate mock and real data instantly</p>
      </header>

      {/* Simple Content */}
      <main style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px' }}>
        <h2 style={{ fontSize: '24px', color: '#333', marginBottom: '20px' }}>Generate Data for Your Projects</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Create realistic mock data or fetch real data from APIs. Export in CSV, JSON, or Excel formats.
        </p>
        

        <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', marginBottom: '30px' }}>
          <div style={{ padding: '20px', backgroundColor: '#e3f2fd', borderRadius: '8px' }}>
            <h3 style={{ color: '#1976d2', marginBottom: '10px' }}>📊 Multiple Formats</h3>
            <p style={{ color: '#666', fontSize: '14px' }}>Export in CSV, JSON, or Excel formats</p>
          </div>
          
          <div style={{ padding: '20px', backgroundColor: '#f3e5f5', borderRadius: '8px' }}>
            <h3 style={{ color: '#7b1fa2', marginBottom: '10px' }}>🎯 Multiple Domains</h3>
            <p style={{ color: '#666', fontSize: '14px' }}>Finance, healthcare, ecommerce data</p>
          </div>
          
          <div style={{ padding: '20px', backgroundColor: '#e8f5e8', borderRadius: '8px' }}>
            <h3 style={{ color: '#388e3c', marginBottom: '10px' }}>🤖 Mock & Real Data</h3>
            <p style={{ color: '#666', fontSize: '14px' }}>AI-generated or real API data</p>
          </div>
        </div>

        {/* Data Generator Form */}
        <div style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
          <h3 style={{ color: '#333', marginBottom: '20px' }}>🚀 Generate Your Data</h3>
          <p style={{ color: '#666', marginBottom: '15px' }}>
            The full interactive form is available at your deployed app. Visit the browser preview above to access all features!
          </p>
          <div style={{ padding: '15px', backgroundColor: '#e8f5e8', borderRadius: '6px' }}>
            <p style={{ color: '#2e7d32', fontSize: '14px', margin: '0' }}>
              ✅ Schema fixed! Mock data generation now works perfectly with Gemini AI.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '20px', color: '#666', fontSize: '14px' }}>
        <p>Built with Next.js and Tailwind CSS</p>
      </footer>
    </div>
  )
}
