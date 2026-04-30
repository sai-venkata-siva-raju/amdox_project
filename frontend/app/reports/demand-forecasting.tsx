'use client';

import * as React from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart,
} from 'recharts';
import { Loader as Loader2, Brain, TrendingUp } from 'lucide-react';

interface Product { id: string; sku: string; name: string; }
interface ForecastPoint { date: string; predicted: number; lower: number; upper: number; }

export function DemandForecasting() {
  const { profile } = useAuth();
  const [products, setProducts] = React.useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = React.useState('');
  const [forecastData, setForecastData] = React.useState<ForecastPoint[]>([]);
  const [mapeScore, setMapeScore] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [retraining, setRetraining] = React.useState(false);

  React.useEffect(() => {
    if (!profile?.tenant_id) return;
    supabase.from('products').select('id, sku, name').eq('tenant_id', profile.tenant_id).order('sku')
      .then(({ data }) => { if (data) setProducts(data); });
  }, [profile?.tenant_id]);

  const fetchForecast = React.useCallback(async (productId: string) => {
    if (!profile?.tenant_id || !productId) return;
    setLoading(true);
    const { data } = await supabase
      .from('demand_forecasts')
      .select('*')
      .eq('tenant_id', profile.tenant_id)
      .eq('product_id', productId)
      .order('forecast_date');

    if (data && data.length > 0) {
      setMapeScore(Number(data[0].mape_score));
      setForecastData(data.map((d: any) => ({
        date: d.forecast_date.slice(5),
        predicted: Number(d.predicted_demand),
        lower: Number(d.lower_bound),
        upper: Number(d.upper_bound),
      })));
    } else {
      setForecastData([]);
      setMapeScore(0);
    }
    setLoading(false);
  }, [profile?.tenant_id]);

  React.useEffect(() => {
    if (selectedProduct) fetchForecast(selectedProduct);
  }, [selectedProduct, fetchForecast]);

  const handleRetrain = async () => {
    setRetraining(true);
    // Simulate retraining delay
    await new Promise((r) => setTimeout(r, 2000));
    // Re-fetch to show "updated" model
    if (selectedProduct) await fetchForecast(selectedProduct);
    setRetraining(false);
  };

  const mapeColor = mapeScore <= 10 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
    : mapeScore <= 20 ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
    : 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300';

  const selectedProd = products.find((p) => p.id === selectedProduct);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold">AI Demand Forecasting</h2>
          <p className="text-sm text-muted-foreground">90-day demand predictions with confidence intervals</p>
        </div>
        <div className="flex items-center gap-3">
          {mapeScore > 0 && (
            <Badge className={mapeColor} variant="secondary">
              MAPE: {mapeScore.toFixed(1)}%
            </Badge>
          )}
          <Button variant="outline" onClick={handleRetrain} disabled={retraining || !selectedProduct}>
            {retraining ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Brain className="mr-2 h-4 w-4" />}
            Retrain Model
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">Select SKU:</span>
        <Select value={selectedProduct} onValueChange={setSelectedProduct}>
          <SelectTrigger className="w-64"><SelectValue placeholder="Choose a product" /></SelectTrigger>
          <SelectContent>
            {products.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.sku} - {p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedProd && (
          <Badge variant="outline" className="text-xs">
            <TrendingUp className="h-3 w-3 mr-1" />
            {forecastData.length} forecast points
          </Badge>
        )}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">
            {selectedProd ? `Forecast: ${selectedProd.sku} - ${selectedProd.name}` : 'Select a product to view forecast'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-72">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : forecastData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                  className="fill-muted-foreground"
                  interval={6}
                />
                <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  formatter={(v: number, name: string) => {
                    if (name === 'predicted') return [v.toFixed(1), 'Predicted'];
                    if (name === 'upper') return [v.toFixed(1), 'Upper Bound'];
                    if (name === 'lower') return [v.toFixed(1), 'Lower Bound'];
                    return [v, name];
                  }}
                />
                <defs>
                  <linearGradient id="confGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="upper"
                  stroke="none"
                  fill="url(#confGrad)"
                  name="upper"
                />
                <Area
                  type="monotone"
                  dataKey="lower"
                  stroke="none"
                  fill="#ffffff"
                  fillOpacity={1}
                  name="lower"
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  name="predicted"
                />
                <Line
                  type="monotone"
                  dataKey="upper"
                  stroke="#93c5fd"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                  dot={false}
                  name="upper"
                />
                <Line
                  type="monotone"
                  dataKey="lower"
                  stroke="#93c5fd"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                  dot={false}
                  name="lower"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-72 text-muted-foreground">
              <Brain className="h-10 w-10 mb-3 opacity-40" />
              <p className="text-sm">No forecast data available for this product</p>
              <p className="text-xs mt-1">Select a product with forecast data or retrain the model</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Forecast summary stats */}
      {forecastData.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Avg Predicted Demand</p>
              <p className="text-lg font-bold">
                {(forecastData.reduce((s, d) => s + d.predicted, 0) / forecastData.length).toFixed(1)} units/day
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Peak Demand</p>
              <p className="text-lg font-bold">
                {Math.max(...forecastData.map((d) => d.predicted)).toFixed(1)} units
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Confidence Range</p>
              <p className="text-lg font-bold">
                +/- {((forecastData.reduce((s, d) => s + (d.upper - d.lower), 0) / forecastData.length) / 2).toFixed(1)} units
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Model Accuracy</p>
              <p className="text-lg font-bold">{(100 - mapeScore).toFixed(1)}%</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
