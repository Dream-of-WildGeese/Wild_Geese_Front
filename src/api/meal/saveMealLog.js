import { client } from '../client';

// mealType: BREAKFAST | LUNCH | DINNER
export const saveMealLog = ({ recordDate, mealType, eaten }) =>
  client.post('/api/v1/meals/logs', { recordDate, mealType, eaten });
