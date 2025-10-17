// Mock data generators for different domains

export function generateFinanceData(rows: number) {
  const data = []
  for (let i = 0; i < rows; i++) {
    data.push({
      transaction_id: `TXN${String(i + 1).padStart(6, "0")}`,
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      amount: Number.parseFloat((Math.random() * 10000).toFixed(2)),
      currency: ["USD", "EUR", "GBP", "JPY"][Math.floor(Math.random() * 4)],
      type: ["debit", "credit"][Math.floor(Math.random() * 2)],
      category: ["groceries", "utilities", "entertainment", "transport", "healthcare"][Math.floor(Math.random() * 5)],
      merchant: ["Amazon", "Walmart", "Target", "Costco", "Apple"][Math.floor(Math.random() * 5)],
      status: ["completed", "pending", "failed"][Math.floor(Math.random() * 3)],
    })
  }
  return data
}

export function generateHealthData(rows: number) {
  const data = []
  for (let i = 0; i < rows; i++) {
    data.push({
      patient_id: `PAT${String(i + 1).padStart(6, "0")}`,
      name: `Patient ${i + 1}`,
      age: Math.floor(Math.random() * 80) + 18,
      gender: ["Male", "Female", "Other"][Math.floor(Math.random() * 3)],
      blood_type: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"][Math.floor(Math.random() * 8)],
      heart_rate: Math.floor(Math.random() * 40) + 60,
      blood_pressure: `${Math.floor(Math.random() * 40) + 100}/${Math.floor(Math.random() * 30) + 60}`,
      temperature: Number.parseFloat((Math.random() * 2 + 97).toFixed(1)),
      diagnosis: ["Hypertension", "Diabetes", "Asthma", "Healthy", "Flu"][Math.floor(Math.random() * 5)],
      last_visit: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    })
  }
  return data
}

export function generateEcommerceData(rows: number) {
  const data = []
  for (let i = 0; i < rows; i++) {
    data.push({
      order_id: `ORD${String(i + 1).padStart(6, "0")}`,
      customer_name: `Customer ${i + 1}`,
      email: `customer${i + 1}@example.com`,
      product: ["Laptop", "Phone", "Tablet", "Headphones", "Watch"][Math.floor(Math.random() * 5)],
      quantity: Math.floor(Math.random() * 5) + 1,
      price: Number.parseFloat((Math.random() * 1000 + 50).toFixed(2)),
      total: Number.parseFloat((Math.random() * 5000 + 100).toFixed(2)),
      status: ["delivered", "shipped", "processing", "cancelled"][Math.floor(Math.random() * 4)],
      payment_method: ["credit_card", "paypal", "bank_transfer"][Math.floor(Math.random() * 3)],
      order_date: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    })
  }
  return data
}

export function generateIoTData(rows: number) {
  const data = []
  for (let i = 0; i < rows; i++) {
    data.push({
      sensor_id: `SENSOR${String(i + 1).padStart(4, "0")}`,
      timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      temperature: Number.parseFloat((Math.random() * 40 + 10).toFixed(2)),
      humidity: Number.parseFloat((Math.random() * 60 + 20).toFixed(2)),
      pressure: Number.parseFloat((Math.random() * 100 + 950).toFixed(2)),
      light_level: Math.floor(Math.random() * 1000),
      motion_detected: Math.random() > 0.5,
      battery_level: Math.floor(Math.random() * 100),
      location: ["Building A", "Building B", "Building C", "Warehouse"][Math.floor(Math.random() * 4)],
      status: ["active", "idle", "maintenance"][Math.floor(Math.random() * 3)],
    })
  }
  return data
}
