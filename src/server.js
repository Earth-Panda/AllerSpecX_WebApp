
import axios from 'axios';

export async function sendToML(id, data) {
    
    axios.post('http://127.0.0.1:8080/v1/models/model:predict', {
        id: id,
        input: data
      })
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });
}