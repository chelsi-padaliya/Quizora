"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useInvalidateQuestions() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: ["questions"] });
    queryClient.invalidateQueries({ queryKey: ["subjects"] });
    queryClient.invalidateQueries({ queryKey: ["topics"] });
  };
}

export function useDeleteQuestionMutation() {
  const invalidate = useInvalidateQuestions();

  return useMutation({
    mutationFn: async (id: string) => {
      const { deleteQuestion } = await import("@/actions/question.actions");
      const result = await deleteQuestion(id);
      if (!result.success) throw new Error(result.error);
      return id;
    },
    onSuccess: () => invalidate(),
  });
}

export function useDuplicateQuestionMutation() {
  const invalidate = useInvalidateQuestions();

  return useMutation({
    mutationFn: async (id: string) => {
      const { duplicateQuestion } = await import("@/actions/question.actions");
      const result = await duplicateQuestion(id);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => invalidate(),
  });
}
