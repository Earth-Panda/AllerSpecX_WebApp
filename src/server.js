
import axios from 'axios';

export async function sendToML(id, data, updateScan) {
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
          { name: "Yes", value: data.probs[1] },
          { name: "No", value: data.probs[0] },
        ],
        weight: data.pred_peanut_mass,
      }));
      console.log(response.pred_class)
    })
    .catch(function (error) {
      console.log(error);
      updateScan( prev => ({
        ...prev,
        status: false,
      }));
    });
    
    
}