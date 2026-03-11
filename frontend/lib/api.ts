const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function fetchMarketData() {
  const response = await fetch(`${API_BASE_URL}/api/market`);
  if (!response.ok) throw new Error('Failed to fetch market data');
  return response.json();
}

export async function fetchQuote(symbols: string[]) {
  const symbolsParam = symbols.join(',');
  const response = await fetch(`${API_BASE_URL}/api/quote?symbols=${symbolsParam}`);
  if (!response.ok) throw new Error('Failed to fetch quote');
  return response.json();
}

export async function searchStocks(query: string) {
  const response = await fetch(`${API_BASE_URL}/api/search?q=${encodeURIComponent(query)}`);
  if (!response.ok) throw new Error('Failed to search stocks');
  return response.json();
}

export async function fetchHistory(symbol: string, period1?: string, period2?: string) {
  const params = new URLSearchParams();
  if (period1) params.append('period1', period1);
  if (period2) params.append('period2', period2);
  
  const url = `${API_BASE_URL}/api/history/${symbol}${params.toString() ? `?${params}` : ''}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch history');
  return response.json();
}

export async function fetchETFs() {
  const response = await fetch(`${API_BASE_URL}/api/etfs`);
  if (!response.ok) throw new Error('Failed to fetch ETFs');
  return response.json();
}

// Portfolio API calls
const USER_ID = 'default-user'; // In production, this would come from authentication

export async function getFavorites() {
  const response = await fetch(`${API_BASE_URL}/api/favorites?userId=${USER_ID}`);
  if (!response.ok) throw new Error('Failed to fetch favorites');
  return response.json();
}

export async function addFavorite(symbol: string) {
  const response = await fetch(`${API_BASE_URL}/api/favorites`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: USER_ID, symbol }),
  });
  if (!response.ok) throw new Error('Failed to add favorite');
  return response.json();
}

export async function removeFavorite(symbol: string) {
  const response = await fetch(`${API_BASE_URL}/api/favorites/${symbol}?userId=${USER_ID}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to remove favorite');
  return response.json();
}

export async function getPortfolio() {
  const response = await fetch(`${API_BASE_URL}/api/portfolio?userId=${USER_ID}`);
  if (!response.ok) throw new Error('Failed to fetch portfolio');
  return response.json();
}

export async function addHolding(holding: {
  symbol: string;
  shares: number;
  averagePrice: number;
}) {
  const response = await fetch(`${API_BASE_URL}/api/portfolio`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: USER_ID, ...holding }),
  });
  if (!response.ok) throw new Error('Failed to add holding');
  return response.json();
}

export async function updateHolding(id: string, holding: {
  shares?: number;
  averagePrice?: number;
}) {
  const response = await fetch(`${API_BASE_URL}/api/portfolio/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(holding),
  });
  if (!response.ok) throw new Error('Failed to update holding');
  return response.json();
}

export async function removeHolding(id: string) {
  const response = await fetch(`${API_BASE_URL}/api/portfolio/${id}?userId=${USER_ID}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to remove holding');
  return response.json();
}
