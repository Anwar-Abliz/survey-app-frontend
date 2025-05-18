import axios from 'axios';

const API_URL = 'http://localhost:5000/api/responses';

const surveyService = {
  getResponses: () => axios.get(API_URL),
  submitResponse: async (responses) => {
    for (const r of responses) {
      await axios.post(API_URL, r); // send each response one at a time
    }
  },
};

export default surveyService;
