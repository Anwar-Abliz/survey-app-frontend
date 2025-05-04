import axios from 'axios';

const API_URL = 'https://survey-app-backend-c2ft.onrender.com/api/responses'; 

const surveyService = {
  getResponses: () => axios.get(API_URL),
  submitResponse: (response) => axios.post(API_URL, response),
};

export default surveyService;
