import axios from 'axios';

const API_URL = 'http://localhost:5000/api/responses'; // backend must run on port 5000

const surveyService = {
  getResponses: () => axios.get(API_URL),
  submitResponse: (response) => axios.post(API_URL, response),
};

export default surveyService;
