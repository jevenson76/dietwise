
import React, { useState, useCallback, useEffect } from 'react';
import { MyFoodItem, MyMeal, ScannedFoodInfo, GroundingSource } from '@appTypes';
import Modal from '@components/common/Modal';
import Alert from '@components/common/Alert';
import LoadingSpinner from '@components/common/LoadingSpinner';
import { useCameraBarcodeScanner } from '@hooks/useCameraBarcodeScanner';
import { getFoodInfoFromUPC, API_KEY_ERROR_MESSAGE } from '@services/geminiService';
import { trackEvent } from '@services/analyticsService';
import type { GroundingChunk } from '@google/genai';


const MYFOOD_SCANNER_VIDEO_ID = "myfood-barcode-video";

interface MyLibraryComponentProps {
  myFoods: MyFoodItem[];
  myMeals: MyMeal[];
  onAddFood: (food: MyFoodItem) => void;
  onUpdateFood: (food: MyFoodItem) => void;
  onDeleteFood: (foodId: string) => void;
  onAddMeal: (meal: MyMeal) => void;
  onUpdateMeal: (meal: MyMeal) => void;
  onDeleteMeal: (mealId: string) => void;
  onLogMeal: (mealId: string) => void;
  apiKeyMissing: boolean;
}

const AdPlaceholder: React.FC<{sizeLabel?: string; className?: string}> = ({ sizeLabel = "Banner Ad (e.g., 320x50)", className=""}) => (
    <div className={`bg-slate-200 dark:bg-slate-700 border-2 border-dashed border-slate-400 dark:border-slate-500 text-slate-500 dark:text-slate-400 text-sm flex flex-col items-center justify-center h-20 sm:h-24 my-6 rounded-md shadow text-center p-2 ${className}`}>
      <i className="fas fa-ad text-2xl text-slate-400 dark:text-slate-500 mb-1"></i>
      <p className="font-semibold">Advertisement</p>
      <p className="text-xs">{sizeLabel}</p>
    </div>
  );

