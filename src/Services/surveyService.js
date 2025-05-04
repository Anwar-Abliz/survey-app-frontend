import axios from 'axios';

const API_URL = 'https://your-backend-url.onrender.com/api/responses'; // backend is hosted on render.com

const surveyService = {
  getResponses: () => axios.get(API_URL),
  submitResponse: (response) => axios.post(API_URL, response),
};

export default surveyService;
