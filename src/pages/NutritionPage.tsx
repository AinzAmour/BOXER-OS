import { UtensilsCrossed, Plus, Search, Settings2 } from 'lucide-react';
import { useState } from 'react';
import type { MealType } from '../types';

// ── Default Indian Halal Low-Cost Food Database (Soya-free) ──
const DEFAULT_FOODS = [
  { id: 'eggs',         name: 'Eggs',                cal: 155, protein: 13,  carbs: 1.1,  fat: 11,  lowCost: true },
  { id: 'chicken',      name: 'Chicken Breast',      cal: 165, protein: 31,  carbs: 0,    fat: 3.6, lowCost: true },
  { id: 'dal_moong',    name: 'Dal (Moong)',          cal: 105, protein: 7.5, carbs: 18,   fat: 0.4, lowCost: true },
  { id: 'dal_masoor',   name: 'Dal (Masoor)',         cal: 116, protein: 9,   carbs: 20,   fat: 0.4, lowCost: true },
  { id: 'chana',        name: 'Chana (Chickpeas)',    cal: 164, protein: 8.9, carbs: 27,   fat: 2.6, lowCost: true },
  { id: 'rajma',        name: 'Rajma (Kidney Beans)', cal: 127, protein: 8.7, carbs: 22,   fat: 0.5, lowCost: true },
  { id: 'milk',         name: 'Milk (Full Fat)',      cal: 62,  protein: 3.2, carbs: 4.8,  fat: 3.3, lowCost: true },
  { id: 'curd',         name: 'Curd / Dahi',          cal: 60,  protein: 3.5, carbs: 4.7,  fat: 3.3, lowCost: true },
  { id: 'paneer',       name: 'Paneer',               cal: 265, protein: 18,  carbs: 1.2,  fat: 20,  lowCost: false },
  { id: 'peanuts',      name: 'Peanuts',               cal: 567, protein: 26,  carbs: 16,   fat: 49,  lowCost: true },
  { id: 'rice',         name: 'Rice (Cooked)',         cal: 130, protein: 2.7, carbs: 28,   fat: 0.3, lowCost: true },
  { id: 'roti',         name: 'Roti / Chapati',        cal: 120, protein: 3.5, carbs: 20,   fat: 3.5, lowCost: true },
  { id: 'oats',         name: 'Oats',                  cal: 389, protein: 17,  carbs: 66,   fat: 7,   lowCost: true },
  { id: 'potato',       name: 'Potato',                cal: 77,  protein: 2,   carbs: 17,   fat: 0.1, lowCost: true },
  { id: 'banana',       name: 'Banana',                cal: 89,  protein: 1.1, carbs: 23,   fat: 0.3, lowCost: true },
  { id: 'veggies',      name: 'Seasonal Vegetables',   cal: 35,  protein: 2,   carbs: 7,    fat: 0.2, lowCost: true },
];

interface MealLog {
  id: number;
  food_name: string;
  quantity_grams: number;
  calories: number;
  protein: number;
  meal_type: MealType;
}

