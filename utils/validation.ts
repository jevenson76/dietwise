export interface ValidationError {
  field: string;
  message: string;
}

export const validateUserProfile = (field: string, value: any): ValidationError | null => {
  switch (field) {
    case 'age':
      if (!value) return null;
      const age = Number(value);
      if (isNaN(age) || age < 1 || age > 120) {
        return { field: 'age', message: 'Age must be between 1 and 120 years' };
      }
      break;
    
    case 'weight':
      if (!value) return null;
      const weight = Number(value);
      if (isNaN(weight) || weight < 10 || weight > 1000) {
        return { field: 'weight', message: 'Weight must be between 10 and 1000 lbs' };
      }
      break;
    
    case 'height_ft':
      if (!value) return null;
      const feet = Number(value);
      if (isNaN(feet) || feet < 1 || feet > 8) {
        return { field: 'height_ft', message: 'Height must be between 1 and 8 feet' };
      }
      break;
    
    case 'height_in':
      if (!value) return null;
      const inches = Number(value);
      if (isNaN(inches) || inches < 0 || inches > 11) {
        return { field: 'height_in', message: 'Inches must be between 0 and 11' };
      }
      break;
    
    case 'targetWeight':
      if (!value) return null;
      const target = Number(value);
      if (isNaN(target) || target < 10 || target > 1000) {
        return { field: 'targetWeight', message: 'Target weight must be between 10 and 1000 lbs' };
      }
      break;
    
    case 'email':
      if (!value) return null;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return { field: 'email', message: 'Please enter a valid email address' };
      }
      break;
    
    case 'name':
      if (!value) return null;
      if (value.length > 100) {
        return { field: 'name', message: 'Name must be less than 100 characters' };
      }
      break;
  }
  
  return null;
};