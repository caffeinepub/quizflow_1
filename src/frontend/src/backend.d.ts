import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Timestamp = bigint;
export interface QuestionOutput {
    prompt: string;
    options: Array<string>;
}
export interface Quiz {
    id: QuizId;
    status: QuizStatus;
    title: string;
    description: string;
    questions: Array<Question>;
}
export interface Submission {
    answers: Array<bigint>;
    participantName: string;
    score: bigint;
    correctAnswers: Array<bigint>;
    timestamp: Timestamp;
    quizId: QuizId;
}
export interface Question {
    correctIndex: bigint;
    prompt: string;
    options: Array<string>;
}
export type QuizId = bigint;
export enum QuizStatus {
    published = "published",
    draft = "draft"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    _initializeAccessControlWithSecret(secret: string): Promise<void>;
    addQuestion(quizId: QuizId, question: Question): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createQuiz(title: string, description: string): Promise<QuizId>;
    deleteQuiz(quizId: QuizId): Promise<void>;
    getAllQuizzes(): Promise<Array<Quiz>>;
    getCallerUserRole(): Promise<UserRole>;
    getPublishedQuizzes(): Promise<Array<QuizId>>;
    getQuiz(quizId: QuizId): Promise<Quiz>;
    getQuizForTaking(quizId: QuizId): Promise<Array<QuestionOutput>>;
    getQuizSubmissions(quizId: QuizId): Promise<Array<Submission>>;
    isCallerAdmin(): Promise<boolean>;
    publishQuiz(quizId: QuizId): Promise<void>;
    submitAnswers(participantName: string, quizId: QuizId, answers: Array<bigint>): Promise<Submission>;
    unpublishQuiz(quizId: QuizId): Promise<void>;
}
