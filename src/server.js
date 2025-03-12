
import axios from 'axios';

export async function sendToML(id, data, updateScan, url) {
  axios.post(url, {
      id: id,
      input: data
    })
    .then(function (response) {
      console.log(response);
      const data = response.data;

      if(Object.hasOwn(data, "calories")){ // if Nutrition facts
        updateScan( prev => ({
          ...prev,
          type: 0,
          status: false,
          nutrifax: {
            calories: data.calories,
            carbohydrates: data.carbs,
            fibres: data.fibres,
            proteins: data.proteins,
          }
        }));
      } else { // If allergen
        updateScan( prev => ({
          ...prev,
          type: 1,
          status: false,
          result: data.pred_class,
          confidence: [
            { name: "Yes", value: parseInt(data.probs[1].toFixed(2)*100) },
            { name: "No", value: parseInt(data.probs[0].toFixed(2)*100) },
          ],
          weight: data.pred_peanut_mass.toFixed(2),
        }));
      }
    })
    .catch(function (error) {
      console.log(error);
      updateScan( prev => ({
        ...prev,
        status: false,
      }));
    });
}