export function NutritionPage() {
  const [activeView, setActiveView] = useState<'log' | 'foods' | 'targets'>('log');
  const [search, setSearch] = useState('');
  const [meals, setMeals] = useState<MealLog[]>([]);
  const [calorieTarget, setCalorieTarget] = useState(2000);
  const [proteinTarget, setProteinTarget] = useState(150);

  // Log meal form
  const [selectedFood, setSelectedFood] = useState<string | null>(null);
  const [quantity, setQuantity] = useState('');
  const [mealType, setMealType] = useState<MealType>('lunch');

  const todayMeals = meals; // In production: filter by today's date
  const totalCalories = todayMeals.reduce((s, m) => s + m.calories, 0);
  const totalProtein = todayMeals.reduce((s, m) => s + m.protein, 0);

  const filteredFoods = DEFAULT_FOODS.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const addMeal = () => {
    const food = DEFAULT_FOODS.find((f) => f.id === selectedFood);
    if (!food || !quantity) return;
    const grams = parseFloat(quantity);
    const entry: MealLog = {
      id: Date.now(),
      food_name: food.name,
      quantity_grams: grams,
      calories: Math.round((food.cal * grams) / 100),
      protein: Math.round((food.protein * grams) / 100 * 10) / 10,
      meal_type: mealType,
    };
    setMeals([...meals, entry]);
    setSelectedFood(null);
    setQuantity('');
  };

  const calPct = Math.min((totalCalories / calorieTarget) * 100, 100);
  const proPct = Math.min((totalProtein / proteinTarget) * 100, 100);

  const views = [
    { id: 'log' as const, label: 'Today' },
    { id: 'foods' as const, label: 'Foods' },
    { id: 'targets' as const, label: 'Targets' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <UtensilsCrossed size={20} className="text-accent-purple" />
        <h2 className="text-lg font-bold">Nutrition</h2>
        <span className="badge bg-status-success/15 text-status-success text-[0.5625rem]">HALAL</span>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 p-1 bg-bg-secondary rounded-xl">
        {views.map((v) => (
          <button
            key={v.id}
            onClick={() => setActiveView(v.id)}
            className={`flex-1 py-2.5 rounded-lg text-xs font-semibold text-center transition-all ${
              activeView === v.id
                ? 'bg-bg-card text-accent-purple border border-border-active'
                : 'text-text-muted hover:text-text-secondary border border-transparent'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* ── Today's Overview ── */}
      {activeView === 'log' && (
        <div className="space-y-4">
          {/* Progress bars */}
          <div className="glass-card p-5 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-text-secondary">Calories</span>
                <span className="stat-number text-sm">
                  <span className="text-text-primary">{totalCalories}</span>
                  <span className="text-text-muted"> / {calorieTarget}</span>
                </span>
              </div>
              <div className="h-2.5 bg-bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-accent-gold rounded-full transition-all duration-500" style={{ width: `${calPct}%` }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-text-secondary">Protein</span>
                <span className="stat-number text-sm">
                  <span className="text-text-primary">{totalProtein}g</span>
                  <span className="text-text-muted"> / {proteinTarget}g</span>
                </span>
              </div>
              <div className="h-2.5 bg-bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-accent-cyan rounded-full transition-all duration-500" style={{ width: `${proPct}%` }} />
              </div>
            </div>
          </div>

          {/* Quick Add */}
          <div className="glass-card p-5 space-y-3">
            <h4 className="text-xs font-bold text-text-muted tracking-widest uppercase">Add Meal</h4>

            <select
              className="input"
              value={selectedFood || ''}
              onChange={(e) => setSelectedFood(e.target.value || null)}
            >
              <option value="">Select food...</option>
              {DEFAULT_FOODS.map((f) => (
                <option key={f.id} value={f.id}>{f.name} ({f.protein}g P / {f.cal} cal per 100g)</option>
              ))}
            </select>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Quantity (g)</label>
                <input type="number" className="input" placeholder="e.g. 200"
                  value={quantity} onChange={(e) => setQuantity(e.target.value)} />
              </div>
              <div>
                <label className="label">Meal</label>
                <select className="input" value={mealType} onChange={(e) => setMealType(e.target.value as MealType)}>
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                </select>
              </div>
            </div>

            {selectedFood && quantity && (
              <div className="text-xs text-text-secondary">
                = {Math.round((DEFAULT_FOODS.find((f) => f.id === selectedFood)!.cal * parseFloat(quantity)) / 100)} cal,{' '}
                {Math.round((DEFAULT_FOODS.find((f) => f.id === selectedFood)!.protein * parseFloat(quantity)) / 100 * 10) / 10}g protein
              </div>
            )}

            <button onClick={addMeal} className="btn btn-primary w-full" disabled={!selectedFood || !quantity}>
              <Plus size={16} /> Add
            </button>
          </div>

          {/* Meal log */}
          {todayMeals.length > 0 && (
            <div className="space-y-2">
              {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((type) => {
                const typeMeals = todayMeals.filter((m) => m.meal_type === type);
                if (typeMeals.length === 0) return null;
                return (
                  <div key={type}>
                    <h4 className="text-[0.625rem] font-bold text-text-muted tracking-widest uppercase mb-1.5">
                      {type}
                    </h4>
                    {typeMeals.map((m) => (
                      <div key={m.id} className="glass-card p-3 flex items-center justify-between mb-1">
                        <div>
                          <span className="text-sm text-text-primary font-medium">{m.food_name}</span>
                          <span className="text-xs text-text-muted ml-2">{m.quantity_grams}g</span>
                        </div>
                        <div className="text-right">
                          <span className="stat-number text-xs text-accent-gold">{m.calories} cal</span>
                          <span className="stat-number text-xs text-accent-cyan ml-2">{m.protein}g P</span>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Food Database ── */}
      {activeView === 'foods' && (
        <div className="space-y-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text" className="input pl-10" placeholder="Search foods..."
              value={search} onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {filteredFoods.map((food) => (
            <div key={food.id} className="glass-card p-4 flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-text-primary">{food.name}</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="badge bg-status-success/10 text-status-success text-[0.5rem]">HALAL</span>
                  {food.lowCost && <span className="badge bg-accent-gold/10 text-accent-gold text-[0.5rem]">LOW COST</span>}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-text-secondary">per 100g</div>
                <div className="stat-number text-xs text-text-primary">{food.cal} cal · {food.protein}g P</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Targets ── */}
      {activeView === 'targets' && (
        <div className="glass-card p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Settings2 size={16} className="text-accent-purple" />
            <h3 className="text-sm font-bold">Nutrition Targets</h3>
          </div>

          <p className="text-xs text-text-muted italic border-l-2 border-accent-gold/30 pl-3">
            Starting target — adjustable based on progress, hunger, training load and future assessment.
          </p>

          <div>
            <label className="label">Daily Calories Target</label>
            <input type="number" className="input" value={calorieTarget}
              onChange={(e) => setCalorieTarget(parseInt(e.target.value) || 2000)} />
          </div>
          <div>
            <label className="label">Daily Protein Target (g)</label>
            <input type="number" className="input" value={proteinTarget}
              onChange={(e) => setProteinTarget(parseInt(e.target.value) || 150)} />
          </div>
        </div>
      )}
    </div>
  );
}
