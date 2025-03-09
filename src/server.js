
import axios from 'axios';

export async function sendToML(id, data, updateScan, url) {

  axios.post(url, {
      id: id,
      input: data
    })
    .then(function (response) {
      console.log(response);
      const data = response.data;

      if(Object.hasOwn(data, "nutrition_facts")){ // if Nutrition facts
        updateScan( prev => ({
          ...prev,
          type: 0,
          status: false,
          nutrifax: {
            calories: data.nutrition_facts[0],
            fat: data.nutrition_facts[1],
            saturated_fat: data.nutrition_facts[2],
            trans_fat: data.nutrition_facts[3],
            carbohydrate: data.nutrition_facts[4],
            fibre: data.nutrition_facts[5],
            sugars: data.nutrition_facts[6],
            protein: data.nutrition_facts[7],
            sodium: data.nutrition_facts[8],
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