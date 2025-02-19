import axios from "axios";

const API = axios.create({
    baseURL: "https://api.lyaim.com",
    withCredentials: true,
});

//  Response Interceptor (Global Error Handling)
API.interceptors.response.use(
    (response) => response,
    (error) => {
        console.log("Server API Error:", error.response?.data?.message || error.message);
        return Promise.reject(error);
    }
);

//  Centralized API Methods
const apiService = {
    signup: (data) => API.post("/signup", data),
    login: (data) => API.post("login", data),
    logout: () => API.post("/logout"),
    profile: () => API.get("profile"),
    profileUpdate: (data) => API.put("profile/update", data),
    contact: (data) => API.post("api/contact", data),
    matchOverview: () => API.get('match/overview'),
    leaderboard: () => API.get('leaderboard'),

    //  Generic API Calls 
    fetchData: (endpoint) => API.get(endpoint),
    postData: (endpoint, data) => API.post(endpoint, data),
};

export default apiService;
