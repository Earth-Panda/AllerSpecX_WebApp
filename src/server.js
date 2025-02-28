
import axios from 'axios';

export async function sendToML(id, data, updateScan) {
  axios.post('http://127.0.0.1:8080/v1/models/model:predict', {
      id: id,
      input: data
    })
    .then(function (response) {
      console.log(response);
      const data = response.data;
      const truePer = 0.75;
      updateScan( prev => ({
        ...prev,
        status: false,
        result: data.pred_class,
        confidence: [
          { name: "", value: 0 },
          { name: "True", value: truePer },
          { name: "False", value: 1-truePer },
        ],
        weight: 9,
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