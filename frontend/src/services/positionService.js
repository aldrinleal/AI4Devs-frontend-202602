import axios from 'axios';

const API_BASE_URL = 'http://localhost:3010';

export const getInterviewFlow = async (positionId) => {
    const response = await axios.get(`${API_BASE_URL}/positions/${positionId}/interviewFlow`);
    return response.data;
};

export const getCandidatesByPosition = async (positionId) => {
    const response = await axios.get(`${API_BASE_URL}/positions/${positionId}/candidates`);
    return response.data;
};

export const updateCandidateStage = async (candidateId, applicationId, newInterviewStepId) => {
    const response = await axios.put(`${API_BASE_URL}/candidates/${candidateId}/stage`, {
        applicationId,
        currentInterviewStep: newInterviewStepId,
    });
    return response.data;
};
