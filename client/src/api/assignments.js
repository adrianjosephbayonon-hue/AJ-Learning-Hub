import api from "./axios";

export const getAssignments = () => {
  return api.get("/assignments");
};

export const submitAssignment = (id, data) => {
  return api.post(`/assignments/${id}/submit`, data);
};