const MyLibraryComponent: React.FC<MyLibraryComponentProps> = ({
  myFoods, myMeals,
  onAddFood, onUpdateFood, onDeleteFood,
  onAddMeal, onUpdateMeal, onDeleteMeal,
  onLogMeal, apiKeyMissing
}) => {
  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<MyFoodItem | null>(null);
  const [editingMeal, setEditingMeal] = useState<MyMeal | null>(null);

  const [currentFood, setCurrentFood] = useState<Partial<MyFoodItem>>({});
  const [currentMeal, setCurrentMeal] = useState<Partial<MyMeal>>({ ingredients: [] });
  const [modalError, setModalError] = useState<string | null>(null);

  // States for MyFood barcode scanning
  const [isMyFoodScannerModalOpen, setIsMyFoodScannerModalOpen] = useState(false);
  const [myFoodScannerError, setMyFoodScannerError] = useState<string | null>(null);
  const [isMyFoodScannerLoadingApi, setIsMyFoodScannerLoadingApi] = useState(false);
  const [myFoodScannedUpc, setMyFoodScannedUpc] = useState<string | null>(null);
  const [myFoodScanGroundingSources, setMyFoodScanGroundingSources] = useState<GroundingSource[]>([]);


  const handleMyFoodScanSuccess = useCallback((text: string) => {
    trackEvent('myfood_upc_scan_success', { upc: text });
    setMyFoodScannedUpc(text);
    setIsMyFoodScannerLoadingApi(true);
    setMyFoodScannerError(null);
    setMyFoodScanGroundingSources([]);

    getFoodInfoFromUPC(text)
      .then(response => {
        if (response.foodInfo && response.foodInfo.name) {
          setCurrentFood({ 
            name: response.foodInfo.name,
            calories: response.foodInfo.calories,
            servingSize: response.foodInfo.servingSize,
            protein: response.foodInfo.protein,
            carbs: response.foodInfo.carbs,
            fat: response.foodInfo.fat,
          });
          trackEvent('myfood_upc_food_info_retrieved', { upc: text, foodName: response.foodInfo.name });
          setIsMyFoodScannerModalOpen(false); 
          setIsFoodModalOpen(true); 
        } else {
          setMyFoodScannerError(response.error || "Could not retrieve food information for this UPC.");
          trackEvent('myfood_upc_food_info_error', { upc: text, error: response.error });
        }
        if (response.sources) {
            const validSources: GroundingSource[] = response.sources
            .filter((chunk): chunk is GroundingChunk & { web: { uri?: string; title?: string } } => chunk.web !== undefined)
            .map(chunk => ({ web: chunk.web! }));
          setMyFoodScanGroundingSources(validSources);
        }
      })
      .catch(err => {
        setMyFoodScannerError(err.message || "An unexpected error occurred.");
        trackEvent('myfood_upc_food_info_exception', { upc: text, error: err.message });
      })
      .finally(() => setIsMyFoodScannerLoadingApi(false));
  }, []);

  const handleMyFoodScanErrorFromHook = useCallback((error: Error) => {
    setMyFoodScannerError(`Scanner Error: ${error.message}. Please ensure camera access is allowed.`);
    trackEvent('myfood_upc_scan_error_hook', { error: error.message });
    setIsMyFoodScannerLoadingApi(false);
    stopMyFoodScan(); 
  }, []);
  
  const { 
    startScan: startMyFoodScan, 
    stopScan: stopMyFoodScan, 
    isScanning: isMyFoodScanning, 
    error: myFoodScannerHookError,
    videoRef: myFoodVideoRef
  } = useCameraBarcodeScanner({
    onScanSuccess: handleMyFoodScanSuccess,
    onScanError: handleMyFoodScanErrorFromHook,
    videoElementId: MYFOOD_SCANNER_VIDEO_ID,
  });

  useEffect(() => {
    if (myFoodScannerHookError) {
      setMyFoodScannerError(`Scanner Init Error: ${myFoodScannerHookError}. Check camera permissions.`);
    }
  }, [myFoodScannerHookError]);

  const openMyFoodScanner = () => {
    if (apiKeyMissing) return;
    trackEvent('myfood_upc_scanner_modal_opened');
    setIsFoodModalOpen(false); 
    setIsMyFoodScannerModalOpen(true);
    setMyFoodScannerError(null);
    setMyFoodScannedUpc(null);
    setIsMyFoodScannerLoadingApi(false);
    setMyFoodScanGroundingSources([]);
    setCurrentFood({}); 
    setTimeout(() => {
        const videoElement = document.getElementById(MYFOOD_SCANNER_VIDEO_ID) as HTMLVideoElement;
        if (myFoodVideoRef.current && videoElement && videoElement.isConnected) {
            startMyFoodScan().catch(err => {
                setMyFoodScannerError(`Failed to start camera: ${err.message}.`);
                trackEvent('myfood_scanner_start_failed', { error: err.message });
            });
        } else {
            setMyFoodScannerError("Camera element not ready for MyFood scanner.");
        }
    }, 100);
  };

  const closeMyFoodScanner = () => {
    stopMyFoodScan();
    setIsMyFoodScannerModalOpen(false);
    setIsFoodModalOpen(true); 
  };


  const inputClass = "mt-1 block w-full px-3 py-2 border border-border-default rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 sm:text-sm placeholder-slate-400 bg-bg-card text-text-default dark:placeholder-slate-500";
  const buttonClass = "bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors disabled:opacity-50";
  const dangerButtonClass = "bg-red-500 hover:bg-red-600 text-white font-semibold py-1.5 px-3 rounded text-xs shadow";

  const handleOpenFoodModal = (food: MyFoodItem | null = null) => {
    setEditingFood(food);
    setCurrentFood(food ? { ...food } : { name: '', calories: undefined });
    setModalError(null);
    setIsFoodModalOpen(true);
  };

  const handleSaveFood = () => {
    setModalError(null);
    if (!currentFood.name?.trim()) {
      setModalError("Food name is required.");
      return;
    }
    if (currentFood.calories === undefined || currentFood.calories === null || isNaN(currentFood.calories) || currentFood.calories <=0) {
      setModalError("Valid calories (must be a positive number) are required.");
      return;
    }
    if (editingFood) {
      onUpdateFood(currentFood as MyFoodItem);
    } else {
      onAddFood(currentFood as MyFoodItem);
    }
    setIsFoodModalOpen(false);
    setCurrentFood({});
  };

  const handleOpenMealModal = (meal: MyMeal | null = null) => {
    setEditingMeal(meal);
    setCurrentMeal(meal ? { ...meal, ingredients: meal.ingredients ? [...meal.ingredients] : [] } : { name: '', description: '', ingredients: [] });
    setModalError(null);
    setIsMealModalOpen(true);
  };

  const handleSaveMeal = () => {
    setModalError(null);
    if (!currentMeal.name?.trim()) {
      setModalError("Meal name is required.");
      return;
    }
    if (!currentMeal.ingredients || currentMeal.ingredients.length === 0) {
      setModalError("A meal must have at least one ingredient.");
      return;
    }
    if (currentMeal.ingredients.some(ing => !ing.foodId || ing.servings <= 0)) {
        setModalError("All ingredients must be selected and have a valid serving size (>0).");
        return;
    }

    if (editingMeal) {
      onUpdateMeal(currentMeal as MyMeal);
    } else {
      onAddMeal(currentMeal as MyMeal);
    }
    setIsMealModalOpen(false);
    setCurrentMeal({ ingredients: [] });
  };
  
  const handleMealIngredientChange = (index: number, field: keyof MyMeal['ingredients'][0], value: string) => {
    const updatedIngredients = [...(currentMeal.ingredients || [])];
    if (field === 'servings') {
        updatedIngredients[index] = { ...updatedIngredients[index], [field]: parseFloat(value) || 1 };
    } else { 
        updatedIngredients[index] = { ...updatedIngredients[index], [field]: value };
    }
    setCurrentMeal(prev => ({ ...prev, ingredients: updatedIngredients }));
  };

  const addMealIngredient = () => {
    setCurrentMeal(prev => ({
      ...prev,
      ingredients: [...(prev.ingredients || []), { foodId: '', servings: 1 }]
    }));
  };

  const removeMealIngredient = (index: number) => {
    setCurrentMeal(prev => ({
      ...prev,
      ingredients: (prev.ingredients || []).filter((_, i) => i !== index)
    }));
  };


  return (
    <div className="space-y-8">
      {/* My Foods Section */}
      <div className="bg-bg-card p-6 sm:p-8 rounded-xl shadow-xl">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-border-default">
          <h2 className="text-xl sm:text-2xl font-semibold text-text-default">
            <i className="fas fa-carrot mr-2.5 text-orange-500 dark:text-orange-400"></i>My Foods
          </h2>
          <button onClick={() => handleOpenFoodModal()} className={buttonClass}>
            <i className="fas fa-plus mr-1.5"></i>Add Food
          </button>
        </div>
        {myFoods.length === 0 ? (
          <p className="text-text-alt text-center py-4">No custom foods saved yet. Add your frequently eaten items!</p>
        ) : (
          <ul className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
            {myFoods.map(food => (
              <li key={food.id} className="p-4 border border-border-default rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-text-default">{food.name}</p>
                  <p className="text-xs text-text-alt">{food.calories} kcal{food.servingSize ? ` / ${food.servingSize}` : ''}</p>
                </div>
                <div className="space-x-2">
                  <button onClick={() => handleOpenFoodModal(food)} className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-1" aria-label={`Edit ${food.name}`}><i className="fas fa-edit"></i></button>
                  <button onClick={() => onDeleteFood(food.id)} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1" aria-label={`Delete ${food.name}`}><i className="fas fa-trash"></i></button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* My Meals Section */}
      <div className="bg-bg-card p-6 sm:p-8 rounded-xl shadow-xl">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-border-default">
          <h2 className="text-xl sm:text-2xl font-semibold text-text-default">
            <i className="fas fa-utensils mr-2.5 text-purple-500 dark:text-purple-400"></i>My Meals
          </h2>
          <button onClick={() => handleOpenMealModal()} className={buttonClass}>
             <i className="fas fa-plus mr-1.5"></i>Create Meal
          </button>
        </div>
        {myMeals.length === 0 ? (
          <p className="text-text-alt text-center py-4">No custom meals created yet. Combine your foods into meals!</p>
        ) : (
          <ul className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
            {myMeals.map(meal => (
              <li key={meal.id} className="p-4 border border-border-default rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-text-default">{meal.name}</p>
                  <p className="text-xs text-text-alt">{meal.totalCalories?.toFixed(0) || 0} kcal. {meal.ingredients.length} ingredient{meal.ingredients.length === 1 ? '' : 's'}.</p>
                </div>
                <div className="space-x-2">
                  <button onClick={() => onLogMeal(meal.id)} className={`${buttonClass} text-xs py-1 px-2.5 bg-green-500 hover:bg-green-600`} aria-label={`Log ${meal.name}`}><i className="fas fa-plus-circle mr-1"></i>Log</button>
                  <button onClick={() => handleOpenMealModal(meal)} className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-1" aria-label={`Edit ${meal.name}`}><i className="fas fa-edit"></i></button>
                  <button onClick={() => onDeleteMeal(meal.id)} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1" aria-label={`Delete ${meal.name}`}><i className="fas fa-trash"></i></button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <AdPlaceholder sizeLabel="Food Library Ad (e.g., 300x100)" className="mt-6"/>

      {/* Add/Edit Food Modal */}
      <Modal isOpen={isFoodModalOpen} onClose={() => { setIsFoodModalOpen(false); setEditingFood(null); setCurrentFood({}); setModalError(null); }} title={editingFood ? "Edit Food" : "Add New Food"}>
        {modalError && <Alert type="error" message={modalError} onClose={() => setModalError(null)} className="mb-3"/>}
        <div className="space-y-4">
            {!editingFood && ( 
                <button 
                    onClick={openMyFoodScanner} 
                    disabled={apiKeyMissing}
                    className={`${buttonClass} w-full bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all mb-3 disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                    <i className="fas fa-barcode mr-2"></i>Scan Barcode to Pre-fill
                </button>
            )}
             {apiKeyMissing && !editingFood && <Alert type="warning" message={<>{API_KEY_ERROR_MESSAGE} <br/> Barcode scanning is disabled.</>} className="mb-2 text-xs" />}
          <div>
            <label htmlFor="foodName" className="block text-sm font-medium text-text-alt">Name <span className="text-red-500">*</span></label>
            <input type="text" id="foodName" value={currentFood.name || ''} onChange={e => setCurrentFood(p => ({...p, name: e.target.value}))} className={inputClass} maxLength={100}/>
          </div>
          <div>
            <label htmlFor="foodCalories" className="block text-sm font-medium text-text-alt">Calories (kcal) <span className="text-red-500">*</span></label>
            <input type="number" id="foodCalories" value={currentFood.calories === undefined ? '' : currentFood.calories} onChange={e => setCurrentFood(p => ({...p, calories: e.target.value === '' ? undefined : parseFloat(e.target.value)}))} className={inputClass} min="0" step="1"/>
          </div>
          <div>
            <label htmlFor="foodServingSize" className="block text-sm font-medium text-text-alt">Serving Size (e.g., 100g, 1 cup)</label>
            <input type="text" id="foodServingSize" value={currentFood.servingSize || ''} onChange={e => setCurrentFood(p => ({...p, servingSize: e.target.value}))} className={inputClass} maxLength={50}/>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div><label htmlFor="foodProtein" className="text-xs text-text-alt">Protein (g)</label><input type="number" id="foodProtein" value={currentFood.protein  === undefined ? '' : currentFood.protein} onChange={e => setCurrentFood(p => ({...p, protein: e.target.value === '' ? undefined : parseFloat(e.target.value)}))} className={inputClass} min="0" step="0.1"/></div>
            <div><label htmlFor="foodCarbs" className="text-xs text-text-alt">Carbs (g)</label><input type="number" id="foodCarbs" value={currentFood.carbs === undefined ? '' : currentFood.carbs} onChange={e => setCurrentFood(p => ({...p, carbs: e.target.value === '' ? undefined : parseFloat(e.target.value)}))} className={inputClass} min="0" step="0.1"/></div>
            <div><label htmlFor="foodFat" className="text-xs text-text-alt">Fat (g)</label><input type="number" id="foodFat" value={currentFood.fat === undefined ? '' : currentFood.fat} onChange={e => setCurrentFood(p => ({...p, fat: e.target.value === '' ? undefined : parseFloat(e.target.value)}))} className={inputClass} min="0" step="0.1"/></div>
          </div>
          <button onClick={handleSaveFood} className={buttonClass + " w-full"}>{editingFood ? "Save Changes" : "Add Food"}</button>
        </div>
      </Modal>

      {/* MyFood Barcode Scanner Modal */}
      <Modal isOpen={isMyFoodScannerModalOpen} onClose={closeMyFoodScanner} title="Scan Barcode for My Food" size="xl">
        <div className="flex flex-col items-center">
            <div className="w-full max-w-md aspect-[4/3] bg-slate-200 dark:bg-slate-700 rounded-lg overflow-hidden mb-4 shadow-inner relative">
                <video id={MYFOOD_SCANNER_VIDEO_ID} ref={myFoodVideoRef} className={`w-full h-full object-cover ${(isMyFoodScanning || isMyFoodScannerLoadingApi || myFoodScannedUpc) ? '' : 'hidden'}`} playsInline />
                {!(isMyFoodScanning || isMyFoodScannerLoadingApi || myFoodScannedUpc || myFoodScannerError) && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 p-4">
                        <i className="fas fa-camera text-5xl mb-3 text-slate-400 dark:text-slate-500"></i>
                        <p className="text-center text-sm">Initializing camera...</p>
                        <p className="text-center text-xs mt-1">Point at a barcode to scan.</p>
                    </div>
                )}
                 {isMyFoodScanning && !isMyFoodScannerLoadingApi && !myFoodScannerError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black bg-opacity-30 p-4">
                        <i className="fas fa-barcode text-5xl mb-3 animate-pulse"></i>
                        <p className="text-center text-sm font-semibold">Scanning...</p>
                    </div>
                )}
            </div>
            {myFoodScannerError && <Alert type="error" message={myFoodScannerError} onClose={() => setMyFoodScannerError(null)} className="w-full max-w-md"/>}
            {isMyFoodScannerLoadingApi && <div className="my-4 text-center w-full max-w-md"><LoadingSpinner label={`Fetching info for UPC: ${myFoodScannedUpc}`}/> <p className="text-text-alt mt-2 text-sm">Fetching food info...</p></div>}
            {myFoodScanGroundingSources.length > 0 && (
                <div className="mt-4 p-3 bg-sky-50 dark:bg-sky-800/50 border border-sky-200 dark:border-sky-700 rounded-lg w-full max-w-md text-xs">
                  <h4 className="text-xs font-semibold text-sky-700 dark:text-sky-300 mb-1">Data Sources (from Google Search):</h4>
                  <ul className="list-disc list-inside space-y-1">
                      {myFoodScanGroundingSources.map((source, index) => (
                      source.web.uri ? (
                          <li key={index}>
                          <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-sky-600 dark:text-sky-400 hover:underline hover:text-sky-800 dark:hover:text-sky-300">
                              {source.web.title || source.web.uri}
                          </a>
                          </li>
                      ) : null
                      ))}
                  </ul>
                </div>
            )}
            <button
                onClick={closeMyFoodScanner}
                className="mt-6 bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-600 dark:hover:bg-slate-500 dark:text-slate-200 font-semibold py-2.5 px-6 rounded-lg shadow hover:shadow-md transition-all"
            >
                Close Scanner & Return to Form
            </button>
        </div>
      </Modal>


      {/* Add/Edit Meal Modal */}
      <Modal isOpen={isMealModalOpen} onClose={() => { setIsMealModalOpen(false); setEditingMeal(null); setCurrentMeal({ ingredients: [] }); setModalError(null); }} title={editingMeal ? "Edit Meal" : "Create New Meal"} size="lg">
        {modalError && <Alert type="error" message={modalError} onClose={() => setModalError(null)} className="mb-3"/>}
        <div className="space-y-4">
          <div>
            <label htmlFor="mealName" className="block text-sm font-medium text-text-alt">Meal Name <span className="text-red-500">*</span></label>
            <input type="text" id="mealName" value={currentMeal.name || ''} onChange={e => setCurrentMeal(p => ({...p, name: e.target.value}))} className={inputClass} maxLength={100}/>
          </div>
           <div>
            <label htmlFor="mealDescription" className="block text-sm font-medium text-text-alt">Description (optional)</label>
            <input type="text" id="mealDescription" value={currentMeal.description || ''} onChange={e => setCurrentMeal(p => ({...p, description: e.target.value}))} className={inputClass} maxLength={200}/>
          </div>
          <h3 className="text-md font-semibold text-text-default pt-2 border-t border-border-default">Ingredients</h3>
          {currentMeal.ingredients && currentMeal.ingredients.map((ing, index) => (
            <div key={index} className="flex items-end gap-2 p-2 border border-border-default rounded">
              <div className="flex-grow">
                <label className="text-xs text-text-alt">Food Item <span className="text-red-500">*</span></label>
                <select 
                    value={ing.foodId} 
                    onChange={e => handleMealIngredientChange(index, 'foodId', e.target.value)} 
                    className={inputClass + " text-sm"}
                    aria-label={`Ingredient ${index + 1} food item`}
                >
                  <option value="">Select Food</option>
                  {myFoods.map(f => <option key={f.id} value={f.id}>{f.name} ({f.calories} kcal{f.servingSize ? ` / ${f.servingSize}` : ''})</option>)}
                </select>
              </div>
              <div className="w-20">
                <label className="text-xs text-text-alt">Servings <span className="text-red-500">*</span></label>
                <input 
                    type="number" 
                    value={ing.servings} 
                    onChange={e => handleMealIngredientChange(index, 'servings', e.target.value)} 
                    className={inputClass + " text-sm"} 
                    step="0.1" min="0.1" 
                    aria-label={`Ingredient ${index + 1} servings`}
                />
              </div>
              <button onClick={() => removeMealIngredient(index)} className={dangerButtonClass + " mb-1"} aria-label={`Remove ingredient ${index + 1}`}><i className="fas fa-times"></i></button>
            </div>
          ))}
          <button onClick={addMealIngredient} className="text-sm text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"><i className="fas fa-plus mr-1"></i>Add Ingredient</button>
          {myFoods.length === 0 && <p className="text-xs text-orange-600 dark:text-orange-400">You need to add foods to 'My Foods' first to create meals.</p>}
          <button 
            onClick={handleSaveMeal} 
            className={buttonClass + " w-full mt-4"}
            disabled={myFoods.length === 0 && (!currentMeal.ingredients || currentMeal.ingredients.length === 0)}
          >
            {editingMeal ? "Save Changes" : "Create Meal"}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default MyLibraryComponent;