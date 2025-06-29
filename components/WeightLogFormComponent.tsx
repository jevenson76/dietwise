import React, { useState, useEffect } from 'react';
import { WeightEntry } from '../types';
import { format } from 'date-fns';
import { parseISO } from 'date-fns/parseISO';
import Alert from './common/Alert';

interface WeightLogFormProps {
  onAddWeightEntry: (entry: WeightEntry) => void;
  latestWeight: number | null | undefined; 
}

const WeightLogForm: React.FC<WeightLogFormProps> = ({ onAddWeightEntry, latestWeight }) => {
  // Get today's date in the local timezone
  const [todayISO] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [date, setDate] = useState<string>(todayISO);
  const [weight, setWeight] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const weightNum = parseFloat(weight);
    if (isNaN(weightNum) || weightNum <= 0 || weightNum > 2000) { // Added upper bound
      setError("Please enter a valid weight (e.g., between 10 and 2000 lbs).");
      return;
    }
    if (!date) {
        setError("Please select a date.");
        return;
    }

    try {
        parseISO(date + 'T00:00:00'); 
    } catch(err) {
        setError("Invalid date format selected.");
        return;
    }

    onAddWeightEntry({ date, weight: weightNum });
    setWeight(''); 
    // Optionally set date back to today if desired after submission
    // setDate(todayISO); 
  };

  const inputClass = "block w-full px-4 py-2.5 border border-border-default rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm placeholder-slate-400 bg-bg-card text-text-default dark:placeholder-slate-500";

  return (
    <div className="bg-bg-card p-6 rounded-xl shadow-xl">
      <h3 className="text-lg font-semibold text-text-default mb-4 pb-3 border-b border-border-default">
        <i className="fas fa-weight-scale mr-2.5 text-teal-600 dark:text-teal-400"></i>
        Log Your Weight
        <span className="text-sm font-normal text-text-alt ml-2">(Past dates allowed)</span>
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
            <label htmlFor="logWeightDate" className="block text-sm font-medium text-text-alt mb-1">
                Date <span className="text-xs text-text-alt font-normal">(select any past date)</span>
            </label>
            <input
                type="date"
                id="logWeightDate"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`${inputClass} dark:[color-scheme:dark]`} 
                max={todayISO} 
                required
            />
            {date !== todayISO && (
                <div className="mt-1">
                    <button
                        type="button"
                        onClick={() => setDate(todayISO)}
                        className="text-xs text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 underline"
                    >
                        ← Back to today
                    </button>
                </div>
            )}
            </div>
            <div>
            <label htmlFor="logWeightLbs" className="block text-sm font-medium text-text-alt">Weight (lbs)</label>
            <input
                type="number"
                id="logWeightLbs"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className={inputClass}
                placeholder={latestWeight ? `e.g., ${latestWeight.toFixed(1)}` : "e.g., 150.5"}
                step="0.1"
                min="10" // Sensible minimum
                max="2000" // Sensible maximum
                required
            />
            </div>
        </div>
        {error && (
          <div className="mt-2">
            <Alert type="error" message={error} />
          </div>
        )}
        <button 
            type="submit"
            className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-150 disabled:opacity-70 disabled:cursor-not-allowed"
        >
            <i className="fas fa-save mr-2"></i>Save Weigh-in
        </button>
      </form>
    </div>
  );
};

export default WeightLogForm;