import {CreateFeedback, CreateNewFeedback} from "@/api/FeedbackApi";
import {useApiHandler} from "@/hooks/useApiHandler";

export const useCreateFeedback = () => {
  return useApiHandler(CreateFeedback)
}

export const useCreateNewFeedback = () => {
  return useApiHandler(CreateNewFeedback)
}