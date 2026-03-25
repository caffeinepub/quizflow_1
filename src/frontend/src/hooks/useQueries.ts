import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Question, QuestionOutput, Quiz, Submission } from "../backend";
import { useActor } from "./useActor";

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function usePublishedQuizzes() {
  const { actor, isFetching } = useActor();
  return useQuery<Quiz[]>({
    queryKey: ["publishedQuizzes"],
    queryFn: async () => {
      if (!actor) return [];
      const ids = await actor.getPublishedQuizzes();
      if (ids.length === 0) return [];
      const quizzes = await Promise.all(ids.map((id) => actor.getQuiz(id)));
      return quizzes;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllQuizzes() {
  const { actor, isFetching } = useActor();
  return useQuery<Quiz[]>({
    queryKey: ["allQuizzes"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllQuizzes();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useQuiz(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Quiz>({
    queryKey: ["quiz", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) throw new Error("No actor or id");
      return actor.getQuiz(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useQuizForTaking(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<QuestionOutput[]>({
    queryKey: ["quizForTaking", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return [];
      return actor.getQuizForTaking(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useQuizSubmissions(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Submission[]>({
    queryKey: ["submissions", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return [];
      return actor.getQuizSubmissions(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useCreateQuiz() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      description,
      questions,
    }: {
      title: string;
      description: string;
      questions: Question[];
    }) => {
      if (!actor) throw new Error("Not authenticated");
      const quizId = await actor.createQuiz(title, description);
      for (const q of questions) {
        await actor.addQuestion(quizId, q);
      }
      return quizId;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allQuizzes"] });
    },
  });
}

export function usePublishQuiz() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (quizId: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.publishQuiz(quizId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allQuizzes"] });
      qc.invalidateQueries({ queryKey: ["publishedQuizzes"] });
    },
  });
}

export function useUnpublishQuiz() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (quizId: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.unpublishQuiz(quizId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allQuizzes"] });
      qc.invalidateQueries({ queryKey: ["publishedQuizzes"] });
    },
  });
}

export function useDeleteQuiz() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (quizId: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.deleteQuiz(quizId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allQuizzes"] });
      qc.invalidateQueries({ queryKey: ["publishedQuizzes"] });
    },
  });
}

export function useSubmitAnswers() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      participantName,
      quizId,
      answers,
    }: {
      participantName: string;
      quizId: bigint;
      answers: bigint[];
    }): Promise<Submission> => {
      if (!actor) throw new Error("Not authenticated");
      return actor.submitAnswers(participantName, quizId, answers);
    },
  });
}
