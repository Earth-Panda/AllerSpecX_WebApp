
import axios from 'axios';

export async function sendToML(id, data, updateScan) {
  console.log(data)
  axios.post('http://127.0.0.1:8080/v1/models/model:predict', {
      id: id,
      input: data
    })
    .then(function (response) {
      console.log(response);
      const data = response.data;

      updateScan( prev => ({
        ...prev,
        status: false,
        result: data.pred_class,
        confidence: [
          { name: "Yes", value: parseInt(data.probs[1].toFixed(2)*100) },
          { name: "No", value: parseInt(data.probs[0].toFixed(2)*100) },
        ],
        weight: data.pred_peanut_mass.toFixed(2),
      }));
      console.log(response.pred_class)
      console.log(parseInt(data.probs[1].toFixed(2)*100))
    })
    .catch(function (error) {
      console.log(error);
      updateScan( prev => ({
        ...prev,
        status: false,
      }));
    });
    
    
}