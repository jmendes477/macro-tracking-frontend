import React, { useState } from 'react';

type FoodItem = {
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
};

type UserData = {
  weight: number | '';
  height: number | '';
  age: number | '';
  activity: number;
};

type MacroSplit = {
  protein: number;
  carbs: number;
  fat: number;
};

const foodDatabase: Record<string, FoodItem> = {
  'Chicken Breast (100g)': { protein: 31, carbs: 0, fat: 3.6, calories: 165 },
  'Brown Rice (100g)': { protein: 2.6, carbs: 23, fat: 0.9, calories: 111 },
  'Broccoli (100g)': { protein: 2.8, carbs: 7, fat: 0.4, calories: 34 },
  'Avocado (100g)': { protein: 2, carbs: 9, fat: 15, calories: 160 },
  'Egg (1 large)': { protein: 6, carbs: 0.6, fat: 5, calories: 78 },
};

const App: React.FC = () => {
  const [selectedFood, setSelectedFood] = useState<string>('');
  const [foodLog, setFoodLog] = useState<string[]>([]);
  const [userData, setUserData] = useState<UserData>({
    weight: '',
    height: '',
    age: '',
    activity: 1.2,
  });
  const [threshold, setThreshold] = useState<{ calories: number }>({ calories: 0 });
  const [macroSplit, setMacroSplit] = useState<MacroSplit>({ protein: 30, carbs: 40, fat: 30 });

  const calculateBMR = () => {
    const { weight, height, age, activity } = userData;
    if (!weight || !height || !age) return;
    const bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    const calories = bmr * activity;
    setThreshold({ calories: Math.round(calories) });
  };

  const handleAddFood = () => {
    if (selectedFood) {
      setFoodLog([...foodLog, selectedFood]);
      setSelectedFood('');
    }
  };

  const removeFood = (index: number) => {
    const updatedLog = [...foodLog];
    updatedLog.splice(index, 1);
    setFoodLog(updatedLog);
  };

  const getTotals = () => {
    return foodLog.reduce(
      (acc, item) => {
        const food = foodDatabase[item];
        acc.protein += food.protein;
        acc.carbs += food.carbs;
        acc.fat += food.fat;
        acc.calories += food.calories;
        return acc;
      },
      { protein: 0, carbs: 0, fat: 0, calories: 0 }
    );
  };

  const calculateTargetGrams = () => {
    const total = macroSplit.protein + macroSplit.carbs + macroSplit.fat;
    if (total !== 100 || threshold.calories === 0) return null;

    const target = {
      protein: Math.round((threshold.calories * (macroSplit.protein / 100)) / 4),
      carbs: Math.round((threshold.calories * (macroSplit.carbs / 100)) / 4),
      fat: Math.round((threshold.calories * (macroSplit.fat / 100)) / 9),
    };
    return target;
  };

  const totals = getTotals();
  const targetGrams = calculateTargetGrams();

  return (
    <div className="p-6 max-w-2xl mx-auto font-sans space-y-6">
      <h1 className="text-2xl font-bold">🥗 Macro Tracker</h1>

      {/* User Info */}
      <div className="border p-4 rounded space-y-2">
        <h2 className="font-semibold">👤 User Info</h2>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Weight (kg)"
            value={userData.weight}
            onChange={(e) =>
              setUserData({ ...userData, weight: Number(e.target.value) || '' })
            }
            className="border p-1"
          />
          <input
            type="number"
            placeholder="Height (cm)"
            value={userData.height}
            onChange={(e) =>
              setUserData({ ...userData, height: Number(e.target.value) || '' })
            }
            className="border p-1"
          />
          <input
            type="number"
            placeholder="Age"
            value={userData.age}
            onChange={(e) =>
              setUserData({ ...userData, age: Number(e.target.value) || '' })
            }
            className="border p-1"
          />
          <select
            value={userData.activity}
            onChange={(e) =>
              setUserData({ ...userData, activity: Number(e.target.value) })
            }
            className="border p-1"
          >
            <option value={1.2}>Sedentary</option>
            <option value={1.375}>Lightly Active</option>
            <option value={1.55}>Moderately Active</option>
            <option value={1.725}>Very Active</option>
          </select>
        </div>
        <button
          onClick={calculateBMR}
          className="bg-blue-500 text-white px-3 py-1 rounded mt-2"
        >
          Calculate Threshold
        </button>
        {threshold.calories > 0 && (
          <p className="text-sm mt-1">
            Estimated Daily Calories: <strong>{threshold.calories}</strong>
          </p>
        )}
      </div>

      {/* Macro Percentage Split */}
      <div className="border p-4 rounded space-y-2">
        <h2 className="font-semibold">⚖️ Macro Percentages</h2>
        <div className="grid grid-cols-3 gap-2">
          {(['protein', 'carbs', 'fat'] as const).map((macro) => (
            <div key={macro}>
              <label className="text-sm capitalize">{macro}</label>
              <input
                type="number"
                value={macroSplit[macro]}
                onChange={(e) =>
                  setMacroSplit({
                    ...macroSplit,
                    [macro]: Number(e.target.value),
                  })
                }
                className="border p-1 w-full"
              />
            </div>
          ))}
        </div>
        {macroSplit.protein + macroSplit.carbs + macroSplit.fat !== 100 && (
          <p className="text-red-500 text-sm">Percentages must total 100%</p>
        )}
      </div>

      {/* Food Log */}
      <div className="border p-4 rounded space-y-2">
        <h2 className="font-semibold">🍽 Add Food</h2>
        <select
          value={selectedFood}
          onChange={(e) => setSelectedFood(e.target.value)}
          className="border p-1 w-full"
        >
          <option value="">-- Select Food --</option>
          {Object.keys(foodDatabase).map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <button
          onClick={handleAddFood}
          className="bg-green-500 text-white px-3 py-1 rounded"
        >
          Add
        </button>

        <ul className="text-sm mt-2 space-y-1">
          {foodLog.map((item, idx) => (
            <li key={idx} className="flex justify-between items-center">
              <span>
                ✅ {item} ({foodDatabase[item].calories} kcal)
              </span>
              <button
                onClick={() => removeFood(idx)}
                className="text-red-500 text-xs"
              >
                ❌ Remove
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Totals */}
      <div className="border p-4 rounded">
        <h2 className="font-semibold">📊 Totals</h2>
        <p>
          Calories: {totals.calories} kcal{' '}
          {threshold.calories > 0 &&
            `(${totals.calories > threshold.calories ? 'Over' : 'Under'})`}
        </p>
        <p>Protein: {totals.protein} g</p>
        <p>Carbs: {totals.carbs} g</p>
        <p>Fat: {totals.fat} g</p>

        {targetGrams && (
          <>
            <h3 className="mt-2 font-medium">🎯 Target Grams</h3>
            <p>Protein: {targetGrams.protein} g</p>
            <p>Carbs: {targetGrams.carbs} g</p>
            <p>Fat: {targetGrams.fat} g</p>
          </>
        )}
      </div>
    </div>
  );
};

export default App;
