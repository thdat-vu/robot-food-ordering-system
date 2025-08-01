import {CreateFeedback} from "@/api/FeedbackApi";
import {useApiHandler} from "@/hooks/useApiHandler";

export const useCreateFeedback = () => {
  return useApiHandler(CreateFeedback)
}